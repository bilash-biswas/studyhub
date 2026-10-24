// -*- coding: utf-8 -*-
/**
 * Medhavi - Delete All Questions from Cloud Firestore
 * Reads all doc names from the backup file, batches them into 400 deletes per commit,
 * and executes atomic batch deletes via Firestore REST API.
 */

const fs = require('fs');
const https = require('https');
const path = require('path');
const os = require('os');

const PROJECT_ID = 'studyhub-bd-39887';
const BACKUP_FILE = path.resolve('C:/Users/AC/.gemini/antigravity/scratch/firestore_backup_pre_wipe.json');
const CONFIG_FILE = path.join(os.homedir(), '.config/configstore/firebase-tools.json');
const COMMIT_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:commit`;

function getToken() {
  const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  return data.tokens.access_token;
}

function commitDeletes(token, docNames) {
  return new Promise((resolve, reject) => {
    const writes = docNames.map(name => ({ delete: name }));
    const payload = JSON.stringify({ writes });

    const req = https.request(COMMIT_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
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

async function runDelete() {
  if (!fs.existsSync(BACKUP_FILE)) {
    throw new Error(`Backup file not found at ${BACKUP_FILE}! Aborting delete for safety.`);
  }

  const backupData = JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf8'));
  const docNames = backupData.map(d => d.name);
  console.log(`[Delete] Found ${docNames.length} questions to delete from Firestore.`);

  const token = getToken();
  const chunkSize = 400;
  const totalChunks = Math.ceil(docNames.length / chunkSize);

  for (let i = 0; i < docNames.length; i += chunkSize) {
    const chunkNum = Math.floor(i / chunkSize) + 1;
    const chunk = docNames.slice(i, i + chunkSize);
    process.stdout.write(`  Deleting Chunk ${chunkNum}/${totalChunks} (${chunk.length} docs)... `);

    let retries = 3;
    while (retries > 0) {
      try {
        await commitDeletes(token, chunk);
        console.log('OK');
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

  console.log('[Delete] All previous questions deleted successfully from Firestore.');
}

runDelete().catch(err => {
  console.error('[Delete Error]:', err);
  process.exit(1);
});
