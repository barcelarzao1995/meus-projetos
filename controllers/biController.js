// controllers/biController.js
import Transacao from '../models/Transacao.js';

export const getResumoBI = async (userId, cartao = '', devedor = '', mes = '') => {
  const filtro = { usuario: userId }; // ✅ Correção aqui

  if (cartao) filtro.formaPagamento = cartao;
  if (devedor) filtro.devedor = devedor;
  if (mes) filtro.mes = mes;

  const transacoes = await Transacao.find(filtro);

  const dadosTabela = transacoes.map((t) => ({
    mes: t.mes,
    cartao: t.formaPagamento,
    descricao: t.descricao,
    totalParcelas: t.totalParcelas,
    valorTotal: t.valorTotal,
  }));

  console.log('📦 Transações encontradas:', dadosTabela.length);
  return dadosTabela;
};


