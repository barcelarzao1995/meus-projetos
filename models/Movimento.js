// models/Movimento.js
const mongoose = require('mongoose');

const MovimentoSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['receita', 'despesa'],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  dateCompra: String, // Para despesas
  vencimentoPrimeiraParcela: String, // Para despesas (mm/YYYY)
  formaPagamento: String, // pix | debito | cartao
  cartaoDescricao: String, // Se for cartao
  parcelas: Number, // Se for cartao
  devedor: String, // Nome do devedor (opcional)
  mesReferencia: String, // Para receitas
}, {
  timestamps: true,
});

module.exports = mongoose.model('Movimento', MovimentoSchema);
