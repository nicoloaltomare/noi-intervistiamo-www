import express from 'express';
import {
  Candidate,
  CandidateStats,
  CandidateFilters,
  CandidateNote,
  CandidateDocument,
  ApiResponse,
  PaginatedResponse
} from '../models';

const router = express.Router();

// Mock candidates data
const mockCandidates: Candidate[] = [
  {
    id: '1',
    firstName: 'Sara',
    lastName: 'Blu',
    email: 'sara.blu@example.com',
    phone: '+39 333 1234567',
    position: 'Frontend Developer',
    experience: 3,
    status: 'interview',
    source: 'LinkedIn',
    skills: ['React', 'TypeScript', 'CSS', 'HTML', 'JavaScript', 'Angular'],
    education: [
      {
        degree: 'Laurea in Informatica',
        field: 'Computer Science',
        university: 'Università di Milano',
        year: 2021
      }
    ],
    workHistory: [
      {
        company: 'Tech Solutions SRL',
        position: 'Junior Frontend Developer',
        startDate: new Date('2021-09-01'),
        endDate: new Date('2024-02-28'),
        description: 'Sviluppo di applicazioni web con React e TypeScript'
      }
    ],
    documents: [
      {
        id: 'doc1',
        type: 'cv',
        filename: 'CV_Sara_Blu.pdf',
        url: '/files/candidates/1/CV_Sara_Blu.pdf',
        uploadedAt: new Date('2024-03-01')
      }
    ],
    notes: [
      {
        id: 'note1',
        author: 'Giovanni Bianchi',
        content: 'Candidata molto preparata tecnicamente, buona comunicazione',
        createdAt: new Date('2024-03-10'),
        isPrivate: false
      }
    ],
    interviews: ['1'],
    evaluations: [
      {
        interviewId: '1',
        interviewer: 'Giovanni Bianchi',
        score: 85,
        feedback: 'Ottima preparazione tecnica, da considerare per il prossimo step',
        date: new Date('2024-03-15')
      }
    ],
    tags: ['react', 'typescript', 'promettente'],
    priority: 'high',
    expectedSalary: 35000,
    availabilityDate: new Date('2024-04-01'),
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-15')
  },
  {
    id: '2',
    firstName: 'Luca',
    lastName: 'Giallo',
    email: 'luca.giallo@example.com',
    phone: '+39 334 7654321',
    position: 'Backend Developer',
    experience: 5,
    status: 'technical',
    source: 'Company Website',
    skills: ['Node.js', 'Python', 'Docker', 'AWS', 'MongoDB', 'PostgreSQL'],
    education: [
      {
        degree: 'Laurea Magistrale in Ingegneria Informatica',
        field: 'Computer Engineering',
        university: 'Politecnico di Milano',
        year: 2019
      }
    ],
    workHistory: [
      {
        company: 'DataTech Italy',
        position: 'Backend Developer',
        startDate: new Date('2019-10-01'),
        description: 'Sviluppo di API REST e microservizi con Node.js e Python'
      }
    ],
    documents: [
      {
        id: 'doc2',
        type: 'cv',
        filename: 'CV_Luca_Giallo.pdf',
        url: '/files/candidates/2/CV_Luca_Giallo.pdf',
        uploadedAt: new Date('2024-03-05')
      },
      {
        id: 'doc3',
        type: 'portfolio',
        filename: 'Portfolio_Progetti.pdf',
        url: '/files/candidates/2/Portfolio_Progetti.pdf',
        uploadedAt: new Date('2024-03-05')
      }
    ],
    notes: [
      {
        id: 'note2',
        author: 'Marco Neri',
        content: 'Esperienza solida nel backend, buona conoscenza dei microservizi',
        createdAt: new Date('2024-03-18'),
        isPrivate: false
      }
    ],
    interviews: ['2'],
    evaluations: [],
    tags: ['nodejs', 'python', 'senior'],
    priority: 'medium',
    expectedSalary: 45000,
    availabilityDate: new Date('2024-05-01'),
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-03-18')
  },
  {
    id: '3',
    firstName: 'Anna',
    lastName: 'Verde',
    email: 'anna.verde@example.com',
    phone: '+39 335 5555555',
    position: 'HR Specialist',
    experience: 2,
    status: 'new',
    source: 'Recruitment Agency',
    skills: ['HR Management', 'Recruiting', 'Communication', 'Team Building'],
    education: [
      {
        degree: 'Laurea in Psicologia del Lavoro',
        field: 'Work Psychology',
        university: 'Università Statale Milano',
        year: 2022
      }
    ],
    workHistory: [
      {
        company: 'HR Solutions',
        position: 'Junior HR Specialist',
        startDate: new Date('2022-09-01'),
        description: 'Supporto nelle attività di selezione e gestione del personale'
      }
    ],
    documents: [
      {
        id: 'doc4',
        type: 'cv',
        filename: 'CV_Anna_Verde.pdf',
        url: '/files/candidates/3/CV_Anna_Verde.pdf',
        uploadedAt: new Date('2024-03-18')
      }
    ],
    notes: [],
    interviews: ['3'],
    evaluations: [],
    tags: ['hr', 'junior'],
    priority: 'low',
    expectedSalary: 28000,
    availabilityDate: new Date('2024-04-15'),
    createdAt: new Date('2024-03-18'),
    updatedAt: new Date('2024-03-18')
  },
  {
    id: '4',
    firstName: 'Roberto',
    lastName: 'Viola',
    email: 'roberto.viola@example.com',
    phone: '+39 336 9999999',
    position: 'Project Manager',
    experience: 8,
    status: 'hired',
    source: 'Internal Referral',
    skills: ['Project Management', 'Agile', 'Scrum', 'Leadership', 'Communication'],
    education: [
      {
        degree: 'Laurea in Economia e Management',
        field: 'Business Management',
        university: 'Bocconi',
        year: 2016
      }
    ],
    workHistory: [
      {
        company: 'Consulting Group',
        position: 'Senior Project Manager',
        startDate: new Date('2018-01-01'),
        endDate: new Date('2024-02-29'),
        description: 'Gestione progetti IT per clienti enterprise'
      }
    ],
    documents: [
      {
        id: 'doc5',
        type: 'cv',
        filename: 'CV_Roberto_Viola.pdf',
        url: '/files/candidates/4/CV_Roberto_Viola.pdf',
        uploadedAt: new Date('2024-03-05')
      }
    ],
    notes: [
      {
        id: 'note3',
        author: 'Mario Rossi',
        content: 'Eccellente background manageriale, perfetto per il team',
        createdAt: new Date('2024-03-12'),
        isPrivate: true
      }
    ],
    interviews: ['4'],
    evaluations: [
      {
        interviewId: '4',
        interviewer: 'Mario Rossi',
        score: 92,
        feedback: 'Candidato ideale per la posizione, assumere immediatamente',
        date: new Date('2024-03-12')
      }
    ],
    tags: ['project-management', 'leadership', 'hired'],
    priority: 'high',
    expectedSalary: 60000,
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-03-12')
  }
];

