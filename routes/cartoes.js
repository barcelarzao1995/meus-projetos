import express from 'express';
import Cartao from '../models/Cartao.js';
import { autenticarToken } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(autenticarToken);

// Listar todos
router.get('/', async (req, res) => {
  const cartoes = await Cartao.find({ userId: req.user.id });
  res.json(cartoes);
});

// Criar
router.post('/', async (req, res) => {
  const cartao = new Cartao({ nome: req.body.nome, userId: req.user.id });
  await cartao.save();
  res.status(201).json(cartao);
});

// Editar
router.put('/:id', async (req, res) => {
  const atualizado = await Cartao.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { nome: req.body.nome },
    { new: true }
  );
  res.json(atualizado);
});

// Excluir
router.delete('/:id', async (req, res) => {
  await Cartao.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  res.json({ message: 'Cartão excluído' });
});

export default router;
