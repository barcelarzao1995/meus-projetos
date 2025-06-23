import mongoose from 'mongoose';

const notaSchema = new mongoose.Schema({
  texto: { type: String, required: true },
  cor: { type: String },
  categoria: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const Nota = mongoose.model('Nota', notaSchema);
export default Nota;
