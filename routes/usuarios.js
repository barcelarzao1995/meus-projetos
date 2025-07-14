// routes/usuarios.js
import express from 'express';
import { autenticarToken } from '../middleware/auth.js';
import User from '../models/User.js';
import Transacao from '../models/Transacao.js';
import Nota from '../models/Nota.js';
import Cartao from '../models/Cartao.js';
import Devedor from '../models/Devedor.js';
import DespesaFixa from '../models/DespesaFixa.js';
import ReceitaFixa from '../models/ReceitaFixa.js';
import Movimento from '../models/Movimento.js';

const router = express.Router();

// DELETE /usuarios/me
router.delete('/me', autenticarToken, async (req, res) => {
  try {
    const userId = req.userId;

    // Exclui todos os dados relacionados ao usuário
    await Promise.all([
      Transacao.deleteMany({ user: userId }),
      Nota.deleteMany({ user: userId }),
      Cartao.deleteMany({ user: userId }),
      Devedor.deleteMany({ user: userId }),
      DespesaFixa.deleteMany({ user: userId }),
      ReceitaFixa.deleteMany({ user: userId }),
      Movimento.deleteMany({ user: userId }),
      User.findByIdAndDelete(userId),
    ]);

    res.json({ message: 'Conta e dados excluídos com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir conta:', error.message);
    res.status(500).json({ error: 'Erro ao excluir a conta.' });
  }
});

export default router;
