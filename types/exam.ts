export interface Exam {
  id: string;
  name: string; // e.g. "BCS (Civil Service)", "Bank Job Recruitment", "Primary & Govt Jobs"
  slug: string; // "bcs", "bank-job", "govt-jobs"
  description?: string;
  icon?: string;
  order: number;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface Subject {
  id: string;
  examId: string;
  name: string; // e.g. "তথ্য ও যোগাযোগ প্রযুক্তি (ICT)", "বাংলা", "English", "গণিত"
  description?: string;
  order: number;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}
