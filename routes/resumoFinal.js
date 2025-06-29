import express from 'express';
import { getResumoFinal } from '../controllers/resumoFinalController.js';
import { autenticarToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', autenticarToken, getResumoFinal);

export default router;
