import express from 'express';
import notaController from '../controllers/notaController.js';
import { autenticarToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(autenticarToken); // Aplica JWT em todas as rotas

router.get('/', notaController.getNotas);
router.post('/', notaController.createNota);
router.put('/:id', notaController.updateNota);
router.delete('/:id', notaController.deleteNota);

export default router;
