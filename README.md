# StudyHub (স্টাডিহাব)

> **"Practice. Improve. Succeed."**  
> *A collaborative, high-performance competitive exam preparation platform for Bangladesh.*

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-v12_Modular-FFCA28?logo=firebase)](https://firebase.google.com/)
[![Cost](https://img.shields.io/badge/Infrastructure_Cost-$0_/_0_BDT-10B981)](#strict-0--0-bdt-free-tier-architecture)

---

## 📖 Overview

**StudyHub** is an academic SaaS platform engineered specifically for students and job candidates in Bangladesh preparing for:

- **BCS (Bangladesh Civil Service)** Preliminary & Written examinations
- **Government & Private Bank Job** Officer & Senior Officer recruitments
- **HSC Board Examinations** (Science & General tracks)
- **University Admission & Competitive Tests**

The application delivers seamless rendering of mixed **Bengali Unicode** and complex **LaTeX mathematical equations** (`$x^2 + y^2 = r^2$`), server-anchored timed mock exams with official negative marking rules, real-time live quiz arenas, weak-area diagnostic recommendations, and a daily challenge streak engine.

---

## ⚡ Strict $0 / 0 BDT Free-Tier Architecture

StudyHub is engineered from the ground up to operate in production at approximately **$0 infrastructure cost** by adhering to free-tier quotas:

| Service | Free-Tier Limits | StudyHub Architectural Optimization |
|---|---|---|
| **Vercel Hobby** | Unlimited deployments, global edge CDN | Next.js App Router, Turbopack, static page generation |
| **Firebase Auth** | 50,000 MAU | Email/Password & Google Sign-In with client-side session persistence |
| **Cloud Firestore** | 50k reads/day, 20k writes/day | **Zero writes per click**: answers stay in local React state until submission. Attempts written in atomic batch. Cursor pagination everywhere. |
| **Firebase Storage** | 1 GB storage, 10 GB/month download | Client-side HTML5 Canvas WebP compression (max 1200px, 80% quality) prior to upload |
| **Realtime Listeners** | Concurrent connections | Active `onSnapshot` listeners are strictly scoped to live multiplayer quiz rooms; closed immediately upon room exit. |

---

## ✨ Key Platform Features

### 1. 🧮 KaTeX Mixed-Text & Bengali Rendering
- Custom zero-latency `<MathText text={...} />` parser for inline (`$...$`) and block (`$$...$$`) LaTeX formulas.
- First-class support for Bengali Unicode script (`বাংলা ফন্ট`) and Bangladeshi Taka (`৳`).
- Formatted across questions, option choices (A, B, C, D), step-by-step explanations, and real-time candidate live preview in the Admin question builder.

### 2. ⚡ Practice Engine (`/practice`)
- Flexible practice setup: select exam track, subject curriculum, difficulty tier, and question count.
- **Two Feedback Modes**:
  - **Instant Feedback**: immediate correct/wrong validation with step-by-step solutions for rapid revision.
  - **Exam Simulation**: no immediate feedback; mimics official test-taking conditions.
- Local state answer recording with Fisher-Yates deterministic randomization.

### 3. ⏱️ Timed Mock Exams (`/exams`)
- Server-anchored countdown timer immune to browser refreshes or background tab sleeping.
- Official negative marking penalties: **0.5 marks** deduction for BCS, **0.25 marks** for Bank recruitments.
- Question palette with status bubbles (Answered, Skipped, Flagged for Review).
- Automatic submission on timer expiration.

### 4. 📊 Detailed Scorecard & Review (`/results/[attemptId]`)
- Comprehensive score breakdown: final score, percentage, accuracy rate, time taken, and average pace per question.
- Question-by-question review with color-coded selections and mathematical solutions.
- **One-Click "Practice Mistakes"**: instantly launches a targeted drill containing only questions the candidate got wrong.

### 5. 🔍 Mistake Bank (`/mistakes`) & Bookmarks (`/bookmarks`)
- **Mistake Bank**: tracks every question where the candidate recorded an incorrect answer.
- **Bookmarks**: quick-flag questions during drills or reviews for future revision.
- One-click drills for all mistake questions or bookmarked sets.

### 6. 📈 Weak-Area Diagnostic Analytics (`/analytics`)
- Subject-by-subject accuracy breakdown.
- Rule-based weakness detector (`attempts >= 10 && accuracy < 60% = Weak Area`).
- Direct **"Drill Weak Area"** button to target low-accuracy topics immediately.

### 7. 🔥 Daily Challenge & Streak Engine (`/daily`)
- Single shared 5-question daily brain teaser generated deterministically per day.
- Daily streak counter (with flame indicator) automatically updated upon practice.

### 8. 🏆 Competitive Leaderboards (`/leaderboard`)
- Top-ranking candidates across Bangladesh.
- Filterable by **Daily**, **Weekly**, and **All-Time** periods.
- Top-3 podium (Gold, Silver, Bronze) and complete candidate standings table.

### 9. 👥 Real-Time Live Quiz Rooms (`/live`)
- Multiplayer quiz arena with 6-character room codes (e.g. `BCS892`).
- Real-time `onSnapshot` synchronization for joined players and live scoreboard.
- Synchronized 20-second question timers with speed-based bonus scoring.
- Final podium celebration upon quiz completion.

### 10. 🛡️ Admin Management Console (`/admin`)
- Role-guarded dashboard with metrics and curricula seeder.
- Question Bank CRUD with live KaTeX preview and WebP image uploads (`/admin/questions`).
- Exam Tracks manager (`/admin/exams`).
- Subject Curricula manager (`/admin/subjects`).
- Mock Tests builder (`/admin/mock-tests`).
- User Management & Admin privilege assignment (`/admin/users`).

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Design Tokens**: Indigo (`#4F46E5`), Sky Blue (`#0EA5E9`), Emerald (`#10B981`), Amber (`#F59E0B`), Slate Neutrals
- **Icons**: [Lucide React](https://lucide.dev/)
- **Math Engine**: [KaTeX](https://katex.org/)
- **Database & Auth**: [Firebase](https://firebase.google.com/) (Auth, Firestore, Storage)
- **Testing**: [Vitest](https://vitest.dev/) (54 unit tests)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js `18.18+` or `20.x+`
- A free [Firebase Console](https://console.firebase.google.com/) project (Spark Plan)

### 2. Clone & Install
```bash
git clone https://github.com/your-username/studyhub.git
cd studyhub
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:

```env
# Firebase Client Configuration (From Firebase Console > Project Settings)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run Automated Tests
```bash
npm test
```
Executes all 54 Vitest unit tests covering scoring algorithms, negative marking, streak progression, timer calculations, weakness classification, and validation schemas.

---

## 🔒 Firebase Security Rules & Indexes

### Deploy Firestore Rules & Indexes
```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

The repository includes:
- `firestore.rules`: Comprehensive role-based access rules (protects user documents, attempts, and admin-only collections).
- `storage.rules`: Strict size (<2 MB) and image mime-type verification.
- `firestore.indexes.json`: Composite indexes required for high-speed pagination and leaderboard ordering.

---

## 🚢 Deployment to Vercel (Hobby Tier)

1. Push your repository to **GitHub**.
2. Go to [Vercel](https://vercel.com/) and click **"New Project"**.
3. Import your StudyHub GitHub repository.
4. Add the environment variables from your `.env.local` file into Vercel Project Settings.
5. Click **Deploy**. Vercel will build the application using Next.js Turbopack and deploy to your custom `*.vercel.app` domain at **$0 / month**.

---

## 📄 License

MIT License. Free to use for personal, academic, and non-commercial educational purposes.
