// controllers/transacoesController.js
import Transacao from '../models/Transacao.js';

export const getTransacoes = async (req, res) => {
  try {
    const transacoes = await Transacao.find({ usuario: req.user.id }).sort({ dataCompra: -1 });
    res.json(transacoes);
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({ error: 'Erro ao buscar transações' });
  }
};

export const criarTransacao = async (req, res) => {
  try {
    const {
      tipo,
      descricao,
      valor,
      parcelas = 1,
      dataCompra,
      formaPagamento,
      cartaoDescricao,
      vencimento,
      devedor,
      mesReferencia,
    } = req.body;

    const valorParcela = parseFloat(valor);
    const saldoDevedor = tipo === 'despesa' ? parseFloat((valorParcela * parcelas).toFixed(2)) : null;

    const novaTransacao = new Transacao({
      tipo,
      descricao,
      valor: valorParcela,
      saldoDevedor,
      parcelas,
      dataCompra: dataCompra ? new Date(dataCompra) : undefined,
      formaPagamento,
      cartaoDescricao,
      vencimento,
      devedor,
      mesReferencia,
      usuario: req.user.id,
    });

    const salva = await novaTransacao.save();
    res.status(201).json(salva);
  } catch (error) {
    console.error('Erro ao salvar transação:', error);
    res.status(400).json({ error: 'Erro ao salvar transação', detalhes: error.message });
  }
};

export const atualizarTransacao = async (req, res) => {
  try {
    const transacao = await Transacao.findOne({ _id: req.params.id, usuario: req.user.id });
    if (!transacao) return res.status(404).json({ error: 'Transação não encontrada' });

    const {
      valor,
      parcelas = 1,
      ...dadosAtualizados
    } = req.body;

    dadosAtualizados.valor = parseFloat(valor);
    dadosAtualizados.parcelas = parcelas;

    if (transacao.tipo === 'despesa') {
      dadosAtualizados.saldoDevedor = parseFloat((valor * parcelas).toFixed(2));
    }

    Object.assign(transacao, dadosAtualizados);

    const atualizado = await transacao.save();
    res.json(atualizado);
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    res.status(400).json({ error: 'Erro ao atualizar transação', detalhes: error.message });
  }
};

export const excluirTransacao = async (req, res) => {
  try {
    const deletada = await Transacao.findOneAndDelete({ _id: req.params.id, usuario: req.user.id });
    if (!deletada) return res.status(404).json({ error: 'Transação não encontrada' });
    res.json({ mensagem: 'Transação excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir transação:', error);
    res.status(500).json({ error: 'Erro ao excluir transação' });
  }
};
export default router;
