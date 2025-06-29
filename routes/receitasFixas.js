// routes/receitasFixas.js
import express from 'express';
import ReceitaFixa from '../models/ReceitaFixa.js';
import { autenticarToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', autenticarToken, async (req, res) => {
  try {
    const receitas = await ReceitaFixa.find({ userId: req.user.id });
    res.json(receitas);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar receitas fixas' });
  }
});

router.post('/', autenticarToken, async (req, res) => {
  try {
    const novaReceita = new ReceitaFixa({
      ...req.body,
      userId: req.user.id,
    });
    const salva = await novaReceita.save();
    res.status(201).json(salva);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao criar receita fixa', error: err.message });
  }
});

router.put('/:id', autenticarToken, async (req, res) => {
  try {
    const atualizada = await ReceitaFixa.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    res.json(atualizada);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao editar receita fixa' });
  }
});

router.delete('/:id', autenticarToken, async (req, res) => {
  try {
    await ReceitaFixa.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Receita fixa removida com sucesso' });
  } catch (err) {
    res.status(400).json({ message: 'Erro ao remover receita fixa' });
  }
});

export default router;
