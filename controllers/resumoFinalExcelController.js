
// controllers/resumoFinalExcelController.js
import ExcelJS from 'exceljs';
import Transacao from '../models/Transacao.js';
import DespesaFixa from '../models/DespesaFixa.js';
import ReceitaFixa from '../models/ReceitaFixa.js';
import { Buffer } from 'buffer';

export const exportarResumoExcel = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartaoSelecionado, devedorSelecionado } = req.query;

    // Buscar transações filtradas
    const filtroTransacoes = { usuario: userId, formaPagamento: 'cartao' };
    if (cartaoSelecionado) filtroTransacoes.cartaoDescricao = cartaoSelecionado;
    if (devedorSelecionado) filtroTransacoes.devedor = devedorSelecionado;

    const transacoes = await Transacao.find(filtroTransacoes);

    // Obter todos os meses únicos
    const meses = Array.from(
      new Set(transacoes.map((t) => t.vencimento).filter(Boolean))
    ).sort((a, b) => {
      const [ma, aa] = a.split('/').map(Number);
      const [mb, ab] = b.split('/').map(Number);
      return aa !== ab ? aa - ab : ma - mb;
    });

    const workbook = new ExcelJS.Workbook();
    const abaResumo = workbook.addWorksheet('Resumo');

    // Cabeçalho da aba "Resumo"
    abaResumo.addRow([
      'Mês',
      'Total Transações',
      'Total Despesas Fixas',
      'Total Receitas Fixas',
      'Valor Final (R$)',
    ]);

    for (const mes of meses) {
      const filtroMes = {
        usuario: userId,
        formaPagamento: 'cartao',
        vencimento: mes,
      };
      if (cartaoSelecionado) filtroMes.cartaoDescricao = cartaoSelecionado;
      if (devedorSelecionado) filtroMes.devedor = devedorSelecionado;

      const transacoesMes = await Transacao.find(filtroMes);
      let despesasFixas = [];
      let receitasFixas = [];

      if (devedorSelecionado) {
        despesasFixas = await DespesaFixa.find({ userId, devedor: devedorSelecionado });
        receitasFixas = await ReceitaFixa.find({ userId, devedor: devedorSelecionado });
      }

      const totalTransacoes = transacoesMes.reduce((acc, t) => acc + (Number(t.valor) || 0), 0);
      const totalDespesasFixas = despesasFixas.reduce((acc, d) => acc + (Number(d.valor) || 0), 0);
      const totalReceitasFixas = receitasFixas.reduce((acc, r) => acc + (Number(r.valor) || 0), 0);
      const valorFinal = totalReceitasFixas - (totalTransacoes + totalDespesasFixas);

      // Adiciona linha no resumo
      abaResumo.addRow([
        { text: mes, hyperlink: `#${mes}!A1` },
        totalTransacoes,
        totalDespesasFixas,
        totalReceitasFixas,
        valorFinal,
      ]);

      // Aba detalhada por mês
      const abaMes = workbook.addWorksheet(mes);
      abaMes.addRow([`Detalhamento do mês: ${mes}`]);
      abaMes.addRow([]);

      abaMes.addRow(['Transações']);
      abaMes.addRow(['Descrição', 'Valor']);
      transacoesMes.forEach((t) => {
        abaMes.addRow([t.descricao, t.valor]);
      });
      abaMes.addRow(['Total Transações', totalTransacoes]);
      abaMes.addRow([]);

      if (devedorSelecionado) {
        abaMes.addRow(['Despesas Fixas']);
        abaMes.addRow(['Descrição', 'Valor']);
        despesasFixas.forEach((d) => {
          abaMes.addRow([d.descricao, d.valor]);
        });
        abaMes.addRow(['Total Despesas Fixas', totalDespesasFixas]);
        abaMes.addRow([]);

        abaMes.addRow(['Receitas Fixas']);
        abaMes.addRow(['Descrição', 'Valor']);
        receitasFixas.forEach((r) => {
          abaMes.addRow([r.descricao, r.valor]);
        });
        abaMes.addRow(['Total Receitas Fixas', totalReceitasFixas]);
        abaMes.addRow([]);
      }

      abaMes.addRow(['Valor Final', valorFinal]);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader('Content-Disposition', 'attachment; filename=resumo-final.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Erro ao exportar Excel:', error);
    res.status(500).json({ error: 'Erro ao exportar resumo Excel' });
  }
};
