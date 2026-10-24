// -*- coding: utf-8 -*-
/**
 * Medhavi - Cloud Firestore Question Backup Tool
 * Exports all existing documents from 'questions' collection using listDocuments with pageToken.
 */

const fs = require('fs');
const https = require('https');
const path = require('path');
const os = require('os');

const PROJECT_ID = 'studyhub-bd-39887';
const BACKUP_FILE = path.resolve('C:/Users/AC/.gemini/antigravity/scratch/firestore_backup_pre_wipe.json');
const CONFIG_FILE = path.join(os.homedir(), '.config/configstore/firebase-tools.json');

function getToken() {
  const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  return data.tokens.access_token;
}

function fetchPage(token, pageToken) {
  return new Promise((resolve, reject) => {
    let url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/questions?pageSize=300`;
    if (pageToken) {
      url += `&pageToken=${encodeURIComponent(pageToken)}`;
    }

    const req = https.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode}: ${raw}`));
        }
        try {
          const parsed = JSON.parse(raw);
          resolve({
            documents: parsed.documents || [],
            nextPageToken: parsed.nextPageToken
          });
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
  });
}

async function runBackup() {
  console.log(`[Backup] Starting backup of 'questions' from Firestore (${PROJECT_ID})...`);
  const token = getToken();
  let allDocs = [];
  let pageToken = null;
  let pageNum = 1;

  while (true) {
    process.stdout.write(`  Fetching Page ${pageNum} (${allDocs.length} saved so far)... `);
    const { documents, nextPageToken } = await fetchPage(token, pageToken);
    allDocs = allDocs.concat(documents);
    console.log(`Fetched ${documents.length} docs (Total: ${allDocs.length}).`);

    if (!nextPageToken) {
      console.log('No nextPageToken. All pages retrieved.');
      break;
    }

    pageToken = nextPageToken;
    pageNum++;
  }

  console.log(`[Backup] Finished. Writing ${allDocs.length} documents to:\n  ${BACKUP_FILE}`);
  fs.writeFileSync(BACKUP_FILE, JSON.stringify(allDocs, null, 2), 'utf8');
  console.log('[Backup] Backup completed successfully.');
}

runBackup().catch(err => {
  console.error('[Backup Error]:', err);
  process.exit(1);
});
