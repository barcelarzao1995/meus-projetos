// server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// ✅ Importação das rotas
import transacoesRoutes from './routes/transacoes.js';
import syncRoutes from './routes/sync.js'; // Opcional
import authRoutes from './routes/auth.js';
import notaRoutes from './routes/nota.js';
import cartoesRoutes from './routes/cartoes.js';
import devedoresRoutes from './routes/devedores.js';
import movimentosRoutes from './routes/movimentos.js';
import despesasFixasRoutes from './routes/despesasFixas.js';
import receitasFixasRoutes from './routes/receitasFixas.js';
import resumoFinalRoutes from './routes/resumoFinal.js'; // Inclui getResumoFinal e exportarResumoExcel
import biRoutes from './routes/bi.js'; // 👈 importar a nova rota
import perfilRoutes from './routes/perfil.js';
import usuariosRoutes from './routes/usuarios.js';
import deleteAccountRoutes from './routes/deleteAccount.js';

dotenv.config();

const app = express();

// ✅ Middlewares
app.use(cors());
app.use(express.json());

// ✅ Registro das rotas
app.use('/api/transacoes', transacoesRoutes);
app.use('/api/sync', syncRoutes); // Pode remover se não usar
app.use('/api/auth', authRoutes);
app.use('/api/notas', notaRoutes);
app.use('/api/cartoes', cartoesRoutes);
app.use('/api/devedores', devedoresRoutes);
app.use('/api/movimentos', movimentosRoutes);
app.use('/api/despesas-fixas', despesasFixasRoutes);
app.use('/api/receitas-fixas', receitasFixasRoutes);
app.use('/api/resumo-final', resumoFinalRoutes); // ✅ Inclui / e /excel
app.use('/api/bi', biRoutes); // 👈 adicionar a nova rota aqui
app.use('/api/perfil', perfilRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/delete-account', deleteAccountRoutes);

// ✅ Health check (útil para Render, Vercel, etc.)
app.get('/healthz', (req, res) => res.send('OK'));

// ✅ Página inicial
app.get('/', (req, res) => {
  res.send('🚀 API Financeira está funcionando!');
});

// ✅ Conexão com MongoDB e start do servidor
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI não definido no arquivo .env');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI, {
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
