# -*- coding: utf-8 -*-
"""
Medhavi (মেধাবী) - BCS Question Subject Re-synchronization Script
Corrects mislabeled subjects across all 5,423 authentic BCS questions.
Updates:
1. Local batch JSON files in scratch/bcs_question_bank/
2. Master file all_bcs_10th_to_50th_master.json
3. Cloud Firestore documents in collection 'questions' via REST commit with updateMask
"""

import os
import sys
import json
import time
import datetime
import urllib.request
import urllib.error

sys.stdout.reconfigure(encoding='utf-8')
sys.path.append('.')

from scripts.classify_scoring import compute_subject_scores, pick_best_subject

PROJECT_ID = "studyhub-bd-39887"
BASE_URL = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents"
COMMIT_URL = f"{BASE_URL}:commit"

MASTER_FILE = r"C:\Users\AC\.gemini\antigravity\scratch\bcs_question_bank\all_bcs_10th_to_50th_master.json"
SCRATCH_DIR = r"C:\Users\AC\.gemini\antigravity\scratch\bcs_question_bank"
CONFIG_FILE = os.path.expanduser(r"~/.config/configstore/firebase-tools.json")

SUBJECT_MAP = {
    "bangla": "sub_bcs_bangla",
    "english": "sub_bcs_english",
    "math": "sub_bcs_math",
    "bangladesh": "sub_bcs_bd_affairs",
    "international": "sub_bcs_intl_affairs",
    "science": "sub_bcs_science",
    "computer": "sub_bcs_ict",
    "mental_ability": "sub_bcs_mental_ability",
    "geography": "sub_bcs_geography",
    "ethics": "sub_bcs_ethics",
}

def get_auth_token():
    with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data['tokens']['access_token']

def commit_batch(token, writes):
    payload = json.dumps({"writes": writes}).encode("utf-8")
    req = urllib.request.Request(
        COMMIT_URL,
        data=payload,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        },
        method="POST"
    )
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.load(resp)
            results = data.get("writeResults", [])
            return len(results)
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8', errors='replace')
        print(f"\n[HTTPError {e.code}]: {err_body}")
        raise

def resync():
    print("=" * 65)
    print("Medhavi - BCS Question Bank Subject Reclassification & Sync")
    print("=" * 65)

    token = get_auth_token()
    print("✓ Successfully retrieved Firebase Auth Token.")

    with open(MASTER_FILE, "r", encoding="utf-8") as f:
        master_data = json.load(f)

    print(f"✓ Loaded {len(master_data)} questions from master file.")

    batch_counters = {}
    updates = []
    reclassified_count = 0
    now_iso = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    for idx, raw_q in enumerate(master_data):
        batch = raw_q.get("bcsBatch", "Unknown BCS")
        batch_clean = batch.split()[0].lower() # e.g. "50th"
        batch_counters[batch_clean] = batch_counters.get(batch_clean, 0) + 1
        q_order = batch_counters[batch_clean]
        custom_id = f"bcs_{batch_clean}_{q_order:03d}"

        old_subj = raw_q.get("bcsSubject")
        new_subj = pick_best_subject(
            raw_q.get("text", ""),
            raw_q.get("options", []),
            raw_q.get("explanation", ""),
            old_subj
        )

        if new_subj != old_subj:
            reclassified_count += 1
            raw_q["bcsSubject"] = new_subj
            new_subject_id = SUBJECT_MAP.get(new_subj, "sub_bcs_bangla")

            tags = [
                f"{batch_clean}-bcs",
                "bcs",
                "bcs-preliminary",
                new_subj
            ]

            doc_name = f"projects/{PROJECT_ID}/databases/(default)/documents/questions/{custom_id}"
            write_op = {
                "update": {
                    "name": doc_name,
                    "fields": {
                        "subjectId": {"stringValue": new_subject_id},
                        "tags": {
                            "arrayValue": {
                                "values": [{"stringValue": t} for t in tags]
                            }
                        },
                        "updatedAt": {"timestampValue": now_iso}
                    }
                },
                "updateMask": {
                    "fieldPaths": ["subjectId", "tags", "updatedAt"]
                }
            }
            updates.append(write_op)

    print(f"\n[Classification Results]")
    print(f"  Total Questions: {len(master_data)}")
    print(f"  Total Subject Corrections: {reclassified_count} ({reclassified_count/len(master_data)*100:.1f}%)")
    print(f"  Total Questions Unchanged: {len(master_data) - reclassified_count}")

    # 1. Update master JSON on disk
    with open(MASTER_FILE, "w", encoding="utf-8") as f:
        json.dump(master_data, f, ensure_ascii=False, indent=2)
    print(f"✓ Updated master file: {MASTER_FILE}")

    # 2. Update individual batch JSON files
    batch_map = {}
    for q in master_data:
        b = q.get("bcsBatch")
        if b not in batch_map:
            batch_map[b] = []
        batch_map[b].append(q)

    for b, b_questions in batch_map.items():
        slug = b.split()[0].lower() # e.g. "50th"
        target_fn = os.path.join(SCRATCH_DIR, f"{slug}_bcs_preliminary.json")
        if os.path.exists(target_fn):
            with open(target_fn, "w", encoding="utf-8") as f:
                json.dump(b_questions, f, ensure_ascii=False, indent=2)

    print(f"✓ Updated {len(batch_map)} individual batch JSON files in {SCRATCH_DIR}")

    # 3. Batch commit updates to Firestore
    chunk_size = 250
    total_chunks = (len(updates) + chunk_size - 1) // chunk_size
    print(f"\n[Firestore Database Sync]")
    print(f"  Committing {len(updates)} document updates across {total_chunks} chunks...")

    committed_total = 0
    for c_idx in range(total_chunks):
        chunk = updates[c_idx * chunk_size : (c_idx + 1) * chunk_size]
        print(f"  Uploading Chunk {c_idx + 1}/{total_chunks} ({len(chunk)} docs)...", end=" ", flush=True)
        count = commit_batch(token, chunk)
        committed_total += count
        print(f"✓ Done (Total: {committed_total}/{len(updates)})")
        time.sleep(0.3)

    print("\n" + "=" * 65)
    print(f"✓ All {committed_total} documents successfully updated in Firestore!")
    print("=" * 65)

if __name__ == "__main__":
    resync()
