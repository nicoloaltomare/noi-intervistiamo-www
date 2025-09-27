export interface Interview {
  id: string;
  title: string;
  candidateName: string;
  candidateEmail: string;
  interviewerName: string;
  interviewerId: string;
  position: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  scheduledDate: Date;
  duration: number; // in minutes
  type: 'technical' | 'hr' | 'final' | 'screening';
  location?: string;
  meetingLink?: string;
  notes?: string;
  score?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InterviewStats {
  totalInterviews: number;
  activeInterviews: number;
  completedInterviews: number;
  scheduledInterviews: number;
  pendingEvaluations: number;
  averageScore: number;
  interviewsByType: {
    technical: number;
    hr: number;
    final: number;
    screening: number;
  };
}