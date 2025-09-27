export interface FileUpload {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  category: 'cv' | 'cover_letter' | 'portfolio' | 'certificate' | 'profile_photo' | 'document' | 'other';
  entityType: 'candidate' | 'user' | 'interview' | 'system';
  entityId?: string;
  isPublic: boolean;
  metadata?: {
    width?: number;
    height?: number;
    pages?: number;
    duration?: number;
    [key: string]: any;
  };
  tags: string[];
  description?: string;
  expiresAt?: Date;
}

export interface FileUploadRequest {
  category: FileUpload['category'];
  entityType: FileUpload['entityType'];
  entityId?: string;
  isPublic?: boolean;
  tags?: string[];
  description?: string;
  expiresAt?: Date;
}

export interface FileUploadResponse {
  file: FileUpload;
  downloadUrl: string;
  thumbnailUrl?: string;
}

export interface FileStats {
  totalFiles: number;
  totalSize: number;
  filesByCategory: {
    cv: number;
    cover_letter: number;
    portfolio: number;
    certificate: number;
    profile_photo: number;
    document: number;
    other: number;
  };
  filesByType: {
    image: number;
    pdf: number;
    document: number;
    video: number;
    audio: number;
    other: number;
  };
  recentUploads: number; // files uploaded in last 24h
  storageUsed: number; // in bytes
  storageLimit: number; // in bytes
}

export interface FileBatch {
  id: string;
  name: string;
  description?: string;
  files: string[]; // File IDs
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface FileFilters {
  category?: string;
  entityType?: string;
  entityId?: string;
  uploadedBy?: string;
  mimetype?: string;
  minSize?: number;
  maxSize?: number;
  uploadedAfter?: Date;
  uploadedBefore?: Date;
  tags?: string[];
  search?: string;
}