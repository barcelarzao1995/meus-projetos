import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const autenticarToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]; // Espera formato: "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  try {
    // Verifica e decodifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Busca o usuário no banco
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Usuário inválido.' });
    }

    // Anexa o usuário à requisição
    req.user = user;

    next(); // segue para o próximo middleware ou rota
  } catch (err) {
    res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};



