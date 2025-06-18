import express from 'express';
import Transacao from '../models/Transacao.js';
import { autenticarToken } from '../middleware/auth.js';

const router = express.Router();

// Listar todas as transações do usuário logado
router.get('/', autenticarToken, async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const transacoes = await Transacao.find({ usuario: usuarioId }).sort({ createdAt: -1 });
    res.json(transacoes);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar transações', detalhes: err.message });
  }
});

// Criar nova transação
router.post('/', autenticarToken, async (req, res) => {
  try {
    const {
      dataCompra,
      formaPagamento,
      ...resto
    } = req.body;

    const novaTransacao = new Transacao({
      ...resto,
      dataCompra: dataCompra ? new Date(dataCompra) : undefined,
      formaPagamento: formaPagamento?.toLowerCase(),
      usuario: req.user.id
    });

    const transacaoSalva = await novaTransacao.save();
    res.status(201).json(transacaoSalva);
  } catch (err) {
    res.status(400).json({ error: 'Erro ao salvar transação', detalhes: err.message });
  }
});

// Editar uma transação
router.put('/:id', autenticarToken, async (req, res) => {
  try {
    const { dataCompra, formaPagamento, ...resto } = req.body;

    const dadosAtualizados = {
      ...resto,
      ...(dataCompra && { dataCompra: new Date(dataCompra) }),
      ...(formaPagamento && { formaPagamento: formaPagamento.toLowerCase() })
    };

    const transacaoAtualizada = await Transacao.findOneAndUpdate(
      { _id: req.params.id, usuario: req.user.id },
      dadosAtualizados,
      { new: true }
    );

    if (!transacaoAtualizada) {
      return res.status(404).json({ message: 'Transação não encontrada' });
    }

    res.json(transacaoAtualizada);
  } catch (err) {
    res.status(400).json({ error: 'Erro ao atualizar transação', detalhes: err.message });
  }
});

// Excluir uma transação
router.delete('/:id', autenticarToken, async (req, res) => {
  try {
    const deletada = await Transacao.findOneAndDelete({
      _id: req.params.id,
      usuario: req.user.id
    });

    if (!deletada) {
      return res.status(404).json({ message: 'Transação não encontrada' });
    }

    res.json({ message: 'Transação excluída com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir transação', detalhes: err.message });
  }
});

export default router;

