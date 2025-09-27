import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  FileUpload,
  FileUploadRequest,
  FileUploadResponse,
  FileStats,
  FileBatch,
  FileFilters,
  ApiResponse,
  PaginatedResponse
} from '../models';

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { category = 'other', entityType = 'system' } = req.body;
    const subDir = path.join(uploadsDir, entityType, category);

    // Create subdirectory if it doesn't exist
    if (!fs.existsSync(subDir)) {
      fs.mkdirSync(subDir, { recursive: true });
    }

    cb(null, subDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req: express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow specific file types
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'text/plain',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/wav'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Max 5 files per request
  }
});

// Mock files data
const mockFiles: FileUpload[] = [
  {
    id: '1',
    filename: 'CV_Sara_Blu-1234567890.pdf',
    originalName: 'CV_Sara_Blu.pdf',
    mimetype: 'application/pdf',
    size: 524288, // 512KB
    path: '/uploads/candidate/cv/CV_Sara_Blu-1234567890.pdf',
    url: '/noi-intervistiamo/api/files/1/download',
    uploadedBy: '1',
    uploadedAt: new Date('2024-03-01T10:00:00Z'),
    category: 'cv',
    entityType: 'candidate',
    entityId: '1',
    isPublic: false,
    metadata: {
      pages: 2
    },
    tags: ['sara-blu', 'frontend', 'cv'],
    description: 'CV di Sara Blu per posizione Frontend Developer'
  },
  {
    id: '2',
    filename: 'Portfolio_Luca_Giallo-1234567891.pdf',
    originalName: 'Portfolio_Progetti.pdf',
    mimetype: 'application/pdf',
    size: 1048576, // 1MB
    path: '/uploads/candidate/portfolio/Portfolio_Luca_Giallo-1234567891.pdf',
    url: '/noi-intervistiamo/api/files/2/download',
    uploadedBy: '2',
    uploadedAt: new Date('2024-03-05T14:30:00Z'),
    category: 'portfolio',
    entityType: 'candidate',
    entityId: '2',
    isPublic: false,
    metadata: {
      pages: 8
    },
    tags: ['luca-giallo', 'backend', 'portfolio'],
    description: 'Portfolio progetti di Luca Giallo'
  },
  {
    id: '3',
    filename: 'photo_giovanni_bianchi-1234567892.jpg',
    originalName: 'profile_photo.jpg',
    mimetype: 'image/jpeg',
    size: 204800, // 200KB
    path: '/uploads/user/profile_photo/photo_giovanni_bianchi-1234567892.jpg',
    url: '/noi-intervistiamo/api/files/3/download',
    uploadedBy: '2',
    uploadedAt: new Date('2024-02-20T09:15:00Z'),
    category: 'profile_photo',
    entityType: 'user',
    entityId: '2',
    isPublic: true,
    metadata: {
      width: 400,
      height: 400
    },
    tags: ['profile', 'giovanni-bianchi'],
    description: 'Foto profilo di Giovanni Bianchi'
  },
  {
    id: '4',
    filename: 'certificato_aws-1234567893.pdf',
    originalName: 'AWS_Certified_Developer.pdf',
    mimetype: 'application/pdf',
    size: 307200, // 300KB
    path: '/uploads/candidate/certificate/certificato_aws-1234567893.pdf',
    url: '/noi-intervistiamo/api/files/4/download',
    uploadedBy: '1',
    uploadedAt: new Date('2024-03-10T16:45:00Z'),
    category: 'certificate',
    entityType: 'candidate',
    entityId: '2',
    isPublic: false,
    metadata: {
      pages: 1
    },
    tags: ['aws', 'certification', 'luca-giallo'],
    description: 'Certificazione AWS Developer di Luca Giallo'
  }
];

// Mock file batches
const mockFileBatches: FileBatch[] = [
  {
    id: '1',
    name: 'Documenti Sara Blu',
    description: 'Tutti i documenti del candidato Sara Blu',
    files: ['1'],
    createdBy: '2',
    createdAt: new Date('2024-03-01T10:00:00Z'),
    updatedAt: new Date('2024-03-01T10:00:00Z'),
    isActive: true
  },
  {
    id: '2',
    name: 'Portfolio Luca Giallo',
    description: 'Portfolio e certificazioni di Luca Giallo',
    files: ['2', '4'],
    createdBy: '1',
    createdAt: new Date('2024-03-05T14:30:00Z'),
    updatedAt: new Date('2024-03-10T16:45:00Z'),
    isActive: true
  }
];

// Helper function to get file type from mimetype
function getFileType(mimetype: string): string {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype === 'application/pdf') return 'pdf';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('audio/')) return 'audio';
  if (mimetype.includes('document') || mimetype.includes('word') || mimetype.includes('text')) return 'document';
  return 'other';
}

