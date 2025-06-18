import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const conectarBanco = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Conectado ao MongoDB com sucesso');
  } catch (erro) {
    console.error('❌ Erro ao conectar ao MongoDB:', erro.message);
    process.exit(1); // Encerra o processo se não conectar
  }
};

export default conectarBanco;
