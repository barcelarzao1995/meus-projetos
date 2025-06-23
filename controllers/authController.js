import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Gerar token JWT
const gerarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'segredo123', { expiresIn: '7d' });
};

// Registro de usuário
export const registrar = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    const usuarioExistente = await User.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ msg: 'E-mail já registrado.' });
    }

    const novoUsuario = new User({ nome, email, senha });
    await novoUsuario.save();

    res.status(201).json({ msg: 'Usuário registrado com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Erro no servidor.' });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res.status(400).json({ msg: 'Usuário não encontrado.' });
    }

    const senhaCorreta = await usuario.comparePassword(senha);
    if (!senhaCorreta) {
      return res.status(400).json({ msg: 'Senha incorreta.' });
    }

    const token = gerarToken(usuario._id);
    res.json({
      token,
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Erro no login.' });
  }
};

// Solicitação de redefinição de senha
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const usuario = await User.findOne({ email });
    if (!usuario) return res.status(404).json({ msg: 'Usuário não encontrado.' });

    const token = crypto.randomBytes(20).toString('hex');
    usuario.resetPasswordToken = token;
    usuario.resetPasswordExpires = Date.now() + 3600000;
    await usuario.save();

    const resetLink = `https://meus-projetos-xqwd.onrender.com/auth/redirect/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Finance App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Redefinição de senha',
      html: `
        <p>Olá,</p>
        <p>Você solicitou a redefinição de senha. Clique no link abaixo para criar uma nova senha:</p>
        <a href="${resetLink}">Redefinir Senha</a>
        <p>Se não foi você, ignore este e-mail.</p>
        <p>Att,<br/>Equipe Finance App</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ msg: 'Email de redefinição enviado com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Erro ao solicitar redefinição.' });
  }
};

// ✅ Redefinir a senha com token
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { novaSenha } = req.body;

    const usuario = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!usuario) {
      return res.status(400).json({ msg: 'Token inválido ou expirado.' });
    }

    usuario.senha = novaSenha;
    usuario.resetPasswordToken = undefined;
    usuario.resetPasswordExpires = undefined;
    await usuario.save();

    res.json({ msg: 'Senha redefinida com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Erro ao redefinir senha.' });
  }
};
