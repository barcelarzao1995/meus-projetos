// controllers/resumoFinalController.js
import Transacao from '../models/Transacao.js';
import DespesaFixa from '../models/DespesaFixa.js';
import ReceitaFixa from '../models/ReceitaFixa.js';

export const getResumoFinanceiro = async (userId, cartaoSelecionado, devedorSelecionado) => {
  const filtroBase = { usuario: userId, formaPagamento: 'cartao' };
  if (cartaoSelecionado) filtroBase.cartaoDescricao = cartaoSelecionado;
  if (devedorSelecionado) filtroBase.devedor = devedorSelecionado;

  const todasTransacoes = await Transacao.find(filtroBase);
  const mesesUnicosSet = new Set();

  todasTransacoes.forEach((t) => {
    if (t.vencimento) mesesUnicosSet.add(t.vencimento);
  });

  const mesesOrdenados = Array.from(mesesUnicosSet).sort((a, b) => {
    const [ma, aa] = a.split('/').map(Number);
    const [mb, ab] = b.split('/').map(Number);
    return aa !== ab ? aa - ab : ma - mb;
  });

  const resultado = [];

  for (const mes of mesesOrdenados) {
    const filtroMes = {
      usuario: userId,
      formaPagamento: 'cartao',
      vencimento: mes,
    };
    if (cartaoSelecionado) filtroMes.cartaoDescricao = cartaoSelecionado;
    if (devedorSelecionado) filtroMes.devedor = devedorSelecionado;

    const transacoes = await Transacao.find(filtroMes);

    let despesasFixas = [];
    let receitasFixas = [];

    if (devedorSelecionado) {
      despesasFixas = await DespesaFixa.find({ userId, devedor: devedorSelecionado });
      receitasFixas = await ReceitaFixa.find({ userId, devedor: devedorSelecionado });
    }

    const totalTransacoes = transacoes.reduce((acc, t) => acc + (Number(t.valor) || 0), 0);
    const totalDespesasFixas = despesasFixas.reduce((acc, d) => acc + (Number(d.valor) || 0), 0);
    const totalReceitasFixas = receitasFixas.reduce((acc, r) => acc + (Number(r.valor) || 0), 0);

    const valorFinal = totalReceitasFixas - (totalTransacoes + totalDespesasFixas);

    resultado.push({
      mes,
      transacoes: transacoes.map((t) => ({
        descricao: t.descricao,
        valor: Number(t.valor) || 0,
      })),
      despesasFixas: despesasFixas.map((d) => ({
        descricao: d.descricao,
        valor: Number(d.valor) || 0,
      })),
      receitasFixas: receitasFixas.map((r) => ({
        descricao: r.descricao,
        valor: Number(r.valor) || 0,
      })),
      totalTransacoes: Number(totalTransacoes.toFixed(2)),
      totalDespesasFixas: Number(totalDespesasFixas.toFixed(2)),
      totalReceitasFixas: Number(totalReceitasFixas.toFixed(2)),
      valorFinal: Number(valorFinal.toFixed(2)),
    });
  }

  return resultado;
};

// Handler do endpoint GET /resumo-final
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
