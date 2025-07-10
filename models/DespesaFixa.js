import mongoose from 'mongoose';

const DespesaFixaSchema = new mongoose.Schema({
  descricao: {
    type: String,
    required: true,
  },
  valor: {
    type: Number,
    required: true,
    min: 0,
  },
  devedor: {
    type: String, // Nome do devedor (ex: "Maria") — opcional
    default: '',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

export default mongoose.model('DespesaFixa', DespesaFixaSchema);
