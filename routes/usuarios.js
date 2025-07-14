// routes/usuarios.js
import express from 'express';
import { listarUsuarios } from '../controllers/usuarioController.js';
import { autenticarToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', autenticarToken, listarUsuarios);

export default router;
