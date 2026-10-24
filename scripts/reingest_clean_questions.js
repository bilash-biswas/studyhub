// -*- coding: utf-8 -*-
/**
 * Medhavi - Batch Ingest Cleaned Questions with adminVerified into Cloud Firestore
 */

const fs = require('fs');
const https = require('https');
const path = require('path');
const os = require('os');

const PROJECT_ID = 'studyhub-bd-39887';
const CLEAN_FILE = path.resolve('C:/Users/AC/.gemini/antigravity/scratch/bcs_question_bank/all_bcs_10th_to_50th_cleaned.json');
const CONFIG_FILE = path.join(os.homedir(), '.config/configstore/firebase-tools.json');
const COMMIT_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:commit`;

function getToken() {
  const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  return data.tokens.access_token;
}

function toFirestoreValue(val) {
  if (val === null || val === undefined) {
    return { nullValue: null };
  }
  if (typeof val === 'boolean') {
    return { booleanValue: val };
  }
  if (typeof val === 'number') {
    if (Number.isInteger(val)) {
      return { integerValue: String(val) };
    }
    return { doubleValue: val };
  }
  if (typeof val === 'string') {
    return { stringValue: val };
  }
  if (Array.isArray(val)) {
    return {
      arrayValue: {
        values: val.map(toFirestoreValue)
      }
    };
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

async function runIngest() {
  console.log(`[Ingest] Reading verified questions from:\n  ${CLEAN_FILE}`);
  const questions = JSON.parse(fs.readFileSync(CLEAN_FILE, 'utf8'));
  console.log(`[Ingest] Loaded ${questions.length} clean questions.`);

  const token = getToken();
  const nowIso = new Date().toISOString();
  const chunkSize = 350; // safe chunk size below 500 limit
  const totalChunks = Math.ceil(questions.length / chunkSize);

  let committedCount = 0;

  for (let i = 0; i < questions.length; i += chunkSize) {
    const chunkNum = Math.floor(i / chunkSize) + 1;
    const chunk = questions.slice(i, i + chunkSize);

    const writes = chunk.map((q) => {
      const docName = `projects/${PROJECT_ID}/databases/(default)/documents/questions/${q.id}`;
      const fields = {
        examId: { stringValue: q.examId || 'exam_bcs' },
        subjectId: { stringValue: q.subjectId },
        question: { stringValue: q.question },
        options: toFirestoreValue(q.options),
        correctOptionId: { stringValue: q.correctOptionId },
        explanation: { stringValue: q.explanation || '' },
        difficulty: { stringValue: q.difficulty || 'medium' },
        source: { stringValue: q.source || 'BCS Preliminary' },
        tags: toFirestoreValue(q.tags || []),
        status: { stringValue: q.status || 'published' },
        adminVerified: { booleanValue: true }, // Explicit Admin Verified boolean
        createdBy: { stringValue: 'admin_verified_audit' },
        updatedBy: { stringValue: 'admin_verified_audit' },
        createdAt: { timestampValue: nowIso },
        updatedAt: { timestampValue: nowIso }
      };

      if (q.year) {
        fields.year = { integerValue: String(q.year) };
      }
      if (q.imageUrl) {
        fields.imageUrl = { stringValue: q.imageUrl };
      }

      return {
        update: {
          name: docName,
          fields: fields
        }
      };
    });

    process.stdout.write(`  Uploading Chunk ${chunkNum}/${totalChunks} (${writes.length} writes)... `);

    let retries = 3;
    while (retries > 0) {
      try {
        await commitWrites(token, writes);
        committedCount += writes.length;
        console.log(`OK (${committedCount}/${questions.length})`);
        break;
      } catch (err) {
        retries--;
        console.log(`Error (${err.message}), retrying...`);
        if (retries === 0) throw err;
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    await new Promise(r => setTimeout(r, 250));
  }

  console.log(`[Ingest] Ingestion complete! Successfully uploaded ${committedCount} verified questions to Firestore.`);
}

runIngest().catch(err => {
  console.error('[Ingest Error]:', err);
  process.exit(1);
});
