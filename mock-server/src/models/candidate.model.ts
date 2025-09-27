export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  experience: number; // years of experience
  status: 'new' | 'screening' | 'interview' | 'technical' | 'final' | 'hired' | 'rejected' | 'withdrawn';
  source: string; // where the candidate came from (LinkedIn, website, etc.)
  skills: string[];
  education: {
    degree: string;
    field: string;
    university: string;
    year: number;
  }[];
  workHistory: {
    company: string;
    position: string;
    startDate: Date;
    endDate?: Date;
    description: string;
  }[];
  documents: {
    id: string;
    type: 'cv' | 'cover_letter' | 'portfolio' | 'certificate' | 'other';
    filename: string;
    url: string;
    uploadedAt: Date;
  }[];
  notes: {
    id: string;
    author: string;
    content: string;
    createdAt: Date;
    isPrivate: boolean;
  }[];
  interviews: string[]; // Interview IDs
  evaluations: {
    interviewId: string;
    interviewer: string;
    score: number;
    feedback: string;
    date: Date;
  }[];
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  expectedSalary?: number;
  availabilityDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CandidateStats {
  totalCandidates: number;
  activeCandidates: number;
  newCandidates: number;
  interviewingCandidates: number;
  hiredCandidates: number;
  rejectedCandidates: number;
  candidatesByStatus: {
    new: number;
    screening: number;
    interview: number;
    technical: number;
    final: number;
    hired: number;
    rejected: number;
    withdrawn: number;
  };
  candidatesBySource: {
    [source: string]: number;
  };
  averageProcessingTime: number; // days
}

export interface CandidateFilters {
  status?: string;
  position?: string;
  source?: string;
  skills?: string[];
  experience?: {
    min: number;
    max: number;
  };
  priority?: string;
  tags?: string[];
  search?: string;
}

export interface CandidateNote {
  id: string;
  candidateId: string;
  author: string;
  content: string;
  createdAt: Date;
  isPrivate: boolean;
}

export interface CandidateDocument {
  id: string;
  candidateId: string;
  type: 'cv' | 'cover_letter' | 'portfolio' | 'certificate' | 'other';
  filename: string;
  url: string;
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
}