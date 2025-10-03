import express from 'express';
import { Department, DepartmentFilters, PaginatedDepartmentsResult } from '../models';

const router = express.Router();

// Mock departments data
export const departments: Department[] = [
  {
    id: '1',
    name: 'Sviluppo Software',
    description: 'Team di sviluppo software',
    color: '#007bff',
    isActive: true,
    createdAt: new Date('2023-01-01T00:00:00'),
    updatedAt: new Date('2023-01-01T00:00:00')
  },
  {
    id: '2',
    name: 'Risorse Umane',
    description: 'Gestione risorse umane e recruiting',
    color: '#17a2b8',
    isActive: true,
    createdAt: new Date('2023-01-01T00:00:00'),
    updatedAt: new Date('2023-01-01T00:00:00')
  },
  {
    id: '3',
    name: 'Marketing',
    description: 'Marketing e comunicazione',
    color: '#e83e8c',
    isActive: true,
    createdAt: new Date('2023-01-01T00:00:00'),
    updatedAt: new Date('2023-01-01T00:00:00')
  },
  {
    id: '4',
    name: 'Vendite',
    description: 'Team commerciale e vendite',
    color: '#28a745',
    isActive: true,
    createdAt: new Date('2023-01-01T00:00:00'),
    updatedAt: new Date('2023-01-01T00:00:00')
  },
  {
    id: '5',
    name: 'Amministrazione',
    description: 'Amministrazione e finanza',
    color: '#6f42c1',
    isActive: true,
    createdAt: new Date('2023-01-01T00:00:00'),
    updatedAt: new Date('2023-01-01T00:00:00')
  },
  {
    id: '6',
    name: 'IT',
    description: 'Infrastruttura e supporto IT',
    color: '#20c997',
    isActive: true,
    createdAt: new Date('2023-01-01T00:00:00'),
    updatedAt: new Date('2023-01-01T00:00:00')
  }
];

// GET /noi-intervistiamo/api/departments
router.get('/', (req, res) => {
  const activeOnly = req.query.activeOnly === 'true';
  const showDeleted = req.query.showDeleted === 'true';

  let allDepartments = [...departments];

  if (!showDeleted) {
    allDepartments = allDepartments.filter(dept => !dept.deletedAt);
  }

  if (activeOnly) {
    allDepartments = allDepartments.filter(dept => dept.isActive);
  }

  res.json(allDepartments);
});

// POST /noi-intervistiamo/api/departments/search
router.post('/search', (req, res) => {
  const { page = 1, pageSize = 10, filters = {} } = req.body;
  const {
    searchText,
    isActive,
    showDeleted = false
  } = filters;

  let filteredDepartments = [...departments];

  // Apply filters
  if (searchText) {
    const search = searchText.toLowerCase();
    filteredDepartments = filteredDepartments.filter(dept =>
      dept.name.toLowerCase().includes(search) ||
      (dept.description && dept.description.toLowerCase().includes(search))
    );
  }

  if (isActive !== undefined) {
    filteredDepartments = filteredDepartments.filter(dept => dept.isActive === isActive);
  }

  if (!showDeleted) {
    filteredDepartments = filteredDepartments.filter(dept => !dept.deletedAt);
  }

  // Pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedDepartments = filteredDepartments.slice(startIndex, endIndex);

  res.json({
    departments: paginatedDepartments,
    total: filteredDepartments.length,
    currentPage: page,
    totalPages: Math.ceil(filteredDepartments.length / pageSize)
  });
});

// GET /noi-intervistiamo/api/departments/:id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const department = departments.find(d => d.id === id);

  if (!department) {
    return res.status(404).json({
      error: 'DEPARTMENT_NOT_FOUND',
      message: 'Dipartimento non trovato'
    });
  }

  res.json(department);
});

// POST /noi-intervistiamo/api/departments
router.post('/', (req, res) => {
  const { name, description, color } = req.body;

  // Validate required fields
  if (!name || !color) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Campi obbligatori mancanti'
    });
  }

  const newDepartment: Department = {
    id: (departments.length + 1).toString(),
    name,
    description,
    color,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  departments.push(newDepartment);

  res.status(201).json(newDepartment);
});

// PUT /noi-intervistiamo/api/departments/:id
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const deptIndex = departments.findIndex(d => d.id === id);

  if (deptIndex === -1) {
    return res.status(404).json({
      error: 'DEPARTMENT_NOT_FOUND',
      message: 'Dipartimento non trovato'
    });
  }

  const updatedDept = {
    ...departments[deptIndex],
    ...req.body,
    updatedAt: new Date()
  };
  departments[deptIndex] = updatedDept;

  res.json(updatedDept);
});

// DELETE /noi-intervistiamo/api/departments/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const deptIndex = departments.findIndex(d => d.id === id);

  if (deptIndex === -1) {
    return res.status(404).json({
      error: 'DEPARTMENT_NOT_FOUND',
      message: 'Dipartimento non trovato'
    });
  }

  // Soft delete
  departments[deptIndex] = {
    ...departments[deptIndex],
    deletedAt: new Date(),
    isActive: false,
    updatedAt: new Date()
  };

  res.status(204).send();
});

// PATCH /noi-intervistiamo/api/departments/:id/restore
router.patch('/:id/restore', (req, res) => {
  const { id } = req.params;
  const deptIndex = departments.findIndex(d => d.id === id);

  if (deptIndex === -1) {
    return res.status(404).json({
      error: 'DEPARTMENT_NOT_FOUND',
      message: 'Dipartimento non trovato'
    });
  }

  departments[deptIndex] = {
    ...departments[deptIndex],
    deletedAt: undefined,
    isActive: true,
    updatedAt: new Date()
  };

  res.json(departments[deptIndex]);
});

// PATCH /noi-intervistiamo/api/departments/:id/toggle-status
router.patch('/:id/toggle-status', (req, res) => {
  const { id } = req.params;
  const deptIndex = departments.findIndex(d => d.id === id);

  if (deptIndex === -1) {
    return res.status(404).json({
      error: 'DEPARTMENT_NOT_FOUND',
      message: 'Dipartimento non trovato'
    });
  }

  const dept = departments[deptIndex];
  departments[deptIndex] = {
    ...dept,
    isActive: !dept.isActive,
    updatedAt: new Date()
  };

  res.json(departments[deptIndex]);
});

export { router as departmentRoutes };
