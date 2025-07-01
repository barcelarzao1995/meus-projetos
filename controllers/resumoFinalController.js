import Transacao from '../models/Transacao.js';
import DespesaFixa from '../models/DespesaFixa.js';
import ReceitaFixa from '../models/ReceitaFixa.js';

export const getResumoFinanceiro = async (userId, cartaoSelecionado = '', devedorSelecionado = '') => {
  // Filtro base
  const filtroBase = { user: userId };
  if (cartaoSelecionado) filtroBase.cartao = cartaoSelecionado;
  if (devedorSelecionado) filtroBase.devedor = devedorSelecionado;

  // Buscar transações
  const transacoes = await Transacao.find(filtroBase).lean();

  // Buscar despesas fixas e receitas fixas do usuário
  const despesasFixas = await DespesaFixa.find({ user: userId }).lean();
  const receitasFixas = await ReceitaFixa.find({ user: userId }).lean();

  // Agrupar transações por mês (formato MM/YYYY)
  const transacoesPorMes = {};
  for (const t of transacoes) {
    const mes = new Date(t.vencimento).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
    }).slice(3); // MM/YYYY

    if (!transacoesPorMes[mes]) {
      transacoesPorMes[mes] = [];
    }
    transacoesPorMes[mes].push(t);
  }

  // Gerar os resumos mensais
  const mesesOrdenados = Object.keys(transacoesPorMes).sort((a, b) => {
    const [ma, aa] = a.split('/').map(Number);
    const [mb, ab] = b.split('/').map(Number);
    return new Date(aa, ma - 1) - new Date(ab, mb - 1);
  });

  const resumoFinal = mesesOrdenados.map((mes) => {
    const transacoesMes = transacoesPorMes[mes];

    const totalTransacoes = transacoesMes.reduce((acc, t) => acc + t.valor, 0);
    const totalDespesasFixas = despesasFixas.reduce((acc, d) => acc + d.valor, 0);
    const totalReceitasFixas = receitasFixas.reduce((acc, r) => acc + r.valor, 0);
    const valorFinal = totalTransacoes + totalDespesasFixas - totalReceitasFixas;

    return {
      mes,
      transacoes: transacoesMes.map(t => ({
        descricao: t.descricao,
        valor: t.valor,
      })),
      despesasFixas: despesasFixas.map(d => ({
        descricao: d.descricao,
        valor: d.valor,
      })),
      receitasFixas: receitasFixas.map(r => ({
        descricao: r.descricao,
        valor: r.valor,
      })),
      totalTransacoes,
      totalDespesasFixas,
      totalReceitasFixas,
      valorFinal,
    };
  });

  return resumoFinal;
};
