// routes/bi.js
import express from 'express';
import { getResumoBI } from '../controllers/biController.js';
import { exportarBIExcel } from '../controllers/biExcelController.js';
import { autenticarToken } from '../middleware/auth.js'; // 👈 middleware JWT

const router = express.Router();

router.get('/', autenticarToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { filtroCartao, filtroDevedor, filtroMes } = req.query;
    const resultado = await getResumoBI(userId, filtroCartao, filtroDevedor, filtroMes);
    res.json(resultado);
  } catch (error) {
    console.error('Erro ao buscar resumo BI:', error);
    res.status(500).json({ error: 'Erro ao buscar resumo BI' });
  }
});

router.get('/excel', autenticarToken, exportarBIExcel); // ✅ rota protegida

export default router;
