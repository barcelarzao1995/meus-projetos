import Transacao from '../models/Transacao.js';
import DespesaFixa from '../models/DespesaFixa.js';
import ReceitaFixa from '../models/ReceitaFixa.js';
import dayjs from 'dayjs';

export const getResumoFinal = async (req, res) => {
  try {
    const userId = req.user.id;
    const meses = [];

    for (let i = 0; i < 7; i++) {
      const ref = dayjs().add(i, 'month');
      const mesRef = ref.format('YYYY-MM');
      const inicio = ref.startOf('month').toDate();
      const fim = ref.endOf('month').toDate();

      const transacoes = await Transacao.find({
        userId,
        formaPagamento: 'Cartão',
        dataCompra: { $gte: inicio, $lte: fim }
      });

      const despesasFixas = await DespesaFixa.find({ userId });
      const receitasFixas = await ReceitaFixa.find({ userId });

      const totalTransacoes = transacoes.reduce((acc, t) => acc + t.valor, 0);
      const totalDespesasFixas = despesasFixas.reduce((acc, d) => acc + d.valor, 0);
      const totalReceitasFixas = receitasFixas.reduce((acc, r) => acc + r.valor, 0);
      const valorFinal = totalDespesasFixas + totalTransacoes - totalReceitasFixas;

      meses.push({
        mes: mesRef,
        transacoes: transacoes.map(t => ({ descricao: t.descricao, valor: t.valor })),
        totalTransacoes,
        despesasFixas: despesasFixas.map(d => ({ descricao: d.descricao, valor: d.valor })),
        totalDespesasFixas,
        receitasFixas: receitasFixas.map(r => ({ descricao: r.descricao, valor: r.valor })),
        totalReceitasFixas,
        valorFinal,
      });
    }

    res.json(meses);
  } catch (err) {
    console.error('Erro ao gerar resumo final', err);
    res.status(500).json({ erro: 'Erro ao gerar resumo final' });
  }
};
