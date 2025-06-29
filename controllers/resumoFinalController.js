// ✅ controllers/resumoFinalController.js

import Transacao from '../models/Transacao.js';
import DespesaFixa from '../models/DespesaFixa.js';
import ReceitaFixa from '../models/ReceitaFixa.js';
import dayjs from 'dayjs';

export const getResumoFinal = async (req, res) => {
  try {
    const userId = req.user.id;
    const resultado = [];

    for (let i = 0; i < 7; i++) {
      const ref = dayjs().add(i, 'month');
      const mes = ref.format('MM/YYYY');
      const inicio = ref.startOf('month').toDate();
      const fim = ref.endOf('month').toDate();

      // Transações feitas com cartão no mês atual
      const transacoes = await Transacao.find({
        usuario: userId,
        formaPagamento: 'cartao',
        dataCompra: { $gte: inicio, $lte: fim }
      });

      const despesasFixas = await DespesaFixa.find({ userId });
      const receitasFixas = await ReceitaFixa.find({ userId });

      const totalTransacoes = transacoes.reduce((acc, t) => acc + (Number(t.valor) || 0), 0);
      const totalDespesasFixas = despesasFixas.reduce((acc, d) => acc + (Number(d.valor) || 0), 0);
      const totalReceitasFixas = receitasFixas.reduce((acc, r) => acc + (Number(r.valor) || 0), 0);
      const valorFinal = totalDespesasFixas + totalTransacoes - totalReceitasFixas;

      resultado.push({
        mes,
        transacoes: transacoes.map(t => ({ descricao: t.descricao, valor: Number(t.valor) || 0 })),
        despesasFixas: despesasFixas.map(d => ({ descricao: d.descricao, valor: Number(d.valor) || 0 })),
        receitasFixas: receitasFixas.map(r => ({ descricao: r.descricao, valor: Number(r.valor) || 0 })),
        totalTransacoes: Number(totalTransacoes.toFixed(2)) || 0,
        totalDespesasFixas: Number(totalDespesasFixas.toFixed(2)) || 0,
        totalReceitasFixas: Number(totalReceitasFixas.toFixed(2)) || 0,
        valorFinal: Number(valorFinal.toFixed(2)) || 0,
      });
    }

    res.json(resultado);
  } catch (err) {
    console.error('Erro ao gerar resumo final:', err);
    res.status(500).json({ erro: 'Erro ao gerar resumo final' });
  }
};
