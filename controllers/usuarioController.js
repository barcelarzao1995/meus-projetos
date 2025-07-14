// controllers/usuarioController.js
import User from '../models/User.js';

export const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await User.find({}, '-senha');
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar usuários' });
  }
};

export const excluirMinhaConta = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id); // id vem do middleware
    res.json({ mensagem: 'Conta excluída com sucesso' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao excluir conta' });
  }
};
