// -*- coding: utf-8 -*-
/**
 * Medhavi (মেধাবী) - Emergency Rollback & Full Restoration from Pristine Backup
 *
 * This restores:
 * 1. ALL 4 OPTIONS for English (and all subjects) - fixing single-option overwrite.
 * 2. Original authentic correctOptionId - restoring flipped/inverted answer keys.
 * 3. Proper subjectId categories (865 Bangladesh Affairs, 979 Bangla, 1,419 English, etc.).
 * 4. Preserves adminVerified: true for all 544 manually verified questions.
 * 5. Sets adminVerified: false for all unverified questions.
 * 6. ZERO DELETIONS: strictly updates fields via Firestore :commit updateMask.
 */

const fs = require('fs');
const https = require('https');
const path = require('path');
const os = require('os');

const PROJECT_ID = 'studyhub-bd-39887';
const BACKUP_FILE = path.resolve('C:/Users/AC/.gemini/antigravity/scratch/firestore_backup_pre_wipe.json');
const FS_STATE_FILE = path.resolve('C:/Users/AC/.gemini/antigravity/scratch/current_firestore_state.json');
const CONFIG_FILE = path.join(os.homedir(), '.config/configstore/firebase-tools.json');
const COMMIT_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:commit`;

function getToken() {
  const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  return data.tokens.access_token;
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
  console.log(`[Restore] Starting ${isDryRun ? 'DRY-RUN' : 'LIVE'} emergency restoration...`);

  const backup = JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf8'));
  const current = JSON.parse(fs.readFileSync(FS_STATE_FILE, 'utf8'));

  console.log(`[Restore] Loaded ${backup.length} documents from pristine backup.`);
  console.log(`[Restore] Loaded ${current.length} documents currently in Firestore.`);

  // Map backup by trailing index number
  const backupByNum = {};
  backup.forEach((d, idx) => {
    backupByNum[idx + 1] = d;
  });

  const nowIso = new Date().toISOString();
  const updates = [];
  let preservedVerified = 0;
  let restoredUnverified = 0;
  let fourOptionsRestored = 0;

  for (const c of current) {
    const m = c.id.match(/_(\d+)$/);
    if (!m) {
      console.warn(`[Restore] Skipping unparseable ID: ${c.id}`);
      continue;
    }
    const num = parseInt(m[1], 10);
    const bDoc = backupByNum[num];
    if (!bDoc) {
      console.warn(`[Restore] No backup doc for number ${num} (${c.id})`);
      continue;
    }

    const bFields = bDoc.fields;
    const isCurrentlyVerified = Boolean(c.adminVerified);

    if (isCurrentlyVerified) {
      preservedVerified++;
    } else {
      restoredUnverified++;
    }

    const optsCount = bFields.options?.arrayValue?.values?.length || 0;
    if (optsCount === 4) fourOptionsRestored++;

    // Ensure batch tag format (e.g. "10th-bcs") is included in tags
    const batchSlug = c.source?.split(' ')[0]?.toLowerCase() || '';
    const existingTags = bFields.tags?.arrayValue?.values?.map(v => v.stringValue) || [];
    const normalizedTags = Array.from(new Set([
      ...(batchSlug ? [`${batchSlug}-bcs`] : []),
      ...existingTags
    ])).map(t => ({ stringValue: t }));

    // Prepare fields to restore
    const fieldsToUpdate = {
      question: bFields.question,
      options: bFields.options,
      correctOptionId: bFields.correctOptionId,
      explanation: bFields.explanation || { stringValue: '' },
      subjectId: bFields.subjectId,
      tags: { arrayValue: { values: normalizedTags } },
      adminVerified: { booleanValue: isCurrentlyVerified }, // Preserve true for verified, false for unverified!
      updatedBy: { stringValue: 'emergency_backup_restore' },
      updatedAt: { timestampValue: nowIso }
    };

    if (bFields.difficulty) fieldsToUpdate.difficulty = bFields.difficulty;
    if (bFields.year) fieldsToUpdate.year = bFields.year;

    updates.push({
      id: c.id,
      fields: fieldsToUpdate,
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
        ...(bFields.difficulty ? ['difficulty'] : []),
        ...(bFields.year ? ['year'] : [])
      ]
    });
  }

  console.log(`\n--- RESTORATION PLAN ---`);
  console.log(`Total documents to restore: ${updates.length}`);
  console.log(`Verified questions preserved (adminVerified: true): ${preservedVerified}`);
  console.log(`Unverified questions restored (adminVerified: false): ${restoredUnverified}`);
  console.log(`Questions with full 4-options restored: ${fourOptionsRestored}`);
  console.log(`DELETION COUNT: 0 (No documents will be deleted)`);

  if (isDryRun) {
    console.log(`\nDry run completed successfully. No changes written.`);
    return;
  }

  const token = getToken();
  const chunkSize = 350;
  const totalChunks = Math.ceil(updates.length / chunkSize);
  let committedTotal = 0;

  console.log(`\nWriting ${updates.length} updates across ${totalChunks} chunks to Firestore...`);

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

  console.log(`\n🎉 Full restoration complete! ${committedTotal} documents restored to their pristine, authentic state.`);
}

main().catch(err => {
  console.error('[Restore] Fatal error:', err);
  process.exit(1);
});
