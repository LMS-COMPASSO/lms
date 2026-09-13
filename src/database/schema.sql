-- =========================================================
-- LMS BNCC Computação - Schema do Banco de Dados (MySQL)
-- =========================================================
CREATE DATABASE IF NOT EXISTS lms_bncc
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE lms_bncc;

-- ---------------------------------------------------------
-- USUÁRIOS (Administrador, Instrutor, Aluno)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  perfil ENUM('administrador','instrutor','aluno') NOT NULL DEFAULT 'aluno',
  avatar_url VARCHAR(255) DEFAULT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_usuarios_perfil (perfil)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- CURSOS
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS cursos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT,
  eixo_bncc ENUM('Pensamento Computacional','Mundo Digital','Cultura Digital') NOT NULL,
  ano_escolar VARCHAR(50) NOT NULL COMMENT 'Ex.: 6º ano EF, 1ª série EM',
  carga_horaria INT NOT NULL DEFAULT 0 COMMENT 'Em horas',
  status ENUM('rascunho','publicado') NOT NULL DEFAULT 'rascunho',
  capa_url VARCHAR(255) DEFAULT NULL,
  instrutor_id INT NOT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cursos_instrutor FOREIGN KEY (instrutor_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
  INDEX idx_cursos_status (status),
  INDEX idx_cursos_eixo (eixo_bncc)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- MÓDULOS (dentro de um curso)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS modulos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  curso_id INT NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT,
  ordem INT NOT NULL DEFAULT 0,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_modulos_curso FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
  INDEX idx_modulos_curso (curso_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- AULAS (dentro de um módulo)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS aulas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  modulo_id INT NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  tipo ENUM('video','texto','pdf','link') NOT NULL DEFAULT 'texto',
  conteudo TEXT COMMENT 'Texto/HTML da aula',
  url_recurso VARCHAR(255) DEFAULT NULL COMMENT 'URL de vídeo, PDF ou link externo',
  duracao_min INT DEFAULT 0,
  ordem INT NOT NULL DEFAULT 0,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_aulas_modulo FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE CASCADE,
  INDEX idx_aulas_modulo (modulo_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- AVALIAÇÕES (associadas a um módulo)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS avaliacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  modulo_id INT NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT,
  nota_minima DECIMAL(5,2) NOT NULL DEFAULT 6.00,
  tentativas_permitidas INT NOT NULL DEFAULT 3,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_avaliacoes_modulo FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE CASCADE,
  INDEX idx_avaliacoes_modulo (modulo_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- QUESTÕES da avaliação
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS questoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  avaliacao_id INT NOT NULL,
  enunciado TEXT NOT NULL,
  tipo ENUM('multipla_escolha','verdadeiro_falso','dissertativa') NOT NULL DEFAULT 'multipla_escolha',
  pontos DECIMAL(5,2) NOT NULL DEFAULT 1.00,
  ordem INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_questoes_avaliacao FOREIGN KEY (avaliacao_id) REFERENCES avaliacoes(id) ON DELETE CASCADE,
  INDEX idx_questoes_avaliacao (avaliacao_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- ALTERNATIVAS de questões de múltipla escolha / V-F
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS alternativas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  questao_id INT NOT NULL,
  texto VARCHAR(500) NOT NULL,
  correta TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT fk_alternativas_questao FOREIGN KEY (questao_id) REFERENCES questoes(id) ON DELETE CASCADE,
  INDEX idx_alternativas_questao (questao_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- MATRÍCULAS (aluno <-> curso)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS matriculas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  curso_id INT NOT NULL,
  status ENUM('ativa','concluida','cancelada') NOT NULL DEFAULT 'ativa',
  progresso_percentual DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  data_matricula DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_conclusao DATETIME DEFAULT NULL,
  CONSTRAINT fk_matriculas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_matriculas_curso FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
  UNIQUE KEY uq_matricula (usuario_id, curso_id),
  INDEX idx_matriculas_status (status)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- PROGRESSO POR AULA
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS progresso_aulas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  matricula_id INT NOT NULL,
  aula_id INT NOT NULL,
  concluida TINYINT(1) NOT NULL DEFAULT 0,
  data_conclusao DATETIME DEFAULT NULL,
  CONSTRAINT fk_progresso_matricula FOREIGN KEY (matricula_id) REFERENCES matriculas(id) ON DELETE CASCADE,
  CONSTRAINT fk_progresso_aula FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE CASCADE,
  UNIQUE KEY uq_progresso (matricula_id, aula_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- TENTATIVAS DE AVALIAÇÃO
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS tentativas_avaliacao (
  id INT AUTO_INCREMENT PRIMARY KEY,
  matricula_id INT NOT NULL,
  avaliacao_id INT NOT NULL,
  nota DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  aprovado TINYINT(1) NOT NULL DEFAULT 0,
  respostas JSON DEFAULT NULL,
  data_tentativa DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tentativas_matricula FOREIGN KEY (matricula_id) REFERENCES matriculas(id) ON DELETE CASCADE,
  CONSTRAINT fk_tentativas_avaliacao FOREIGN KEY (avaliacao_id) REFERENCES avaliacoes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- CERTIFICADOS
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS certificados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  matricula_id INT NOT NULL UNIQUE,
  codigo_validacao VARCHAR(50) NOT NULL UNIQUE,
  url_arquivo VARCHAR(255) DEFAULT NULL,
  data_emissao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_certificados_matricula FOREIGN KEY (matricula_id) REFERENCES matriculas(id) ON DELETE CASCADE
) ENGINE=InnoDB;
