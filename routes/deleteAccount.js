import express from 'express';
import { excluirConta } from '../controllers/deleteAccountController.js';
import { autenticarToken } from '../middleware/auth.js';

const router = express.Router();

router.delete('/', autenticarToken, excluirConta);

export default router;
