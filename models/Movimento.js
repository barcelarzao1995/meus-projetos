// models/Movimento.js
import mongoose from 'mongoose';

const MovimentoSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: ['receita', 'despesa'],
    required: true,
  },
  descricao: {
    type: String,
    required: true,
  },
  valor: {
    type: Number,
    required: true,
  },
  dataCompra: Date,
  formaPagamento: {
    type: String,
    enum: ['pix', 'debito', 'cartao'],
  },
  cartaoDescricao: String,
  parcelas: {
    type: Number,
    default: 1,
  },
  parcelaAtual: Number,
  vencimento: String, // formato MM/YYYY
  mesReferencia: String, // formato MM/YYYY
  devedor: String,
  idGrupoParcelas: String,
  saldoDevedor: Number,
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Movimento', MovimentoSchema);

