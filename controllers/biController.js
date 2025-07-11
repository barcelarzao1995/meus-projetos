// controllers/biController.js
import Transacao from '../models/Transacao.js';

export const getResumoBI = async (usuarioId, cartao = '', devedor = '', mes = '') => {
  const filtro = { usuario: usuarioId }; // Corrigido aqui

  if (cartao) filtro.cartaoDescricao = cartao;
  if (devedor) filtro.devedor = devedor;
  if (mes) filtro.vencimento = mes;

  console.log('🔍 Filtros aplicados no banco:', filtro);

  const transacoes = await Transacao.find(filtro);

  const dadosTabela = transacoes.map((t) => ({
    mes: t.vencimento || '',
    cartao: t.cartaoDescricao || '',
    descricao: t.descricao || '',
    totalParcelas: t.parcelas || 1,
    valorTotal: t.valor || 0,
  }));

  return dadosTabela;
};
