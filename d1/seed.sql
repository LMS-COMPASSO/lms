-- ====================================================================
-- SEED DATA PARA LMS BNCC DA COMPUTAÇÃO (CLOUDFLARE D1)
-- ====================================================================
-- Senha padrão para todos os usuários deste seed: Admin@12345
-- Hash SHA-256 de 'Admin@12345': 6f2cb9dd8f4b65e24e1c3f3fa5bc57982349237f11abceacd45bbcb74d621c25
-- ====================================================================

-- 1. Usuários de Demonstração
INSERT INTO usuarios (nome, email, senha_hash, perfil, ativo) VALUES
('Administrador do Sistema', 'admin@lms-bncc.edu.br', '6f2cb9dd8f4b65e24e1c3f3fa5bc57982349237f11abceacd45bbcb74d621c25', 'administrador', 1)
ON CONFLICT(email) DO NOTHING;

INSERT INTO usuarios (nome, email, senha_hash, perfil, ativo) VALUES
('Profa. Marina Silva', 'prof.marina@escola.gov.br', '6f2cb9dd8f4b65e24e1c3f3fa5bc57982349237f11abceacd45bbcb74d621c25', 'instrutor', 1)
ON CONFLICT(email) DO NOTHING;

INSERT INTO usuarios (nome, email, senha_hash, perfil, ativo) VALUES
('Pedro Santos (Aluno)', 'aluno.pedro@escola.gov.br', '6f2cb9dd8f4b65e24e1c3f3fa5bc57982349237f11abceacd45bbcb74d621c25', 'aluno', 1)
ON CONFLICT(email) DO NOTHING;

