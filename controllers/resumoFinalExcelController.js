// controllers/resumoFinalExcelController.js
import ExcelJS from 'exceljs';
import Transacao from '../models/Transacao.js';
import DespesaFixa from '../models/DespesaFixa.js';
import ReceitaFixa from '../models/ReceitaFixa.js';

const sanitizeSheetName = (name) =>
  name.replace(/[\\/?*[\]:]/g, '-').slice(0, 31); // Excel limita nomes de abas a 31 caracteres

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

    // Estilos de cabeçalho
    const headerStyle = {
      font: { bold: true, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4E89AE' } },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      },
    };

    sheetResumo.addRow(['Mês', 'Total Transações', 'Total Despesas Fixas', 'Total Receitas Fixas', 'Valor Final']);

    for (const mes of mesesUnicos) {
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

      // Aba mensal detalhada
      const abaNome = sanitizeSheetName(mes);
      const sheetMes = workbook.addWorksheet(abaNome);

      sheetMes.columns = [
        { header: 'Descrição', key: 'descricao', width: 40 },
        { header: 'Tipo', key: 'tipo', width: 20 },
        { header: 'Valor (R$)', key: 'valor', width: 20 },
      ];

      const rows = [];

      transacoesMes.forEach((t) => {
        rows.push({ descricao: t.descricao, tipo: 'Transação', valor: Number(t.valor || 0) });
      });
      despesasFixas.forEach((d) => {
        rows.push({ descricao: d.descricao, tipo: 'Despesa Fixa', valor: Number(d.valor || 0) });
      });
      receitasFixas.forEach((r) => {
        rows.push({ descricao: r.descricao, tipo: 'Receita Fixa', valor: Number(r.valor || 0) });
      });

      sheetMes.addRows(rows);

      sheetMes.eachRow((row, i) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' },
          };
          if (i === 1) {
            cell.font = { bold: true };
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFDCE6F1' },
            };
          }
        });
      });

      // Valor final no fim da aba
      const lastRow = sheetMes.addRow([
        'Valor Final',
        '',
        valorFinal,
      ]);
      lastRow.font = { bold: true };
      lastRow.getCell(3).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: valorFinal < 0 ? 'FFFFCCCC' : 'FFCCFFCC' },
      };
      lastRow.getCell(3).font = {
        color: { argb: valorFinal < 0 ? 'FF990000' : 'FF006100' },
        bold: true,
      };

      // Adiciona hiperlink no resumo
      const resumoRow = sheetResumo.addRow([
        { text: mes, hyperlink: `#'${abaNome}'!A1`, tooltip: 'Clique para ver detalhes' },
        totalTransacoes,
        totalDespesasFixas,
        totalReceitasFixas,
        valorFinal,
      ]);

      resumoRow.eachCell((cell) => {
        cell.border = headerStyle.border;
      });

      resumoRow.getCell(5).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: valorFinal < 0 ? 'FFFFCCCC' : 'FFCCFFCC' },
      };
      resumoRow.getCell(5).font = {
        color: { argb: valorFinal < 0 ? 'FF990000' : 'FF006100' },
        bold: true,
      };
    }

    // Aplica estilos no cabeçalho
    sheetResumo.getRow(1).eachCell((cell) => {
      Object.assign(cell, headerStyle);
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=resumo-financeiro.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Erro ao exportar Excel:', error);
    res.status(500).json({ erro: 'Erro ao gerar Excel' });
  }
};
