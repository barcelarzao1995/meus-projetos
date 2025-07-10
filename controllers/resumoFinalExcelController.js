import ExcelJS from 'exceljs';
import Transacao from '../models/Transacao.js';
import DespesaFixa from '../models/DespesaFixa.js';
import ReceitaFixa from '../models/ReceitaFixa.js';

const sanitizeSheetName = (name) =>
  name.replace(/[\\/?*[\]:]/g, '-').slice(0, 31);

export const exportarResumoExcel = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartaoSelecionado, devedorSelecionado } = req.query;

    const filtroBase = { usuario: userId, formaPagamento: 'cartao' };
    if (cartaoSelecionado) filtroBase.cartaoDescricao = cartaoSelecionado;
    if (devedorSelecionado) filtroBase.devedor = devedorSelecionado;

    const transacoes = await Transacao.find(filtroBase);
    const mesesUnicos = [
      ...new Set(transacoes.map((t) => t.vencimento).filter(Boolean)),
    ].sort((a, b) => {
      const [ma, aa] = a.split('/').map(Number);
      const [mb, ab] = b.split('/').map(Number);
      return aa !== ab ? aa - ab : ma - mb;
    });

    const workbook = new ExcelJS.Workbook();
    const sheetResumo = workbook.addWorksheet('Resumo');

    // Estilo cabeçalho resumo
    const headerStyle = {
      font: { bold: true, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4E89AE' } },
      alignment: { horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      },
    };

    sheetResumo.columns = [
      { header: 'Mês', key: 'mes', width: 20 },
      { header: 'Total Transações', key: 'transacoes', width: 20 },
      { header: 'Despesas Fixas', key: 'despesas', width: 20 },
      { header: 'Receitas Fixas', key: 'receitas', width: 20 },
      { header: 'Valor Final', key: 'final', width: 20 },
    ];

    sheetResumo.getRow(1).eachCell((cell) => {
      Object.assign(cell, headerStyle);
    });

    for (const mes of mesesUnicos) {
      const abaNome = sanitizeSheetName(mes);
      const filtroMes = { ...filtroBase, vencimento: mes };

      const transacoesMes = await Transacao.find(filtroMes);

      const despesasFixas = devedorSelecionado
        ? await DespesaFixa.find({ userId, devedor: devedorSelecionado })
        : [];

      const receitasFixas = devedorSelecionado
        ? await ReceitaFixa.find({ userId, devedor: devedorSelecionado })
        : [];

      const totalTransacoes = transacoesMes.reduce((acc, t) => acc + Number(t.valor || 0), 0);
      const totalDespesasFixas = despesasFixas.reduce((acc, d) => acc + Number(d.valor || 0), 0);
      const totalReceitasFixas = receitasFixas.reduce((acc, r) => acc + Number(r.valor || 0), 0);
      const valorFinal = totalReceitasFixas - (totalDespesasFixas + totalTransacoes);

      // Adiciona ao resumo
      const row = sheetResumo.addRow([
        { text: mes, hyperlink: `#'${abaNome}'!A1`, tooltip: 'Ver detalhes' },
        totalTransacoes,
        totalDespesasFixas,
        totalReceitasFixas,
        valorFinal,
      ]);

      row.eachCell((cell, col) => {
        cell.numFmt = col > 1 ? '"R$"#,##0.00' : undefined;
        cell.border = headerStyle.border;
      });

      const cellFinal = row.getCell(5);
      cellFinal.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: valorFinal < 0 ? 'FFFFCCCC' : 'FFCCFFCC' },
      };
      cellFinal.font = {
        bold: true,
        color: { argb: valorFinal < 0 ? 'FF990000' : 'FF006100' },
      };

      // Abas detalhadas
      const sheetMes = workbook.addWorksheet(abaNome);

      sheetMes.mergeCells('A1', 'C1');
      const titleCell = sheetMes.getCell('A1');
      titleCell.value = `Detalhes do mês: ${mes}`;
      titleCell.font = { size: 14, bold: true };
      titleCell.alignment = { horizontal: 'center' };

      sheetMes.addRow([]);
      sheetMes.columns = [
        { header: 'Descrição', key: 'descricao', width: 40 },
        { header: 'Tipo', key: 'tipo', width: 25 },
        { header: 'Valor (R$)', key: 'valor', width: 20 },
      ];

      const rows = [];

      transacoesMes.forEach((t) =>
        rows.push({ descricao: t.descricao, tipo: 'Transação', valor: Number(t.valor || 0) })
      );
      despesasFixas.forEach((d) =>
        rows.push({ descricao: d.descricao, tipo: 'Despesa Fixa', valor: Number(d.valor || 0) })
      );
      receitasFixas.forEach((r) =>
        rows.push({ descricao: r.descricao, tipo: 'Receita Fixa', valor: Number(r.valor || 0) })
      );

      sheetMes.addRows(rows);

      sheetMes.getRow(3).eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFDCE6F1' },
        };
        cell.alignment = { horizontal: 'center' };
      });

      sheetMes.eachRow((row, index) => {
        if (index > 3) {
          row.getCell(3).numFmt = '"R$"#,##0.00';
        }
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      });

      // Valor final no fim
      const finalRow = sheetMes.addRow(['Valor Final', '', valorFinal]);
      finalRow.font = { bold: true };
      finalRow.getCell(3).numFmt = '"R$"#,##0.00';
      finalRow.getCell(3).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: valorFinal < 0 ? 'FFFFCCCC' : 'FFCCFFCC' },
      };
      finalRow.getCell(3).font = {
        bold: true,
        color: { argb: valorFinal < 0 ? 'FF990000' : 'FF006100' },
      };
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=resumo-financeiro.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Erro ao exportar Excel:', error);
    res.status(500).json({ erro: 'Erro ao gerar Excel' });
  }
};
