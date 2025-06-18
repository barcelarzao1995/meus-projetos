import mongoose from 'mongoose';

const transacaoSchema = new mongoose.Schema({
  tipo: {
    type: String,
    required: true,
    enum: ['receita', 'despesa'],
  },
  descricao: {
    type: String,
    required: true,
  },
  valor: {
    type: Number,
    required: true,
  },
  dataCompra: {
    type: Date,
    required: true,
  },
  formaPagamento: {
    type: String,
    enum: ['pix', 'debito', 'cartao'],
    required: function () {
      return this.tipo === 'despesa';
    },
  },
  cartaoDescricao: {
    type: String,
    default: '',
  },
  parcelas: {
    type: Number,
    default: 1,
  },
  vencimento: {
    type: String,
    default: '',
  },
  devedor: {
    type: String,
    default: '',
  },
  mesReferencia: {
    type: String,
    required: true,
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
  },
}, { timestamps: true });

const Transacao = mongoose.model('Transacao', transacaoSchema);
export default Transacao;
