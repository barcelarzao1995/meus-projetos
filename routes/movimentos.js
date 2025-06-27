// routes/movimentos.js
import express from 'express';
import Movimento from '../models/Movimento.js';
import { autenticarToken } from '../middleware/auth.js';

const router = express.Router();

// 🔽 Buscar todos os movimentos do usuário
router.get('/', autenticarToken, async (req, res) => {
  try {
    const movimentos = await Movimento.find({ usuario: req.user.id }).sort({ createdAt: -1 });
    res.json(movimentos);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar movimentos', detalhes: err.message });
  }
});

// 🔽 Criar novo movimento
router.post('/', autenticarToken, async (req, res) => {
  try {
    const movimento = new Movimento({
      ...req.body,
      usuario: req.user.id,
    });

    const salvo = await movimento.save();
    res.status(201).json(salvo);
  } catch (err) {
    res.status(400).json({ error: 'Erro ao salvar movimento', detalhes: err.message });
  }
});

// 🔽 Atualizar um movimento
router.put('/:id', autenticarToken, async (req, res) => {
  try {
    const atualizado = await Movimento.findOneAndUpdate(
      { _id: req.params.id, usuario: req.user.id },
      req.body,
      { new: true }
    );

    if (!atualizado) return res.status(404).json({ message: 'Movimento não encontrado' });
    res.json(atualizado);
  } catch (err) {
    res.status(400).json({ error: 'Erro ao atualizar movimento', detalhes: err.message });
  }
});

// 🔽 Excluir um movimento
router.delete('/:id', autenticarToken, async (req, res) => {
  try {
    const deletado = await Movimento.findOneAndDelete({ _id: req.params.id, usuario: req.user.id });

    if (!deletado) return res.status(404).json({ message: 'Movimento não encontrado' });
    res.json({ message: 'Movimento excluído com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir movimento', detalhes: err.message });
  }
});

export default router;
