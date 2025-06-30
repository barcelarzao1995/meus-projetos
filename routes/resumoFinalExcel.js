import express from 'express';
import { gerarExcelResumo } from '../controllers/resumoFinalExcelController.js';
import { autenticarToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/excel', autenticarToken, gerarExcelResumo);

export default router;
