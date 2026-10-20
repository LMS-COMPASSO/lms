/**
 * ============================================================================
 * LMS COMPASSO - CATÁLOGO DE ATIVIDADES DINÂMICAS (PENSAMENTO COMPUTACIONAL)
 * ============================================================================
 * Reúne as atividades interativas sobre algoritmos do cotidiano e decomposição
 * lógica. Cada tipo de atividade tem o seu arquivo de dados:
 *   - ordenar.js   → montar a sequência de passos de uma tarefa (algoritmos)
 *   - decompor.js  → dividir um problema grande em partes menores
 *   - robo.js      → programar um robô em um mapa (sequência de comandos)
 *
 * Para criar uma nova atividade, siga o guia em docs/atividades-dinamicas.md.
 * ============================================================================
 */

import { ATIVIDADES_ORDENAR } from './ordenar.js';
import { ATIVIDADES_DECOMPOR } from './decompor.js';
import { ATIVIDADES_ROBO } from './robo.js';
import { ATIVIDADES_BLOCOS } from './blocos.js';
import { ATIVIDADES_PYTHON3D } from './python3d.js';

export const EIXOS_BNCC = {
  'pensamento-computacional': {
    rotulo: 'Pensamento Computacional',
    icone: 'psychology',
    cor: '#2563eb',
  },
  'mundo-digital': {
    rotulo: 'Mundo Digital',
    icone: 'developer_board',
    cor: '#059669',
  },
  'cultura-digital': {
    rotulo: 'Cultura Digital',
    icone: 'verified_user',
    cor: '#d97706',
  },
};

export const CONCEITOS = {
  algoritmos: { rotulo: 'Algoritmos do cotidiano', emoji: '🔢' },
  decomposicao: { rotulo: 'Decomposição lógica', emoji: '🧩' },
};

export const TIPOS = {
  ordenar: { rotulo: 'Montar a sequência' },
  decompor: { rotulo: 'Dividir o problema' },
  robo: { rotulo: 'Programar o robô' },
  blocos: { rotulo: 'Programação em blocos' },
  python3d: { rotulo: 'Laboratório 3D Python' },
};

// Mesmos agrupamentos usados nas propostas pedagógicas do projeto.
export const FAIXAS = {
  f1: '1º ao 3º ano',
  f2: '4º e 5º ano',
  f3: '6º ao 9º ano',
};

export const NIVEIS = {
  1: 'Iniciante',
  2: 'Intermediário',
  3: 'Desafio',
};

/**
 * Habilidades da BNCC Computação (Complemento à BNCC, Resolução CNE/CP nº 1/2022)
 * referenciadas pelas atividades. O texto é o oficial; o vínculo de cada atividade
 * com a habilidade é uma sugestão de alinhamento e deve ser validado pela equipe pedagógica.
 */
export const HABILIDADES = {
  EF01CO02: {
    anos: '1º ano',
    texto: 'Identificar e seguir sequências de passos aplicados no dia a dia para resolver problemas.',
  },
  EF01CO03: {
    anos: '1º ano',
    texto: 'Reorganizar e criar sequências de passos em meios físicos ou digitais, relacionando essas sequências à palavra ‘Algoritmos’.',
  },
  EF03CO03: {
    anos: '3º ano',
    texto: 'Aplicar a estratégia de decomposição para resolver problemas complexos, dividindo esse problema em partes menores, resolvendo-as e combinando suas soluções.',
  },
  EF15CO02: {
    anos: '1º ao 5º ano',
    texto: 'Construir e simular algoritmos, de forma independente ou em colaboração, que resolvam problemas simples e do cotidiano com uso de sequências, seleções condicionais e repetições de instruções.',
  },
  EF15CO04: {
    anos: '1º ao 5º ano',
    texto: 'Aplicar a estratégia de decomposição para resolver problemas complexos, dividindo esse problema em partes menores, resolvendo-as e combinando suas soluções.',
  },
  EF69CO02: {
    anos: '6º ao 9º ano',
    texto: 'Reconhecer, formular e modelar padrões para criar soluções algorítmicas reutilizáveis.',
  },
  EF69CO03: {
    anos: '6º ao 9º ano',
    texto: 'Desenvolver algoritmos usando estruturas de sequenciação, seleção e repetição para solucionar problemas computacionais.',
  },
  EF69CO04: {
    anos: '6º ao 9º ano',
    texto: 'Construir soluções de problemas usando a técnica de decomposição e automatizar tais soluções usando uma linguagem de programação.',
  },
  EF01CO04: {
    anos: '1º ano',
    texto: 'Reconhecer e utilizar componentes e periféricos básicos de dispositivos computacionais (mouse, teclado, tela, impressora).',
  },
  EF01CO05: {
    anos: '1º ano',
    texto: 'Compreender o uso ético, seguro e equilibrado das tecnologias digitais no cotidiano e respeitar os limites de uso.',
  },
  EF02CO03: {
    anos: '2º ano',
    texto: 'Identificar componentes de um dispositivo computacional e diferenciá-los entre entrada, processamento, armazenamento e saída.',
  },
  EF02CO04: {
    anos: '2º ano',
    texto: 'Compreender a importância da privacidade e proteção de dados pessoais, criando senhas seguras e não compartilhando dados com estranhos.',
  },
  EF03CO04: {
    anos: '3º ano',
    texto: 'Analisar criticamente conteúdos e mensagens digitais, checando fontes e diferenciando fatos de boatos ou desinformação (Fake News).',
  },
  EF04CO03: {
    anos: '4º ano',
    texto: 'Compreender que as informações no computador são representadas em formato binário e como os dados trafegam em redes de computadores.',
  },
  EF04CO04: {
    anos: '4º ano',
    texto: 'Reconhecer práticas de cidadania digital, prevenindo riscos de engenharia social (phishing) e combatendo ativamente o cyberbullying.',
  },
  EF05CO03: {
    anos: '5º ano',
    texto: 'Compreender a arquitetura básica de computadores (CPU, memória RAM, armazenamento e barramentos) e o ciclo de busca, decodificação e execução.',
  },
  EF05CO04: {
    anos: '5º ano',
    texto: 'Analisar o impacto social, ético e ambiental das tecnologias digitais, compreendendo a pegada digital e o descarte de lixo eletrônico.',
  },
  EF69CO05: {
    anos: '6º ao 9º ano',
    texto: 'Descrever e simular os elementos da infraestrutura da Internet: roteadores, servidores, pacotes de dados, endereçamento IP e DNS.',
  },
  EF69CO07: {
    anos: '6º ao 9º ano',
    texto: 'Debater sobre direitos autorais, licenças livres de software e conteúdo digital e segurança da informação.',
  },
};

export const ATIVIDADES = [
  ...ATIVIDADES_ORDENAR,
  ...ATIVIDADES_DECOMPOR,
  ...ATIVIDADES_ROBO,
  ...ATIVIDADES_BLOCOS,
  ...ATIVIDADES_PYTHON3D,
].map((atividade) => ({
  eixo: atividade.eixo || 'pensamento-computacional',
  ...atividade,
}));

export function buscarAtividade(id) {
  return ATIVIDADES.find((atividade) => atividade.id === id) || null;
}
