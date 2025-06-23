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

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rotas principais
app.use('/api/transacoes', transacoesRoutes);
app.use('/api/sync', syncRoutes); // Se não estiver usando, pode comentar
app.use('/api/auth', authRoutes); // 🔐 todas auth (login, registro, redefinição)
app.use('/api/notas', notaRoutes);
app.use('/api/cartoes', cartoesRoutes);
app.use('/api/devedores', devedoresRoutes);

// Health check (Render usa isso para saber se está tudo ok)
app.get('/healthz', (req, res) => res.send('OK'));

// Rota raiz (só para teste rápido)
app.get('/', (req, res) => {
  res.send('🚀 API Financeira está funcionando!');
});

// Conexão com MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Conectado ao MongoDB Atlas');
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  });
})
.catch((err) => {
  console.error('❌ Erro ao conectar ao MongoDB:', err.message);
});
