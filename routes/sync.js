// routes/sync.js
import express from 'express';
import { autenticarToken } from '../middleware/auth.js';
import Transacao from '../models/Transacao.js';

const router = express.Router();

// Rota para sincronizar transações do app com o banco de dados
router.post('/sincronizar', autenticarToken, async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const transacoes = req.body.transacoes;

    if (!Array.isArray(transacoes)) {
      return res.status(400).json({ error: 'Formato inválido de transações.' });
    }

    const transacoesComUsuario = transacoes.map(t => ({ ...t, usuario: usuarioId }));
    await Transacao.insertMany(transacoesComUsuario);

    res.json({ message: 'Transações sincronizadas com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao sincronizar transações', detalhes: err.message });
  }
});

export default router;
