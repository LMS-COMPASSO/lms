/**
 * ============================================================================
 * LMS COMPASSO — HELPERS DE TRADUÇÃO DO MÓDULO DE ATIVIDADES & LAB 3D
 * ============================================================================
 * Centraliza a resolução de chaves i18n para o catálogo, habilidades BNCC,
 * folha de impressão desplugada e jogadores interativos, preservando os objetos
 * crus de catálogo para validação em testes unitários.
 * ============================================================================
 */

import { t, formatarData, formatarNumero, obterIdiomaAtual } from '../i18n.js';

export { t, formatarData, formatarNumero, obterIdiomaAtual };

export function pluralT(quantidade, chaveSingular, chavePlural, extras = {}) {
  return t(quantidade === 1 ? chaveSingular : chavePlural, { n: quantidade, ...extras });
}

export function habTexto(codigo, padrao = '') {
  return t(`hab.${codigo}.texto`, {}, padrao);
}

export function habAnos(codigo, padrao = '') {
  return t(`hab.${codigo}.anos`, {}, padrao);
}

export function atvTitulo(atv) {
  return t(`atv.${atv.id}.titulo`, {}, atv.titulo);
}

export function atvResumo(atv) {
  return t(`atv.${atv.id}.resumo`, {}, atv.resumo);
}

export function atvInstrucao(atv) {
  return t(`atv.${atv.id}.instrucao`, {}, atv.instrucao);
}

export function atvDica(atv) {
  return t(`atv.${atv.id}.dica`, {}, atv.dica);
}

export function atvConclusao(atv) {
  return t(`atv.${atv.id}.conclusao`, {}, atv.conclusao);
}

export function atvProblema(atv) {
  return t(`atv.${atv.id}.problema`, {}, atv.problema || '');
}

export function atvDescarte(atv) {
  return t(`atv.${atv.id}.descarteTitulo`, {}, atv.descarteTitulo || '');
}

export function atvPasso(atvId, passo) {
  return t(`atv.${atvId}.passo.${passo.id}`, {}, passo.texto);
}

export function atvParte(atvId, parte) {
  return t(`atv.${atvId}.parte.${parte.id}`, {}, parte.titulo);
}

export function atvTarefa(atvId, tarefa) {
  return t(`atv.${atvId}.tarefa.${tarefa.id}`, {}, tarefa.texto);
}

export function atvBlocoRotulo(atvId, bloco) {
  if (!bloco) return '';
  return t(`atv.${atvId}.bloco.${bloco.id}`, {}, bloco.rotulo);
}

export function atvFaseNome(atvId, fase, idx = 0) {
  return t(`atv.${atvId}.fase.${fase.id || idx + 1}.nome`, {}, fase.nome || '');
}

export function atvFaseTag(atvId, fase, idx = 0) {
  if (!fase?.tag) return '';
  return t(`atv.${atvId}.fase.${fase.id || idx + 1}.tag`, {}, fase.tag);
}

export function atvFaseDesc(atvId, fase, idx = 0) {
  if (!fase?.descricao) return '';
  return t(`atv.${atvId}.fase.${fase.id || idx + 1}.desc`, {}, fase.descricao);
}

export function atvTema(atvId, tema = {}, faseId = null) {
  const prefixo = faseId ? `atv.${atvId}.fase.${faseId}.tema` : `atv.${atvId}.tema`;
  return {
    ...tema,
    _rawMeta: tema.nomeMeta,
    _rawObstaculo: tema.nomeObstaculo,
    _rawItem: tema.nomeItem,
    nomeMeta: tema.nomeMeta ? t(`${prefixo}.nomeMeta`, {}, tema.nomeMeta) : tema.nomeMeta,
    nomeObstaculo: tema.nomeObstaculo ? t(`${prefixo}.nomeObstaculo`, {}, tema.nomeObstaculo) : tema.nomeObstaculo,
    nomeItem: tema.nomeItem ? t(`${prefixo}.nomeItem`, {}, tema.nomeItem) : tema.nomeItem,
    faltouItem: tema.faltouItem ? t(`${prefixo}.faltouItem`, {}, tema.faltouItem) : tema.faltouItem,
  };
}

export function atvProfessor(atv) {
  const prof = atv.professor || {};
  return {
    objetivo: prof.objetivo ? t(`atv.${atv.id}.prof.objetivo`, {}, prof.objetivo) : '',
    desplugada: prof.desplugada ? t(`atv.${atv.id}.prof.desplugada`, {}, prof.desplugada) : '',
    observacao: prof.observacao ? t(`atv.${atv.id}.prof.observacao`, {}, prof.observacao) : '',
    conversa: (prof.conversa || []).map((pergunta, idx) => t(`atv.${atv.id}.prof.conversa.${idx}`, {}, pergunta)),
  };
}

export function dirNome(dirId, padrao = '') {
  return t(`robo.dir.${dirId}`, {}, padrao);
}

export function tituloCurtoPy3d(atv) {
  const full = atvTitulo(atv);
  return full.replace(/^Python 3D:\s*/i, '');
}

export function resolverParamsPython(params = {}) {
  const resolvidos = { ...params };
  if (params.dirKey) resolvidos.direcao = t(params.dirKey, {}, params.direcao || '');
  if (params.motivoKey) resolvidos.motivo = t(params.motivoKey, {}, params.motivo || '');
  return resolvidos;
}

export function traduzirErroWorkerPython(resposta) {
  if (!resposta) return t('py3d.err.padrao', {}, 'Erro ao executar código Python.');
  if (resposta.erroChave) {
    const prefixo = resposta.erroLinha
      ? t('py3d.err.prefixoLinha', { linha: resposta.erroLinha })
      : t('py3d.err.prefixoGeral');
    return `${prefixo}${t(resposta.erroChave, resolverParamsPython(resposta.erroParams))}`;
  }
  return resposta.erro || t('py3d.err.padrao', {}, 'Erro ao executar código Python.');
}

export function traduzirEventoPython(ev) {
  if (!ev) return '';
  if (ev.descChave) {
    return t(ev.descChave, resolverParamsPython(ev.descParams), ev.descricao);
  }
  return ev.descricao || t('py3d.ev.generico', { linha: ev.linha, tipo: ev.tipo });
}

export function traduzirResumoPython(resumo) {
  if (!resumo) return '';
  if (resumo.motivoChave) {
    return t(resumo.motivoChave, resolverParamsPython(resumo.motivoParams), resumo.motivo);
  }
  return resumo.motivo || '';
}
