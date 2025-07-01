// controllers/resumoFinalController.js
import Transacao from '../models/Transacao.js';
import DespesaFixa from '../models/DespesaFixa.js';
import ReceitaFixa from '../models/ReceitaFixa.js';
import dayjs from 'dayjs';

export const getResumoFinanceiro = async (userId, cartaoSelecionado, devedorSelecionado) => {
  // Busca transações do usuário com filtros aplicados
  const filtro = { userId };
  if (cartaoSelecionado) filtro.cartao = cartaoSelecionado;
  if (devedorSelecionado) filtro.devedor = devedorSelecionado;

  const transacoes = await Transacao.find(filtro);

  // Organiza por mês
  const meses = {};
  for (const t of transacoes) {
    const mes = dayjs(t.vencimento).format('MMMM/YYYY');
    if (!meses[mes]) meses[mes] = { transacoes: [], despesasFixas: [], receitasFixas: [] };

    meses[mes].transacoes.push(t);
  }

  // Busca despesas e receitas fixas do usuário
  const despesasFixas = await DespesaFixa.find({ userId });
  const receitasFixas = await ReceitaFixa.find({ userId });

  // Aplica despesas e receitas fixas a todos os meses encontrados
  for (const mes in meses) {
    meses[mes].despesasFixas = despesasFixas;
    meses[mes].receitasFixas = receitasFixas;
  }

  // Monta o resumo final com totais
  const resultado = Object.entries(meses).map(([mes, dados]) => {
    const totalTransacoes = dados.transacoes.reduce((s, t) => s + t.valor, 0);
    const totalDespesasFixas = dados.despesasFixas.reduce((s, d) => s + d.valor, 0);
    const totalReceitasFixas = dados.receitasFixas.reduce((s, r) => s + r.valor, 0);
    const valorFinal = totalTransacoes + totalDespesasFixas - totalReceitasFixas;

    return {
      mes,
      transacoes: dados.transacoes,
      despesasFixas: dados.despesasFixas,
      receitasFixas: dados.receitasFixas,
      totalTransacoes,
      totalDespesasFixas,
      totalReceitasFixas,
      valorFinal,
    };
  });

  // Ordena os meses cronologicamente
  return resultado.sort((a, b) =>
    dayjs(a.mes, 'MMMM/YYYY').isAfter(dayjs(b.mes, 'MMMM/YYYY')) ? 1 : -1
  );
};

// Endpoint padrão GET /resumo-final
export const getResumoFinal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartaoSelecionado, devedorSelecionado } = req.query;

    const dados = await getResumoFinanceiro(userId, cartaoSelecionado, devedorSelecionado);
    res.json(dados);
  } catch (error) {
    console.error('❌ Erro ao carregar resumo final:', error);
    res.status(500).json({ error: 'Erro ao gerar resumo final' });
  }
};