// Helper function to calculate file stats
function calculateFileStats(): FileStats {
  const totalSize = mockFiles.reduce((sum, file) => sum + file.size, 0);
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentUploads = mockFiles.filter(file => file.uploadedAt > yesterday).length;

  return {
    totalFiles: mockFiles.length,
    totalSize,
    filesByCategory: {
      cv: mockFiles.filter(f => f.category === 'cv').length,
      cover_letter: mockFiles.filter(f => f.category === 'cover_letter').length,
      portfolio: mockFiles.filter(f => f.category === 'portfolio').length,
      certificate: mockFiles.filter(f => f.category === 'certificate').length,
      profile_photo: mockFiles.filter(f => f.category === 'profile_photo').length,
      document: mockFiles.filter(f => f.category === 'document').length,
      other: mockFiles.filter(f => f.category === 'other').length
    },
    filesByType: {
      image: mockFiles.filter(f => getFileType(f.mimetype) === 'image').length,
      pdf: mockFiles.filter(f => getFileType(f.mimetype) === 'pdf').length,
      document: mockFiles.filter(f => getFileType(f.mimetype) === 'document').length,
      video: mockFiles.filter(f => getFileType(f.mimetype) === 'video').length,
      audio: mockFiles.filter(f => getFileType(f.mimetype) === 'audio').length,
      other: mockFiles.filter(f => getFileType(f.mimetype) === 'other').length
    },
    recentUploads,
    storageUsed: totalSize,
    storageLimit: 1024 * 1024 * 1024 // 1GB limit
  };
}

// Helper function to apply file filters
function applyFileFilters(files: FileUpload[], filters: FileFilters): FileUpload[] {
  let filtered = [...files];

  if (filters.category) {
    filtered = filtered.filter(f => f.category === filters.category);
  }

  if (filters.entityType) {
    filtered = filtered.filter(f => f.entityType === filters.entityType);
  }

  if (filters.entityId) {
    filtered = filtered.filter(f => f.entityId === filters.entityId);
  }

  if (filters.uploadedBy) {
    filtered = filtered.filter(f => f.uploadedBy === filters.uploadedBy);
  }

  if (filters.mimetype) {
    filtered = filtered.filter(f => f.mimetype.includes(filters.mimetype!));
  }

  if (filters.minSize) {
    filtered = filtered.filter(f => f.size >= filters.minSize!);
  }

  if (filters.maxSize) {
    filtered = filtered.filter(f => f.size <= filters.maxSize!);
  }

  if (filters.uploadedAfter) {
    filtered = filtered.filter(f => f.uploadedAt >= filters.uploadedAfter!);
  }

  if (filters.uploadedBefore) {
    filtered = filtered.filter(f => f.uploadedAt <= filters.uploadedBefore!);
  }

  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter(f =>
      filters.tags!.some(tag =>
        f.tags.some(fileTag =>
          fileTag.toLowerCase().includes(tag.toLowerCase())
        )
      )
    );
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(f =>
      f.originalName.toLowerCase().includes(searchLower) ||
      f.filename.toLowerCase().includes(searchLower) ||
      f.description?.toLowerCase().includes(searchLower) ||
      f.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }

  return filtered;
}

// GET /noi-intervistiamo/api/files
router.get('/', (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;

  const filters: FileFilters = {
    category: req.query.category as string,
    entityType: req.query.entityType as string,
    entityId: req.query.entityId as string,
    uploadedBy: req.query.uploadedBy as string,
    mimetype: req.query.mimetype as string,
    minSize: req.query.minSize ? parseInt(req.query.minSize as string) : undefined,
    maxSize: req.query.maxSize ? parseInt(req.query.maxSize as string) : undefined,
    uploadedAfter: req.query.uploadedAfter ? new Date(req.query.uploadedAfter as string) : undefined,
    uploadedBefore: req.query.uploadedBefore ? new Date(req.query.uploadedBefore as string) : undefined,
    tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
    search: req.query.search as string
  };

  let filteredFiles = applyFileFilters(mockFiles, filters);

  // Sort by upload date (most recent first)
  filteredFiles.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

  // Pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedFiles = filteredFiles.slice(startIndex, endIndex);

  const paginatedResponse: PaginatedResponse<FileUpload> = {
    items: paginatedFiles,
    total: filteredFiles.length,
    page,
    pageSize,
    totalPages: Math.ceil(filteredFiles.length / pageSize)
  };

  res.json(paginatedResponse);
});

// GET /noi-intervistiamo/api/files/stats
router.get('/stats', (req, res) => {
  const stats = calculateFileStats();

  res.json(stats);
});

