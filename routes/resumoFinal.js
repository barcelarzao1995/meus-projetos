import express from 'express';
import { getResumoFinal } from '../controllers/resumoFinalController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getResumoFinal);

export default router;