const mockCandidateStats: CandidateStats = {
  totalCandidates: mockCandidates.length,
  activeCandidates: mockCandidates.filter(c => !['hired', 'rejected', 'withdrawn'].includes(c.status)).length,
  newCandidates: mockCandidates.filter(c => c.status === 'new').length,
  interviewingCandidates: mockCandidates.filter(c => ['interview', 'technical', 'final'].includes(c.status)).length,
  hiredCandidates: mockCandidates.filter(c => c.status === 'hired').length,
  rejectedCandidates: mockCandidates.filter(c => c.status === 'rejected').length,
  candidatesByStatus: {
    new: mockCandidates.filter(c => c.status === 'new').length,
    screening: mockCandidates.filter(c => c.status === 'screening').length,
    interview: mockCandidates.filter(c => c.status === 'interview').length,
    technical: mockCandidates.filter(c => c.status === 'technical').length,
    final: mockCandidates.filter(c => c.status === 'final').length,
    hired: mockCandidates.filter(c => c.status === 'hired').length,
    rejected: mockCandidates.filter(c => c.status === 'rejected').length,
    withdrawn: mockCandidates.filter(c => c.status === 'withdrawn').length
  },
  candidatesBySource: {
    'LinkedIn': mockCandidates.filter(c => c.source === 'LinkedIn').length,
    'Company Website': mockCandidates.filter(c => c.source === 'Company Website').length,
    'Recruitment Agency': mockCandidates.filter(c => c.source === 'Recruitment Agency').length,
    'Internal Referral': mockCandidates.filter(c => c.source === 'Internal Referral').length
  },
  averageProcessingTime: 15 // Mock average processing time in days
};

// Helper function to apply filters
function applyCandidateFilters(candidates: Candidate[], filters: CandidateFilters): Candidate[] {
  let filtered = [...candidates];

  if (filters.status) {
    filtered = filtered.filter(c => c.status === filters.status);
  }

  if (filters.position) {
    filtered = filtered.filter(c => c.position.toLowerCase().includes(filters.position!.toLowerCase()));
  }

  if (filters.source) {
    filtered = filtered.filter(c => c.source === filters.source);
  }

  if (filters.skills && filters.skills.length > 0) {
    filtered = filtered.filter(c =>
      filters.skills!.some(skill =>
        c.skills.some(candidateSkill =>
          candidateSkill.toLowerCase().includes(skill.toLowerCase())
        )
      )
    );
  }

  if (filters.experience) {
    filtered = filtered.filter(c =>
      c.experience >= (filters.experience!.min || 0) &&
      c.experience <= (filters.experience!.max || 100)
    );
  }

  if (filters.priority) {
    filtered = filtered.filter(c => c.priority === filters.priority);
  }

  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter(c =>
      filters.tags!.some(tag =>
        c.tags.some(candidateTag =>
          candidateTag.toLowerCase().includes(tag.toLowerCase())
        )
      )
    );
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(c =>
      c.firstName.toLowerCase().includes(searchLower) ||
      c.lastName.toLowerCase().includes(searchLower) ||
      c.email.toLowerCase().includes(searchLower) ||
      c.position.toLowerCase().includes(searchLower) ||
      c.skills.some(skill => skill.toLowerCase().includes(searchLower))
    );
  }

  return filtered;
}

