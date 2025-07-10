import express from 'express';
import DespesaFixa from '../models/DespesaFixa.js';
import { autenticarToken } from '../middleware/auth.js';

const router = express.Router();

// 🔍 GET com filtro opcional por devedor
router.get('/', autenticarToken, async (req, res) => {
  try {
    const { devedor } = req.query;

    const filtro = { userId: req.user.id };
    if (devedor) filtro.devedor = devedor;

    const despesas = await DespesaFixa.find(filtro);
    res.json(despesas);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar despesas fixas' });
  }
});

// ➕ POST com suporte ao campo "devedor"
router.post('/', autenticarToken, async (req, res) => {
  try {
    const { descricao, valor, devedor } = req.body;

    const novaDespesa = new DespesaFixa({
      descricao,
      valor,
      devedor: devedor || '', // opcional
      userId: req.user.id,
    });

    const salva = await novaDespesa.save();
    res.status(201).json(salva);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao criar despesa fixa', error: err.message });
  }
});

// ✏️ PUT para atualizar
router.put('/:id', autenticarToken, async (req, res) => {
  try {
    const atualizada = await DespesaFixa.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    res.json(atualizada);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao editar despesa fixa' });
  }
});

// ❌ DELETE
router.delete('/:id', autenticarToken, async (req, res) => {
  try {
    await DespesaFixa.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Despesa fixa removida com sucesso' });
  } catch (err) {
    res.status(400).json({ message: 'Erro ao remover despesa fixa' });
  }
});

export default router;
