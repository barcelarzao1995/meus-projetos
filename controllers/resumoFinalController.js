import Transacao from '../models/Transacao.js';
import DespesaFixa from '../models/DespesaFixa.js';
import ReceitaFixa from '../models/ReceitaFixa.js';
import dayjs from 'dayjs';

export const getResumoFinal = async (req, res) => {
  try {
    const userId = req.user.id;
    const meses = [];

    for (let i = 0; i < 7; i++) {
      const dataRef = dayjs().add(i, 'month');
      const mesLabel = dataRef.format('MM/YYYY');
      const inicioMes = dataRef.startOf('month').toDate();
      const fimMes = dataRef.endOf('month').toDate();

      // 🔹 Buscar transações do mês
      const transacoes = await Transacao.find({
        userId,
        dataCompra: { $gte: inicioMes, $lte: fimMes },
      });

      // 🔹 Buscar despesas fixas e receitas fixas
      const despesasFixas = await DespesaFixa.find({ userId });
      const receitasFixas = await ReceitaFixa.find({ userId });

      // 🔸 Calcular totais
      const totalTransacoes = transacoes.reduce((acc, t) => acc + t.valor, 0);
      const totalDespesasFixas = despesasFixas.reduce((acc, d) => acc + d.valor, 0);
      const totalReceitasFixas = receitasFixas.reduce((acc, r) => acc + r.valor, 0);
      const valorFinal = totalTransacoes + totalDespesasFixas - totalReceitasFixas;

      meses.push({
        mes: mesLabel,
        transacoes: transacoes.map((t) => ({
          descricao: t.descricao,
          valor: t.valor,
        })),
        despesasFixas: despesasFixas.map((d) => ({
          descricao: d.descricao,
          valor: d.valor,
        })),
        receitasFixas: receitasFixas.map((r) => ({
          descricao: r.descricao,
          valor: r.valor,
        })),
        totalTransacoes,
        totalDespesasFixas,
        totalReceitasFixas,
        valorFinal,
      });
    }

    res.json(meses);
  } catch (err) {
    console.error('Erro ao gerar resumo final:', err);
    res.status(500).json({ error: 'Erro ao gerar resumo final' });
  }
};
