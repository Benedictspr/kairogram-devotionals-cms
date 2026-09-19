const fs = require('fs');
const path = require('path');

// In-memory cache fallback for serverless execution
let memoryStore = null;

function getStorePath() {
  return path.join(process.cwd(), 'data', 'devotionals.json');
}

function loadDevotionals() {
  if (memoryStore) return memoryStore;
  
  // Check /tmp first (in case updated during warm serverless lifecycle)
  try {
    const tmpPath = path.join('/tmp', 'devotionals.json');
    if (fs.existsSync(tmpPath)) {
      const data = fs.readFileSync(tmpPath, 'utf8');
      memoryStore = JSON.parse(data);
      return memoryStore;
    }
  } catch (_) {}

  // Check bundled data/devotionals.json
  try {
    const filePath = getStorePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      memoryStore = JSON.parse(data);
      return memoryStore;
    }
  } catch (err) {
    console.error("[API] Error loading devotionals.json:", err);
  }

  // Baseline fallback dataset if file doesn't exist
  memoryStore = {
    version: "1.0",
    date: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString(),
    source: "Kairogram Cloud Devotionals CMS (Vercel)",
    publications: {},
    dates: {}
  };
  return memoryStore;
}

async function saveDevotionals(store) {
  memoryStore = store;
  const jsonStr = JSON.stringify(store, null, 2);

  // 1. Try local disk
  try {
    const filePath = getStorePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, jsonStr, 'utf8');
  } catch (err) {
    // 2. Serverless /tmp fallback
    try {
      fs.writeFileSync(path.join('/tmp', 'devotionals.json'), jsonStr, 'utf8');
    } catch (_) {}
  }

  // 3. Optional GitHub Direct Persistence
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (token && repo && typeof fetch === 'function') {
    try {
      const contentBase64 = Buffer.from(jsonStr, 'utf8').toString('base64');
      const getFileResp = await fetch(`https://api.github.com/repos/${repo}/contents/data/devotionals.json`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Kairogram-CMS'
        }
      });
      let sha = '';
      if (getFileResp.ok) {
        const fileData = await getFileResp.json();
        sha = fileData.sha;
      }

      await fetch(`https://api.github.com/repos/${repo}/contents/data/devotionals.json`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Kairogram-CMS',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'chore(devotionals): update live catalog via Cloud Studio [skip ci]',
          content: contentBase64,
          sha: sha || undefined
        })
      });
      console.log(`[API] Saved and committed to GitHub repo: ${repo}`);
    } catch (gitErr) {
      console.warn("[API] GitHub sync note:", gitErr.message);
    }
  }
}

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const store = loadDevotionals();

  // GET: Fetch devotionals (Latest, by Date, by Church, or full library)
  if (req.method === 'GET') {
    const { date, church, manual, latest } = req.query || {};

    // 1. Specific Date
    if (date) {
      const dayPubs = (store.dates && store.dates[date]) ? store.dates[date] : {};
      if (church) {
        const filtered = {};
        for (const [k, v] of Object.entries(dayPubs)) {
          if (v && v.church === church) filtered[k] = v;
        }
        return res.status(200).json({
          date,
          count: Object.keys(filtered).length,
          publications: filtered
        });
      }
      return res.status(200).json({
        date,
        count: Object.keys(dayPubs).length,
        publications: dayPubs
      });
    }

    // 2. Filter by Church across all dates
    if (church && !latest) {
      const churchEntries = [];
      if (store.dates) {
        for (const [d, pubs] of Object.entries(store.dates)) {
          for (const [k, item] of Object.entries(pubs)) {
            if (item && item.church === church) {
              churchEntries.push({ date: d, key: k, ...item });
            }
          }
        }
      }
      return res.status(200).json({
        church,
        count: churchEntries.length,
        entries: churchEntries
      });
    }

    // 3. Default: Full Latest Payload (Directly consumable by Kairogram mobile app)
    return res.status(200).json({
      version: store.version || "1.0",
      date: store.date || new Date().toISOString().split('T')[0],
      dateLabel: store.dateLabel || new Date().toDateString(),
      updatedAt: store.updatedAt || new Date().toISOString(),
      source: "Kairogram Devotionals Cloud CMS (Vercel Live Feed)",
      publications: store.publications || {},
      dates: store.dates || {},
      sunday_school_lessons: store.sunday_school_lessons || []
    });
  }

  // POST: Ingest single devotion or batch of devotionals
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!body) {
        return res.status(400).json({ error: "Missing JSON request body" });
      }

      if (!store.dates) store.dates = {};
      if (!store.publications) store.publications = {};
      if (!store.sunday_school_lessons) store.sunday_school_lessons = [];

      let ingestedCount = 0;

      // Case A: Array of items (Batch Ingestion)
      const items = Array.isArray(body) ? body : (body.entries || [body]);

      for (const item of items) {
        if (!item) continue;
        const church = item.church || 'rccg';
        const manual = item.manual || (church === 'rccg' ? 'open_heavens' : church);
        const dateStr = item.date || new Date().toISOString().split('T')[0];
        const pubKey = `${church}_${manual}`;

        // Ensure date node exists
        if (!store.dates[dateStr]) store.dates[dateStr] = {};

        const entryPayload = {
          church,
          manual,
          title: item.title || item.topic || "Daily Devotional",
          author: item.author || (church === 'rccg' ? "Pastor E.A. Adeboye" : ""),
          date: dateStr,
          dateLabel: item.dateLabel || dateStr,
          topic: item.topic || "Walking in Divine Glory",
          memoryVerseRef: item.memoryVerseRef || "",
          memoryVerseText: item.memoryVerseText || "",
          bibleReadingRef: item.bibleReadingRef || item.readingRef || item.fireScriptureRef || item.textRef || item.basicScriptureRef || "",
          fireScriptureRef: item.fireScriptureRef || (church === 'mfm' ? (item.bibleReadingRef || item.readingRef) : ""),
          textRef: item.textRef || (church === 'dclm' ? (item.bibleReadingRef || item.readingRef) : ""),
          basicScriptureRef: item.basicScriptureRef || (church === 'odm' ? (item.bibleReadingRef || item.readingRef) : ""),
          message: Array.isArray(item.message) ? item.message : (item.message ? [item.message] : []),
          prayerPoints: Array.isArray(item.prayerPoints) ? item.prayerPoints : (item.prayerPoints ? [item.prayerPoints] : []),
          hymn: item.hymn || "",
          thoughtForTheDay: item.thoughtForTheDay || "",
          motivationalQuote: item.motivationalQuote || "",
          confession: item.confession || "",
          propheticWord: item.propheticWord || item.propheticDeclaration || "",
          propheticDeclaration: item.propheticDeclaration || item.propheticWord || "",
          devotionalCapsule: item.devotionalCapsule || "",
          morningPrayers: Array.isArray(item.morningPrayers) ? item.morningPrayers : (item.morningPrayers ? [item.morningPrayers] : []),
          eveningPrayers: Array.isArray(item.eveningPrayers) ? item.eveningPrayers : (item.eveningPrayers ? [item.eveningPrayers] : []),
          furtherStudy: Array.isArray(item.furtherStudy) ? item.furtherStudy : (item.furtherStudy ? [item.furtherStudy] : []),
          oneYearReading: item.oneYearReading || item.bibleInOneYear || "",
          twoYearReading: item.twoYearReading || "",
          bibleInOneYear: item.bibleInOneYear || item.oneYearReading || "",
          rememberThis: item.rememberThis || "",
          assignments: item.assignments || item.assignment || "",
          readTime: item.readTime || "4 min read",
          source: item.source || "Kairogram Devotionals Cloud CMS",
          updatedAt: new Date().toISOString()
        };

        // If Sunday school, include specific outlines
        if (item.isSundaySchool || manual.includes('ss') || manual.includes('sunday_school') || manual.includes('yaya')) {
          entryPayload.isSundaySchool = true;
          entryPayload.lessonNum = item.lessonNum || 1;
          entryPayload.introduction = item.introduction || "";
          entryPayload.outlines = item.outlines || [];
          entryPayload.discussion = item.discussion || "";
          entryPayload.summary = item.summary || "";
          entryPayload.assignment = item.assignment || "";
          entryPayload.teachingAim = item.teachingAim || "";
          entryPayload.teacherObjectives = Array.isArray(item.teacherObjectives) ? item.teacherObjectives : (item.teacherObjectives ? [item.teacherObjectives] : []);
          entryPayload.youthFocus = item.youthFocus || "";
          entryPayload.classActivities = item.classActivities || "";
          entryPayload.markingScheme = item.markingScheme || "";

          // Also push to sunday_school_lessons array
          const existingIdx = store.sunday_school_lessons.findIndex(l => 
            Number(l.lessonNum) === Number(item.lessonNum) && l.manual === manual
          );
          if (existingIdx !== -1) {
            store.sunday_school_lessons[existingIdx] = entryPayload;
          } else {
            store.sunday_school_lessons.push(entryPayload);
          }
        }

        // Store into date map
        store.dates[dateStr][pubKey] = entryPayload;

        // Also update latest publications pointer
        store.publications[pubKey] = entryPayload;
        ingestedCount++;
      }

      store.updatedAt = new Date().toISOString();
      await saveDevotionals(store);

      return res.status(200).json({
        success: true,
        message: `Successfully ingested and published ${ingestedCount} devotional publication(s).`,
        ingestedCount,
        updatedAt: store.updatedAt
      });
    } catch (postErr) {
      console.error("[API] POST error:", postErr);
      return res.status(500).json({ error: "Failed to process devotional payload", details: postErr.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
