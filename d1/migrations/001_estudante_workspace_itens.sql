-- Migração aditiva 001: Workspace Estilo Notion & Hub de Ideias dos Estudantes
CREATE TABLE IF NOT EXISTS estudante_workspace_itens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('ideia', 'planejando', 'execucao', 'concluido')) DEFAULT 'ideia',
  eixo_bncc TEXT NOT NULL CHECK(eixo_bncc IN ('Pensamento Computacional', 'Mundo Digital', 'Cultura Digital')) DEFAULT 'Pensamento Computacional',
  habilidade_codigo TEXT,
  curso_id INTEGER,
  prioridade TEXT NOT NULL CHECK(prioridade IN ('baixa', 'media', 'alta')) DEFAULT 'media',
  prazo TEXT,
  cover_id TEXT NOT NULL DEFAULT 'cover-lms-compasso',
  icone_id TEXT NOT NULL DEFAULT 'icon-lightbulb',
  template_origem TEXT,
  blocos_json TEXT NOT NULL DEFAULT '[]',
  ordem INTEGER NOT NULL DEFAULT 0,
  criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_workspace_usuario ON estudante_workspace_itens(usuario_id);
CREATE INDEX IF NOT EXISTS idx_workspace_status ON estudante_workspace_itens(usuario_id, status);
CREATE INDEX IF NOT EXISTS idx_workspace_eixo ON estudante_workspace_itens(usuario_id, eixo_bncc);
CREATE INDEX IF NOT EXISTS idx_workspace_curso ON estudante_workspace_itens(curso_id);
