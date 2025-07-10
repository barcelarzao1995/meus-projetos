// routes/bi.js
import express from 'express';
import { autenticarToken } from '../middleware/authMiddleware.js';
import { exportarBIExcel } from '../controllers/biExcelController.js';

const router = express.Router();

router.get('/excel', autenticarToken, exportarBIExcel);

export default router;
