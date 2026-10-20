/**
 * ============================================================================
 * LMS COMPASSO - ATIVIDADES 3D DE LÓGICA DE PROGRAMAÇÃO EM PYTHON (BNCC)
 * ============================================================================
 * Progressão pedagógica do simples ao complexo com cena 3D (Three.js + GSAP)
 * e execução de código Python no navegador via Pyodide (Web Worker) + fallback:
 *  1. Sequências e algoritmos (Robô em Labirinto 3D)           — EF15CO02, EF69CO03
 *  2. Condicionais (Portas, sensores e obstáculos 3D)          — EF05CO04, EF69CO03
 *  3. Laços (for/while) e repetição em grade 3D                — EF04CO03, EF69CO03
 *  4. Variáveis e funções (Decomposição de problemas 3D)       — EF06CO04, EF69CO04
 *  5. Listas e ordenação visualizada com blocos 3D             — EF05CO01, EF08CO03
 *  6. Recursão e busca (Torre de Hanói 3D interativa)          — EF08CO01, EF09CO01
 * ============================================================================
 */

export const ATIVIDADES_PYTHON3D = [
  {
    id: 'python3d-sequencia-labirinto',
    tipo: 'python3d',
    conceito: 'algoritmos',
    eixo: 'pensamento-computacional',
    faixa: 'f2',
    anos: '5º ao 7º ano',
    nivel: 1,
    duracaoMin: 15,
    emoji: '🤖',
    titulo: 'Python 3D: Sequência no Labirinto de Cristais',
    resumo: 'Escreva seus primeiros comandos em Python para guiar o robô 3D pelo corredor, coletar o cristal e chegar ao portal.',
    instrucao: 'Use os comandos robo.mover(), robo.girar_direita(), robo.girar_esquerda() e robo.coletar() em sequência para levar o robô até o cristal (I) e depois até a meta (M).',
    dica: 'O robô começa olhando para o Leste (direita). Avance 2 casas, colete o cristal, gire à direita e avance mais 2 casas até o portal!',
    conclusao: 'Parabéns! Você escreveu um algoritmo sequencial em Python e controlou o robô em um espaço tridimensional!',
    habilidades: ['EF15CO02', 'EF69CO03'],
    cena3d: {
      modo: 'grade',
      grade: [
        'R.I.',
        '##.#',
        '..M#',
      ],
      direcaoInicial: 'leste',
      maxPassos: 40,
    },
    codigoInicial: `# Guiar o robô até o cristal e depois até o portal (M)
robo.mover()
robo.mover()
robo.coletar()
# Continue os comandos abaixo:
`,
    solucaoReferencia: `robo.mover()
robo.mover()
robo.coletar()
robo.girar_direita()
robo.mover()
robo.mover()`,
    criteriosVerificacao: {
      exigirMeta: true,
      exigirTodosItens: true,
      maxComandos: 12,
    },
    professor: {
      objetivo: 'Introduzir a sintaxe de chamadas de função em Python por meio de instruções sequenciais com feedback espacial 3D imediato.',
      desplugada: 'No pátio ou quadra, desenhe uma grade 4x3 com giz. Um aluno atua como "programador" escrevendo os comandos no quadro e outro atua como "robô" executando linha por linha.',
      conversa: [
        'O que acontece quando trocamos a ordem de duas linhas no código Python?',
        'Por que o computador precisa de instruções sem ambiguidade, como robo.girar_direita()?',
      ],
    },
  },
  {
    id: 'python3d-condicionais-portas',
    tipo: 'python3d',
    conceito: 'algoritmos',
    eixo: 'pensamento-computacional',
    faixa: 'f3',
    anos: '6º ao 9º ano',
    nivel: 2,
    duracaoMin: 18,
    emoji: '🚪',
    titulo: 'Python 3D: Sensores e Portas Condicionais (if/else)',
    resumo: 'Use sensores lógicos e estruturas condicionais (if/else) em Python para abrir portas de energia e desviar de barreiras.',
    instrucao: 'No percurso há uma porta energética (P) e um cristal (I). Use if robo.frente_porta(): robo.abrir_porta() e if robo.tem_item(): robo.coletar() para tomar decisões seguras.',
    dica: 'Verifique com if robo.frente_porta(): antes de avançar pela porta P, e colete o cristal quando robo.tem_item() for verdadeiro.',
    conclusao: 'Excelente! Com estruturas condicionais (if/else), seu algoritmo em Python reage ao estado do ambiente 3D!',
    habilidades: ['EF15CO02', 'EF69CO03'],
    cena3d: {
      modo: 'grade',
      grade: [
        'R.P.I',
        '####.',
        '....M',
      ],
      direcaoInicial: 'leste',
      maxPassos: 60,
    },
    codigoInicial: `# Use estruturas condicionais (if) para abrir a porta e coletar o cristal
for passo in range(4):
    if robo.frente_porta():
        robo.abrir_porta()
    robo.mover()
    if robo.tem_item():
        robo.coletar()

# Agora gire para o sul e siga até a meta (M):
`,
    solucaoReferencia: `for passo in range(4):
    if robo.frente_porta():
        robo.abrir_porta()
    robo.mover()
    if robo.tem_item():
        robo.coletar()

robo.girar_direita()
robo.mover()
robo.mover()`,
    criteriosVerificacao: {
      exigirMeta: true,
      exigirTodosItens: true,
      exigirCondicional: true,
    },
    professor: {
      objetivo: 'Compreender e aplicar estruturas de seleção condicional (if/else) associadas a sensores booleanos em Python.',
      desplugada: 'Use cartões coloridos (Azul = Porta Fechada, Amarelo = Cristal). Os alunos caminham pela trilha e só podem passar pela casa Azul se anunciarem a condição "SE porta fechada ENTÃO abrir porta".',
      conversa: [
        'Qual é o tipo de dado retornado pelos sensores robo.frente_porta() e robo.tem_item()?',
        'Por que a indentação (espaços à esquerda) é obrigatória dentro do bloco if em Python?',
      ],
    },
  },
  {
    id: 'python3d-lacos-repeticao',
    tipo: 'python3d',
    conceito: 'algoritmos',
    eixo: 'pensamento-computacional',
    faixa: 'f3',
    anos: '6º ao 9º ano',
    nivel: 2,
    duracaoMin: 18,
    emoji: '🔁',
    titulo: 'Python 3D: Laços de Repetição (for e while)',
    resumo: 'Automatize a coleta de uma fileira de cristais usando laços for e while em Python sem repetir código.',
    instrucao: 'Há 3 cristais alinhados no corredor norte e 1 cristal no corredor leste. Use um laço for ou while robo.esta_livre(): para avançar e coletar todos os cristais até o portal (M).',
    dica: 'Use while robo.esta_livre(): para avançar até o fim do corredor coletando cristais, depois gire à direita e repita!',
    conclusao: 'Muito bem! Os laços de repetição tornam os algoritmos enxutos, legíveis e escaláveis!',
    habilidades: ['EF69CO02', 'EF69CO03'],
    cena3d: {
      modo: 'grade',
      grade: [
        'R.I.I',
        '####.',
        '####I',
        '####M',
      ],
      direcaoInicial: 'leste',
      maxPassos: 80,
    },
    codigoInicial: `# Avance pelo primeiro corredor com um laço de repetição
for i in range(4):
    robo.mover()
    if robo.tem_item():
        robo.coletar()

# Gire para o sul e use outro laço para chegar até a meta (M):
`,
    solucaoReferencia: `for i in range(4):
    robo.mover()
    if robo.tem_item():
        robo.coletar()

robo.girar_direita()
for i in range(3):
    robo.mover()
    if robo.tem_item():
        robo.coletar()`,
    criteriosVerificacao: {
      exigirMeta: true,
      exigirTodosItens: true,
      exigirLaco: true,
    },
    professor: {
      objetivo: 'Aplicar laços de repetição definidos (for) e indefinidos (while) para eliminar redundância em sequências de instruções.',
      desplugada: 'Peça que os alunos reescrevam uma música ou coreografia repetitiva usando a notação "REPITA N VEZES" e contem quantas linhas foram economizadas.',
      conversa: [
        'Quando é melhor usar for i in range(N) e quando é melhor usar while robo.esta_livre()?',
        'O que aconteceria se a condição de um laço while nunca deixasse de ser verdadeira?',
      ],
    },
  },
  {
    id: 'python3d-funcoes-decomposicao',
    tipo: 'python3d',
    conceito: 'decomposicao',
    eixo: 'pensamento-computacional',
    faixa: 'f3',
    anos: '7º ao 9º ano',
    nivel: 2,
    duracaoMin: 20,
    emoji: '🧩',
    titulo: 'Python 3D: Variáveis, Funções e Decomposição (def)',
    resumo: 'Decomponha o percurso em subproblemas criando sua própria função em Python com def explorar_corredor(passos).',
    instrucao: 'Defina uma função def avancar_e_coletar(passos): que move o robô e coleta cristais pelo caminho. Depois chame essa função para percorrer os três trechos em formato de escada até a meta (M).',
    dica: 'A função avancar_e_coletar(2) já está definida! Basta chamá-la, girar o robô e reutilizá-la para vencer os degraus.',
    conclusao: 'Perfeito! Criar funções parametrizadas com def é a essência da decomposição e do reúso de código na Computação!',
    habilidades: ['EF03CO03', 'EF69CO02', 'EF69CO04'],
    cena3d: {
      modo: 'grade',
      grade: [
        'R.I##',
        '##.I#',
        '###.M',
      ],
      direcaoInicial: 'leste',
      maxPassos: 80,
    },
    codigoInicial: `# Função reutilizável para avançar N passos coletando cristais
def avancar_e_coletar(passos):
    for i in range(passos):
        robo.mover()
        if robo.tem_item():
            robo.coletar()

# Trecho 1: avançar 2 casas para o leste
avancar_e_coletar(2)

# Complete os giros e chamadas da função até chegar em M:
`,
    solucaoReferencia: `def avancar_e_coletar(passos):
    for i in range(passos):
        robo.mover()
        if robo.tem_item():
            robo.coletar()

avancar_e_coletar(2)
robo.girar_direita()
avancar_e_coletar(1)
robo.girar_esquerda()
avancar_e_coletar(1)
robo.girar_direita()
avancar_e_coletar(1)
robo.girar_esquerda()
avancar_e_coletar(1)`,
    criteriosVerificacao: {
      exigirMeta: true,
      exigirTodosItens: true,
      exigirFuncao: true,
    },
    professor: {
      objetivo: 'Empregar a estratégia de decomposição e generalização criando funções parametrizadas (def) em Python.',
      desplugada: 'Divida a turma em equipes onde cada equipe cria uma "macro" (ex.: "fazer_degrau"). O programa principal apenas chama o nome da macro criada pelo grupo.',
      conversa: [
        'Como o parâmetro "passos" torna a função avancar_e_coletar mais flexível?',
        'Qual é a vantagem de corrigir um erro dentro de uma função em vez de corrigir em 10 lugares diferentes do código?',
      ],
    },
  },
  {
    id: 'python3d-listas-ordenacao',
    tipo: 'python3d',
    conceito: 'algoritmos',
    eixo: 'pensamento-computacional',
    faixa: 'f3',
    anos: '8º e 9º ano',
    nivel: 3,
    duracaoMin: 20,
    emoji: '📊',
    titulo: 'Python 3D: Listas e Ordenação Visual de Torres (Bubble Sort)',
    resumo: 'Manipule índices de uma lista em Python e observe as torres 3D trocarem de posição até ficarem em ordem crescente.',
    instrucao: 'As 5 torres 3D têm alturas [4, 2, 5, 1, 3]. Use lista.comparar(j, j + 1) e lista.trocar(j, j + 1) dentro de dois laços for para ordenar todas as torres da menor para a maior!',
    dica: 'Se lista.comparar(j, j + 1) > 0, significa que a torre da esquerda é maior que a da direita e você deve chamar lista.trocar(j, j + 1).',
    conclusao: 'Incrível! Você implementou um algoritmo clássico de ordenação sobre listas e visualizou cada comparação e troca em 3D!',
    habilidades: ['EF69CO02', 'EF69CO03', 'EF69CO04'],
    cena3d: {
      modo: 'ordenacao',
      valoresIniciais: [4, 2, 5, 1, 3],
      maxPassos: 120,
    },
    codigoInicial: `# Ordene as 5 torres 3D em ordem crescente [1, 2, 3, 4, 5]
n = 5
for i in range(n - 1):
    for j in range(n - 1 - i):
        # Se a torre j for maior que a torre j + 1, troque as duas:
        if lista.comparar(j, j + 1) > 0:
            lista.trocar(j, j + 1)
`,
    solucaoReferencia: `n = 5
for i in range(n - 1):
    for j in range(n - 1 - i):
        if lista.comparar(j, j + 1) > 0:
            lista.trocar(j, j + 1)`,
    criteriosVerificacao: {
      exigirListaOrdenada: true,
    },
    professor: {
      objetivo: 'Compreender algoritmos clássicos de manipulação e ordenação sobre listas (EF08CO03) por meio de visualização 3D passo a passo.',
      desplugada: 'Cinco alunos seguram cartazes com números embaralhados na frente da sala. Um colega aplica a regra de comparar pares vizinhos e trocar de lugar até que a fila inteira esteja ordenada.',
      conversa: [
        'Quantas comparações são feitas no pior caso quando temos 5 elementos na lista?',
        'Por que o elemento mais alto sempre "flutua" para a última posição ao final da primeira rodada?',
      ],
    },
  },
  {
    id: 'python3d-recursao-hanoi',
    tipo: 'python3d',
    conceito: 'decomposicao',
    eixo: 'pensamento-computacional',
    faixa: 'f3',
    anos: '8º e 9º ano',
    nivel: 3,
    duracaoMin: 22,
    emoji: '🗼',
    titulo: 'Python 3D: Recursão Visual na Torre de Hanói',
    resumo: 'Use o poder da recursão em Python para transferir os 3 discos de energia do pino A para o pino C respeitando as regras.',
    instrucao: 'Em cada movimento, um disco maior nunca pode ficar sobre um disco menor. Complete a função recursiva resolver_hanoi(n, origem, destino, auxiliar) usando hanoi.mover_disco(origem, destino).',
    dica: 'Para mover n discos de origem para destino: 1) mova n-1 discos para auxiliar; 2) mova o disco maior para destino; 3) mova os n-1 discos de auxiliar para destino.',
    conclusao: 'Espetacular! Você dominou a recursão em Python e resolveu a Torre de Hanói com o número mínimo de 7 movimentos!',
    habilidades: ['EF03CO03', 'EF69CO02', 'EF69CO04'],
    cena3d: {
      modo: 'hanoi',
      numDiscos: 3,
      pinoOrigem: 'A',
      pinoDestino: 'C',
      maxPassos: 60,
    },
    codigoInicial: `# Solução recursiva da Torre de Hanói 3D (3 discos: A -> C)
def resolver_hanoi(n, origem, destino, auxiliar):
    if n == 1:
        hanoi.mover_disco(origem, destino)
    else:
        resolver_hanoi(n - 1, origem, auxiliar, destino)
        hanoi.mover_disco(origem, destino)
        resolver_hanoi(n - 1, auxiliar, destino, origem)

# Inicie a transferência dos 3 discos do pino 'A' para o pino 'C':
resolver_hanoi(3, 'A', 'C', 'B')
`,
    solucaoReferencia: `def resolver_hanoi(n, origem, destino, auxiliar):
    if n == 1:
        hanoi.mover_disco(origem, destino)
    else:
        resolver_hanoi(n - 1, origem, auxiliar, destino)
        hanoi.mover_disco(origem, destino)
        resolver_hanoi(n - 1, auxiliar, destino, origem)

resolver_hanoi(3, 'A', 'C', 'B')`,
    criteriosVerificacao: {
      exigirHanoiCompleto: true,
    },
    professor: {
      objetivo: 'Exercitar o pensamento indutivo e o conceito de recursão (caso base e passo recursivo — EF08CO01) com visualização tridimensional.',
      desplugada: 'Utilize 3 moedas de tamanhos diferentes (ex.: R$ 1,00, R$ 0,50 e R$ 0,10) e três círculos desenhados em uma folha de papel para descobrir a sequência mínima de 7 movimentos.',
      conversa: [
        'Qual é o "caso base" da função resolver_hanoi e o que aconteceria se ele não existisse?',
        'Por que 3 discos exigem 7 movimentos e 4 discos exigem 15 movimentos (2^n - 1)?',
      ],
    },
  },
];
