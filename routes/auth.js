// routes/auth.js
import express from 'express';
import {
  registrar,
  login,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registrar);
router.post('/login', login);

// Solicitação de redefinição
router.post('/forgot-password', forgotPassword);

// Redefinir senha com token
router.post('/reset-password/:token', resetPassword);

// 🔁 Redirecionamento para deep linking
router.get('/redirect/reset-password/:token', (req, res) => {
  const { token } = req.params;
  const deepLink = `financeapp://reset-password/${token}`;
  res.redirect(deepLink);
});

export default router;
