
// controllers/resumoFinalExcelController.js
import ExcelJS from 'exceljs';
import { getResumoFinanceiro } from './resumoFinalController.js';

const aplicarFormatoMonetario = (worksheet, colunaKey) => {
  worksheet.eachRow((row, rowNumber) => {
    const cell = row.getCell(colunaKey);
    if (rowNumber > 1 && typeof cell.value === 'number') {
      cell.numFmt = 'R$ #,##0.00';
    }
  });
};

export const exportarResumoExcel = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartaoSelecionado, devedorSelecionado } = req.query;

    const resumo = await getResumoFinanceiro(userId, cartaoSelecionado, devedorSelecionado);

    const workbook = new ExcelJS.Workbook();
    const resumoSheet = workbook.addWorksheet('Resumo');

    const headerStyle = {
      font: { bold: true, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4E89AE' } },
      alignment: { horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      },
    };

    resumoSheet.columns = [
      { header: 'Mês', key: 'mes', width: 15 },
      { header: 'Total Transações', key: 'totalTransacoes', width: 20 },
      { header: 'Total Despesas Fixas', key: 'totalDespesasFixas', width: 22 },
      { header: 'Total Receitas Fixas', key: 'totalReceitasFixas', width: 22 },
      { header: 'Valor Final', key: 'valorFinal', width: 20 },
    ];
    resumoSheet.getRow(1).eachCell(cell => (cell.style = headerStyle));

    resumo.forEach((mes) => {
      const abaNome = mes.mes.replace(/[\/*?:\[\]]/g, '-');
      resumoSheet.addRow({
        mes: { text: mes.mes, hyperlink: `#${abaNome}!A1` },
        totalTransacoes: mes.totalTransacoes,
        totalDespesasFixas: mes.totalDespesasFixas,
        totalReceitasFixas: mes.totalReceitasFixas,
        valorFinal: mes.valorFinal,
      });
    });

    aplicarFormatoMonetario(resumoSheet, 2);
    aplicarFormatoMonetario(resumoSheet, 3);
    aplicarFormatoMonetario(resumoSheet, 4);
    aplicarFormatoMonetario(resumoSheet, 5);

    resumo.forEach((mesResumo) => {
      const abaNome = mesResumo.mes.replace(/[\/*?:\[\]]/g, '-');
      const aba = workbook.addWorksheet(abaNome);

      aba.columns = [
        { header: 'Tipo', key: 'tipo', width: 22 },
        { header: 'Descrição', key: 'descricao', width: 35 },
        { header: 'Valor (R$)', key: 'valor', width: 18 },
      ];
      aba.getRow(1).eachCell(cell => (cell.style = headerStyle));

      mesResumo.transacoes.forEach(t => {
        aba.addRow({ tipo: 'Transação', descricao: t.descricao, valor: t.valor });
      });

      mesResumo.despesasFixas.forEach(d => {
        aba.addRow({ tipo: 'Despesa Fixa', descricao: d.descricao, valor: d.valor });
      });

      mesResumo.receitasFixas.forEach(r => {
        aba.addRow({ tipo: 'Receita Fixa', descricao: r.descricao, valor: r.valor });
      });

      aba.addRow({});
      aba.addRow({ tipo: 'TOTAL TRANSAÇÕES', valor: mesResumo.totalTransacoes });
      aba.addRow({ tipo: 'TOTAL DESPESAS FIXAS', valor: mesResumo.totalDespesasFixas });
      aba.addRow({ tipo: 'TOTAL RECEITAS FIXAS', valor: mesResumo.totalReceitasFixas });
      aba.addRow({ tipo: 'VALOR FINAL', valor: mesResumo.valorFinal });

      aplicarFormatoMonetario(aba, 3);

      aba.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' },
          };
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        });
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Disposition', 'attachment; filename="resumo-financeiro.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('❌ Erro ao exportar Excel:', err);
    res.status(500).json({ error: 'Erro ao gerar o Excel' });
  }
};
