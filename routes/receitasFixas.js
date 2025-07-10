import express from 'express';
import ReceitaFixa from '../models/ReceitaFixa.js';
import { autenticarToken } from '../middleware/auth.js';

const router = express.Router();

// 🔍 GET com filtro opcional por devedor
router.get('/', autenticarToken, async (req, res) => {
  try {
    const { devedor } = req.query;

    const filtro = { userId: req.user.id };
    if (devedor) filtro.devedor = devedor;

    const receitas = await ReceitaFixa.find(filtro);
    res.json(receitas);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar receitas fixas' });
  }
});

// ➕ POST com suporte ao campo "devedor"
router.post('/', autenticarToken, async (req, res) => {
  try {
    const { descricao, valor, devedor } = req.body;

    const novaReceita = new ReceitaFixa({
      descricao,
      valor,
      devedor: devedor || '', // opcional
      userId: req.user.id,
    });

    const salva = await novaReceita.save();
    res.status(201).json(salva);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao criar receita fixa', error: err.message });
  }
});

// ✏️ PUT para atualizar
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

// ❌ DELETE
router.delete('/:id', autenticarToken, async (req, res) => {
  try {
    await ReceitaFixa.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Receita fixa removida com sucesso' });
  } catch (err) {
    res.status(400).json({ message: 'Erro ao remover receita fixa' });
  }
});

export default router;
