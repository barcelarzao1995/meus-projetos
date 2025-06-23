import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import transacoesRoutes from './routes/transacoes.js';
import syncRoutes from './routes/sync.js';
import authRoutes from './routes/auth.js';
import notaRoutes from './routes/nota.js'; // ✅ adicionando notas
import cartoesRoutes from './routes/cartoes.js';
import devedoresRoutes from './routes/devedores.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/transacoes', transacoesRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notas', notaRoutes); // ✅ rota nova
app.use('/cartoes', cartoesRoutes);
app.use('/devedores', devedoresRoutes);

app.get('/', (req, res) => {
  res.send('🚀 API conectada com MongoDB');
});

export default app;
