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
    id: "exam_hsc",
    name: "HSC Board Examination",
    slug: "hsc",
    description: "Higher Secondary Certificate board exam and University Admission MCQ preparation.",
    order: 3,
    subjects: [
      {
        id: "sub_hsc_physics",
        name: "পদার্থবিজ্ঞান (Physics)",
        description: "১ম ও ২য় পত্র: বলবিদ্যা, তাপগতিবিদ্যা, আলো, তড়িৎ ও আধুনিক পদার্থবিজ্ঞান",
        order: 1,
      },
      {
        id: "sub_hsc_chemistry",
        name: "রসায়ন (Chemistry)",
        description: "১ম ও ২য় পত্র: গুণগত রসায়ন, পর্যায়বৃত্ত ধর্ম, জৈব রসায়ন ও পরিবেশ রসায়ন",
        order: 2,
      },
      {
        id: "sub_hsc_higher_math",
        name: "উচ্চতর গণিত (Higher Mathematics)",
        description: "১ম ও ২য় পত্র: মেট্রিক্স, ক্যালকুলাস, ত্রিকোণমিতি, জটিল সংখ্যা ও কনিক",
        order: 3,
      },
      {
        id: "sub_hsc_biology",
        name: "জীববিজ্ঞান (Biology)",
        description: "১ম ও ২য় পত্র: উদ্ভিদবিজ্ঞান, প্রাণিবিজ্ঞান ও জিনতত্ত্ব",
        order: 4,
      },
      {
        id: "sub_hsc_ict",
        name: "তথ্য ও যোগাযোগ প্রযুক্তি (HSC ICT)",
        description: "বিশ্ব ও বাংলাদেশ প্রেক্ষিত, কমিউনিকেশন সিস্টেম, এইচটিএমএল ও সি প্রোগ্রামিং",
        order: 5,
      },
      {
        id: "sub_hsc_bangla",
        name: "বাংলা (Bangla 1st & 2nd)",
        description: "সাহিত্যপাঠ, সহপাঠ ও বাংলা ব্যাকরণ",
        order: 6,
      },
      {
        id: "sub_hsc_english",
        name: "English (1st & 2nd Paper)",
        description: "Grammar items, Comprehension, and Vocabulary",
        order: 7,
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
