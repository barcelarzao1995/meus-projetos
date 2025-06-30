// ✅ controllers/resumoFinalExcelController.js
import ExcelJS from 'exceljs';
import { Readable } from 'stream';
import dayjs from 'dayjs';
import Transacao from '../models/Transacao.js';
import DespesaFixa from '../models/DespesaFixa.js';
import ReceitaFixa from '../models/ReceitaFixa.js';

export const exportarResumoExcel = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartaoSelecionado, devedorSelecionado } = req.query;

    const workbook = new ExcelJS.Workbook();
    const dataHoje = dayjs().format('DD-MM-YYYY');

    // Pegar o vencimento mais distante
    const transacoesCartao = await Transacao.find({
      usuario: userId,
      formaPagamento: 'cartao',
      ...(cartaoSelecionado && { cartaoDescricao: cartaoSelecionado }),
      ...(devedorSelecionado && { devedor: devedorSelecionado }),
    });

    const vencimentosUnicos = [
      ...new Set(transacoesCartao.map((t) => t.vencimento)),
    ].sort((a, b) => dayjs(a, 'MM/YYYY') - dayjs(b, 'MM/YYYY'));

    for (const mes of vencimentosUnicos) {
      const worksheet = workbook.addWorksheet(mes);

      worksheet.columns = [
        { header: 'Tipo', key: 'tipo', width: 20 },
        { header: 'Descrição', key: 'descricao', width: 40 },
        { header: 'Valor (R$)', key: 'valor', width: 20 },
      ];

      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFCCE5FF' },
      };
      worksheet.getRow(1).alignment = { horizontal: 'center' };

      const filtro = {
        usuario: userId,
        formaPagamento: 'cartao',
        vencimento: mes,
      };
      if (cartaoSelecionado) filtro.cartaoDescricao = cartaoSelecionado;
      if (devedorSelecionado) filtro.devedor = devedorSelecionado;

      const transacoes = await Transacao.find(filtro);
      const despesasFixas = await DespesaFixa.find({ userId });
      const receitasFixas = await ReceitaFixa.find({ userId });

      const linhas = [];

      transacoes.forEach((t) => {
        linhas.push({
          tipo: 'Cartão',
          descricao: t.descricao,
          valor: Number(t.valor || 0),
        });
      });

      despesasFixas.forEach((d) => {
        linhas.push({
          tipo: 'Despesa Fixa',
          descricao: d.descricao,
          valor: Number(d.valor || 0),
        });
      });

      receitasFixas.forEach((r) => {
        linhas.push({
          tipo: 'Receita Fixa',
          descricao: r.descricao,
          valor: Number(r.valor || 0),
        });
      });

      linhas.forEach((linha) => worksheet.addRow(linha));

      // Estilizar linhas e somar
      let total = 0;
      worksheet.eachRow((row, index) => {
        if (index === 1) return; // pular header
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
        const valor = row.getCell('valor').value;
        if (typeof valor === 'number') total += valor;
      });

      const totalRow = worksheet.addRow({
        tipo: '',
        descricao: 'Total',
        valor: total,
      });

      totalRow.font = { bold: true };
      totalRow.getCell('descricao').alignment = { horizontal: 'right' };
      totalRow.getCell('valor').numFmt = '"R$"#,##0.00';
    }

    // Preparar resposta
    const buffer = await workbook.xlsx.writeBuffer();
    const stream = Readable.from(buffer);
    const filename = `resumo-financeiro-${dataHoje}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    stream.pipe(res);
  } catch (err) {
    console.error('Erro ao exportar Excel:', err);
    res.status(500).json({ erro: 'Erro ao gerar Excel' });
  }
};
