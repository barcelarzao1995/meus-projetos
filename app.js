import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import transacoesRoutes from './routes/transacoes.js';
import syncRoutes from './routes/sync.js';
import authRoutes from './routes/auth.js';
import notaRoutes from './routes/nota.js';
import cartoesRoutes from './routes/cartoes.js';
import devedoresRoutes from './routes/devedores.js';
import despesasFixasRoutes from './routes/despesasFixas.js';
import receitasFixasRoutes from './routes/receitasFixas.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ⚠️ Rotas com /api (frontend espera isso!)
app.use('/api/transacoes', transacoesRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notas', notaRoutes);
app.use('/api/cartoes', cartoesRoutes); // ⚠️ repare no /api
app.use('/api/devedores', devedoresRoutes); // ⚠️ repare no /api
app.use('/api/despesas-fixas', despesasFixasRoutes);
app.use('/api/receitas-fixas', receitasFixasRoutes);

app.get('/', (req, res) => {
  res.send('🚀 API conectada com MongoDB');
});

export default app;

