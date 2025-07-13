// controllers/perfilExcelController.js
import ExcelJS from 'exceljs';
import Transacao from '../models/Transacao.js';
import { sanitizeSheetName, sanitizeFileName } from '../utils/sanitize.js';

export const exportarPerfilExcel = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartao, devedor, mes } = req.query;

    const filtro = { usuario: userId };
    if (cartao) filtro.cartaoDescricao = cartao;
    if (devedor) filtro.devedor = devedor;
    if (mes) filtro.vencimento = mes;

    const transacoes = await Transacao.find(filtro).sort({ vencimento: 1 });

    if (!transacoes.length) {
      return res.status(400).json({ erro: 'Nenhuma transação encontrada.' });
    }

    const workbook = new ExcelJS.Workbook();
    const resumoSheet = workbook.addWorksheet('Resumo');

    resumoSheet.columns = [
      { header: 'Mês', key: 'mes', width: 15 },
      { header: 'Cartão', key: 'cartao', width: 25 },
      { header: 'Descrição', key: 'descricao', width: 30 },
      { header: 'Tipo', key: 'tipo', width: 15 },
      { header: 'Valor (R$)', key: 'valor', width: 15 },
    ];

    const transacoesPorMes = {};

    transacoes.forEach(t => {
      const mes = t.vencimento;
      if (!transacoesPorMes[mes]) transacoesPorMes[mes] = [];
      transacoesPorMes[mes].push(t);

      resumoSheet.addRow({
        mes,
        cartao: t.cartaoDescricao || '',
        descricao: t.descricao,
        tipo: t.tipo,
        valor: Number(t.valor),
      });
    });

    resumoSheet.eachRow((row, index) => {
      row.alignment = { vertical: 'middle', horizontal: 'left' };
      if (index === 1) {
        row.font = { bold: true };
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFCCCCCC' },
        };
      }
    });

    // Abas por mês
    for (const mes in transacoesPorMes) {
      const sheetName = sanitizeSheetName(mes);
      const sheet = workbook.addWorksheet(sheetName);

      sheet.columns = [
        { header: 'Cartão', key: 'cartao', width: 25 },
        { header: 'Descrição', key: 'descricao', width: 30 },
        { header: 'Tipo', key: 'tipo', width: 15 },
        { header: 'Valor (R$)', key: 'valor', width: 15 },
      ];

      let totalMes = 0;

      transacoesPorMes[mes].forEach(t => {
        sheet.addRow({
          cartao: t.cartaoDescricao,
          descricao: t.descricao,
          tipo: t.tipo,
          valor: Number(t.valor),
        });
        totalMes += Number(t.valor);
      });

      sheet.addRow([]);
      const totalRow = sheet.addRow({ descricao: 'Total', valor: totalMes });
      totalRow.font = { bold: true };
      totalRow.getCell('valor').numFmt = '"R$"#,##0.00';
      totalRow.getCell('valor').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: totalMes < 0 ? 'FFFFCCCC' : 'FFCCFFCC' },
      };

      sheet.eachRow((row, idx) => {
        row.alignment = { vertical: 'middle', horizontal: 'left' };
        if (idx === 1) {
          row.font = { bold: true };
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' },
          };
        }
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();

    const safeFileName = sanitizeFileName(
      `perfil-transacoes-${cartao || 'todos'}-${devedor || 'todos'}-${mes || 'todos'}-${Date.now()}`
    );

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${safeFileName}.xlsx`);
    res.send(buffer);
  } catch (error) {
    console.error('Erro ao gerar Excel do perfil:', error);
    res.status(500).json({ erro: 'Erro ao gerar Excel do perfil' });
  }
};
