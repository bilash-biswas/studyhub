import { getDocs, query, limit } from "firebase/firestore";
import { examsCol } from "@/lib/firebase/firestore";
import { createExam } from "./exam-service";
import { createSubject } from "./subject-service";

export interface SeedExamDefinition {
  id: string;
  name: string;
  slug: string;
  description: string;
  order: number;
  subjects: {
    id: string;
    name: string;
    description: string;
    order: number;
  }[];
}

export const DEFAULT_CATALOGS: SeedExamDefinition[] = [
  {
    id: "exam_bcs",
    name: "BCS (Bangladesh Civil Service)",
    slug: "bcs",
    description: "Preliminary preparation for 46th & 47th BCS General and Technical cadres.",
    order: 1,
    subjects: [
      {
        id: "sub_bcs_bangla",
        name: "বাংলা ভাষা ও সাহিত্য",
        description: "প্রাচীন, মধ্য ও আধুনিক যুগ, বাংলা ব্যাকরণ ও সাহিত্যিক পরিচিতি",
        order: 1,
      },
      {
        id: "sub_bcs_english",
        name: "English Language & Literature",
        description: "Grammar, Vocabulary, Idioms, Literature periods and renowned works",
        order: 2,
      },
      {
        id: "sub_bcs_math",
        name: "গাণিতিক যুক্তি (Mathematics)",
        description: "বীজগণিত, পাটিগণিত, জ্যামিতি, বিন্যাস-সমাবেশ ও সম্ভাব্যতা",
        order: 3,
      },
      {
        id: "sub_bcs_bd_affairs",
        name: "বাংলাদেশ বিষয়াবলি",
        description: "ইতিহাস, মুক্তিযুদ্ধ, সংবিধান, অর্থনীতি ও সাম্প্রতিক বাংলাদেশ",
        order: 4,
      },
      {
        id: "sub_bcs_intl_affairs",
        name: "আন্তর্জাতিক বিষয়াবলি",
        description: "আন্তর্জাতিক সম্পর্ক, বিশ্বরাজনীতি, সংস্থা ও সাম্প্রতিক ঘটনাবলি",
        order: 5,
      },
      {
        id: "sub_bcs_science",
        name: "সাধারণ বিজ্ঞান",
        description: "ভৌত বিজ্ঞান, জীববিজ্ঞান ও আধুনিক বিজ্ঞান ও প্রযুক্তি",
        order: 6,
      },
      {
        id: "sub_bcs_ict",
        name: "তথ্য ও যোগাযোগ প্রযুক্তি (ICT)",
        description: "কম্পিউটার ফান্ডামেন্টাল, নেটওয়ার্কিং, ডাটাবেস ও ক্লাউড কম্পিউটিং",
        order: 7,
      },
      {
        id: "sub_bcs_mental_ability",
        name: "মানসিক দক্ষতা",
        description: "ভাষাগত যৌক্তিক বিচার, সমস্যা সমাধান ও স্থানিক সম্পর্ক",
        order: 8,
      },
      {
        id: "sub_bcs_geography",
        name: "ভূগোল, পরিবেশ ও দুর্যোগ ব্যবস্থাপনা",
        description: "বাংলাদেশ ও বৈশ্বিক ভূগোল, পরিবেশ দূষণ ও প্রাকৃতিক দুর্যোগ",
        order: 9,
      },
      {
        id: "sub_bcs_ethics",
        name: "নৈতিকতা, মূল্যবোধ ও সুশাসন",
        description: "মূল্যবোধের ধারণা, সুশাসনের মূলনীতি ও নাগরিক অধিকার",
        order: 10,
      },
    ],
  },
  {
    id: "exam_bank_job",
    name: "Bank Job Recruitment",
    slug: "bank-job",
    description: "Preparation for Combined 8 & 10 Banks Senior Officer, Officer, and Cash Officer positions.",
    order: 2,
    subjects: [
      {
        id: "sub_bank_math",
        name: "Mathematics (Quantitative Aptitude)",
        description: "Arithmetic shortcuts, Algebra, Geometry, Data Interpretation",
        order: 1,
      },
      {
        id: "sub_bank_english",
        name: "English Language & Comprehension",
        description: "Vocabulary, Sentence Correction, Fill in the blanks, Reading Passage",
        order: 2,
      },
      {
        id: "sub_bank_bangla",
        name: "Bengali Language & Literature",
        description: "Bangla Grammar, Vocabulary, Translation, and Literature",
        order: 3,
      },
      {
        id: "sub_bank_gk",
        name: "General Knowledge (Bangladesh & Global)",
        description: "National & Global Economy, Banking Terminology, Current Affairs",
        order: 4,
      },
      {
        id: "sub_bank_ict",
        name: "Basic Computer & ICT",
        description: "Hardware, Software, Internet, Networking, Cybersecurity, MS Office",
        order: 5,
      },
      {
        id: "sub_bank_finance",
        name: "Banking & Financial Knowledge",
        description: "Bangladesh Bank regulations, Monetary policy, Commercial banking, Accounting basics",
        order: 6,
      },
    ],
  },
  {
    id: "exam_govt_jobs",
    name: "Primary & Govt Job Recruitment",
    slug: "govt-jobs",
    description: "Preparation for Primary Assistant Teacher (ডিপিই), NTRCA Teacher Registration, and 9th–20th Grade Ministry recruitments.",
    order: 3,
    subjects: [
      {
        id: "sub_govt_bangla",
        name: "বাংলা ভাষা ও সাহিত্য",
        description: "বাংলা ব্যাকরণ, বানান শুদ্ধি, বাগধারা, সাহিত্য ও কবি-সাহিত্যিকদের জীবনী",
        order: 1,
      },
      {
        id: "sub_govt_english",
        name: "English Language & Grammar",
        description: "Parts of Speech, Tense, Voice, Prepositions, Vocabulary, Spelling & Idioms",
        order: 2,
      },
      {
        id: "sub_govt_math",
        name: "গণিত ও মানসিক দক্ষতা (Mathematics)",
        description: "পাটিগণিত (শতকরা, লাভ-ক্ষতি, সুদকষা), বীজগণিতীয় সূত্রাবলি ও জ্যামিতি",
        order: 3,
      },
      {
        id: "sub_govt_gk",
        name: "সাধারণ জ্ঞান (বাংলাদেশ ও আন্তর্জাতিক)",
        description: "বাংলাদেশের ইতিহাস, মুক্তিযুদ্ধ, সংবিধান, ভূগোল ও সাম্প্রতিক আন্তর্জাতিক ঘটনা",
        order: 4,
      },
      {
        id: "sub_govt_science_ict",
        name: "সাধারণ বিজ্ঞান ও তথ্যপ্রযুক্তি",
        description: "দৈনন্দিন বিজ্ঞান, কম্পিউটার ফান্ডামেন্টাল ও মোবাইল-ইন্টারনেট প্রযুক্তি",
        order: 5,
      },
    ],
  },
];

/**
 * Idempotently seeds default exam and subject catalogs if the exams collection is empty.
 * Protects Spark free tier by checking first with limit(1).
 */
export async function seedDefaultCatalogs(): Promise<{ seeded: boolean; examCount: number; subjectCount: number }> {
  try {
    const checkSnapshot = await getDocs(query(examsCol(), limit(1)));
    if (!checkSnapshot.empty) {
      return { seeded: false, examCount: 0, subjectCount: 0 };
    }

    let examCount = 0;
    let subjectCount = 0;

    for (const examDef of DEFAULT_CATALOGS) {
      await createExam(
        {
          name: examDef.name,
          slug: examDef.slug,
          description: examDef.description,
          order: examDef.order,
          isActive: true,
        },
        examDef.id
      );
      examCount++;

      for (const subDef of examDef.subjects) {
        await createSubject(
          {
            examId: examDef.id,
            name: subDef.name,
            description: subDef.description,
            order: subDef.order,
            isActive: true,
          },
          subDef.id
        );
        subjectCount++;
      }
    }

    return { seeded: true, examCount, subjectCount };
  } catch (error) {
    console.error("Error seeding default catalogs:", error);
    return { seeded: false, examCount: 0, subjectCount: 0 };
  }
}
