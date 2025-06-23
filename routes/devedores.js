import express from 'express';
import Devedor from '../models/Devedor.js';
import { autenticarToken } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(autenticarToken);

router.get('/', async (req, res) => {
  const devedores = await Devedor.find({ userId: req.user.id });
  res.json(devedores);
});

router.post('/', async (req, res) => {
  const devedor = new Devedor({ nome: req.body.nome, userId: req.user.id });
  await devedor.save();
  res.status(201).json(devedor);
});

router.put('/:id', async (req, res) => {
  const atualizado = await Devedor.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { nome: req.body.nome },
    { new: true }
  );
  res.json(atualizado);
});

router.delete('/:id', async (req, res) => {
  await Devedor.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  res.json({ message: 'Devedor excluído' });
});

export default router;
