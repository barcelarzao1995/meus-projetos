import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const autenticarToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token não fornecido.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ error: 'Usuário inválido.' });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};

