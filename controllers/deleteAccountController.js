import User from '../models/User.js';
import DespesasFixas from '../models/Transacao.js';
import Cartao from '../models/Cartao.js'
import DespesasFixas from '../models/DespesaFixa.js'
import Devedor from '../models/Devedor.js'
import Movimento from '../models/Movimento.js'
import Nota from '../models/Nota.js'
import Receita from '../models/ReceitaFixa.js'

export const excluirConta = async (req, res) => {
  try {
    const userId = req.user.id;
    await Transacao.deleteMany({ usuario: userId });
    await Cartao.deleteMany({ usuario: userId });
    await DespesasFixas.deleteMany({ usuario: userId });
    await Devedor.deleteMany({ usuario: userId });
    await Movimento.deleteMany({ usuario: userId });
    await Nota.deleteMany({ usuario: userId });
    await Receita.deleteMany({ usuario: userId });
    await User.findByIdAndDelete(userId);
    
    res.status(200).json({ message: 'Conta e todos os dados excluídos com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir conta:', error);
    res.status(500).json({ error: 'Erro ao excluir conta.' });
  }
};
