// controllers/resumoFinalExcelController.js
import ExcelJS from 'exceljs';
import { getResumoFinanceiro } from './resumoFinalController.js';

// Função utilitária para deixar nomes válidos para planilhas do Excel
function nomeAbaValido(nome) {
  return nome.replace(/[\\/*?:[\]]/g, '-').substring(0, 31); // Excel permite no máximo 31 caracteres
}

export const exportarResumoExcel = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartaoSelecionado, devedorSelecionado } = req.query;

    const dadosResumo = await getResumoFinanceiro(userId, cartaoSelecionado, devedorSelecionado);

    const workbook = new ExcelJS.Workbook();
    const abaResumo = workbook.addWorksheet('Resumo');

    // Estilo do cabeçalho
    const headerStyle = {
      font: { bold: true, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4E89AE' } },
      border: {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' },
      },
    };

    // Aba de Resumo
    abaResumo.columns = [
      { header: 'Mês', key: 'mes', width: 15 },
      { header: 'Total Transações', key: 'totalTransacoes', width: 20 },
      { header: 'Total Despesas Fixas', key: 'totalDespesasFixas', width: 22 },
      { header: 'Total Receitas Fixas', key: 'totalReceitasFixas', width: 22 },
      { header: 'Valor Final', key: 'valorFinal', width: 18 },
    ];
    abaResumo.getRow(1).eachCell(cell => {
      Object.assign(cell, { style: headerStyle });
    });

    dadosResumo.forEach((mesResumo, i) => {
      abaResumo.addRow({
        mes: mesResumo.mes,
        totalTransacoes: mesResumo.totalTransacoes,
        totalDespesasFixas: mesResumo.totalDespesasFixas,
        totalReceitasFixas: mesResumo.totalReceitasFixas,
        valorFinal: mesResumo.valorFinal,
      });

      const abaDetalhe = workbook.addWorksheet(nomeAbaValido(mesResumo.mes));

      abaDetalhe.columns = [
        { header: 'Tipo', key: 'tipo', width: 20 },
        { header: 'Descrição', key: 'descricao', width: 40 },
        { header: 'Valor', key: 'valor', width: 15 },
      ];

      abaDetalhe.getRow(1).eachCell(cell => {
        Object.assign(cell, { style: headerStyle });
      });

      mesResumo.transacoes.forEach(t => {
        abaDetalhe.addRow({ tipo: 'Transação', descricao: t.descricao, valor: t.valor });
      });

      mesResumo.despesasFixas.forEach(d => {
        abaDetalhe.addRow({ tipo: 'Despesa Fixa', descricao: d.descricao, valor: d.valor });
      });

      mesResumo.receitasFixas.forEach(r => {
        abaDetalhe.addRow({ tipo: 'Receita Fixa', descricao: r.descricao, valor: r.valor });
      });

      // Soma final na aba do mês
      abaDetalhe.addRow({});
      abaDetalhe.addRow({
        tipo: 'TOTAL',
        valor: mesResumo.valorFinal,
      });

      const lastRow = abaDetalhe.lastRow;
      lastRow.eachCell(cell => {
        cell.font = { bold: true };
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' },
        };
      });
    });

    // Geração do arquivo em memória
    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=ResumoFinanceiro.xlsx');
    res.send(buffer);
  } catch (error) {
    console.error('❌ Erro ao gerar Excel:', error.message);
    res.status(500).json({ erro: 'Erro ao gerar Excel do resumo financeiro' });
  }
};
