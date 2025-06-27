// server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import transacoesRoutes from './routes/transacoes.js';
import syncRoutes from './routes/sync.js'; // Opcional
import authRoutes from './routes/auth.js';
import notaRoutes from './routes/nota.js';
import cartoesRoutes from './routes/cartoes.js';
import devedoresRoutes from './routes/devedores.js';
import movimentosRoutes from './routes/movimentos.js';


dotenv.config();

const app = express();

// ✅ Middlewares
app.use(cors());
app.use(express.json());

// ✅ Rotas principais
app.use('/api/transacoes', transacoesRoutes);
app.use('/api/sync', syncRoutes); // Se não usar sincronização, pode remover
app.use('/api/auth', authRoutes); // login, registro, etc
app.use('/api/notas', notaRoutes);
app.use('/api/cartoes', cartoesRoutes);
app.use('/api/devedores', devedoresRoutes);
app.use('/api/movimentos', movimentosRoutes);

// ✅ Health check para Render
app.get('/healthz', (req, res) => res.send('OK'));

// ✅ Página inicial
app.get('/', (req, res) => {
  res.send('🚀 API Financeira está funcionando!');
});

// ✅ Conexão MongoDB e start do servidor
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI não definido no .env');
  process.exit(1);
}

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Conectado ao MongoDB Atlas');
  app.listen(PORT, () =>
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`)
  );
})
.catch((err) => {
  console.error('❌ Erro ao conectar ao MongoDB:', err.message);
});
