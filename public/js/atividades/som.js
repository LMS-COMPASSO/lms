/**
 * ============================================================================
 * LMS COMPASSO — MOTOR DE ÁUDIO SINTETIZADO (WEB AUDIO API)
 * ============================================================================
 * Síntese em tempo real via osciladores nativos. Não depende de arquivos externos,
 * possui latência zero e respeito a preferências do usuário (localStorage).
 * ============================================================================
 */

import { h } from './dom.js';
import { t } from './traducao.js';

let audioCtx = null;
let somHabilitado = localStorage.getItem('lms_som_ativo') !== 'false';

function obterAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx) audioCtx = new AudioContextClass();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

export function somAtivo() {
  return somHabilitado;
}

export function definirSomAtivo(ativo) {
  somHabilitado = Boolean(ativo);
  localStorage.setItem('lms_som_ativo', somHabilitado ? 'true' : 'false');
  return somHabilitado;
}

export function alternarSom() {
  return definirSomAtivo(!somHabilitado);
}

export function tocarSom(tipo) {
  if (!somHabilitado) return;
  const ctx = obterAudioContext();
  if (!ctx) return;

  try {
    const agora = ctx.currentTime;

    if (tipo === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, agora);
      gain.gain.setValueAtTime(0.04, agora);
      gain.gain.exponentialRampToValueAtTime(0.001, agora + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(agora);
      osc.stop(agora + 0.04);
    } else if (tipo === 'mover') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, agora);
      osc.frequency.exponentialRampToValueAtTime(580, agora + 0.06);
      gain.gain.setValueAtTime(0.05, agora);
      gain.gain.exponentialRampToValueAtTime(0.001, agora + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(agora);
      osc.stop(agora + 0.06);
    } else if (tipo === 'encaixe') {
      [523.25, 659.25].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, agora + idx * 0.05);
        gain.gain.setValueAtTime(0.07, agora + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, agora + idx * 0.05 + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(agora + idx * 0.05);
        osc.stop(agora + idx * 0.05 + 0.12);
      });
    } else if (tipo === 'passo') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, agora);
      osc.frequency.exponentialRampToValueAtTime(160, agora + 0.08);
      gain.gain.setValueAtTime(0.08, agora);
      gain.gain.exponentialRampToValueAtTime(0.001, agora + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(agora);
      osc.stop(agora + 0.08);
    } else if (tipo === 'giro') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, agora);
      osc.frequency.exponentialRampToValueAtTime(660, agora + 0.07);
      gain.gain.setValueAtTime(0.06, agora);
      gain.gain.exponentialRampToValueAtTime(0.001, agora + 0.07);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(agora);
      osc.stop(agora + 0.07);
    } else if (tipo === 'item') {
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, agora + idx * 0.07);
        gain.gain.setValueAtTime(0.12, agora + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, agora + idx * 0.07 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(agora + idx * 0.07);
        osc.stop(agora + idx * 0.07 + 0.25);
      });
    } else if (tipo === 'erro') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, agora);
      osc.frequency.linearRampToValueAtTime(60, agora + 0.25);
      gain.gain.setValueAtTime(0.18, agora);
      gain.gain.exponentialRampToValueAtTime(0.001, agora + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(agora);
      osc.stop(agora + 0.25);
    } else if (tipo === 'vitoria') {
      [261.63, 329.63, 392.00, 523.25, 659.25].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, agora + idx * 0.09);
        gain.gain.setValueAtTime(0.14, agora + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, agora + idx * 0.09 + 0.32);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(agora + idx * 0.09);
        osc.stop(agora + idx * 0.09 + 0.32);
      });
    } else if (tipo === 'bloco') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, agora);
      osc.frequency.exponentialRampToValueAtTime(760, agora + 0.06);
      gain.gain.setValueAtTime(0.06, agora);
      gain.gain.exponentialRampToValueAtTime(0.001, agora + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(agora);
      osc.stop(agora + 0.06);
    }
  } catch (_e) {
    // Contextos de áudio bloqueados pelo navegador são ignorados silenciosamente
  }
}

/**
 * Cria um botão estéreo reutilizável para a barra de ferramentas das atividades.
 * @param {Function} aoAlternar Callback chamado ao alternar o estado do áudio
 */
export function criarBotaoSom(aoAlternar) {
  const iconeEl = h('span', { class: 'material-symbols-outlined' }, somHabilitado ? 'volume_up' : 'volume_off');
  const rotuloEl = h('span', { class: 'atv-som-rotulo' }, somHabilitado ? t('som.on', {}, 'Som: ON') : t('som.off', {}, 'Som: OFF'));
  const btn = h(
    'button',
    {
      type: 'button',
      class: `atv-btn-som ${somHabilitado ? 'ativo' : ''}`,
      'aria-label': somHabilitado
        ? t('som.desativarAria', {}, 'Desativar efeitos sonoros')
        : t('som.ativarAria', {}, 'Ativar efeitos sonoros'),
      title: somHabilitado
        ? t('som.ativadosTitle', {}, 'Sons ativados')
        : t('som.mudosTitle', {}, 'Sons mudos'),
      onclick: () => {
        const novo = alternarSom();
        btn.classList.toggle('ativo', novo);
        btn.setAttribute(
          'aria-label',
          novo
            ? t('som.desativarAria', {}, 'Desativar efeitos sonoros')
            : t('som.ativarAria', {}, 'Ativar efeitos sonoros'),
        );
        btn.setAttribute(
          'title',
          novo
            ? t('som.ativadosTitle', {}, 'Sons ativados')
            : t('som.mudosTitle', {}, 'Sons mudos'),
        );
        iconeEl.textContent = novo ? 'volume_up' : 'volume_off';
        rotuloEl.textContent = novo ? t('som.on', {}, 'Som: ON') : t('som.off', {}, 'Som: OFF');
        if (novo) tocarSom('click');
        if (aoAlternar) aoAlternar(novo);
      },
    },
    iconeEl,
    rotuloEl,
  );
  return btn;
}
