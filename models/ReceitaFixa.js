// models/ReceitaFixa.js
import mongoose from 'mongoose';

const receitaFixaSchema = new mongoose.Schema({
  descricao: {
    type: String,
    required: true,
  },
  valor: {
    type: Number,
    required: true,
    min: 0,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model('ReceitaFixa', receitaFixaSchema);
