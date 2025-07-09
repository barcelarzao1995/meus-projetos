// middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const autenticarToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token não fornecido.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'segredo123');
    const usuario = await User.findById(decoded.id).select('-senha');

    if (!usuario) return res.status(401).json({ error: 'Usuário não encontrado.' });

    req.usuario = usuario; // ✅ Usar "usuario" para consistência com o controller
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido.' });
  }
};

