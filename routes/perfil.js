// routes/perfil.js
import express from 'express';
import { exportarPerfilExcel } from '../controllers/perfilExcelController.js';
import { autenticarToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/excel', autenticarToken, exportarPerfilExcel);

export default router;
