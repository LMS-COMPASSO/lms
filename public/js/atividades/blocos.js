/**
 * ============================================================================
 * LMS COMPASSO - ATIVIDADES DE PROGRAMAÇÃO EM BLOCOS (FUNDAMENTAL II)
 * ============================================================================
 * Atividades de programação visual por blocos (Scratch/Blockly nativo).
 * Desenvolvem as habilidades de repetição (iteração), seleção condicional (if/else),
 * variáveis, geometria algorítmica e automação no Ensino Fundamental II:
 * - Habilidades BNCC: EF69CO03, EF69CO04, EF15CO02, EF69CO02
 * ============================================================================
 */

export const ATIVIDADES_BLOCOS = [
  {
    id: 'blocos-geometria-quadrado',
    tipo: 'blocos',
    conceito: 'algoritmos',
    faixa: 'f2',
    anos: '4º ao 6º ano',
    nivel: 1,
    duracaoMin: 12,
    emoji: '📐',
    titulo: 'Simulador de Blocos: O Quadrado com Repetições',
    resumo: 'Construa um algoritmo com bloco de repetição para fazer o robô desenhar um quadrado perfeito.',
    instrucao: 'Em vez de repetir os mesmos comandos várias vezes, use o bloco "Repetir 4 vezes" com os comandos de avançar e virar à direita dentro dele.',
    dica: 'Um quadrado tem 4 lados iguais e 4 ângulos retos (90 graus). Use "Repetir 4 vezes"!',
    conclusao: 'Excelente! Usar blocos de repetição (loops) torna o algoritmo muito mais eficiente e fácil de manter!',
    habilidades: ['EF15CO02', 'EF69CO03', 'EF69CO04'],
    meta: {
      tipo: 'desenho',
      figura: 'quadrado',
      lados: 4,
      passo: 60,
      angulo: 90,
      exigirLoop: true,
    },
    blocosDisponiveis: [
      { id: 'avancar', categoria: 'movimento', rotulo: 'Avançar 60 passos', cor: '#2563eb' },
      { id: 'girar_direita', categoria: 'movimento', rotulo: 'Girar 90° à direita ↷', cor: '#2563eb' },
      { id: 'girar_esquerda', categoria: 'movimento', rotulo: 'Girar 90° à esquerda ↶', cor: '#2563eb' },
      { id: 'repetir', categoria: 'controle', rotulo: 'Repetir [N] vezes', cor: '#f59e0b', comFilhos: true, padraoVezes: 4 },
      { id: 'mudar_cor', categoria: 'aparencia', rotulo: 'Mudar cor da linha', cor: '#10b981' },
      { id: 'falar', categoria: 'aparencia', rotulo: 'Falar "Desenhei!"', cor: '#8b5cf6' },
    ],
    programaInicial: [],
    professor: {
      objetivo: 'Compreender o conceito de iteração/laço de repetição e como ele reduz a redundância em programas computacionais.',
      desplugada: 'Peça para os alunos escreverem no papel duas versões da receita de dar 4 passos: uma linha por passo versus "Repita 4 vezes: dê um passo". Comparem a economia de instruções.',
      conversa: [
        'Por que é melhor usar "repetir 4 vezes" do que escrever "avançar e girar" quatro vezes seguidas?',
        'O que acontece se mudarmos o ângulo de 90° para 120°?',
        'Onde mais encontramos repetições em nossa rotina diária?',
      ],
    },
  },
  {
    id: 'blocos-labirinto-condicional',
    tipo: 'blocos',
    conceito: 'algoritmos',
    faixa: 'f3',
    anos: '6º ao 9º ano',
    nivel: 2,
    duracaoMin: 15,
    emoji: '🧭',
    titulo: 'Simulador de Blocos: Decisões no Labirinto',
    resumo: 'Programe o robô para navegar no labirinto usando condições (SE / SENÃO) e laços de repetição.',
    instrucao: 'Monte um algoritmo de navegação: avance passo a passo e use a verificação condicional para tomar decisões inteligentes no percurso.',
    dica: 'Verifique se há obstáculos à sua frente antes de avançar. Se houver caminho livre, siga em frente; caso contrário, gire!',
    conclusao: 'Sensacional! As estruturas de seleção condicional (SE / SENÃO) dão autonomia para o algoritmo tomar decisões dinâmicas!',
    habilidades: ['EF69CO03', 'EF69CO04'],
    meta: {
      tipo: 'labirinto',
      grade: [
        ['R', '.', '.', 'X'],
        ['X', 'X', '.', '.'],
        ['.', '.', '.', 'X'],
        ['.', 'X', '.', 'M'],
      ],
      inicio: { x: 0, y: 0, dir: 'L' },
      alvo: { x: 3, y: 3 },
    },
    blocosDisponiveis: [
      { id: 'avancar', categoria: 'movimento', rotulo: 'Avançar 1 casa', cor: '#2563eb' },
      { id: 'girar_direita', categoria: 'movimento', rotulo: 'Girar 90° à direita ↷', cor: '#2563eb' },
      { id: 'girar_esquerda', categoria: 'movimento', rotulo: 'Girar 90° à esquerda ↶', cor: '#2563eb' },
      { id: 'repetir', categoria: 'controle', rotulo: 'Repetir [N] vezes', cor: '#f59e0b', comFilhos: true, padraoVezes: 3 },
      { id: 'se_livre', categoria: 'controle', rotulo: 'Se caminho à frente livre', cor: '#ea580c', comFilhos: true },
      { id: 'falar', categoria: 'aparencia', rotulo: 'Falar "Cheguei!"', cor: '#8b5cf6' },
    ],
    programaInicial: [],
    professor: {
      objetivo: 'Aplicar estruturas de seleção condicional combinadas com iteração para resolver problemas de tomada de decisão.',
      desplugada: 'Jogo do Semáforo Lógico: Alunos caminham pela sala. O professor exibe cartões (Livre / Obstáculo) e os alunos devem executar a regra condicional combinada.',
      conversa: [
        'Como os carros autônomos e robôs aspiradores usam sensores e blocos condicionais para não bater?',
        'Qual a diferença entre uma decisão fixa e uma decisão baseada em condição?',
      ],
    },
  },
  {
    id: 'blocos-padrao-estrela',
    tipo: 'blocos',
    conceito: 'algoritmos',
    faixa: 'f3',
    anos: '6º ao 9º ano',
    nivel: 3,
    duracaoMin: 15,
    emoji: '⭐',
    titulo: 'Simulador de Blocos: Geometria de Estrelas',
    resumo: 'Explore rotações fracionárias e laços para desenhar uma estrela de 5 pontas perfeita.',
    instrucao: 'Uma estrela de 5 pontas é formada por 5 traços iguais e giros de 144 graus (720° / 5). Encaixe o bloco Repetir 5 vezes!',
    dica: 'Cada ponta exige um traço de 80 passos e um giro de 144°. Repita 5 vezes para fechar a estrela!',
    conclusao: 'Fantástico! Você usou matemática, geometria e pensamento computacional para gerar arte algorítmica!',
    habilidades: ['EF69CO02', 'EF69CO03', 'EF69CO04'],
    meta: {
      tipo: 'desenho',
      figura: 'estrela',
      lados: 5,
      passo: 80,
      angulo: 144,
      exigirLoop: true,
    },
    blocosDisponiveis: [
      { id: 'avancar_longo', categoria: 'movimento', rotulo: 'Avançar 80 passos', cor: '#2563eb' },
      { id: 'girar_estrela', categoria: 'movimento', rotulo: 'Girar 144° à direita ↷', cor: '#2563eb' },
      { id: 'girar_direita', categoria: 'movimento', rotulo: 'Girar 90° à direita ↷', cor: '#2563eb' },
      { id: 'repetir', categoria: 'controle', rotulo: 'Repetir [N] vezes', cor: '#f59e0b', comFilhos: true, padraoVezes: 5 },
      { id: 'mudar_cor', categoria: 'aparencia', rotulo: 'Mudar cor da linha', cor: '#10b981' },
      { id: 'falar', categoria: 'aparencia', rotulo: 'Falar "Estrela!"', cor: '#8b5cf6' },
    ],
    programaInicial: [],
    professor: {
      objetivo: 'Compreender a relação entre ângulos de rotação geométrica, laços finitos e reconhecimento de padrões visuais.',
      desplugada: 'Utilizando régua e transferidor ou fita no chão da quadra, desenhar a estrela orientando um colega com instruções de graus.',
      conversa: [
        'Por que o robô precisou girar 144° em vez de 72°?',
        'Como a computação gráfica nos filmes de animação usa esses mesmos princípios geométricos?',
      ],
    },
  },
];
