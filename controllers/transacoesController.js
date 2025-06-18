const Transacao = require('../models/Transacao');

// GET: Lista todas as transações do usuário autenticado
exports.getTransacoes = async (req, res) => {
  try {
    const transacoes = await Transacao.find({ usuario: req.userId }).sort({ dataCompra: -1 });
    res.json(transacoes);
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({ error: 'Erro ao buscar transações' });
  }
};

// POST: Cria nova transação
exports.criarTransacao = async (req, res) => {
  try {
    const {
      tipo,
      descricao,
      valor,
      dataCompra,
      formaPagamento,
      cartaoDescricao,
      parcelas,
      vencimento,
      devedor,
      mesReferencia,
    } = req.body;

    const novaTransacao = new Transacao({
      tipo,
      descricao,
      valor,
      dataCompra: new Date(dataCompra), // importante!
      formaPagamento,
      cartaoDescricao,
      parcelas,
      vencimento,
      devedor,
      mesReferencia,
      usuario: req.userId,
    });

    const transacaoSalva = await novaTransacao.save();
    res.status(201).json(transacaoSalva);
  } catch (error) {
    console.error('Erro ao salvar transação:', error);
    res.status(400).json({
      error: 'Erro ao salvar transação',
      detalhes: error.message,
    });
  }
};

// PUT: Atualiza uma transação
exports.atualizarTransacao = async (req, res) => {
  try {
    const transacao = await Transacao.findOne({ _id: req.params.id, usuario: req.userId });
    if (!transacao) return res.status(404).json({ error: 'Transação não encontrada' });

    const dadosAtualizados = {
      ...req.body,
      dataCompra: req.body.dataCompra ? new Date(req.body.dataCompra) : transacao.dataCompra,
    };

    Object.assign(transacao, dadosAtualizados);
    const atualizado = await transacao.save();
    res.json(atualizado);
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    res.status(400).json({
      error: 'Erro ao atualizar transação',
      detalhes: error.message,
    });
  }
};

// DELETE: Remove uma transação
exports.excluirTransacao = async (req, res) => {
  try {
    const transacao = await Transacao.findOneAndDelete({ _id: req.params.id, usuario: req.userId });
    if (!transacao) return res.status(404).json({ error: 'Transação não encontrada' });
    res.json({ mensagem: 'Transação excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir transação:', error);
    res.status(500).json({ error: 'Erro ao excluir transação' });
  }
};
