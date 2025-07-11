// controllers/biController.js
import Transacao from '../models/Transacao.js';

export const getResumoBI = async (req, res) => {
  try {
    const { cartao, devedor, mes } = req.query;

    const filtro = {};
    if (cartao) filtro.cartaoDescricao = cartao;
    if (devedor) filtro.devedor = devedor;
    if (mes) filtro.vencimento = mes;

    const transacoes = await Transacao.find(filtro);

    // Aqui você pode montar um resumo (ou só retornar as transações):
    res.json({ transacoes });
  } catch (error) {
    console.error('Erro no getResumoBI:', error);
    res.status(500).json({ error: 'Erro ao obter resumo BI' });
  }
};

