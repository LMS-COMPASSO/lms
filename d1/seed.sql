-- ====================================================================
-- SEED DATA PARA LMS BNCC DA COMPUTAÇÃO (CLOUDFLARE D1)
-- ====================================================================
-- Senha padrão para todos os usuários deste seed: Admin@12345
-- Hash SHA-256 de 'Admin@12345': 6f2cb9dd8f4b65e24e1c3f3fa5bc57982349237f11abceacd45bbcb74d621c25
-- ====================================================================

-- 1. Usuários de Demonstração
INSERT OR IGNORE INTO usuarios (id, nome, email, senha_hash, perfil, ativo) VALUES
(1, 'Administrador do Sistema', 'admin@lms-bncc.edu.br', '6f2cb9dd8f4b65e24e1c3f3fa5bc57982349237f11abceacd45bbcb74d621c25', 'administrador', 1),
(2, 'Profa. Marina Silva', 'prof.marina@escola.gov.br', '6f2cb9dd8f4b65e24e1c3f3fa5bc57982349237f11abceacd45bbcb74d621c25', 'instrutor', 1),
(3, 'Pedro Santos (Aluno)', 'aluno.pedro@escola.gov.br', '6f2cb9dd8f4b65e24e1c3f3fa5bc57982349237f11abceacd45bbcb74d621c25', 'aluno', 1);

-- 2. Cursos Alinhados aos 3 Eixos da BNCC Computação
INSERT OR IGNORE INTO cursos (id, titulo, descricao, eixo_bncc, ano_escolar, carga_horaria, status, capa_url, instrutor_id) VALUES
(1, 'Pensamento Computacional: Algoritmos e Padrões no Cotidiano', 'Desenvolvimento da capacidade de decompor problemas complexos, reconhecer padrões e criar algoritmos passo a passo para o Ensino Fundamental I.', 'Pensamento Computacional', '1º ao 3º Ano', 20, 'publicado', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800', 2),
(2, 'Mundo Digital: Como Funcionam os Computadores e a Internet', 'Compreensão do funcionamento físico e lógico dos dispositivos digitais, transmissão de dados em redes e codificação binária.', 'Mundo Digital', '4º e 5º Ano', 30, 'publicado', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800', 2),
(3, 'Cultura Digital: Cidadania, Segurança e Ética na Rede', 'Uso consciente, crítico e responsável das tecnologias digitais, combate à desinformação, ciberbullying e proteção de dados pessoais.', 'Cultura Digital', '6º ao 9º Ano', 25, 'publicado', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800', 2);

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
(1, 3, 1, 'ativa', 0.0);
