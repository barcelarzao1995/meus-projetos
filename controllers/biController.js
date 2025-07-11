import Transacao from '../models/Transacao.js';

export const getResumoBI = async (usuarioId, cartao = '', devedor = '', mes = '') => {
  const filtro = { usuario: usuarioId }; // ✅ Corrigido: campo no schema é 'usuario'

  if (cartao) filtro.formaPagamento = cartao;
  if (devedor) filtro.devedor = devedor;
  if (mes) filtro.mesReferencia = mes; // ou 'vencimento', dependendo do seu uso

  const transacoes = await Transacao.find(filtro);

  const dadosTabela = transacoes.map((t) => ({
    mes: t.mesReferencia || t.vencimento || '',
    cartao: t.cartaoDescricao || t.formaPagamento || '',
    descricao: t.descricao || '',
    totalParcelas: t.parcelas || 1,
    valorTotal: t.valor || 0,
  }));

  return dadosTabela;
};
