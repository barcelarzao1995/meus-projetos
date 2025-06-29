import express from 'express';
import { gerarResumoExcel } from '../controllers/resumoExcelController.js';
import { autenticarToken } from '../middleware/auth.js'; // CORREÇÃO

const router = express.Router();

router.get('/excel', autenticarToken, gerarResumoExcel); // CORREÇÃO

export default router;
