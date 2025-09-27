import express from 'express';
import { Interview, InterviewStats, ApiResponse, PaginatedResponse } from '../models';

const router = express.Router();

// Mock interviews data
const mockInterviews: Interview[] = [
  {
    id: '1',
    title: 'Colloquio Frontend Developer',
    candidateName: 'Sara Blu',
    candidateEmail: 'sara.blu@example.com',
    interviewerName: 'Giovanni Bianchi',
    interviewerId: '2',
    position: 'Frontend Developer',
    status: 'completed',
    scheduledDate: new Date('2024-03-15T10:00:00'),
    duration: 60,
    type: 'technical',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    notes: 'Candidato molto preparato su React e TypeScript',
    score: 85,
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-15')
  },
  {
    id: '2',
    title: 'Colloquio Backend Developer',
    candidateName: 'Luca Giallo',
    candidateEmail: 'luca.giallo@example.com',
    interviewerName: 'Marco Neri',
    interviewerId: '4',
    position: 'Backend Developer',
    status: 'scheduled',
    scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    duration: 90,
    type: 'technical',
    meetingLink: 'https://meet.google.com/xyz-uvwx-rst',
    notes: '',
    createdAt: new Date('2024-03-20'),
    updatedAt: new Date('2024-03-20')
  },
  {
    id: '3',
    title: 'Colloquio HR Specialist',
    candidateName: 'Anna Verde',
    candidateEmail: 'anna.verde@example.com',
    interviewerName: 'Giovanni Bianchi',
    interviewerId: '2',
    position: 'HR Specialist',
    status: 'in-progress',
    scheduledDate: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    duration: 45,
    type: 'hr',
    meetingLink: 'https://meet.google.com/klm-nopq-rst',
    notes: 'Primo colloquio conoscitivo',
    createdAt: new Date('2024-03-18'),
    updatedAt: new Date()
  },
  {
    id: '4',
    title: 'Colloquio Finale Project Manager',
    candidateName: 'Roberto Viola',
    candidateEmail: 'roberto.viola@example.com',
    interviewerName: 'Mario Rossi',
    interviewerId: '1',
    position: 'Project Manager',
    status: 'completed',
    scheduledDate: new Date('2024-03-12T14:30:00'),
    duration: 60,
    type: 'final',
    location: 'Ufficio Milano - Sala Riunioni A',
    notes: 'Colloquio finale con il team management',
    score: 92,
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-03-12')
  }
];

const mockInterviewStats: InterviewStats = {
  totalInterviews: mockInterviews.length,
  activeInterviews: mockInterviews.filter(i => i.status === 'in-progress' || i.status === 'scheduled').length,
  completedInterviews: mockInterviews.filter(i => i.status === 'completed').length,
  scheduledInterviews: mockInterviews.filter(i => i.status === 'scheduled').length,
  pendingEvaluations: mockInterviews.filter(i => i.status === 'completed' && !i.score).length,
  averageScore: mockInterviews
    .filter(i => i.score)
    .reduce((acc, curr) => acc + (curr.score || 0), 0) / mockInterviews.filter(i => i.score).length,
  interviewsByType: {
    technical: mockInterviews.filter(i => i.type === 'technical').length,
    hr: mockInterviews.filter(i => i.type === 'hr').length,
    final: mockInterviews.filter(i => i.type === 'final').length,
    screening: mockInterviews.filter(i => i.type === 'screening').length
  }
};

// GET /noi-intervistiamo/api/interviews
router.get('/', (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;
  const status = req.query.status as string;
  const type = req.query.type as string;
  const interviewerId = req.query.interviewerId as string;
  const search = req.query.search as string;

  let filteredInterviews = [...mockInterviews];

  // Apply filters
  if (status) {
    filteredInterviews = filteredInterviews.filter(interview => interview.status === status);
  }
  if (type) {
    filteredInterviews = filteredInterviews.filter(interview => interview.type === type);
  }
  if (interviewerId) {
    filteredInterviews = filteredInterviews.filter(interview => interview.interviewerId === interviewerId);
  }
  if (search) {
    const searchLower = search.toLowerCase();
    filteredInterviews = filteredInterviews.filter(interview =>
      interview.candidateName.toLowerCase().includes(searchLower) ||
      interview.candidateEmail.toLowerCase().includes(searchLower) ||
      interview.position.toLowerCase().includes(searchLower) ||
      interview.title.toLowerCase().includes(searchLower)
    );
  }

  // Sort by scheduled date (most recent first)
  filteredInterviews.sort((a, b) => b.scheduledDate.getTime() - a.scheduledDate.getTime());

  // Pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedInterviews = filteredInterviews.slice(startIndex, endIndex);

  const paginatedResponse: PaginatedResponse<Interview> = {
    items: paginatedInterviews,
    total: filteredInterviews.length,
    page,
    pageSize,
    totalPages: Math.ceil(filteredInterviews.length / pageSize)
  };

  res.json(paginatedResponse);
});

// GET /noi-intervistiamo/api/interviews/stats
router.get('/stats', (req, res) => {
  res.json(mockInterviewStats);
});

// GET /noi-intervistiamo/api/interviews/:id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const interview = mockInterviews.find(i => i.id === id);

  if (!interview) {
    return res.status(404).json({
      error: 'INTERVIEW_NOT_FOUND',
      message: 'Colloquio non trovato'
    });
  }

  res.json(interview);
});

// POST /noi-intervistiamo/api/interviews
router.post('/', (req, res) => {
  const {
    title,
    candidateName,
    candidateEmail,
    interviewerName,
    interviewerId,
    position,
    scheduledDate,
    duration,
    type,
    location,
    meetingLink
  } = req.body;

  // Validate required fields
  if (!title || !candidateName || !candidateEmail || !interviewerId || !position || !scheduledDate || !duration || !type) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Campi obbligatori mancanti'
    });
  }

  const newInterview: Interview = {
    id: (mockInterviews.length + 1).toString(),
    title,
    candidateName,
    candidateEmail,
    interviewerName,
    interviewerId,
    position,
    status: 'scheduled',
    scheduledDate: new Date(scheduledDate),
    duration,
    type,
    location,
    meetingLink,
    notes: '',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  mockInterviews.push(newInterview);

  res.status(201).json(newInterview);
});

// PUT /noi-intervistiamo/api/interviews/:id
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const interviewIndex = mockInterviews.findIndex(i => i.id === id);

  if (interviewIndex === -1) {
    return res.status(404).json({
      error: 'INTERVIEW_NOT_FOUND',
      message: 'Colloquio non trovato'
    });
  }

  const updatedInterview = {
    ...mockInterviews[interviewIndex],
    ...req.body,
    updatedAt: new Date()
  };

  mockInterviews[interviewIndex] = updatedInterview;

  res.json(updatedInterview);
});

// DELETE /noi-intervistiamo/api/interviews/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const interviewIndex = mockInterviews.findIndex(i => i.id === id);

  if (interviewIndex === -1) {
    return res.status(404).json({
      error: 'INTERVIEW_NOT_FOUND',
      message: 'Colloquio non trovato'
    });
  }

  mockInterviews.splice(interviewIndex, 1);

  res.status(204).send();
});

export { router as interviewRoutes };