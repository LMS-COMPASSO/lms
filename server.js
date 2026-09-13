require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const errorHandler = require('./src/middleware/errorHandler');

const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const courseRoutes = require('./src/routes/courseRoutes');
const moduleRoutes = require('./src/routes/moduleRoutes');
const lessonRoutes = require('./src/routes/lessonRoutes');
const assessmentRoutes = require('./src/routes/assessmentRoutes');
const enrollmentRoutes = require('./src/routes/enrollmentRoutes');
const certificateRoutes = require('./src/routes/certificateRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Arquivos estáticos do frontend (public/) e certificados gerados
app.use(express.static(path.join(__dirname, 'public')));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/cursos', courseRoutes);
app.use('/api/modulos', moduleRoutes);
app.use('/api/aulas', lessonRoutes);
app.use('/api/avaliacoes', assessmentRoutes);
app.use('/api/matriculas', enrollmentRoutes);
app.use('/api/certificados', certificateRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', servico: 'LMS BNCC Computação', hora: new Date().toISOString() });
});

// 404 para rotas de API não encontradas
app.use('/api', (req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

// Fallback: serve o frontend (SPA simples de páginas estáticas)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 LMS BNCC Computação rodando em http://localhost:${PORT}`);
});
