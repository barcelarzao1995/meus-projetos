import ExcelJS from 'exceljs';
import { getResumoBI } from './biController.js';

export const exportarBIExcel = async (req, res) => {
  try {
    const usuarioId = req.user.id; // Corrigido de userId para usuarioId
    const { filtroCartao = '', filtroDevedor = '', filtroMes = '' } = req.query;

    console.log('🟡 Exportando BI Excel com filtros:', {
      filtroCartao,
      filtroDevedor,
      filtroMes,
    });
    console.log('🔍 ID do usuário recebido:', usuarioId);

    const dados = await getResumoBI(usuarioId, filtroCartao, filtroDevedor, filtroMes);
    console.log('🟢 Dados retornados:', dados.length);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Painel BI');

    // Definir colunas
    sheet.columns = [
      { header: 'Mês', key: 'mes', width: 15 },
      { header: 'Cartão', key: 'cartao', width: 25 },
      { header: 'Descrição', key: 'descricao', width: 40 },
      { header: 'Parcelas', key: 'totalParcelas', width: 12 },
      { header: 'Valor Total (R$)', key: 'valorTotal', width: 18 },
    ];

    // Estilo de cabeçalho
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

    // Aplicar estilo ao cabeçalho
    sheet.getRow(1).eachCell((cell) => {
      Object.assign(cell, headerStyle);
    });

    // Inserir dados
    dados.forEach((item) => {
      sheet.addRow({
        mes: item.mes || '',
        cartao: item.cartao || '',
        descricao: item.descricao || '',
        totalParcelas: item.totalParcelas ?? 1,
        valorTotal: Number(item.valorTotal ?? 0),
      });
    });

    // Estilizar linhas de dados
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // pula cabeçalho
      row.eachCell((cell, colNumber) => {
        cell.border = headerStyle.border;

        if (colNumber === 5) {
          cell.numFmt = '"R$"#,##0.00';
          cell.alignment = { horizontal: 'right' };
        }
      });
    });

    // Enviar Excel direto na resposta (sem salvar em disco)
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=Painel-BI.xlsx');
    await workbook.xlsx.write(res);
    res.end();

    console.log('✅ Excel BI exportado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao gerar Excel BI:', error);
    res.status(500).json({ erro: 'Erro ao gerar Excel do Painel BI' });
  }
};