-- 2. Cursos Alinhados aos 3 Eixos da BNCC Computação
INSERT OR IGNORE INTO cursos (id, titulo, descricao, eixo_bncc, ano_escolar, carga_horaria, status, capa_url, instrutor_id) VALUES
(1, 'Pensamento Computacional: Algoritmos e Padrões no Cotidiano', 'Desenvolvimento da capacidade de decompor problemas complexos, reconhecer padrões e criar algoritmos passo a passo para o Ensino Fundamental I.', 'Pensamento Computacional', '1º ao 3º Ano', 20, 'publicado', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800', (SELECT id FROM usuarios WHERE email = 'prof.marina@escola.gov.br')),
(2, 'Mundo Digital: Como Funcionam os Computadores e a Internet', 'Compreensão do funcionamento físico e lógico dos dispositivos digitais, transmissão de dados em redes e codificação binária.', 'Mundo Digital', '4º e 5º Ano', 30, 'publicado', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800', (SELECT id FROM usuarios WHERE email = 'prof.marina@escola.gov.br')),
(3, 'Cultura Digital: Cidadania, Segurança e Ética na Rede', 'Uso consciente, crítico e responsável das tecnologias digitais, combate à desinformação, ciberbullying e proteção de dados pessoais.', 'Cultura Digital', '6º ao 9º Ano', 25, 'publicado', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800', (SELECT id FROM usuarios WHERE email = 'prof.marina@escola.gov.br'));

-- 3. Módulos dos Cursos
INSERT OR IGNORE INTO modulos (id, curso_id, titulo, descricao, ordem) VALUES
(1, 1, 'Módulo 1: O que são Algoritmos?', 'Aprenda a estruturar sequências lógicas de ações e comandos.', 1),
(2, 1, 'Módulo 2: Decomposição e Padrões', 'Dividindo problemas grandes em partes simples e reconhecendo repetições.', 2),
(3, 2, 'Módulo 1: Por Dentro do Computador', 'Entendendo a diferença entre hardware e software.', 1),
(4, 3, 'Módulo 1: Pegada Digital e Privacidade', 'Como cuidar dos seus dados e manter uma postura ética na internet.', 1);

-- 4. Aulas
INSERT OR IGNORE INTO aulas (id, modulo_id, titulo, tipo, conteudo, url_recurso, duracao_min, ordem) VALUES
(1, 1, 'Instruções Claras: A Receita de Bolo dos Algoritmos', 'texto', 'Um algoritmo é uma sequência finita de passos claros para resolver um problema ou executar uma tarefa, como uma receita culinária ou instruções de montagem.', NULL, 15, 1),
(2, 1, 'Desafio Desplugado: O Robô Humano', 'texto', 'Atividade prática desplugada onde um aluno atua como robô e segue exatamente os passos instruídos pelos colegas.', NULL, 20, 2),
(3, 2, 'Reconhecendo Padrões na Natureza e na Música', 'texto', 'Observar regularidades e repetições nos ajuda a prever resultados e simplificar instruções.', NULL, 25, 1),
(4, 3, 'Hardware vs Software: O Corpo e a Mente da Máquina', 'texto', 'Hardware é a parte física (tela, teclado, processador) e software são as instruções e programas que fazem o hardware funcionar.', NULL, 30, 1),
(5, 4, 'Privacidade e Segurança de Senhas', 'texto', 'Aprenda a criar senhas seguras e entender quais informações nunca devem ser compartilhadas com estranhos online.', NULL, 20, 1);

-- 4.1 Aulas com atividades dinâmicas (página /atividades.html). O WHERE NOT EXISTS permite rodar o seed de novo sem duplicar aulas.
INSERT INTO aulas (modulo_id, titulo, tipo, conteudo, url_recurso, duracao_min, ordem)
SELECT 1, 'Atividade dinâmica: Monte o algoritmo de escovar os dentes', 'link', 'Coloque os passos na ordem certa e descubra qual passo não faz parte do algoritmo.', '/atividades.html?id=ordenar-escovar-dentes', 8, 3
WHERE NOT EXISTS (SELECT 1 FROM aulas WHERE modulo_id = 1 AND url_recurso = '/atividades.html?id=ordenar-escovar-dentes');

INSERT INTO aulas (modulo_id, titulo, tipo, conteudo, url_recurso, duracao_min, ordem)
SELECT 1, 'Atividade dinâmica: Preparar um sanduíche', 'link', 'Monte a receita do sanduíche e descubra quais passos podem trocar de lugar.', '/atividades.html?id=ordenar-sanduiche', 10, 4
WHERE NOT EXISTS (SELECT 1 FROM aulas WHERE modulo_id = 1 AND url_recurso = '/atividades.html?id=ordenar-sanduiche');

INSERT INTO aulas (modulo_id, titulo, tipo, conteudo, url_recurso, duracao_min, ordem)
SELECT 1, 'Atividade dinâmica: Robô a caminho da escola', 'link', 'Escreva os comandos do robô, passo a passo, e corrija o programa quando ele errar o caminho.', '/atividades.html?id=robo-caminho-escola', 8, 5
WHERE NOT EXISTS (SELECT 1 FROM aulas WHERE modulo_id = 1 AND url_recurso = '/atividades.html?id=robo-caminho-escola');

INSERT INTO aulas (modulo_id, titulo, tipo, conteudo, url_recurso, duracao_min, ordem)
SELECT 2, 'Atividade dinâmica: O café da manhã em partes', 'link', 'Divida o problema de preparar o café da manhã em duas partes menores.', '/atividades.html?id=decompor-cafe-da-manha', 10, 2
WHERE NOT EXISTS (SELECT 1 FROM aulas WHERE modulo_id = 2 AND url_recurso = '/atividades.html?id=decompor-cafe-da-manha');

-- 5. Avaliações
INSERT OR IGNORE INTO avaliacoes (id, modulo_id, titulo, descricao, nota_minima, tentativas_permitidas) VALUES
(1, 1, 'Quiz: Introdução aos Algoritmos', 'Teste seus conhecimentos sobre comandos, instruções e sequenciamento lógico.', 6.0, 3);

-- 6. Questões
INSERT OR IGNORE INTO questoes (id, avaliacao_id, enunciado, tipo, pontos, ordem) VALUES
(1, 1, 'O que melhor define um algoritmo na computação escolar?', 'multipla_escolha', 5.0, 1),
(2, 1, 'Se invertermos a ordem de passos fundamentais de um algoritmo, o que acontece?', 'multipla_escolha', 5.0, 2);

-- 7. Alternativas
INSERT OR IGNORE INTO alternativas (id, questao_id, texto, correta) VALUES
(1, 1, 'Uma sequência finita e ordenada de passos para resolver um problema.', 1),
(2, 1, 'Uma peça física que fica dentro da CPU do computador.', 0),
(3, 1, 'Um tipo de vírus que apaga arquivos da máquina.', 0),
(4, 2, 'O algoritmo pode produzir um resultado incorreto ou falhar.', 1),
(5, 2, 'Nada muda, os passos de um algoritmo podem ocorrer em qualquer ordem.', 0),
(6, 2, 'O computador desliga automaticamente.', 0);

-- 8. Matrícula de Exemplo para Teste
INSERT OR IGNORE INTO matriculas (id, usuario_id, curso_id, status, progresso_percentual) VALUES
(1, (SELECT id FROM usuarios WHERE email = 'aluno.pedro@escola.gov.br'), 1, 'ativa', 35.0);

-- 9. Alunos adicionais para demonstração de turma
INSERT INTO usuarios (nome, email, senha_hash, perfil, ativo) VALUES
('Sofia Oliveira (Aluna)', 'aluna.sofia@escola.gov.br', '6f2cb9dd8f4b65e24e1c3f3fa5bc57982349237f11abceacd45bbcb74d621c25', 'aluno', 1),
('Lucas Ferreira (Aluno)', 'aluno.lucas@escola.gov.br', '6f2cb9dd8f4b65e24e1c3f3fa5bc57982349237f11abceacd45bbcb74d621c25', 'aluno', 1)
ON CONFLICT(email) DO NOTHING;

-- Matrículas adicionais
INSERT OR IGNORE INTO matriculas (usuario_id, curso_id, status, progresso_percentual) VALUES
((SELECT id FROM usuarios WHERE email = 'aluna.sofia@escola.gov.br'), 1, 'ativa', 85.0),
((SELECT id FROM usuarios WHERE email = 'aluno.lucas@escola.gov.br'), 1, 'concluida', 100.0);

-- 10. Catálogo de Medalhas / Selos por Eixo da BNCC Computação
INSERT OR IGNORE INTO medalhas (id, codigo, titulo, descricao, eixo_bncc, icone, cor, criterio_tipo, criterio_meta) VALUES
(1, 'mestre_algoritmos', 'Mestre dos Algoritmos', 'Completou com sucesso atividades de sequenciamento e ordenação lógica.', 'Pensamento Computacional', 'format_list_numbered', '#2563eb', 'concluir_atividade', 1),
(2, 'arquiteto_decomposicao', 'Arquiteto da Decomposição', 'Dominou a técnica de dividir problemas complexos em partes menores.', 'Pensamento Computacional', 'extension', '#0284c7', 'concluir_atividade', 1),
(3, 'programador_blocos', 'Programador de Blocos', 'Criou e simulou programas com repetições e seleções no simulador visual.', 'Pensamento Computacional', 'code_blocks', '#7c3aed', 'concluir_blocos', 1),
(4, 'detetive_hardware_software', 'Mundo Digital: Hardware & Software', 'Compreendeu a diferença prática entre partes físicas e lógicas da computação.', 'Mundo Digital', 'memory', '#059669', 'concluir_aula', 1),
(5, 'arquiteto_redes', 'Navegador da Internet e Redes', 'Entendeu como pacotes de dados e conexões trafegam pela rede mundial.', 'Mundo Digital', 'lan', '#0d9488', 'concluir_aula', 1),
(6, 'guardiao_privacidade', 'Guardião da Privacidade', 'Adotou boas práticas de proteção de dados pessoais e senhas seguras.', 'Cultura Digital', 'verified_user', '#d97706', 'concluir_aula', 1),
(7, 'cidadao_etico', 'Cidadão Digital Consciente', 'Identificou fontes confiáveis e debateu ética e segurança no ambiente virtual.', 'Cultura Digital', 'diversity_3', '#ea580c', 'concluir_aula', 1),
(8, 'primeiro_passo', 'Primeiro Passo na Computação', 'Completou a primeira aula ou desafio dinâmico na plataforma.', 'Geral', 'flag', '#16a34a', 'primeira_acao', 1),
(9, 'trilha_completa', 'Certificado BNCC Conquistado', 'Concluiu 100% de uma trilha formativa com certificado emitido.', 'Geral', 'military_tech', '#eab308', 'certificado', 1);

-- Conquistas de exemplo
INSERT OR IGNORE INTO usuario_medalhas (usuario_id, medalha_id) VALUES
((SELECT id FROM usuarios WHERE email = 'aluno.pedro@escola.gov.br'), 1),
((SELECT id FROM usuarios WHERE email = 'aluno.pedro@escola.gov.br'), 8),
((SELECT id FROM usuarios WHERE email = 'aluna.sofia@escola.gov.br'), 1),
((SELECT id FROM usuarios WHERE email = 'aluna.sofia@escola.gov.br'), 2),
((SELECT id FROM usuarios WHERE email = 'aluno.lucas@escola.gov.br'), 1),
((SELECT id FROM usuarios WHERE email = 'aluno.lucas@escola.gov.br'), 2),
((SELECT id FROM usuarios WHERE email = 'aluno.lucas@escola.gov.br'), 3),
((SELECT id FROM usuarios WHERE email = 'aluno.lucas@escola.gov.br'), 9);

-- 11. Registros de Desempenho por Habilidade BNCC (Base do Relatório Pedagógico)
INSERT OR IGNORE INTO desempenho_habilidades (usuario_id, curso_id, habilidade_codigo, origem_tipo, origem_id, pontuacao, nivel_atingido) VALUES
((SELECT id FROM usuarios WHERE email = 'aluno.pedro@escola.gov.br'), 1, 'EF01CO02', 'atividade', 'ordenar-escovar-dentes', 9.5, 'avancado'),
((SELECT id FROM usuarios WHERE email = 'aluno.pedro@escola.gov.br'), 1, 'EF01CO03', 'atividade', 'ordenar-escovar-dentes', 8.0, 'adequado'),
((SELECT id FROM usuarios WHERE email = 'aluno.pedro@escola.gov.br'), 1, 'EF15CO02', 'atividade', 'robo-caminho-escola', 7.5, 'adequado'),
((SELECT id FROM usuarios WHERE email = 'aluna.sofia@escola.gov.br'), 1, 'EF01CO02', 'atividade', 'ordenar-escovar-dentes', 10.0, 'avancado'),
((SELECT id FROM usuarios WHERE email = 'aluna.sofia@escola.gov.br'), 1, 'EF01CO03', 'atividade', 'ordenar-escovar-dentes', 9.0, 'avancado'),
((SELECT id FROM usuarios WHERE email = 'aluna.sofia@escola.gov.br'), 1, 'EF03CO03', 'atividade', 'decompor-cafe-da-manha', 8.5, 'avancado'),
((SELECT id FROM usuarios WHERE email = 'aluna.sofia@escola.gov.br'), 1, 'EF15CO02', 'atividade', 'robo-caminho-escola', 8.0, 'adequado'),
((SELECT id FROM usuarios WHERE email = 'aluno.lucas@escola.gov.br'), 1, 'EF01CO02', 'atividade', 'ordenar-escovar-dentes', 10.0, 'avancado'),
((SELECT id FROM usuarios WHERE email = 'aluno.lucas@escola.gov.br'), 1, 'EF03CO03', 'atividade', 'decompor-cafe-da-manha', 9.0, 'avancado'),
((SELECT id FROM usuarios WHERE email = 'aluno.lucas@escola.gov.br'), 1, 'EF15CO02', 'atividade', 'robo-caminho-escola', 9.5, 'avancado'),
((SELECT id FROM usuarios WHERE email = 'aluno.lucas@escola.gov.br'), 1, 'EF69CO03', 'atividade', 'blocos-geometria-quadrado', 9.0, 'avancado'),
((SELECT id FROM usuarios WHERE email = 'aluno.lucas@escola.gov.br'), 1, 'EF69CO04', 'atividade', 'blocos-labirinto-condicional', 8.5, 'avancado');

-- 12. Aulas com Simulador de Programação em Blocos (Fundamental II)
INSERT INTO aulas (modulo_id, titulo, tipo, conteudo, url_recurso, duracao_min, ordem)
SELECT 1, 'Atividade dinâmica: Simulador de Blocos — Geometria com Algoritmos', 'link', 'Programe o robô desenhista com blocos de repetição e ângulos para criar figuras geométricas.', '/atividades.html?id=blocos-geometria-quadrado', 15, 6
WHERE NOT EXISTS (SELECT 1 FROM aulas WHERE modulo_id = 1 AND url_recurso = '/atividades.html?id=blocos-geometria-quadrado');

INSERT INTO aulas (modulo_id, titulo, tipo, conteudo, url_recurso, duracao_min, ordem)
SELECT 1, 'Atividade dinâmica: Simulador de Blocos — Labirinto e Condicionais', 'link', 'Use blocos condicionais (se... então) e repetições para desviar dos obstáculos no labirinto.', '/atividades.html?id=blocos-labirinto-condicional', 15, 7
WHERE NOT EXISTS (SELECT 1 FROM aulas WHERE modulo_id = 1 AND url_recurso = '/atividades.html?id=blocos-labirinto-condicional');
