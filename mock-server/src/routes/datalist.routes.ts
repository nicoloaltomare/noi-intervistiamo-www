import { Router } from 'express';

const router = Router();

// Import data from other routes
import { roles } from './role.routes';
import { departments } from './department.routes';
import { userStatuses, accessAreas, colorPalettes } from './configuration.data';

// GET /api/datalist/roles - Get roles for dropdown
router.get('/roles', (req, res) => {
  const activeRoles = roles
    .filter(role => role.isActive && !role.deletedAt)
    .map(role => ({
      id: role.id,
      name: role.name,
      code: role.code,
      color: role.color
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  res.json(activeRoles);
});

// GET /api/datalist/departments - Get departments for dropdown
router.get('/departments', (req, res) => {
  const activeDepartments = departments
    .filter(dept => dept.isActive)
    .map(dept => ({
      id: dept.id,
      name: dept.name,
      color: dept.color
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  res.json(activeDepartments);
});

// GET /api/datalist/user-statuses - Get user statuses for dropdown
router.get('/user-statuses', (req, res) => {
  const activeStatuses = userStatuses
    .filter(status => status.isActive)
    .sort((a, b) => a.order - b.order)
    .map(status => ({
      value: status.value,
      label: status.label,
      icon: status.icon,
      color: status.color
    }));

  res.json(activeStatuses);
});

// GET /api/datalist/user-access-areas - Get access areas for user form
router.get('/user-access-areas', (req, res) => {
  const activeAreas = accessAreas
    .filter(area => area.isActive)
    .sort((a, b) => a.order - b.order)
    .map(area => ({
      id: area.id,
      label: area.label,
      icon: area.icon,
      color: area.color
    }));

  res.json(activeAreas);
});

// GET /api/datalist/user-color-palettes - Get color palettes for user form
router.get('/user-color-palettes', (req, res) => {
  const activePalettes = colorPalettes
    .filter(palette => palette.isActive)
    .map(palette => ({
      id: palette.id,
      name: palette.name,
      colors: palette.colors
    }));

  res.json(activePalettes);
});

export default router;
