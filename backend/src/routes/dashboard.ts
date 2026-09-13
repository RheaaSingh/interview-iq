import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/stats', authenticate, dashboardController.getStats);
router.get('/weak-areas', authenticate, dashboardController.getWeakAreas);
router.post('/practice', authenticate, dashboardController.createPracticeInterview);

export default router;
