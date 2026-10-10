/**
 * Cria o jogador adequado ao tipo da atividade.
 * Cada jogador devolve um elemento pronto para ser inserido na página e chama
 * `ctx.aoConcluir({ tentativas, estrelas })` quando o estudante resolve a atividade.
 */

import { jogadorOrdenar } from './jogador-ordenar.js';
import { jogadorDecompor } from './jogador-decompor.js';
import { jogadorRobo } from './jogador-robo.js';

export function criarJogador(atividade, ctx) {
  if (atividade.tipo === 'ordenar') return jogadorOrdenar(atividade, ctx);
  if (atividade.tipo === 'decompor') return jogadorDecompor(atividade, ctx);
  if (atividade.tipo === 'robo') return jogadorRobo(atividade, ctx);
  throw new Error(`Tipo de atividade desconhecido: ${atividade.tipo}`);
}