// GET /noi-intervistiamo/api/candidates
router.get('/', (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;

  const filters: CandidateFilters = {
    status: req.query.status as string,
    position: req.query.position as string,
    source: req.query.source as string,
    skills: req.query.skills ? (req.query.skills as string).split(',') : undefined,
    experience: req.query.minExp || req.query.maxExp ? {
      min: parseInt(req.query.minExp as string) || 0,
      max: parseInt(req.query.maxExp as string) || 100
    } : undefined,
    priority: req.query.priority as string,
    tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
    search: req.query.search as string
  };

  let filteredCandidates = applyCandidateFilters(mockCandidates, filters);

  // Sort by updated date (most recent first)
  filteredCandidates.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  // Pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCandidates = filteredCandidates.slice(startIndex, endIndex);

  const paginatedResponse: PaginatedResponse<Candidate> = {
    items: paginatedCandidates,
    total: filteredCandidates.length,
    page,
    pageSize,
    totalPages: Math.ceil(filteredCandidates.length / pageSize)
  };

  res.json(paginatedResponse);
});

// GET /noi-intervistiamo/api/candidates/stats
router.get('/stats', (req, res) => {
  res.json(mockCandidateStats);
});

// GET /noi-intervistiamo/api/candidates/:id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const candidate = mockCandidates.find(c => c.id === id);

  if (!candidate) {
    return res.status(404).json({
      error: 'CANDIDATE_NOT_FOUND',
      message: 'Candidato non trovato'
    });
  }

  res.json(candidate);
});

// POST /noi-intervistiamo/api/candidates
router.post('/', (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    position,
    experience,
    source,
    skills,
    education,
    workHistory,
    expectedSalary,
    availabilityDate,
    tags,
    priority
  } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !email || !position) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Campi obbligatori mancanti: firstName, lastName, email, position'
    });
  }

  // Check if candidate with same email already exists
  const existingCandidate = mockCandidates.find(c => c.email === email);
  if (existingCandidate) {
    return res.status(409).json({
      error: 'CANDIDATE_EXISTS',
      message: 'Candidato con questa email esiste già'
    });
  }

  const newCandidate: Candidate = {
    id: (mockCandidates.length + 1).toString(),
    firstName,
    lastName,
    email,
    phone,
    position,
    experience: experience || 0,
    status: 'new',
    source: source || 'Unknown',
    skills: skills || [],
    education: education || [],
    workHistory: workHistory || [],
    documents: [],
    notes: [],
    interviews: [],
    evaluations: [],
    tags: tags || [],
    priority: priority || 'medium',
    expectedSalary,
    availabilityDate: availabilityDate ? new Date(availabilityDate) : undefined,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  mockCandidates.push(newCandidate);

  res.status(201).json(newCandidate);
});

// PUT /noi-intervistiamo/api/candidates/:id
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const candidateIndex = mockCandidates.findIndex(c => c.id === id);

  if (candidateIndex === -1) {
    return res.status(404).json({
      error: 'CANDIDATE_NOT_FOUND',
      message: 'Candidato non trovato'
    });
  }

  const updatedCandidate = {
    ...mockCandidates[candidateIndex],
    ...req.body,
    updatedAt: new Date()
  };

  mockCandidates[candidateIndex] = updatedCandidate;

  res.json(updatedCandidate);
});

// DELETE /noi-intervistiamo/api/candidates/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const candidateIndex = mockCandidates.findIndex(c => c.id === id);

  if (candidateIndex === -1) {
    return res.status(404).json({
      error: 'CANDIDATE_NOT_FOUND',
      message: 'Candidato non trovato'
    });
  }

  mockCandidates.splice(candidateIndex, 1);

  res.status(204).send();
});

// POST /noi-intervistiamo/api/candidates/:id/notes
router.post('/:id/notes', (req, res) => {
  const { id } = req.params;
  const { content, isPrivate = false } = req.body;

  if (!content) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Il contenuto della nota è obbligatorio'
    });
  }

  const candidate = mockCandidates.find(c => c.id === id);
  if (!candidate) {
    return res.status(404).json({
      error: 'CANDIDATE_NOT_FOUND',
      message: 'Candidato non trovato'
    });
  }

  const newNote = {
    id: (candidate.notes.length + 1).toString(),
    author: 'Current User', // In real app, get from auth token
    content,
    createdAt: new Date(),
    isPrivate
  };

  candidate.notes.push(newNote);
  candidate.updatedAt = new Date();

  res.status(201).json(newNote);
});

// GET /noi-intervistiamo/api/candidates/:id/notes
router.get('/:id/notes', (req, res) => {
  const { id } = req.params;
  const candidate = mockCandidates.find(c => c.id === id);

  if (!candidate) {
    return res.status(404).json({
      error: 'CANDIDATE_NOT_FOUND',
      message: 'Candidato non trovato'
    });
  }

  res.json(candidate.notes);
});

export { router as candidateRoutes };