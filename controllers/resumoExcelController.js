// controllers/resumoExcelController.js

import ExcelJS from 'exceljs';
import Transacao from '../models/Transacao.js';
import DespesaFixa from '../models/DespesaFixa.js';
import ReceitaFixa from '../models/ReceitaFixa.js';
import dayjs from 'dayjs';

export const gerarResumoExcel = async (req, res) => {
  try {
    const userId = req.user.id;
    const { devedor, cartaoDescricao } = req.query;

    const workbook = new ExcelJS.Workbook();
    const abaResumo = workbook.addWorksheet('Resumo Geral');

    abaResumo.addRow([
      'Mês', 'Total Transações', 'Total Despesas Fixas', 'Total Receitas Fixas', 'Valor Final'
    ]);

    for (let i = 0; i < 7; i++) {
      const ref = dayjs().add(i, 'month');
      const mes = ref.format('MM/YYYY');

      const filtroTransacoes = {
        usuario: userId,
        formaPagamento: 'cartao',
        vencimento: mes
      };

      if (devedor) filtroTransacoes.devedor = devedor;
      if (cartaoDescricao) filtroTransacoes.cartaoDescricao = cartaoDescricao;

      const transacoes = await Transacao.find(filtroTransacoes);
      const despesasFixas = await DespesaFixa.find({ userId });
      const receitasFixas = await ReceitaFixa.find({ userId });

      const totalTransacoes = transacoes.reduce((acc, t) => acc + (Number(t.valor) || 0), 0);
      const totalDespesasFixas = despesasFixas.reduce((acc, d) => acc + (Number(d.valor) || 0), 0);
      const totalReceitasFixas = receitasFixas.reduce((acc, r) => acc + (Number(r.valor) || 0), 0);
      const valorFinal = totalDespesasFixas + totalTransacoes - totalReceitasFixas;

      abaResumo.addRow([
        mes, totalTransacoes, totalDespesasFixas, totalReceitasFixas, valorFinal
      ]);

      // Aba por mês detalhada
      const abaMes = workbook.addWorksheet(mes);
      abaMes.addRow(['Descrição', 'Valor', 'Tipo']);

      transacoes.forEach(t => {
        abaMes.addRow([t.descricao, t.valor, 'Transação']);
      });

      despesasFixas.forEach(d => {
        abaMes.addRow([d.descricao, d.valor, 'Despesa Fixa']);
      });

      receitasFixas.forEach(r => {
        abaMes.addRow([r.descricao, r.valor, 'Receita Fixa']);
      });

      abaMes.addRow([]);
      abaMes.addRow(['Total Final', valorFinal]);
    }

    // Enviar arquivo como buffer
    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="resumo-financeiro.xlsx"');
    res.send(buffer);

  } catch (err) {
    console.error('Erro ao gerar Excel', err);
    res.status(500).json({ erro: 'Erro ao gerar Excel' });
  }
};
