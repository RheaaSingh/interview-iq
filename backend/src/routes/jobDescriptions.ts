import { Router } from 'express';
import { jobDescriptionController } from '../controllers/jobDescriptionController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, jobDescriptionController.create);
router.get('/', authenticate, jobDescriptionController.getAll);
router.get('/:id', authenticate, jobDescriptionController.getById);
router.delete('/:id', authenticate, jobDescriptionController.delete);
router.post('/match', authenticate, jobDescriptionController.matchWithResume);

export default router;
