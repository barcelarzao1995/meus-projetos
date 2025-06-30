import ExcelJS from 'exceljs';
import Transacao from '../models/Transacao.js';
import DespesaFixa from '../models/DespesaFixa.js';
import ReceitaFixa from '../models/ReceitaFixa.js';
import dayjs from 'dayjs';
import { Buffer } from 'buffer';

export const gerarExcelResumo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartaoSelecionado, devedorSelecionado } = req.query;

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Resumo Financeiro');

    // Cabeçalho
    sheet.addRow([
      'Mês',
      'Descrição Transação',
      'Valor Transação',
      'Descrição Despesa Fixa',
      'Valor Despesa Fixa',
      'Descrição Receita Fixa',
      'Valor Receita Fixa',
      'Total Mês',
    ]);

    // Coleta de dados mês a mês
    let mesIndex = 0;
    let mesesProcessados = 0;
    const LIMITE_MESES = 24;

    while (mesesProcessados < LIMITE_MESES) {
      const ref = dayjs().add(mesIndex, 'month');
      const mes = ref.format('MM/YYYY');

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

      if (transacoes.length === 0 && mesesProcessados > 0) break;

      const totalTransacoes = transacoes.reduce((acc, t) => acc + (Number(t.valor) || 0), 0);
      const totalDespesasFixas = despesasFixas.reduce((acc, d) => acc + (Number(d.valor) || 0), 0);
      const totalReceitasFixas = receitasFixas.reduce((acc, r) => acc + (Number(r.valor) || 0), 0);
      const totalMes = totalTransacoes + totalDespesasFixas - totalReceitasFixas;

      const maxLinhas = Math.max(
        transacoes.length,
        despesasFixas.length,
        receitasFixas.length,
        1
      );

      for (let i = 0; i < maxLinhas; i++) {
        sheet.addRow([
          i === 0 ? mes : '',

          transacoes[i]?.descricao || '',
          transacoes[i] ? Number(transacoes[i].valor) : '',

          despesasFixas[i]?.descricao || '',
          despesasFixas[i] ? Number(despesasFixas[i].valor) : '',

          receitasFixas[i]?.descricao || '',
          receitasFixas[i] ? Number(receitasFixas[i].valor) : '',

          i === 0 ? totalMes : '',
        ]);
      }

      mesIndex++;
      mesesProcessados++;
    }

    // Geração do buffer e resposta em base64
    const buffer = await workbook.xlsx.writeBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    res.json({ base64 });
  } catch (err) {
    console.error('Erro ao gerar Excel do resumo:', err);
    res.status(500).json({ erro: 'Erro ao gerar Excel do resumo' });
  }
};
