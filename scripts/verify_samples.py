# -*- coding: utf-8 -*-
import json
import sys
import random

sys.stdout.reconfigure(encoding='utf-8')
sys.path.append('.')

from scripts.classify_scoring import compute_subject_scores, pick_best_subject

with open(r'C:\Users\AC\.gemini\antigravity\scratch\bcs_question_bank\all_bcs_10th_to_50th_master.json', 'r', encoding='utf-8') as f:
    master = json.load(f)

# Group changed questions by new subject
by_new_subject = {}

for q in master:
    old = q.get('bcsSubject')
    new = pick_best_subject(q.get('text', ''), q.get('options', []), q.get('explanation', ''), old)
    if new != old:
        if new not in by_new_subject:
            by_new_subject[new] = []
        by_new_subject[new].append((old, q.get('bcsBatch'), q.get('text', '')))

random.seed(42)
print("=== SAMPLE VERIFICATION FOR EACH NEW SUBJECT ===")
for subj, items in sorted(by_new_subject.items()):
    print(f"\n==========================================")
    print(f"NEW SUBJECT: {subj.upper()} (Total reclassified into this: {len(items)})")
    print(f"==========================================")
    sample_items = random.sample(items, min(4, len(items)))
    for old, batch, text in sample_items:
        print(f"  [{batch}] (Old: {old:12s}) -> {text[:70]}")
