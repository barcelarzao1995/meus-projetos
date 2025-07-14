import express from 'express';
import { autenticarToken } from '../middleware/auth.js';
import deleteAccountController from '../controllers/deleteAccountController.js';

const router = express.Router();

router.delete('/', autenticarToken, deleteAccountController);

export default router;
