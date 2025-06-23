// routes/transacoes.js
import express from 'express';
import Transacao from '../models/Transacao.js';
import { autenticarToken } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';

const router = express.Router();

// Listar todas as transações
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
      parcelas = 1,
      vencimento,
      valor,
      ...resto
    } = req.body;

    const usuarioId = req.user.id;
    const pagamento = formaPagamento?.toLowerCase();
    const dataCompraFormatada = dataCompra ? new Date(dataCompra) : undefined;

    if (resto.tipo === 'despesa' && pagamento === 'cartao' && parcelas > 1) {
      const grupoParcelasId = uuidv4();
      const valorParcela = parseFloat(valor);
      const saldoDevedor = parseFloat((valorParcela * parcelas).toFixed(2));
      const [mes, ano] = vencimento.split('/');
      const inicio = moment(`${ano}-${mes}-01`);

      const transacoesParceladas = [];

      for (let i = 0; i < parcelas; i++) {
        const vencimentoParcela = moment(inicio).add(i, 'months').format('MM/YYYY');

        const parcela = new Transacao({
          ...resto,
          valor: valorParcela,
          parcelaAtual: i + 1,
          parcelas,
          vencimento: vencimentoParcela,
          formaPagamento: pagamento,
          dataCompra: dataCompraFormatada,
          usuario: usuarioId,
          idGrupoParcelas: grupoParcelasId,
          saldoDevedor,
          descricao: `${resto.descricao} (${i + 1}/${parcelas})`,
        });

        transacoesParceladas.push(parcela.save());
      }

      await Promise.all(transacoesParceladas);
      return res.status(201).json({ message: 'Parcelas criadas com sucesso' });
    }

    const novaTransacao = new Transacao({
      ...resto,
      valor,
      parcelas,
      dataCompra: dataCompraFormatada,
      formaPagamento: pagamento,
      usuario: usuarioId,
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
    const {
      dataCompra,
      formaPagamento,
      parcelas = 1,
      valor,
      descricao,
      vencimento,
      ...resto
    } = req.body;

    const pagamento = formaPagamento?.toLowerCase();
    const dataCompraFormatada = dataCompra ? new Date(dataCompra) : undefined;
    const transacaoOriginal = await Transacao.findOne({ _id: req.params.id, usuario: req.user.id });

    if (
      transacaoOriginal &&
      transacaoOriginal.tipo === 'despesa' &&
      pagamento === 'cartao' &&
      parcelas > 1 &&
      !transacaoOriginal.idGrupoParcelas
    ) {
      const idGrupoParcelas = uuidv4();
      const valorParcela = parseFloat(valor);
      const saldoDevedor = parseFloat((valorParcela * parcelas).toFixed(2));
      const [mes, ano] = vencimento.split('/');
      const inicio = moment(`${ano}-${mes}-01`);
      const usuarioId = req.user.id;

      const base = transacaoOriginal.toObject();
      delete base._id;

      const novasParcelas = [];

      for (let i = 0; i < parcelas; i++) {
        const vencimentoParcela = moment(inicio).add(i, 'months').format('MM/YYYY');

        const novaParcela = new Transacao({
          ...base,
          ...resto,
          descricao: `${descricao} (${i + 1}/${parcelas})`,
          valor: valorParcela,
          parcelaAtual: i + 1,
          parcelas,
          formaPagamento: pagamento,
          vencimento: vencimentoParcela,
          dataCompra: dataCompraFormatada || transacaoOriginal.dataCompra,
          usuario: usuarioId,
          idGrupoParcelas,
          saldoDevedor,
        });

        novasParcelas.push(novaParcela.save());
      }

      await Transacao.deleteOne({ _id: transacaoOriginal._id });
      await Promise.all(novasParcelas);

      return res.status(200).json({ message: 'Transação convertida em parcelas com sucesso' });
    }

    const dadosAtualizados = {
      ...resto,
      descricao,
      valor,
      parcelas,
      vencimento,
      ...(dataCompra && { dataCompra: new Date(dataCompra) }),
      ...(formaPagamento && { formaPagamento: pagamento })
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

// Excluir transação individual
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

// Excluir grupo de parcelas
router.delete('/grupo/:idGrupoParcelas', autenticarToken, async (req, res) => {
  try {
    const { idGrupoParcelas } = req.params;
    const usuarioId = req.user.id;

    const resultado = await Transacao.deleteMany({
      idGrupoParcelas,
      usuario: usuarioId
    });

    if (resultado.deletedCount === 0) {
      return res.status(404).json({ message: 'Nenhuma parcela encontrada para exclusão' });
    }

    res.json({ message: `Parcelas do grupo excluídas com sucesso (${resultado.deletedCount})` });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir parcelas do grupo', detalhes: err.message });
  }
});

export default router;
