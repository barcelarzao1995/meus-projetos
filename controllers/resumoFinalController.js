import Transacao from '../models/Transacao.js';
import DespesaFixa from '../models/DespesaFixa.js';
import ReceitaFixa from '../models/ReceitaFixa.js';
import dayjs from 'dayjs';

export const getResumoFinanceiro = async (userId, cartaoSelecionado, devedorSelecionado) => {
  const filtroBase = { usuario: userId, formaPagamento: 'cartao' };
  const todasTransacoes = await Transacao.find(filtroBase);
  const mesesUnicosSet = new Set();

  todasTransacoes.forEach(t => {
    if (t.vencimento) mesesUnicosSet.add(t.vencimento);
  });

  const mesesOrdenados = Array.from(mesesUnicosSet)
    .sort((a, b) => {
      const [ma, aa] = a.split('/').map(Number);
      const [mb, ab] = b.split('/').map(Number);
      return aa !== ab ? aa - ab : ma - mb;
    });

  const resultado = [];

  for (const mes of mesesOrdenados) {
    const [mesNum, anoNum] = mes.split('/').map(Number);

    const filtro = {
      usuario: userId,
      formaPagamento: 'cartao',
      vencimento: mes,
    };
    if (cartaoSelecionado) filtro.cartaoDescricao = cartaoSelecionado;
    if (devedorSelecionado) filtro.devedor = devedorSelecionado;

    const transacoes = await Transacao.find(filtro);
    const despesasFixas = await DespesaFixa.find({ userId });
    const receitasFixas = await ReceitaFixa.find({ userId });

    const totalTransacoes = transacoes.reduce((acc, t) => acc + (Number(t.valor) || 0), 0);
    const totalDespesasFixas = despesasFixas.reduce((acc, d) => acc + (Number(d.valor) || 0), 0);
    const totalReceitasFixas = receitasFixas.reduce((acc, r) => acc + (Number(r.valor) || 0), 0);
    const valorFinal = totalDespesasFixas + totalTransacoes - totalReceitasFixas;

    resultado.push({
      mes,
      transacoes: transacoes.map(t => ({
        descricao: t.descricao,
        valor: Number(t.valor) || 0,
      })),
      despesasFixas: despesasFixas.map(d => ({
        descricao: d.descricao,
        valor: Number(d.valor) || 0,
      })),
      receitasFixas: receitasFixas.map(r => ({
        descricao: r.descricao,
        valor: Number(r.valor) || 0,
      })),
      totalTransacoes: Number(totalTransacoes.toFixed(2)) || 0,
      totalDespesasFixas: Number(totalDespesasFixas.toFixed(2)) || 0,
      totalReceitasFixas: Number(totalReceitasFixas.toFixed(2)) || 0,
      valorFinal: Number(valorFinal.toFixed(2)) || 0,
    });
  }

  return resultado;
};

// ✅ Handler que usa a função e responde com JSON
export const getResumoFinal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartaoSelecionado, devedorSelecionado } = req.query;

    const resultado = await getResumoFinanceiro(userId, cartaoSelecionado, devedorSelecionado);
    res.json(resultado);
  } catch (err) {
    console.error('Erro ao gerar resumo final:', err);
    res.status(500).json({ erro: 'Erro ao gerar resumo final' });
  }
};
