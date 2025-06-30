import ExcelJS from 'exceljs';
import dayjs from 'dayjs';
import Transacao from '../models/Transacao.js';
import DespesaFixa from '../models/DespesaFixa.js';
import ReceitaFixa from '../models/ReceitaFixa.js';

export const exportarResumoExcel = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartaoSelecionado, devedorSelecionado } = req.query;

    const workbook = new ExcelJS.Workbook();
    const mesesComCartao = await Transacao.find({
      usuario: userId,
      formaPagamento: 'cartao',
    }).distinct('vencimento');

    const mesesOrdenados = mesesComCartao
      .map((m) => dayjs(`01/${m}`, 'DD/MM/YYYY'))
      .sort((a, b) => a.isAfter(b) ? 1 : -1);

    for (const dataRef of mesesOrdenados) {
      const mes = dataRef.format('MM/YYYY');
      const worksheet = workbook.addWorksheet(mes.replace('/', '-'));

      worksheet.columns = [
        { header: 'Descrição Transação', key: 'descricaoTransacao', width: 30 },
        { header: 'Valor Transação', key: 'valorTransacao', width: 20 },
        { header: 'Descrição Despesa Fixa', key: 'descricaoDespesa', width: 30 },
        { header: 'Valor Despesa Fixa', key: 'valorDespesa', width: 20 },
        { header: 'Descrição Receita Fixa', key: 'descricaoReceita', width: 30 },
        { header: 'Valor Receita Fixa', key: 'valorReceita', width: 20 },
      ];

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

      const maxLength = Math.max(
        transacoes.length,
        despesasFixas.length,
        receitasFixas.length
      );

      for (let i = 0; i < maxLength; i++) {
        worksheet.addRow({
          descricaoTransacao: transacoes[i]?.descricao || '',
          valorTransacao: transacoes[i]?.valor || '',
          descricaoDespesa: despesasFixas[i]?.descricao || '',
          valorDespesa: despesasFixas[i]?.valor || '',
          descricaoReceita: receitasFixas[i]?.descricao || '',
          valorReceita: receitasFixas[i]?.valor || '',
        });
      }

      const totalTransacoes = transacoes.reduce((acc, t) => acc + (Number(t.valor) || 0), 0);
      const totalDespesasFixas = despesasFixas.reduce((acc, d) => acc + (Number(d.valor) || 0), 0);
      const totalReceitasFixas = receitasFixas.reduce((acc, r) => acc + (Number(r.valor) || 0), 0);
      const valorFinal = totalDespesasFixas + totalTransacoes - totalReceitasFixas;

      worksheet.addRow({});
      worksheet.addRow({ descricaoTransacao: 'Total Transações', valorTransacao: totalTransacoes });
      worksheet.addRow({ descricaoDespesa: 'Total Despesas Fixas', valorDespesa: totalDespesasFixas });
      worksheet.addRow({ descricaoReceita: 'Total Receitas Fixas', valorReceita: totalReceitasFixas });
      worksheet.addRow({ descricaoTransacao: 'Valor Final', valorTransacao: valorFinal });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=resumo-financeiro.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Erro ao gerar Excel:', error);
    res.status(500).json({ erro: 'Erro ao gerar Excel' });
  }
};
