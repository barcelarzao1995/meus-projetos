// controllers/biExcelController.js
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { getResumoBI } from './biController.js'; // Supondo que você tenha essa função

export const exportarBIExcel = async (req, res) => {
  try {
    const userId = req.user.id;
    const { filtroCartao, filtroDevedor, filtroMes } = req.query;

    const dados = await getResumoBI(userId, filtroCartao, filtroDevedor, filtroMes);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Painel BI');

    // Cabeçalhos
    sheet.columns = [
      { header: 'Mês', key: 'mes', width: 12 },
      { header: 'Cartão', key: 'cartao', width: 20 },
      { header: 'Descrição', key: 'descricao', width: 30 },
      { header: 'Parcelas', key: 'totalParcelas', width: 12 },
      { header: 'Valor Total', key: 'valorTotal', width: 15 },
    ];

    // Estilo do cabeçalho
    sheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4E89AE' },
      };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Dados
    dados.forEach((item) => {
      sheet.addRow({
        mes: item.mes,
        cartao: item.cartao,
        descricao: item.descricao,
        totalParcelas: item.totalParcelas,
        valorTotal: item.valorTotal,
      });
    });

    // Estilizar linhas
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // Criar arquivo temporário
    const tempDir = os.tmpdir();
    const filePath = path.join(tempDir, `BI-${Date.now()}.xlsx`);
    await workbook.xlsx.writeFile(filePath);

    res.download(filePath, 'Painel-BI.xlsx', (err) => {
      if (err) console.error('Erro ao enviar Excel:', err);
      fs.unlinkSync(filePath); // Apagar após envio
    });
  } catch (error) {
    console.error('Erro ao gerar Excel BI:', error);
    res.status(500).json({ erro: 'Erro ao gerar Excel do Painel BI' });
  }
};
