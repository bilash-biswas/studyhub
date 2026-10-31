// -*- coding: utf-8 -*-
/**
 * Medhavi (মেধাবী) - Safe Sync Unverified Questions from Master JSON to Cloud Firestore
 *
 * Rules:
 * 1. ZERO DELETIONS: Only updates fields on existing documents via Firestore :commit with updateMask.
 * 2. PRESERVE VERIFIED STATUS: All 544 already-verified questions KEEP adminVerified: true.
 * 3. KEEP UNVERIFIED QUEUE: All unverified questions explicitly remain adminVerified: false.
 * 4. UPDATE FIELDS: question, options, correctOptionId, explanation, subjectId, tags.
 */

const fs = require('fs');
const https = require('https');
const path = require('path');
const os = require('os');
const katex = require('katex');

const PROJECT_ID = 'studyhub-bd-39887';
const MASTER_FILE = path.resolve('C:/Users/AC/.gemini/antigravity/scratch/bcs_question_bank/all_bcs_10th_to_50th_master.json');
const FS_STATE_FILE = path.resolve('C:/Users/AC/.gemini/antigravity/scratch/current_firestore_state.json');
const FS_TEXTS_FILE = path.resolve('C:/Users/AC/.gemini/antigravity/scratch/firestore_question_texts.json');
const CONFIG_FILE = path.join(os.homedir(), '.config/configstore/firebase-tools.json');
const COMMIT_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:commit`;

function getToken() {
  const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  return data.tokens.access_token;
}

// LaTeX cleaning and math wrapping helper
function cleanAndWrapMath(raw) {
  if (!raw || typeof raw !== 'string') return raw;
  let s = raw;

  s = s.replace(/\\(sin|sec|tan|cos|log)\{([a-z]{2,})\}/g, '$1$2');
  s = s.replace(/\^\s*\\circ\s*([CFN])/g, '°$1');
  s = s.replace(/\\circ\s*([CFN])/g, '°$1');
  s = s.replace(/\^\s*\\circ/g, '°');
  s = s.replace(/°([\u0980-\u09FF])/g, '° $1');

  // Replace Unicode superscripts
  s = s.replace(/([a-zA-Z0-9)])²/g, '$1^2');
  s = s.replace(/([a-zA-Z0-9)])³/g, '$1^3');

  // If already wrapped in $, validate KaTeX
  if (s.includes('$')) {
    return s;
  }

  // Wrap bare LaTeX commands if any
  if (/(\\(?:frac|sqrt|le|ge|ne|pm|angle|log|sin|cos|tan|cdot|times|text)|[\^_])/.test(s)) {
    // If simple equation or formula without $
    s = s.replace(/[0-9a-zA-Z\\{}+\-*/=()[\]^_.,<>|∪∩∞πθ×÷°\s]+/g, (chunk) => {
      if (!/(\\(?:frac|sqrt|le|ge|ne|pm|angle|log|sin|cos|tan|cdot|times|text)|[\^_])/.test(chunk)) {
        return chunk;
      }
      return `$${chunk.trim()}$`;
    });
  }

  return s;
}

const SUBJECT_MAP = {
  bangla: 'sub_bcs_bangla',
  english: 'sub_bcs_english',
  math: 'sub_bcs_math',
  bangladesh: 'sub_bcs_bd_affairs',
  international: 'sub_bcs_intl_affairs',
  science: 'sub_bcs_science',
  computer: 'sub_bcs_ict',
  ict: 'sub_bcs_ict',
  mental_ability: 'sub_bcs_mental_ability',
  geography: 'sub_bcs_geography',
  ethics: 'sub_bcs_ethics',
  general_knowledge: 'sub_bcs_bd_affairs'
};

function mapSubject(rawSubject, qText) {
  if (!rawSubject) return 'sub_bcs_bd_affairs';
  const clean = rawSubject.toLowerCase().trim();
  if (clean.startsWith('sub_bcs_')) return clean;

  if (clean === 'general_knowledge') {
    // Basic heuristic for the 50 GK questions in 19th BCS
    const t = (qText || '').toLowerCase();
    if (t.includes('ওজোন') || t.includes('পরিবেশ') || t.includes('গ্যাস') || t.includes('এসিড')) return 'sub_bcs_geography';
    if (t.includes('জাতিসংঘ') || t.includes('আন্তর্জাতিক') || t.includes('নোবেল')) return 'sub_bcs_intl_affairs';
    return 'sub_bcs_bd_affairs';
  }

  return SUBJECT_MAP[clean] || 'sub_bcs_bd_affairs';
}

function norm(text) {
  if (!text) return '';
  return text.replace(/[$ \n\r\t]/g, '').replace(/[\s\.,।\?\'\"\-–—\(\)]+/g, '').toLowerCase();
}

function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') {
    if (Number.isInteger(val)) return { integerValue: String(val) };
    return { doubleValue: val };
  }
  if (typeof val === 'string') return { stringValue: val };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreValue) } };
  }
  if (typeof val === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function commitWrites(token, writes) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ writes });

    const req = https.request(COMMIT_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json; charset=utf-8'
      }
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode}: ${raw}`));
        }
        resolve();
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  console.log(`[Sync] Starting ${isDryRun ? 'DRY-RUN' : 'LIVE'} synchronization...`);

  const master = JSON.parse(fs.readFileSync(MASTER_FILE, 'utf8'));
  const fsList = JSON.parse(fs.readFileSync(FS_STATE_FILE, 'utf8'));
  const fsTexts = JSON.parse(fs.readFileSync(FS_TEXTS_FILE, 'utf8'));
  const fsDict = {};
  fsTexts.forEach(d => { fsDict[d.id] = d; });

  console.log(`[Sync] Master file questions: ${master.length}`);
  console.log(`[Sync] Firestore total docs: ${fsList.length}`);

  // Group master questions by batch slug (e.g. "10th", "45th")
  const masterByBatch = {};
  master.forEach((q) => {
    const b = (q.bcsBatch || '').split(' ')[0].toLowerCase();
    if (!masterByBatch[b]) masterByBatch[b] = [];
    masterByBatch[b].push(q);
  });

  // Group Firestore docs by batch slug
  const fsByBatch = {};
  fsList.forEach((d) => {
    const b = (d.source || '').split(' ')[0].toLowerCase();
    if (!fsByBatch[b]) fsByBatch[b] = [];
    fsByBatch[b].push(d);
  });

  const nowIso = new Date().toISOString();
  const updates = [];
  let preservedVerified = 0;
  let updatedUnverified = 0;
  let untouchedExtra = 0;

  for (const b of Object.keys(fsByBatch).sort()) {
    const fDocs = fsByBatch[b];
    const mQs = masterByBatch[b] || [];

    // Pass 1: normalized text match
    const mUsed = new Set();
    const fMatched = {};

    fDocs.forEach((f) => {
      const fFull = fsDict[f.id] || {};
      const fn = norm(fFull.question || '');
      for (let mIdx = 0; mIdx < mQs.length; mIdx++) {
        if (mUsed.has(mIdx)) continue;
        const mn = norm(mQs[mIdx].text || '');
        if (fn && mn && (fn === mn || (fn.length > 20 && fn.slice(0, 25) === mn.slice(0, 25)))) {
          mUsed.add(mIdx);
          fMatched[f.id] = mQs[mIdx];
          break;
        }
      }
    });

    // Pass 2: sequential slot match for corrected/replaced text
    const mRemaining = mQs.filter((_, idx) => !mUsed.has(idx));
    const fRemaining = fDocs.filter((f) => !fMatched[f.id]);

    for (let i = 0; i < Math.min(fRemaining.length, mRemaining.length); i++) {
      fMatched[fRemaining[i].id] = mRemaining[i];
    }

    // Build update payloads
    fDocs.forEach((f) => {
      const mq = fMatched[f.id];
      const isVerified = Boolean(f.adminVerified);

      if (isVerified) {
        // Rule 2: DO NOT TOUCH VERIFIED STATUS
        preservedVerified++;
        return; // Keep verified questions exactly as verified
      }

      if (!mq) {
        // Extra question without a master entry (e.g. 48th BCS medical questions)
        untouchedExtra++;
        // We only update tags to ensure batch filter works, and enforce adminVerified: false
        const batchTag = `${b}-bcs`;
        const tags = Array.from(new Set([batchTag, 'bcs', 'bcs-preliminary', 'medical']));
        updates.push({
          id: f.id,
          fields: {
            adminVerified: { booleanValue: false },
            tags: toFirestoreValue(tags),
            updatedBy: { stringValue: 'sync_master_preserve' },
            updatedAt: { timestampValue: nowIso }
          },
          mask: ['adminVerified', 'tags', 'updatedBy', 'updatedAt']
        });
        return;
      }

      // Found unverified match in master JSON
      updatedUnverified++;

      const cleanedQuestion = cleanAndWrapMath((mq.text || '').trim());
      const letters = ['a', 'b', 'c', 'd', 'e'];
      let correctId = 'a';

      const options = (mq.options || []).map((opt, oIdx) => {
        const id = letters[oIdx] || String(oIdx);
        if (opt.isCorrect) correctId = id;
        return {
          id: id,
          text: cleanAndWrapMath((opt.text || '').trim())
        };
      });

      const explanation = cleanAndWrapMath((mq.explanation || '').trim());
      const subjectId = mapSubject(mq.bcsSubject, cleanedQuestion);

      const batchTag = `${b}-bcs`;
      const subjSlug = subjectId.replace('sub_bcs_', '').replace('_', '-');
      const tags = Array.from(new Set([
        batchTag,
        `${b}bcs`,
        'bcs',
        'bcs-preliminary',
        subjSlug,
        ...(mq.examYear ? [String(mq.examYear)] : [])
      ]));

      const docFields = {
        question: { stringValue: cleanedQuestion },
        options: toFirestoreValue(options),
        correctOptionId: { stringValue: correctId },
        explanation: { stringValue: explanation },
        subjectId: { stringValue: subjectId },
        tags: toFirestoreValue(tags),
        adminVerified: { booleanValue: false }, // EXPLICITLY FALSE
        updatedBy: { stringValue: 'sync_master_corrected' },
        updatedAt: { timestampValue: nowIso }
      };

      if (mq.difficulty) {
        docFields.difficulty = { stringValue: mq.difficulty };
      }
      if (mq.examYear) {
        docFields.year = { integerValue: String(mq.examYear) };
      }

      updates.push({
        id: f.id,
        fields: docFields,
        mask: [
          'question',
          'options',
          'correctOptionId',
          'explanation',
          'subjectId',
          'tags',
          'adminVerified',
          'updatedBy',
          'updatedAt',
          ...(mq.difficulty ? ['difficulty'] : []),
          ...(mq.examYear ? ['year'] : [])
        ]
      });
    });
  }

  console.log(`\n--- SYNC SUMMARY ---`);
  console.log(`Preserved Verified Documents (Untouched): ${preservedVerified}`);
  console.log(`Unverified Documents to Update: ${updatedUnverified}`);
  console.log(`Special/Medical Unverified Docs Retained: ${untouchedExtra}`);
  console.log(`Total Write Operations: ${updates.length}`);
  console.log(`DELETION COUNT: 0 (No documents will be deleted)`);

  if (isDryRun) {
    console.log(`\nDry run completed successfully. No writes made to Firestore.`);
    return;
  }

  // Execute in batches of 350 writes
  const token = getToken();
  const chunkSize = 350;
  const totalChunks = Math.ceil(updates.length / chunkSize);
  let committedTotal = 0;

  console.log(`\nUploading ${updates.length} updates across ${totalChunks} chunks...`);

  for (let i = 0; i < updates.length; i += chunkSize) {
    const chunkNum = Math.floor(i / chunkSize) + 1;
    const chunk = updates.slice(i, i + chunkSize);

    const writes = chunk.map(u => ({
      update: {
        name: `projects/${PROJECT_ID}/databases/(default)/documents/questions/${u.id}`,
        fields: u.fields
      },
      updateMask: {
        fieldPaths: u.mask
      }
    }));

    process.stdout.write(`  Processing Chunk ${chunkNum}/${totalChunks} (${writes.length} docs)... `);

    let retries = 3;
    while (retries > 0) {
      try {
        await commitWrites(token, writes);
        committedTotal += writes.length;
        console.log(`OK (${committedTotal}/${updates.length})`);
        break;
      } catch (err) {
        retries--;
        console.log(`Error (${err.message}), retrying...`);
        if (retries === 0) throw err;
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\n🎉 Synchronization complete! ${committedTotal} unverified questions updated successfully.`);
}

main().catch(err => {
  console.error('[Sync] Fatal error:', err);
  process.exit(1);
});
