// ✅ controllers/resumoExcelController.js

import ExcelJS from 'exceljs';
import Transacao from '../models/Transacao.js';
import DespesaFixa from '../models/DespesaFixa.js';
import ReceitaFixa from '../models/ReceitaFixa.js';
import dayjs from 'dayjs';

export const gerarResumoExcel = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartaoSelecionado, devedorSelecionado } = req.query;

    // Encontrar o último vencimento
    const ultima = await Transacao.find({ usuario: userId, formaPagamento: 'cartao' })
      .sort({ vencimento: -1 })
      .limit(1);

    const ultimoMes = ultima[0]?.vencimento || dayjs().format('MM/YYYY');

    // Montar lista de meses de hoje até o último vencimento
    const meses = [];
    let ref = dayjs();
    while (ref.format('MM/YYYY') <= ultimoMes) {
      meses.push(ref.format('MM/YYYY'));
      ref = ref.add(1, 'month');
    }

    const workbook = new ExcelJS.Workbook();
    const abaResumo = workbook.addWorksheet('Resumo Geral');
    abaResumo.addRow(['Mês', 'Total Transações', 'Total Despesas Fixas', 'Total Receitas Fixas', 'Valor Final']);

    for (const mes of meses) {
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

      abaResumo.addRow([
        mes, totalTransacoes, totalDespesasFixas, totalReceitasFixas, valorFinal,
      ]);

      // Aba do mês detalhada
      const abaMes = workbook.addWorksheet(mes);
      abaMes.addRow(['Descrição', 'Valor (R$)', 'Tipo']);

      transacoes.forEach((t) => {
        abaMes.addRow([t.descricao, t.valor, 'Transação']);
      });
      despesasFixas.forEach((d) => {
        abaMes.addRow([d.descricao, d.valor, 'Despesa Fixa']);
      });
      receitasFixas.forEach((r) => {
        abaMes.addRow([r.descricao, r.valor, 'Receita Fixa']);
      });

      abaMes.addRow([]);
      abaMes.addRow(['TOTAL FINAL', valorFinal]);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="resumo-financeiro.xlsx"');
    res.send(buffer);

  } catch (err) {
    console.error('Erro ao gerar Excel', err);
    res.status(500).json({ erro: 'Erro ao gerar Excel' });
  }
};
