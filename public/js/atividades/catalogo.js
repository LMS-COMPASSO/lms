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

export const CONCEITOS = {
  algoritmos: { rotulo: 'Algoritmos do cotidiano', emoji: '🔢' },
  decomposicao: { rotulo: 'Decomposição lógica', emoji: '🧩' },
};

export const TIPOS = {
  ordenar: { rotulo: 'Montar a sequência' },
  decompor: { rotulo: 'Dividir o problema' },
  robo: { rotulo: 'Programar o robô' },
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
  EF69CO04: {
    anos: '6º ao 9º ano',
    texto: 'Construir soluções de problemas usando a técnica de decomposição e automatizar tais soluções usando uma linguagem de programação.',
  },
};

export const ATIVIDADES = [
  ...ATIVIDADES_ORDENAR,
  ...ATIVIDADES_DECOMPOR,
  ...ATIVIDADES_ROBO,
];

export function buscarAtividade(id) {
  return ATIVIDADES.find((atividade) => atividade.id === id) || null;
}
