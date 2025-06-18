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

// Nova rota: solicitar redefinição
router.post('/forgot-password', forgotPassword);

// Nova rota: redefinir senha com token
router.post('/reset-password/:token', resetPassword);

export default router;
