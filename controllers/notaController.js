// controllers/notaController.js

import Nota from '../models/Nota.js';

const getNotas = async (req, res) => {
  try {
    const notas = await Nota.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(notas);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar notas', error: err.message });
  }
};

const createNota = async (req, res) => {
  try {
    const { texto, cor, categoria } = req.body;

    if (!texto || !texto.trim()) {
      return res.status(400).json({ message: 'O campo "texto" é obrigatório.' });
    }

    const novaNota = new Nota({
      texto,
      cor,
      categoria,
      userId: req.user._id,
    });

    await novaNota.save();
    res.status(201).json(novaNota);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar nota', error: err.message });
  }
};

const updateNota = async (req, res) => {
  try {
    const { id } = req.params;
    const { texto, cor, categoria } = req.body;

    const nota = await Nota.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { texto, cor, categoria },
      { new: true }
    );

    if (!nota) {
      return res.status(404).json({ message: 'Nota não encontrada' });
    }

    res.json(nota);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar nota', error: err.message });
  }
};

const deleteNota = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Nota.findOneAndDelete({ _id: id, userId: req.user._id });

    if (!deleted) {
      return res.status(404).json({ message: 'Nota não encontrada' });
    }

    res.json({ message: 'Nota excluída com sucesso' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao excluir nota', error: err.message });
  }
};

export default {
  getNotas,
  createNota,
  updateNota,
  deleteNota,
};
