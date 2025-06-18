// server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import transacoesRoutes from './routes/transacoes.js';
import syncRoutes from './routes/sync.js'; // se estiver usando a rota de sincronização
import authRoutes from './routes/auth.js';

// Carrega as variáveis do .env
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/transacoes', transacoesRoutes);
app.use('/api/sync', syncRoutes); // se estiver usando a rota /api/sync/sincronizar
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('🚀 API Financeira está funcionando!');
});

// Conexão com MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Conectado ao MongoDB Atlas');

    // Inicia o servidor após conexão
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Erro ao conectar ao MongoDB:', err.message);
  });
