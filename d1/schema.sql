PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  perfil TEXT NOT NULL CHECK(perfil IN ('administrador', 'instrutor', 'aluno')) DEFAULT 'aluno',
  avatar_url TEXT,
  ativo INTEGER NOT NULL DEFAULT 1,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cursos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  descricao TEXT,
  eixo_bncc TEXT NOT NULL CHECK(eixo_bncc IN ('Pensamento Computacional', 'Mundo Digital', 'Cultura Digital')),
  ano_escolar TEXT NOT NULL,
  carga_horaria INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK(status IN ('rascunho', 'publicado')) DEFAULT 'rascunho',
  capa_url TEXT,
  instrutor_id INTEGER NOT NULL,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (instrutor_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS modulos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  curso_id INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  ordem INTEGER NOT NULL DEFAULT 0,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS aulas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  modulo_id INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK(tipo IN ('video', 'texto', 'pdf', 'link')) DEFAULT 'texto',
  conteudo TEXT,
  url_recurso TEXT,
  duracao_min INTEGER DEFAULT 0,
  ordem INTEGER NOT NULL DEFAULT 0,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS avaliacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  modulo_id INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  nota_minima REAL NOT NULL DEFAULT 6.0,
  tentativas_permitidas INTEGER NOT NULL DEFAULT 3,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS questoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  avaliacao_id INTEGER NOT NULL,
  enunciado TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK(tipo IN ('multipla_escolha', 'verdadeiro_falso', 'dissertativa')) DEFAULT 'multipla_escolha',
  pontos REAL NOT NULL DEFAULT 1.0,
  ordem INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (avaliacao_id) REFERENCES avaliacoes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS alternativas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  questao_id INTEGER NOT NULL,
  texto TEXT NOT NULL,
  correta INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (questao_id) REFERENCES questoes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS matriculas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  curso_id INTEGER NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('ativa', 'concluida', 'cancelada')) DEFAULT 'ativa',
  progresso_percentual REAL NOT NULL DEFAULT 0.0,
  data_matricula TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_conclusao TEXT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
  UNIQUE(usuario_id, curso_id)
);

CREATE TABLE IF NOT EXISTS progresso_aulas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  matricula_id INTEGER NOT NULL,
  aula_id INTEGER NOT NULL,
  concluida INTEGER NOT NULL DEFAULT 0,
  data_conclusao TEXT,
  FOREIGN KEY (matricula_id) REFERENCES matriculas(id) ON DELETE CASCADE,
  FOREIGN KEY (aula_id) REFERENCES aulas(id) ON DELETE CASCADE,
  UNIQUE(matricula_id, aula_id)
);

CREATE TABLE IF NOT EXISTS tentativas_avaliacao (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  matricula_id INTEGER NOT NULL,
  avaliacao_id INTEGER NOT NULL,
  nota REAL NOT NULL DEFAULT 0.0,
  aprovado INTEGER NOT NULL DEFAULT 0,
  respostas TEXT,
  data_tentativa TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (matricula_id) REFERENCES matriculas(id) ON DELETE CASCADE,
  FOREIGN KEY (avaliacao_id) REFERENCES avaliacoes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS certificados (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  matricula_id INTEGER NOT NULL UNIQUE,
  codigo_validacao TEXT NOT NULL UNIQUE,
  url_arquivo TEXT,
  data_emissao TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (matricula_id) REFERENCES matriculas(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cursos_instrutor ON cursos(instrutor_id);
CREATE INDEX IF NOT EXISTS idx_cursos_status ON cursos(status);
CREATE INDEX IF NOT EXISTS idx_cursos_eixo ON cursos(eixo_bncc);
CREATE INDEX IF NOT EXISTS idx_modulos_curso ON modulos(curso_id);
CREATE INDEX IF NOT EXISTS idx_aulas_modulo ON aulas(modulo_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_modulo ON avaliacoes(modulo_id);
CREATE INDEX IF NOT EXISTS idx_questoes_avaliacao ON questoes(avaliacao_id);
CREATE INDEX IF NOT EXISTS idx_alternativas_questao ON alternativas(questao_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_usuario ON matriculas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_curso ON matriculas(curso_id);
CREATE INDEX IF NOT EXISTS idx_progresso_matricula ON progresso_aulas(matricula_id);
CREATE INDEX IF NOT EXISTS idx_tentativas_matricula ON tentativas_avaliacao(matricula_id);
