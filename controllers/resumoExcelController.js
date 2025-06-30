// ✅ controllers/resumoExcelController.js

import ExcelJS from 'exceljs';
import Transacao from '../models/Transacao.js';
import DespesaFixa from '../models/DespesaFixa.js';
import ReceitaFixa from '../models/ReceitaFixa.js';
import dayjs from 'dayjs';

export const exportarResumoExcel = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartaoSelecionado, devedorSelecionado } = req.query;

    const filtroBase = {
      usuario: userId,
      formaPagamento: 'cartao',
    };
    if (cartaoSelecionado) filtroBase.cartaoDescricao = cartaoSelecionado;
    if (devedorSelecionado) filtroBase.devedor = devedorSelecionado;

    const transacoes = await Transacao.find(filtroBase);
    const vencimentosUnicos = [...new Set(transacoes.map((t) => t.vencimento))].sort((a, b) => {
      const [ma, ya] = a.split('/');
      const [mb, yb] = b.split('/');
      return new Date(`${yb}-${mb}-01`) - new Date(`${ya}-${ma}-01`);
    });

    const despesasFixas = await DespesaFixa.find({ userId });
    const receitasFixas = await ReceitaFixa.find({ userId });

    const workbook = new ExcelJS.Workbook();
    const resumoSheet = workbook.addWorksheet('Resumo');

    resumoSheet.columns = [
      { header: 'Mês', key: 'mes', width: 15 },
      { header: 'Total Transações', key: 'transacoes', width: 20 },
      { header: 'Total Despesas Fixas', key: 'despesasFixas', width: 20 },
      { header: 'Total Receitas Fixas', key: 'receitasFixas', width: 20 },
      { header: 'Valor Final', key: 'valorFinal', width: 20 },
    ];

    for (const mes of vencimentosUnicos) {
      const transacoesMes = transacoes.filter((t) => t.vencimento === mes);
      const totalTransacoes = transacoesMes.reduce((acc, t) => acc + (Number(t.valor) || 0), 0);
      const totalDespesasFixas = despesasFixas.reduce((acc, d) => acc + (Number(d.valor) || 0), 0);
      const totalReceitasFixas = receitasFixas.reduce((acc, r) => acc + (Number(r.valor) || 0), 0);
      const valorFinal = totalDespesasFixas + totalTransacoes - totalReceitasFixas;

      // Adiciona linha no Resumo com hiperlink
      resumoSheet.addRow({
        mes: { text: mes, hyperlink: `#${mes.replace('/', '-')}` },
        transacoes: totalTransacoes,
        despesasFixas: totalDespesasFixas,
        receitasFixas: totalReceitasFixas,
        valorFinal,
      });

      // Criar aba detalhada
      const sheet = workbook.addWorksheet(mes.replace('/', '-'));
      sheet.columns = [
        { header: 'Descrição Transação', key: 'descT', width: 25 },
        { header: 'Valor Transação', key: 'valT', width: 15 },
        { header: 'Descrição Despesa Fixa', key: 'descD', width: 25 },
        { header: 'Valor Despesa', key: 'valD', width: 15 },
        { header: 'Descrição Receita Fixa', key: 'descR', width: 25 },
        { header: 'Valor Receita', key: 'valR', width: 15 },
      ];

      const maxLen = Math.max(transacoesMes.length, despesasFixas.length, receitasFixas.length);

      for (let i = 0; i < maxLen; i++) {
        sheet.addRow({
          descT: transacoesMes[i]?.descricao || '',
          valT: transacoesMes[i]?.valor || '',
          descD: despesasFixas[i]?.descricao || '',
          valD: despesasFixas[i]?.valor || '',
          descR: receitasFixas[i]?.descricao || '',
          valR: receitasFixas[i]?.valor || '',
        });
      }
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=ResumoFinanceiro.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Erro ao exportar Excel:', err);
    res.status(500).json({ erro: 'Erro ao gerar Excel' });
  }
};
