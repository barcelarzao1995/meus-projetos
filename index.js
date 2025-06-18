import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import transacoesRoutes from './routes/transacoes.js';

dotenv.config();

const app = express();
const PORT = 3001;
const HOST = '192.168.0.44'; // seu IP local ou 0.0.0.0 para todos

// Middlewares
app.use(cors());
app.use(express.json());

// Conexão com MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ Conectado ao MongoDB Atlas'))
  .catch((err) => console.error('❌ Erro ao conectar ao MongoDB:', err));

// Rotas
app.use('/api/transacoes', transacoesRoutes);

app.get('/', (req, res) => {
  res.send('🚀 API FinanceApp conectada ao Atlas');
});

app.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor rodando em http://${HOST}:${PORT}`);
});