// GET /noi-intervistiamo/api/files/:id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const file = mockFiles.find(f => f.id === id);

  if (!file) {
    return res.status(404).json({
      error: 'FILE_NOT_FOUND',
      message: 'File non trovato'
    });
  }

  const fileResponse: FileUploadResponse = {
    file,
    downloadUrl: file.url,
    thumbnailUrl: file.category === 'profile_photo' ? `${file.url}?size=thumbnail` : undefined
  };

  res.json(fileResponse);
});

// GET /noi-intervistiamo/api/files/:id/download
router.get('/:id/download', (req, res) => {
  const { id } = req.params;
  const file = mockFiles.find(f => f.id === id);

  if (!file) {
    return res.status(404).json({
      error: 'FILE_NOT_FOUND',
      message: 'File non trovato'
    });
  }

  // In a real implementation, you would serve the actual file
  // For now, return a mock response
  res.setHeader('Content-Type', file.mimetype);
  res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
  res.setHeader('Content-Length', file.size.toString());

  // Mock file content
  const mockContent = `Mock file content for ${file.originalName}\nFile ID: ${file.id}\nSize: ${file.size} bytes`;
  res.send(mockContent);
});

// POST /noi-intervistiamo/api/files/upload
router.post('/upload', upload.array('files', 5), (req, res) => {
  const files = req.files as Express.Multer.File[];
  const uploadRequest: FileUploadRequest = req.body;

  if (!files || files.length === 0) {
    return res.status(400).json({
      error: 'NO_FILES_UPLOADED',
      message: 'Nessun file è stato caricato'
    });
  }

  const uploadedFiles: FileUpload[] = files.map((file, index) => {
    const fileId = (mockFiles.length + index + 1).toString();
    const fileUpload: FileUpload = {
      id: fileId,
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      url: `/noi-intervistiamo/api/files/${fileId}/download`,
      uploadedBy: '1', // In real app, get from auth token
      uploadedAt: new Date(),
      category: uploadRequest.category || 'other',
      entityType: uploadRequest.entityType || 'system',
      entityId: uploadRequest.entityId,
      isPublic: uploadRequest.isPublic || false,
      metadata: {},
      tags: uploadRequest.tags || [],
      description: uploadRequest.description,
      expiresAt: uploadRequest.expiresAt ? new Date(uploadRequest.expiresAt) : undefined
    };

    // Add basic metadata based on file type
    if (file.mimetype.startsWith('image/')) {
      fileUpload.metadata = {
        width: 1920, // Mock dimensions
        height: 1080
      };
    } else if (file.mimetype === 'application/pdf') {
      fileUpload.metadata = {
        pages: Math.floor(Math.random() * 10) + 1 // Mock page count
      };
    }

    mockFiles.push(fileUpload);
    return fileUpload;
  });

  res.status(201).json(uploadedFiles);
});

// PUT /noi-intervistiamo/api/files/:id
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const fileIndex = mockFiles.findIndex(f => f.id === id);

  if (fileIndex === -1) {
    return res.status(404).json({
      error: 'FILE_NOT_FOUND',
      message: 'File non trovato'
    });
  }

  const updatedFile = {
    ...mockFiles[fileIndex],
    ...req.body,
    // Don't allow changing certain fields
    id: mockFiles[fileIndex].id,
    filename: mockFiles[fileIndex].filename,
    path: mockFiles[fileIndex].path,
    uploadedBy: mockFiles[fileIndex].uploadedBy,
    uploadedAt: mockFiles[fileIndex].uploadedAt
  };

  mockFiles[fileIndex] = updatedFile;

  res.json(updatedFile);
});

// DELETE /noi-intervistiamo/api/files/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const fileIndex = mockFiles.findIndex(f => f.id === id);

  if (fileIndex === -1) {
    return res.status(404).json({
      error: 'FILE_NOT_FOUND',
      message: 'File non trovato'
    });
  }

  const deletedFile = mockFiles[fileIndex];
  mockFiles.splice(fileIndex, 1);

  // In real implementation, also delete the physical file
  // fs.unlinkSync(deletedFile.path);

  res.status(204).send();
});

// GET /noi-intervistiamo/api/files/batches
router.get('/batches', (req, res) => {
  res.json(mockFileBatches);
});

// POST /noi-intervistiamo/api/files/batches
router.post('/batches', (req, res) => {
  const { name, description, files } = req.body;

  if (!name || !files || files.length === 0) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Nome e file sono obbligatori'
    });
  }

  const newBatch: FileBatch = {
    id: (mockFileBatches.length + 1).toString(),
    name,
    description,
    files,
    createdBy: '1', // In real app, get from auth token
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  };

  mockFileBatches.push(newBatch);

  res.status(201).json(newBatch);
});

export { router as fileRoutes };