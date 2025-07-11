import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { getResumoBI } from './biController.js';

export const exportarBIExcel = async (req, res) => {
  try {
    const userId = req.user.id;
    const { filtroCartao = '', filtroDevedor = '', filtroMes = '' } = req.query;

    console.log('🟡 Exportando BI Excel com filtros:', {
      filtroCartao,
      filtroDevedor,
      filtroMes,
    });

    const dados = await getResumoBI(userId, filtroCartao, filtroDevedor, filtroMes);
    console.log('🔍 userId recebido:', userId);


    console.log('🟢 Dados retornados:', dados?.length);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Painel BI');

    // Cabeçalhos
    sheet.columns = [
      { header: 'Mês', key: 'mes', width: 12 },
      { header: 'Cartão', key: 'cartao', width: 20 },
      { header: 'Descrição', key: 'descricao', width: 30 },
      { header: 'Parcelas', key: 'totalParcelas', width: 12 },
      { header: 'Valor Total (R$)', key: 'valorTotal', width: 20 },
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

    // Inserir os dados
    dados.forEach((item) => {
      sheet.addRow({
        mes: item.mes || '',
        cartao: item.cartao || '',
        descricao: item.descricao || '',
        totalParcelas: item.totalParcelas ?? 0,
        valorTotal: typeof item.valorTotal === 'number' ? item.valorTotal : 0,
      });
    });

    // Estilo das linhas de dados
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // pula cabeçalho
      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        };

        // Formatar colunas numéricas
        if (colNumber === 5) {
          cell.numFmt = 'R$ #,##0.00';
        }
      });
    });

    // Criar arquivo temporário
    const tempDir = os.tmpdir();
    const filePath = path.join(tempDir, `BI-${Date.now()}.xlsx`);
    await workbook.xlsx.writeFile(filePath);

    console.log('✅ Excel gerado com sucesso:', filePath);

    res.download(filePath, 'Painel-BI.xlsx', (err) => {
      if (err) {
        console.error('❌ Erro ao enviar o Excel:', err);
      }
      fs.unlink(filePath, () => {}); // Apagar após envio
    });
  } catch (error) {
    console.error('❌ Erro ao gerar Excel BI:', error);
    res.status(500).json({ erro: 'Erro ao gerar Excel do Painel BI' });
  }
};
