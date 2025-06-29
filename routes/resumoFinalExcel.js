import express from 'express';
import { gerarResumoExcel } from '../controllers/resumoExcelController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/excel', auth, gerarResumoExcel);

export default router;
