import User from '../models/User.js';
import Transacao from '../models/Transacao.js';
import Cartao from '../models/Cartao.js'
import DespesasFixa from '../models/DespesaFixa.js'
import Devedor from '../models/Devedor.js'
import Movimento from '../models/Movimento.js'
import Nota from '../models/Nota.js'
import ReceitaFixa from '../models/ReceitaFixa.js';

export const excluirConta = async (req, res) => {
  try {
    const userId = req.user.id;
    await Transacao.deleteMany({ usuario: userId });
    await Cartao.deleteMany({ usuario: userId });
    await DespesasFixa.deleteMany({ usuario: userId });
    await Devedor.deleteMany({ usuario: userId });
    await Movimento.deleteMany({ usuario: userId });
    await Nota.deleteMany({ usuario: userId });
    await ReceitaFixa.deleteMany({ usuario: userId });
    await User.findByIdAndDelete(userId);

     res.status(200).json({ message: 'Conta excluída com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir conta:', err);
    res.status(500).json({ error: 'Erro ao excluir conta' });
  }
};

export default excluirConta;
