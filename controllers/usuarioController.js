// controllers/usuarioController.js
import User from '../models/User.js';

export const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await User.find({}, '-senha'); // exclui campo senha
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar usuários' });
  }
};
