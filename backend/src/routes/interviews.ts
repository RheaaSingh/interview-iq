import { Router } from 'express';
import { interviewController } from '../controllers/interviewController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, interviewController.create);
router.get('/', authenticate, interviewController.getAll);
router.get('/:id', authenticate, interviewController.getById);
router.delete('/:id', authenticate, interviewController.delete);
router.post('/:id/start', authenticate, interviewController.start);
router.get('/:id/question', authenticate, interviewController.getCurrentQuestion);
router.post('/:id/answer', authenticate, interviewController.submitAnswer);
router.post('/:id/complete', authenticate, interviewController.complete);
router.get('/:id/results', authenticate, interviewController.getResults);

export default router;
