import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import transacoesRoutes from './routes/transacoes.js';
import syncRoutes from './routes/sync.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/transacoes', transacoesRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/auth', authRoutes); // ✅ <- Adiciona rotas de login e registro

app.get('/', (req, res) => {
  res.send('API Financeira está funcionando!');
});

export default app;
