// ✅ backend/controllers/resumoFinalController.js

import Transacao from '../models/Transacao.js';
import DespesaFixa from '../models/DespesaFixa.js';
import ReceitaFixa from '../models/ReceitaFixa.js';
import dayjs from 'dayjs';

export const getResumoFinal = async (req, res) => {
  try {
    const userId = req.user.id;
    const resumo = [];

    for (let i = 0; i < 7; i++) {
      const ref = dayjs().add(i, 'month');
      const mes = ref.format('MM/YYYY');
      const inicio = ref.startOf('month').toDate();
      const fim = ref.endOf('month').toDate();

      const transacoes = await Transacao.find({
        userId,
        formaPagamento: 'Cartão',
        dataCompra: { $gte: inicio, $lte: fim },
      });

      const despesasFixas = await DespesaFixa.find({ userId });
      const receitasFixas = await ReceitaFixa.find({ userId });

      const totalCartoes = transacoes.reduce((acc, t) => acc + t.valor, 0);
      const totalDespesasFixas = despesasFixas.reduce((acc, d) => acc + d.valor, 0);
      const totalReceitasFixas = receitasFixas.reduce((acc, r) => acc + r.valor, 0);
      const valorFinal = totalCartoes + totalDespesasFixas - totalReceitasFixas;

      resumo.push({
        mes,
        transacoes: transacoes.map(t => ({ descricao: t.descricao, valor: t.valor })),
        totalCartoes,
        despesasFixas: despesasFixas.map(d => ({ descricao: d.descricao, valor: d.valor })),
        totalDespesasFixas,
        receitasFixas: receitasFixas.map(r => ({ descricao: r.descricao, valor: r.valor })),
        totalReceitasFixas,
        valorFinal,
      });
    }

    res.json(resumo);
  } catch (err) {
    console.error('Erro ao gerar resumo final:', err);
    res.status(500).json({ erro: 'Erro ao gerar resumo final' });
  }
};
