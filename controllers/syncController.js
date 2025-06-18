import Transacao from '../models/Transacao.js';

export const sincronizarTransacoes = async (req, res) => {
  try {
    const transacoes = req.body.transacoes;

    if (!Array.isArray(transacoes)) {
      return res.status(400).json({ error: 'Formato inválido. Esperado: array de transações.' });
    }

    // Para cada transação, salva no banco com vinculação ao usuário logado
    const transacoesSalvas = await Promise.all(
      transacoes.map(async (t) => {
        const novaTransacao = new Transacao({
          tipo: t.tipo,
          valor: t.valor,
          descricao: t.descricao || '',
          formaPagamento: t.formaPagamento || '',
          cartaoDescricao: t.cartaoDescricao || '',
          parcelas: t.parcelas || 1,
          contaDescricao: t.contaDescricao || '',
          dataCompra: t.dataCompra,
          vencimentoParcela: t.vencimentoParcela || '',
          devedor: t.devedor || '',
          mesReferencia: t.mesReferencia || '',
        });

        return await novaTransacao.save();
      })
    );

    return res.status(201).json({
      message: 'Transações sincronizadas com sucesso.',
      totalSincronizadas: transacoesSalvas.length,
    });
  } catch (error) {
    console.error('Erro na sincronização:', error);
    res.status(500).json({ error: 'Erro interno ao sincronizar transações.' });
  }
};
