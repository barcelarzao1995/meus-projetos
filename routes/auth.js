// routes/auth.js
import express from 'express';
import {
  registrar,
  login,
  forgotPassword,
  resetPassword,
  usuarioAutenticado, // ✅ importado
} from '../controllers/authController.js';

import { autenticarToken } from '../middleware/auth.js'; // ✅ middleware de autenticação

const router = express.Router();

// Registro e login
router.post('/register', registrar);
router.post('/login', login);

// Redefinição de senha
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Deep linking para reset
router.get('/redirect/reset-password/:token', (req, res) => {
  const { token } = req.params;
  const deepLink = `financeapp://reset-password/${token}`;
  res.redirect(deepLink);
});

// ✅ Nova rota protegida para obter os dados do usuário autenticado
router.get('/usuario', autenticarToken, usuarioAutenticado);

export default router;
