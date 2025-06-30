// routes/resumoExcelRoutes.js
import express from 'express';
import { autenticarToken } from '../middleware/authMiddleware.js';
import { exportarResumoExcel } from '../controllers/resumoExcelController.js';

const router = express.Router();
router.use(autenticarToken);

router.get('/excel', exportarResumoExcel);

export default router;
