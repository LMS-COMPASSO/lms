/**
 * ============================================================================
 * LMS COMPASSO — MOTOR DE INTERNACIONALIZAÇÃO (i18n) E ACESSIBILIDADE
 * ============================================================================
 * Suporte a múltiplos idiomas (Inglês, Português, Espanhol, Francês, Alemão,
 * Italiano, Turco, Ucraniano e Russo) com base no seletor visual acessível.
 * - WCAG 3.1.1 (Idioma da Página): atualiza document.documentElement.lang
 * - WCAG 3.1.2 (Idioma das Partes): declara lang individual em cada opção
 * - WAI-ARIA 1.2: Padrão Listbox acessível (role="listbox", role="option")
 * - Navegação via Teclado: Setas Cima/Baixo, Home, End, Enter, Space, Escape
 * - Live Region: Anúncio sonoro via aria-live ao trocar de idioma
 * ============================================================================
 */

export const CHAVE_STORAGE_IDIOMA = 'lms_idioma';

export const IDIOMAS_SUPORTADOS = [
  { codigo: 'en', nome: 'Inglês', nativo: 'English', regiao: 'US', dir: 'ltr' },
  { codigo: 'uk', nome: 'Ucraniano', nativo: 'Українська', regiao: 'UA', dir: 'ltr' },
  { codigo: 'es', nome: 'Espanhol', nativo: 'Español', regiao: 'ES', dir: 'ltr' },
  { codigo: 'tr', nome: 'Turco', nativo: 'Türkçe', regiao: 'TR', dir: 'ltr' },
  { codigo: 'it', nome: 'Italiano', nativo: 'Italiano', regiao: 'IT', dir: 'ltr' },
  { codigo: 'de', nome: 'Alemão', nativo: 'Deutsch', regiao: 'DE', dir: 'ltr' },
  { codigo: 'fr', nome: 'Francês', nativo: 'Français', regiao: 'FR', dir: 'ltr' },
  { codigo: 'ru', nome: 'Russo', nativo: 'Русский', regiao: 'RU', dir: 'ltr' },
  { codigo: 'pt', nome: 'Português', nativo: 'Português (Brasil)', regiao: 'BR', dir: 'ltr' },
];

export const DICIONARIO = {
  pt: {
    // Navegação Principal
    'nav.inicio': 'Início',
    'nav.boasVindas': 'Boas-vindas',
    'nav.atividades': 'Atividades',
    'nav.mundoDigital': 'Mundo Digital',
    'nav.culturaDigital': 'Cultura Digital',
    'nav.buscar': 'Buscar',
    'nav.entrar': 'Entrar',
    'nav.criarConta': 'Criar conta',
    'nav.painel': 'Painel',
    'nav.sair': 'Sair',
    'nav.buscarAriaLabel': 'Buscar atividades BNCC',
    'nav.voltar': 'Voltar',
    'nav.proximo': 'Próximo',

    // Seletor de Idioma
    'i18n.rotuloSeletor': 'Alterar idioma. Idioma atual: {atual}',
    'i18n.listaAriaLabel': 'Idiomas disponíveis',
    'i18n.anuncioTroca': 'Idioma alterado para {nome}.',

    // Wayfinding e Breadcrumbs
    'wf.voceEstaAqui': 'Você está aqui',
    'wf.voltarTrilhas': 'Voltar para Trilhas',
    'wf.inicio': 'Início',
    'wf.pensamentoComputacional': 'Pensamento Computacional',
    'wf.atividadesLab3d': 'Atividades & Laboratório 3D BNCC',

    // Eixos da BNCC
    'eixo.pensamento-computacional': 'Pensamento Computacional',
    'eixo.mundo-digital': 'Mundo Digital',
    'eixo.cultura-digital': 'Cultura Digital',

    // Tipos de Atividades
    'tipo.ordenar': 'Montar a sequência',
    'tipo.decompor': 'Dividir o problema',
    'tipo.robo': 'Programar o robô',
    'tipo.blocos': 'Programação em blocos',
    'tipo.python3d': 'Laboratório 3D Python',

    // Níveis
    'nivel.1': 'Iniciante',
    'nivel.2': 'Intermediário',
    'nivel.3': 'Desafio',

    // Faixas
    'faixa.f1': '1º ao 3º ano',
    'faixa.f2': '4º e 5º ano',
    'faixa.f3': '6º ao 9º ano',

    // Conceitos
    'conceito.algoritmos': 'Algoritmos do cotidiano',
    'conceito.decomposicao': 'Decomposição lógica',

    // Spotlight Hero (CinemaOS)
    'spotlight.destaqueAriaLabel': 'Atividade em Destaque',
    'spotlight.kickerRecomendada': 'Próxima Missão Recomendada',
    'spotlight.kickerRetomar': 'Continuar de onde parou',
    'spotlight.kickerConcluida': 'Trilha BNCC Dominada!',
    'spotlight.comecarDesafio': 'Começar Desafio',
    'spotlight.retomarAtividade': 'Retomar Atividade',
    'spotlight.jogarNovamente': 'Jogar Novamente',
    'spotlight.explorarGrade': 'Explorar Grade ({total})',
    'spotlight.certificado3d': 'Certificado 3D ({concluidas}/{total})',
    'spotlight.certificado3dTitulo': 'Certificado Oficial Explorador Python 3D',
    'spotlight.trilhaProgresso': 'Trilha de Atividades: {concluidas} de {total} concluídas ({percentual}%)',
    'spotlight.xpConquistados': '+{xp} XP conquistados',
    'spotlight.cliqueParaJogar': 'Clique para jogar',
    'spotlight.proximaAtividade': 'Próxima atividade',
    'spotlight.verTodas': 'Ver todas as atividades',

    // Barra de Descoberta e Filtros
    'toolbar.secaoAriaLabel': 'Catálogo Geral de Atividades',
    'toolbar.buscaPlaceholder': 'Buscar por título, conceito ou código BNCC (ex.: EF05CO01, Hanói, Robô)...',
    'toolbar.buscaAriaLabel': 'Buscar atividades por nome ou código de habilidade BNCC',
    'toolbar.limparBusca': 'Limpar busca',
    'toolbar.todas': 'Todas',
    'toolbar.python3d': 'Python 3D',
    'toolbar.algoritmos': 'Algoritmos',
    'toolbar.decomposicao': 'Decomposição',
    'toolbar.robo': 'Robô no Mapa',
    'toolbar.blocos': 'Blocos',
    'toolbar.filtros': 'Filtros',
    'toolbar.anoEscolar': 'Ano escolar:',
    'toolbar.todosAnos': 'Todos os anos',
    'toolbar.habilidadeBncc': 'Habilidade BNCC:',
    'toolbar.todasHabilidades': 'Todas as habilidades BNCC',
    'toolbar.limparFiltros': 'Limpar filtros avançados',

    // Cartões e Estados de Progresso
    'card.naoIniciado': 'Não iniciado',
    'card.emAndamento': 'Em andamento',
    'card.concluido': 'Concluído',
    'card.comecar': 'Começar',
    'card.continuar': 'Continuar',
    'card.jogarDeNovo': 'Jogar de novo',
    'card.min': 'min',

    // Estado Vazio / Busca
    'vazio.titulo': 'Nenhuma atividade encontrada para esse filtro',
    'vazio.descricao': 'Tente limpar os filtros ativos ou voltar para o catálogo completo.',
    'vazio.mostrarTodas': 'Mostrar todas as atividades',
    'vazio.irInicio': 'Ir para o início',

    // Home
    'home.eyebrow': 'Projeto de Inovação SUAP/IFMA · Startup LMS COMPASSO',
    'home.titulo': 'Computação na escola, passo a passo.',
    'home.lead': 'O LMS COMPASSO é uma plataforma aberta e leve que ajuda redes municipais e escolas a ensinar Pensamento Computacional, Mundo Digital e Cultura Digital no Ensino Fundamental, com a BNCC Computação como guia.',
    'home.ctaAtividade': 'Experimente uma atividade',
    'home.ctaBoasVindas': 'Boas-vindas & Parceiros',
    'home.ctaEntrar': 'Entrar na plataforma',

    // Atividades
    'atv.ordenar-escovar-dentes.titulo': 'Monte o algoritmo: escovar os dentes',
    'atv.ordenar-escovar-dentes.resumo': 'Coloque os passos de escovar os dentes na ordem certa.',
    'atv.ordenar-atravessar-rua.titulo': 'Monte o algoritmo: atravessar a rua com segurança',
    'atv.ordenar-atravessar-rua.resumo': 'Organize os passos para atravessar a rua e deixe de fora os que são perigosos.',
    'atv.ordenar-sanduiche.titulo': 'Monte o algoritmo: preparar um sanduíche',
    'atv.ordenar-sanduiche.resumo': 'Descubra a ordem dos ingredientes para montar um sanduíche saboroso.',
    'atv.py3d-labirinto-1.titulo': 'Labirinto 3D: Primeiros Passos em Python',
    'atv.py3d-labirinto-1.resumo': 'Controle um robô 3D em tempo real executando comandos Python no navegador.',

    // Rodapé
    'rodape.plataforma': 'Plataforma',
    'rodape.projeto': 'Projeto',
    'rodape.descricao': 'Plataforma aberta para o ensino de Computação no Ensino Fundamental, alinhada à BNCC Computação.',
    'rodape.paginaInicial': 'Página inicial',
    'rodape.boasVindas': 'Boas-vindas & Parceiros',
    'rodape.mundoDigital': 'Mundo Digital (Hardware 3D)',
    'rodape.culturaDigital': 'Cultura Digital (Simulador Chat)',
    'rodape.entrar': 'Entrar',
    'rodape.criarConta': 'Criar conta de aluno',
    'rodape.codigoGithub': 'Código no GitHub',
    'rodape.comoCriar': 'Como criar atividades',
    'rodape.licenca': 'Licença MIT',
    'rodape.fim': 'Projeto de Inovação SUAP/IFMA nº 14246/2025 · Startup LMS COMPASSO · IFMA Campus Grajaú.',

    // Mundo Digital — Metadados e Wayfinding
    'md.metaTitulo': 'Mundo Digital — Laboratório 3D de Hardware e Redes — LMS COMPASSO',
    'md.metaDesc': 'Laboratório interativo do Eixo Mundo Digital alinhado à BNCC Computação: explore a placa-mãe em 3D, monte componentes, compreenda o ciclo da CPU e simule o tráfego de pacotes na internet.',
    'md.badgeEixo': 'Eixo 2 · BNCC Computação',
    'md.heroTitulo': 'Mundo Digital: <span>Hardware & Redes</span>',
    'md.heroDesc': 'Como os computadores realmente pensam, guardam memórias e conversam através de cabos e ondas de rádio? Explore a placa-mãe interativa em 3D, inspecione a CPU em funcionamento e acompanhe pacotes de dados viajando pela internet.',
    'md.ctaPlaca': 'Explorar Placa-Mãe 3D',
    'md.ctaCpu': 'Simular Ciclo da CPU',
    'md.ctaRedes': 'Tráfego de Pacotes na Internet',
    'md.tagEF01CO04': 'Periféricos I/O',
    'md.tagEF02CO03': 'Componentes & Memória',
    'md.tagEF04CO03': 'Dados & Redes',
    'md.tagEF05CO03': 'Arquitetura da CPU',
    'md.tagEF69CO05': 'Roteamento & Internet',

    // Seção 1: Placa-Mãe 3D e PC Builder
    'md.sec1Titulo': 'Placa-Mãe 3D: Raio-X & PC Builder',
    'md.sec1Desc': 'Clique nos componentes para inspecionar sua função pedagógica ou use o desafio de montagem para encaixar peças e ligar o sistema.',
    'md.statusPostEspera': 'Em Espera (Desligado)',
    'md.statusPostAtivo': 'POST Concluído (Sistema Operacional Ativo)',
    'md.ariaVisualizacao': 'Modos de visualização da placa-mãe',
    'md.vistaIsometrica': 'Isométrica 3D',
    'md.vistaTopo': 'Topo',
    'md.vistaLateral': 'Perfil',
    'md.compCpuRotulo': 'Processador',
    'md.compRamRotulo': 'Memória RAM',
    'md.compSsdRotulo': 'Armazenamento SSD',
    'md.compGpuRotulo': 'GPU Dedicada',
    'md.compIoRotulo': 'Portas I/O',
    'md.analogiaTitulo': 'Analogia Pedagógica',

    // Specs Labels
    'md.spec.velTipica': 'Velocidade Típica',
    'md.spec.unidInternas': 'Unidades Internas',
    'md.spec.bncc': 'BNCC Computação',
    'md.spec.tecAtual': 'Tecnologia Atual',
    'md.spec.volatilidade': 'Volatilidade',
    'md.spec.interface': 'Interface',
    'md.spec.memoria': 'Memória',
    'md.spec.saidasVideo': 'Saídas de Vídeo',
    'md.spec.entradas': 'Entradas',
    'md.spec.saidas': 'Saídas',

    // CPU Dados
    'md.cpu.nome': 'Processador Central (CPU)',
    'md.cpu.categoria': 'Unidade de Processamento (Cérebro do Computador)',
    'md.cpu.desc': 'A CPU executa as instruções de todos os programas. Ela interpreta cálculos matemáticos e lógicos através de bilhões de ciclos elétricos por segundo.',
    'md.cpu.analogia': 'É como o Chef de Cozinha de um restaurante: recebe os pedidos, prepara as receitas e comanda a equipe.',
    'md.cpu.spec1': '3.2 a 5.0 GHz (Bilhões de ciclos/s)',
    'md.cpu.spec2': 'ULA (Cálculos), UC (Controle), Registradores',
    'md.cpu.spec3': 'EF05CO03 (Arquitetura e Ciclo de Execução)',

    // RAM Dados
    'md.ram.nome': 'Memória Principal (RAM DDR5)',
    'md.ram.categoria': 'Armazenamento Primário Volátil de Alta Velocidade',
    'md.ram.desc': 'A RAM armazena os dados que a CPU precisa ler imediatamente. É ultrarrápida, porém volátil: ao desligar o computador, tudo que está nela se apaga.',
    'md.ram.analogia': 'É a mesa de estudos do aluno: enquanto você estuda, seus cadernos ficam abertos nela. Quando a aula acaba, a mesa é limpa.',
    'md.ram.spec1': 'DDR5 a 5600 MT/s',
    'md.ram.spec2': 'Sim (Apaga sem energia elétrica)',
    'md.ram.spec3': 'EF02CO03 (Diferença entre RAM e Armazenamento)',

    // SSD Dados
    'md.ssd.nome': 'Armazenamento Secundário (SSD NVMe M.2)',
    'md.ssd.categoria': 'Armazenamento Permanente Não-Volátil',
    'md.ssd.desc': 'O SSD armazena permanentemente o sistema operacional, fotos, jogos e documentos em chips de memória flash que não dependem de energia para reter informações.',
    'md.ssd.analogia': 'É a mochila escolar ou a estante de livros: mesmo depois que você vai dormir, seus livros continuam guardados com segurança.',
    'md.ssd.spec1': 'PCIe 4.0 NVMe (Até 7.000 MB/s)',
    'md.ssd.spec2': 'Não-volátil (Permanente)',
    'md.ssd.spec3': 'EF02CO03 (Armazenamento de Dados)',

    // GPU Dados
    'md.gpu.nome': 'Placa de Vídeo Dedicada (GPU)',
    'md.gpu.categoria': 'Processamento Gráfico e Paralelo',
    'md.gpu.desc': 'A GPU possui milhares de pequenos núcleos projetados para calcular simultaneamente milhões de polígonos, texturas e efeitos de iluminação em tempo real para o monitor.',
    'md.gpu.analogia': 'Se a CPU é um único cientista genial, a GPU é um batalhão de 5.000 desenhistas desenhando cada detalhe do jogo ao mesmo tempo.',
    'md.gpu.spec1': 'VRAM GDDR6 Dedicada',
    'md.gpu.spec2': 'HDMI 2.1 e DisplayPort 1.4',
    'md.gpu.spec3': 'EF01CO04 (Periféricos e Saída Visual)',

    // IO Dados
    'md.io.nome': 'Painel Traseiro de Conexões (Portas I/O)',
    'md.io.categoria': 'Interface de Entrada e Saída (Input / Output)',
    'md.io.desc': 'Central de conexões físicas que conecta o computador ao mundo: portas USB para periféricos de entrada (teclado/mouse), HDMI para saída visual e conector RJ-45 para cabos de rede.',
    'md.io.analogia': 'São as portas e janelas de uma casa: por onde as cartas entram (dados) e por onde os moradores conversam com o exterior.',
    'md.io.spec1': 'USB (Teclado, Mouse, Microfone)',
    'md.io.spec2': 'HDMI (Tela/Monitor), Áudio (Caixas de som)',
    'md.io.spec3': 'EF01CO04 / EF02CO03 (Classificação I/O)',

    // PC Builder Desafio
    'md.pcBuilderTitulo': 'Desafio: Monte o Computador',
    'md.pcBuilderProgresso': '{instalados} / {total} Instalados',
    'md.pcEtapa1': '1. Encaixar o Processador no Socket',
    'md.pcEtapa2': '2. Inserir o Pente de Memória RAM',
    'md.pcEtapa3': '3. Conectar a Unidade SSD M.2',
    'md.pcEtapa4': '4. Instalar a Placa de Vídeo no Slot PCIe',
    'md.pcEtapa5': '5. Ligar e Executar o POST de Inicialização',
    'md.btnEncaixar': 'Encaixar Próximo Componente',
    'md.btnLigar': 'Ligar Computador (POST)',
    'md.btnMontado': 'Computador Montado & Ativo!',
    'md.btnReiniciar': 'Reiniciar',

    // Seção 2: Ciclo da CPU
    'md.sec2Titulo': 'O Ciclo de Clock da CPU',
    'md.sec2Desc': 'Como bilhões de transistores transformam pulsos elétricos em tarefas reais? Veja o ciclo de busca, decodificação e execução.',
    'md.cpuIrTitulo': 'Registrador de Instrução (IR)',
    'md.cpuUcTitulo': 'Unidade de Controle (UC)',
    'md.cpuUcConteudo': 'Decodificador: Operação Aritmética',
    'md.cpuUlaTitulo': 'Unidade Lógica e Aritmética (ULA)',
    'md.cpuFase1': 'Fase 1',
    'md.cpuBuscaTitulo': 'Busca (Fetch)',
    'md.cpuBuscaDesc': 'O endereço de memória é consultado e a próxima instrução é trazida da RAM para o Registrador de Instrução interno da CPU.',
    'md.cpuFase2': 'Fase 2',
    'md.cpuDecodificaTitulo': 'Decodificação (Decode)',
    'md.cpuDecodificaDesc': 'A Unidade de Controle traduz os bits da instrução e identifica quais circuitos e registradores precisam ser acionados.',
    'md.cpuFase3': 'Fase 3',
    'md.cpuExecutaTitulo': 'Execução (Execute)',
    'md.cpuExecutaDesc': 'A ULA processa a conta ou a comparação lógica e armazena o resultado no Acumulador, concluindo o ciclo de clock.',
    'md.cpuAguardandoOperandos': 'Aguardando Operandos...',
    'md.cpuCarregadoValores': 'Carregado: 5 e 3',
    'md.cpuInstrucaoConcluida': 'Instrução Concluída',
    'md.cpuResultado': 'Resultado: 8 (00001000₂)',
    'md.btnCpuPasso': 'Avançar Passo a Passo',
    'md.btnCpuAuto': 'Ciclo Automático',
    'md.btnCpuPausar': 'Pausar Ciclo',

    // Seção 3: Simulador de Redes e Pacotes TCP/IP
    'md.sec3Titulo': 'Como os Pacotes Trafegam na Internet?',
    'md.sec3Desc': 'Nenhuma foto ou mensagem viaja inteira pela rede: ela é fragmentada em pacotes com endereços IP e remontada no servidor de destino.',
    'md.redeNoAluno': 'Computador Aluno',
    'md.redeNoRoteador': 'Roteador Wi-Fi',
    'md.redeNoProvedor': 'Provedor & Fibra',
    'md.redeNoServidor': 'Servidor COMPASSO',
    'md.redeProtocoloRotulo': 'Protocolo:',
    'md.redeSeqRotulo': 'Sequência (SYN):',
    'md.redePayloadRotulo': 'Carga Útil (Payload):',
    'md.redePayloadValor': '"Olá, Escola! Atividade Concluída"',
    'md.redeStatusRotulo': 'Status de Entrega:',
    'md.redeStatusPronto': 'Pronto para Enviar',
    'md.redeStatusEnviando': 'Enviando pacotes TCP via roteadores...',
    'md.redeStatusSucesso': '✅ Pacotes entregues e remontados no Servidor LMS COMPASSO!',
    'md.redeStatusPerda': '❌ Pacote 2 perdido no caminho! Protocolo TCP retransmitiu com sucesso (ACK 3).',
    'md.btnDispararPacote': 'Disparar Pacote de Dados',
    'md.btnSimularPerda': 'Simular Perda de Pacote (Retransmissão TCP)',
    'md.btnPerdaAtivada': '⚠️ Perda de Pacote: Ativada',

    // Wayfinding & Rodapé
    'wf.eixosBncc': 'Eixos BNCC',
    'wf.mundoDigital': 'Mundo Digital',
    'rodape.eixos': 'Eixos Curriculares',
    'rodape.acessoRapido': 'Acesso Rápido',
    'rodape.copyrightMundoDigital': 'Projeto de Inovação SUAP/IFMA nº 14246/2025 · Startup LMS COMPASSO · Eixo Mundo Digital.',    'cd.metaTitulo': 'Cultura Digital — Cidadania e Diálogo — LMS COMPASSO',

    // Cultura Digital (Eixo 3 BNCC)
    "cd.metaTitulo": "Cultura Digital — Cidadania e Diálogo — LMS COMPASSO",
    "cd.metaDesc": "Laboratório interativo do Eixo Cultura Digital alinhado à BNCC Computação: tome decisões éticas em chats interativos, identifique phishing e fake news, proteja sua pegada digital e teste a segurança de senhas.",
    "cd.pularConteudo": "Pular para o conteúdo principal",
    "cd.voltarMundoDigital": "Voltar para Mundo Digital",
    "cd.culturaDigital": "Cultura Digital",
    "cd.eixoBncc": "Eixo 3 · BNCC Computação",
    "cd.heroTitulo": "Cultura Digital: <span>Cidadania & Ética na Rede</span>",
    "cd.heroDesc": "Como navegar com segurança, discernir verdades de boatos e construir um ambiente de respeito mútuo nas redes? Tome decisões em conversas simuladas, descubra golpes de phishing, teste a resistência de senhas e meça sua pegada digital.",
    "cd.ctaChat": "Iniciar Chat Interativo",
    "cd.ctaCofre": "Cofre de Senhas Seguras",
    "cd.ctaPegada": "Medidor de Pegada Digital",
    "cd.tagEF01CO05": "Ética & Respeito",
    "cd.tagEF02CO04": "Proteção de Dados",
    "cd.tagEF03CO04": "Fake News & Fatos",
    "cd.tagEF04CO04": "Phishing & Cyberbullying",
    "cd.tagEF05CO04": "Pegada Digital",
    "cd.sec1Titulo": "ZapCompasso: Simulador de Diálogo e Cidadania",
    "cd.sec1Desc": "Escolha um contato na lista lateral, analise as mensagens recebidas e tome a decisão correta para proteger seus dados e combater abusos online.",
    "cd.conversas": "Conversas",
    "cd.pontosCidadania": "{pontos} Pontos de Cidadania",
    "cd.onlineAgora": "Online agora",
    "cd.decisaoRotulo": "Qual é a melhor atitude como cidadão digital?",
    "cd.refazerCenario": "Refazer este cenário",
    "cd.analisePedagogica": "Análise Pedagógica:",
    "cd.horaAgora": "Agora",
    "cd.cenariosAriaLabel": "Cenários de Diálogo Digital",
    "cd.chat.phishing.nome": "Leo (Colega de Jogo)",
    "cd.chat.phishing.badge": "Phishing & Engenharia Social (EF04CO04)",
    "cd.chat.phishing.previa": "Mano, achei um site que dá moedas grátis!",
    "cd.chat.phishing.msg": "Mano, olha esse site que tá dando 10.000 moedas e itens grátis no jogo hoje! Clica rápido e coloca seu login e senha antes que saia do ar: http://robl0x-free-coins.xyz/login",
    "cd.chat.phishing.opc1.texto": "Valeu Leo! Vou clicar agora e colocar minha senha pra pegar as moedas.",
    "cd.chat.phishing.opc1.resposta": "Eita... Você caiu no golpe! Minha conta foi invadida e o hacker mandou esse link pra você!",
    "cd.chat.phishing.opc1.feedback": "⚠️ CUIDADO: Isso é um ataque de Phishing! O link tem um endereço falso (.xyz). Nenhum jogo oficial pede sua senha em sites externos. Seus dados seriam roubados.",
    "cd.chat.phishing.opc2.texto": "Não vou entrar agora, mas vou repassar o link pro grupo da sala.",
    "cd.chat.phishing.opc2.resposta": "Não faça isso! O link é perigoso!",
    "cd.chat.phishing.opc2.feedback": "⚠️ ATENÇÃO: Repassar links suspeitos coloca seus amigos e familiares em perigo. Na dúvida, nunca propague correntes.",
    "cd.chat.phishing.opc3.texto": "Leo, isso é golpe de Phishing! Olha esse link falso (.xyz). Ninguém dá moedas em troca de senha. Troque sua senha agora se tiver entrado lá!",
    "cd.chat.phishing.opc3.resposta": "Caramba, você me salvou! Vou trocar minha senha correndo antes que roubem minha conta!",
    "cd.chat.phishing.opc3.feedback": "🌟 EXCELENTE: Você identificou a URL falsa, protegeu sua conta e ainda orientou o amigo a mudar a senha comprometida. Habilidade EF04CO04 dominada!",
    "cd.chat.cyberbullying.nome": "Grupo da Turma 5º B",
    "cd.chat.cyberbullying.badge": "Convivência Ética & Respeito (EF04CO04 / EF01CO05)",
    "cd.chat.cyberbullying.previa": "Olha a foto do Pedro no recreio kkk",
    "cd.chat.cyberbullying.msg": "[Foto compartilhada do Pedro caindo na poça de água] 'Kkkk olha que mico do Pedro no recreio hoje! Vamos criar uma figurinha e espalhar em todas as redes!'",
    "cd.chat.cyberbullying.opc1.texto": "Kkkkk vou fazer a figurinha agora e postar no TikTok!",
    "cd.chat.cyberbullying.opc1.resposta": "[O Pedro saiu do grupo magoado]",
    "cd.chat.cyberbullying.opc1.feedback": "⚠️ GRAVE: Isso é Cyberbullying. Compartilhar imagens constrangedoras sem consentimento causa sofrimento real e fere as regras de convivência escolar e digital.",
    "cd.chat.cyberbullying.opc2.texto": "Vou só silenciar o grupo e fingir que não vi nada.",
    "cd.chat.cyberbullying.opc2.resposta": "[A zombaria continua sem ninguém intervir]",
    "cd.chat.cyberbullying.opc2.feedback": "⚠️ REFLEXÃO: A omissão permite que a agressão continue. Ser um cidadão digital consciente exige apoiar quem está sendo atacado.",
    "cd.chat.cyberbullying.opc3.texto": "Gente, parem com isso. Imagina se fosse com vocês? Apaguem essa foto, não criem figurinhas e respeitem o Pedro.",
    "cd.chat.cyberbullying.opc3.resposta": "É verdade pessoal, fomos longe demais. Já apaguei a foto. Desculpa, Pedro!",
    "cd.chat.cyberbullying.opc3.feedback": "🌟 EXEMPLAR: Você agiu como um 'Upstander' (defensor ativo), usando sua voz digital para frear o desrespeito e acolher o colega. Habilidade EF01CO05 e EF04CO04!",
    "cd.chat.privacidade.nome": "ShadowGamer_99",
    "cd.chat.privacidade.badge": "Proteção de Dados & Privacidade (EF02CO04)",
    "cd.chat.privacidade.previa": "Onde você mora? Passa seu Whats!",
    "cd.chat.privacidade.msg": "Jogou muito hoje na partida! Me passa seu nome completo, idade e o nome da sua escola pra gente marcar de jogar pessoalmente amanhã!",
    "cd.chat.privacidade.opc1.texto": "Meu nome é Lucas Silva, tenho 10 anos e estudo na Escola Municipal das 13h às 17h.",
    "cd.chat.privacidade.opc1.resposta": "Beleza, já sei onde te encontrar amanhã...",
    "cd.chat.privacidade.opc1.feedback": "⚠️ PERIGO GRAVE: Nunca informe nome completo, idade, escola ou rotina para pessoas desconhecidas em jogos online. Seus dados pessoais devem ser protegidos!",
    "cd.chat.privacidade.opc2.texto": "Não quero passar a escola, mas meu telefone é (99) 99999-9999.",
    "cd.chat.privacidade.opc2.resposta": "Anotado! Vou te ligar agora.",
    "cd.chat.privacidade.opc2.feedback": "⚠️ RISCO: Seu número de telefone também é um dado pessoal sensível. Estranhos podem usá-lo para golpes ou mensagens indevidas.",
    "cd.chat.privacidade.opc3.texto": "Não compartilho informações pessoais nem rotina escolar na internet. Vamos nos comunicar apenas pelo chat do próprio jogo.",
    "cd.chat.privacidade.opc3.resposta": "Tranquilo, você está certo em ter cuidado. Vamos focar na partida!",
    "cd.chat.privacidade.opc3.feedback": "🌟 PERFEITO: Você estabeleceu limites claros de privacidade e compreendeu que dados pessoais não devem circular abertamente. Habilidade EF02CO04!",
    "cd.chat.fakenews.nome": "Tia Cláudia (Família)",
    "cd.chat.fakenews.badge": "Detetive de Fake News (EF03CO04)",
    "cd.chat.fakenews.previa": "URGENTE! Repassem para todos!",
    "cd.chat.fakenews.msg": "URGENTE!!! Repassem para todos: cientistas avisam que amanhã a internet vai cair no mundo inteiro por 1 mês! Não bebam água da torneira! Compartilhem para salvar vidas!!",
    "cd.chat.fakenews.opc1.texto": "Meu Deus tia! Vou mandar em todos os grupos agora mesmo!",
    "cd.chat.fakenews.opc1.resposta": "[O boato se espalhou e gerou pânico entre vizinhos]",
    "cd.chat.fakenews.opc1.feedback": "⚠️ ATENÇÃO: Mensagens alarmistas, cheias de exclamações e sem fonte confiável são a receita clássica das Fake News. Compartilhar sem checar espalha desinformação.",
    "cd.chat.fakenews.opc2.texto": "Vou estocar água em casa por garantia, mas não repasso.",
    "cd.chat.fakenews.opc2.resposta": "Melhor prevenir, né?",
    "cd.chat.fakenews.opc2.feedback": "⚠️ DICA: Antes de acreditar ou se preocupar, faça uma busca rápida em sites confiáveis de notícias ou órgãos oficiais.",
    "cd.chat.fakenews.opc3.texto": "Tia, pesquisei no site oficial do governo e em jornais sérios: isso é notícia falsa (boato)! Por favor não repasse, pra não causar pânico nas pessoas.",
    "cd.chat.fakenews.opc3.resposta": "Nossa meu bem, ainda bem que você me avisou! Já vou avisar que me enganei e apagar.",
    "cd.chat.fakenews.opc3.feedback": "🌟 BRILHANTE: Você usou o pensamento crítico, checou os fatos em fontes confiáveis e interrompeu a cadeia de desinformação. Habilidade EF03CO04!",
    "cd.sec2Titulo": "Cofre Digital: Testador de Senhas Seguras",
    "cd.sec2Desc": "Aprenda a construir chaves digitais invioláveis. Veja em tempo real quanto tempo um computador levaria para adivinhar sua senha.",
    "cd.senhaLabel": "Digite uma senha para testar a força:",
    "cd.senhaPlaceholder": "Ex: MinhaEscola#2026!",
    "cd.senhaStatusPadrao": "Digite uma senha para testar",
    "cd.tempoQuebraPadrao": "Tempo para quebrar: —",
    "cd.senhaMuitoFraca": "Muito Fraca",
    "cd.senhaFraca": "Fraca",
    "cd.senhaMedia": "Média / Boa",
    "cd.senhaExcelente": "Excelente & Segura!",
    "cd.quebrada0001": "Quebrada em: 0.001 segundos",
    "cd.quebradaMinutos": "Quebrada em: alguns minutos",
    "cd.quebradaAnos": "Quebrada em: 2 a 3 anos",
    "cd.quebrada500Anos": "Quebrada em: Mais de 500 anos!",
    "cd.reqAriaLabel": "Requisitos para senha forte",
    "cd.req8Char": "Pelo menos 8 caracteres",
    "cd.reqMaiusc": "Letras maiúsculas e minúsculas",
    "cd.reqNum": "Pelo menos um número",
    "cd.reqSimb": "Símbolos (@, #, $, !, %)",
    "cd.dica1Titulo": "A Regra dos 4 Elementos (EF02CO04)",
    "cd.dica1Desc": "Senhas com apenas números (como 123456 ou datas de aniversário) são descobertas em frações de segundo por programas de ataque. Misturar palavras com números e símbolos cria trilhões de combinações possíveis.",
    "cd.dica2Titulo": "Dica Mnemônica para Crianças",
    "cd.dica2Desc": "Crie frases fáceis de lembrar para você, mas impossíveis para outros adivinharem. Exemplo: <em>\"GostoDeAstronomiaNoIFMA#2026!\"</em>.",
    "cd.sec3Titulo": "Sua Pegada Digital no Mundo (EF05CO04)",
    "cd.sec3Desc": "Tudo o que você curte, compartilha e cadastra na internet deixa rastros permanentes. Marque suas ações diárias para ver o estado da sua pegada.",
    "cd.pegadaLimpaTitulo": "Pegada Digital Limpa & Protegida",
    "cd.pegadaLimpaDesc": "Você cuida com atenção da sua privacidade, não compartilha dados sensíveis e mantém sua identidade resguardada.",
    "cd.pegadaAtencaoTitulo": "Atenção: Pegada Digital Visível",
    "cd.pegadaAtencaoDesc": "Algumas informações da sua rotina estão públicas. Desative localizações e revise quem pode ver suas postagens.",
    "cd.pegadaAlertaTitulo": "Alerta: Pegada Digital Vulnerável!",
    "cd.pegadaAlertaDesc": "Muitos dados pessoais e de rotina estão expostos. Qualquer estranho pode rastrear seus passos online.",
    "cd.chkUniforme": "Posto fotos com uniforme da escola ou mostrando a fachada da minha casa",
    "cd.chkGps": "Deixo a localização (GPS) sempre ativada publicamente nas redes sociais",
    "cd.chkTermos": "Aceito termos de uso de jogos e apps sem conferir quais dados eles coletam",
    "cd.chkSenhaRepetida": "Uso a mesma senha simples para o e-mail, jogos e redes sociais",
    "cd.rodapeFim": "Projeto de Inovação SUAP/IFMA nº 14246/2025 · Startup LMS COMPASSO · Eixo Cultura Digital.",
    "rodape.copyrightCulturaDigital": "Projeto de Inovação SUAP/IFMA nº 14246/2025 · Startup LMS COMPASSO · Eixo Cultura Digital.",
  },    'cd.metaTitulo': 'Cultura Digital — Ciudadanía y Diálogo — LMS COMPASSO',

    // Cultura Digital (Eixo 3 BNCC)
    "cd.metaTitulo": "Cultura Digital — Ciudadanía y Diálogo — LMS COMPASSO",
    "cd.metaDesc": "Laboratorio interactivo del Eje Cultura Digital: toma decisiones éticas en chats simulados, identifica phishing y fake news, protege tu huella digital y evalúa contraseñas.",
    "cd.pularConteudo": "Saltar al contenido principal",
    "cd.voltarMundoDigital": "Volver a Mundo Digital",
    "cd.culturaDigital": "Cultura Digital",
    "cd.eixoBncc": "Eje 3 · Currículo de Computación",
    "cd.heroTitulo": "Cultura Digital: <span>Ciudadanía y Ética en la Red</span>",
    "cd.heroDesc": "¿Cómo navegar con seguridad, discernir verdades de rumores y construir respeto mutuo en las redes? Toma decisiones en conversaciones simuladas, descubre estafas de phishing, prueba contraseñas y mide tu huella digital.",
    "cd.ctaChat": "Iniciar Chat Interactivo",
    "cd.ctaCofre": "Cofre de Contraseñas Seguras",
    "cd.ctaPegada": "Medidor de Huella Digital",
    "cd.tagEF01CO05": "Ética y Respeto",
    "cd.tagEF02CO04": "Protección de Datos",
    "cd.tagEF03CO04": "Fake News y Hechos",
    "cd.tagEF04CO04": "Phishing y Ciberacoso",
    "cd.tagEF05CO04": "Huella Digital",
    "cd.sec1Titulo": "ZapCompasso: Simulador de Diálogo y Ciudadanía",
    "cd.sec1Desc": "Elige un contacto en la barra lateral, analiza los mensajes recibidos y toma la decisión correcta para proteger tus datos y frenar abusos.",
    "cd.conversas": "Conversaciones",
    "cd.pontosCidadania": "{pontos} Puntos de Ciudadanía",
    "cd.onlineAgora": "En línea ahora",
    "cd.decisaoRotulo": "¿Cuál es la mejor actitud como ciudadano digital?",
    "cd.refazerCenario": "Rehacer este escenario",
    "cd.analisePedagogica": "Análisis Pedagógico:",
    "cd.horaAgora": "Ahora",
    "cd.cenariosAriaLabel": "Escenarios de Diálogo Digital",
    "cd.chat.phishing.nome": "Leo (Compañero de Juego)",
    "cd.chat.phishing.badge": "Phishing e Ingeniería Social (EF04CO04)",
    "cd.chat.phishing.previa": "¡Oye, encontré un sitio que da monedas gratis!",
    "cd.chat.phishing.msg": "¡Amigo, mira este sitio que regala 10.000 monedas y objetos en el juego hoy! Haz clic rápido y pon tu contraseña antes de que lo cierren: http://robl0x-free-coins.xyz/login",
    "cd.chat.phishing.opc1.texto": "¡Gracias Leo! Voy a hacer clic y poner mi contraseña para obtener las monedas.",
    "cd.chat.phishing.opc1.resposta": "¡Uf... caíste en la trampa! Mi cuenta fue hackeada y el atacante te envió ese enlace.",
    "cd.chat.phishing.opc1.feedback": "⚠️ CUIDADO: ¡Esto es un ataque de Phishing! El enlace tiene un dominio falso (.xyz). Ningún juego oficial pide tu contraseña en webs externas.",
    "cd.chat.phishing.opc2.texto": "No voy a entrar ahora, pero reenviaré el enlace al grupo de la clase.",
    "cd.chat.phishing.opc2.resposta": "¡No hagas eso! ¡El enlace es peligroso!",
    "cd.chat.phishing.opc2.feedback": "⚠️ ATENCIÓN: Reenviar enlaces sospechosos pone en peligro a amigos y familiares. Ante la duda, nunca difundas cadenas.",
    "cd.chat.phishing.opc3.texto": "¡Leo, es una estafa de Phishing! Mira esa dirección falsa (.xyz). Nadie regala monedas a cambio de contraseñas. ¡Cambia tu contraseña ya!",
    "cd.chat.phishing.opc3.resposta": "¡Me salvaste! Voy a cambiar mi contraseña ahora mismo antes de que me roben la cuenta.",
    "cd.chat.phishing.opc3.feedback": "🌟 EXCELENTE: Identificaste la URL falsa, protegiste tu cuenta y ayudaste a tu amigo. ¡Habilidad EF04CO04 dominada!",
    "cd.chat.cyberbullying.nome": "Grupo del 5º B",
    "cd.chat.cyberbullying.badge": "Convivencia Ética y Respeto (EF04CO04 / EF01CO05)",
    "cd.chat.cyberbullying.previa": "Miren la foto de Pedro en el recreo jajaja",
    "cd.chat.cyberbullying.msg": "[Foto de Pedro resbalando en un charco] 'Jajaja miren qué vergüenza lo de Pedro hoy. ¡Hagamos un sticker y compartámoslo!'",
    "cd.chat.cyberbullying.opc1.texto": "¡Jajaja voy a hacer el sticker y publicarlo en TikTok!",
    "cd.chat.cyberbullying.opc1.resposta": "[Pedro salió del grupo muy dolido]",
    "cd.chat.cyberbullying.opc1.feedback": "⚠️ GRAVE: Esto es Ciberacoso. Compartir fotos vergonzosas sin consentimiento causa daño real y viola las normas de convivencia.",
    "cd.chat.cyberbullying.opc2.texto": "Voy a silenciar el grupo y fingir que no vi nada.",
    "cd.chat.cyberbullying.opc2.resposta": "[Las burlas continúan sin que nadie intervenga]",
    "cd.chat.cyberbullying.opc2.feedback": "⚠️ REFLEXIÓN: El silencio permite que la agresión continúe. Ser un ciudadano consciente exige apoyar a quien sufre abusos.",
    "cd.chat.cyberbullying.opc3.texto": "Chicos, basta ya. ¿Cómo se sentirían ustedes? Borren esa foto, no creen stickers y respeten a Pedro.",
    "cd.chat.cyberbullying.opc3.resposta": "Tienen razón, fuimos demasiado lejos. Foto eliminada. ¡Perdón, Pedro!",
    "cd.chat.cyberbullying.opc3.feedback": "🌟 EJEMPLAR: Actuaste como defensor activo (Upstander), frenaste la falta de respeto y apoyaste al compañero. Habilidades EF01CO05 y EF04CO04.",
    "cd.chat.privacidade.nome": "ShadowGamer_99",
    "cd.chat.privacidade.badge": "Protección de Datos y Privacidad (EF02CO04)",
    "cd.chat.privacidade.previa": "¿Dónde vives? ¡Pasa tu WhatsApp!",
    "cd.chat.privacidade.msg": "¡Gran partida hoy! Pásame tu nombre completo, edad y el nombre de tu escuela para vernos mañana en persona.",
    "cd.chat.privacidade.opc1.texto": "Me llamo Lucas Silva, tengo 10 años y voy a la Escuela Municipal de 13h a 17h.",
    "cd.chat.privacidade.opc1.resposta": "Genial, ya sé dónde encontrarte mañana...",
    "cd.chat.privacidade.opc1.feedback": "⚠️ PELIGRO GRAVE: Nunca des tu nombre completo, edad, escuela o rutina a desconocidos en juegos en línea.",
    "cd.chat.privacidade.opc2.texto": "No diré mi escuela, pero mi teléfono es (99) 99999-9999.",
    "cd.chat.privacidade.opc2.resposta": "¡Anotado! Te llamo ahora.",
    "cd.chat.privacidade.opc2.feedback": "⚠️ RIESGO: Tu teléfono también es un dato personal sensible que desconocidos pueden usar para estafas.",
    "cd.chat.privacidade.opc3.texto": "No comparto información personal ni mi rutina en internet. Hablemos solo por el chat del propio juego.",
    "cd.chat.privacidade.opc3.resposta": "Tranquilo, haces bien en cuidarte. ¡Vamos a jugar!",
    "cd.chat.privacidade.opc3.feedback": "🌟 PERFECTO: Estableciste límites claros de privacidad y protegiste tus datos personales. Habilidad EF02CO04.",
    "cd.chat.fakenews.nome": "Tía Claudia (Familia)",
    "cd.chat.fakenews.badge": "Detective de Fake News (EF03CO04)",
    "cd.chat.fakenews.previa": "¡URGENTE! ¡Reenvíen a todos!",
    "cd.chat.fakenews.msg": "¡URGENTE! Reenvíen a todos: científicos avisan que mañana internet caerá en todo el mundo por 1 mes. ¡No beban agua del grifo! ¡Compartan para salvar vidas!",
    "cd.chat.fakenews.opc1.texto": "¡Dios mío tía! ¡Voy a mandarlo a todos mis grupos ya!",
    "cd.chat.fakenews.opc1.resposta": "[El rumor se difundió y generó alarma entre vecinos]",
    "cd.chat.fakenews.opc1.feedback": "⚠️ ATENCIÓN: Mensajes alarmistas llenos de signos de exclamación y sin fuentes oficiales son el formato clásico de Fake News.",
    "cd.chat.fakenews.opc2.texto": "Voy a guardar agua en casa por si acaso, pero no lo reenvío.",
    "cd.chat.fakenews.opc2.resposta": "Más vale prevenir, ¿no?",
    "cd.chat.fakenews.opc2.feedback": "⚠️ CONSEJO: Antes de preocuparte, haz una búsqueda rápida en medios informativos serios o sitios de gobierno.",
    "cd.chat.fakenews.opc3.texto": "Tía, busqué en portales oficiales y periódicos confiables: ¡es una noticia falsa! Por favor no lo reenvíes para no asustar a la gente.",
    "cd.chat.fakenews.opc3.resposta": "¡Qué bien que me avisaste! Ya mismo aclaro que me equivoqué y lo borro.",
    "cd.chat.fakenews.opc3.feedback": "🌟 BRILLANTE: Usaste el pensamiento crítico, contrastaste hechos y detuviste la desinformación. Habilidad EF03CO04.",
    "cd.sec2Titulo": "Cofre Digital: Probador de Contraseñas Seguras",
    "cd.sec2Desc": "Aprende a construir claves digitales inviolables. Observa en tiempo real cuánto tardaría una máquina en adivinar tu contraseña.",
    "cd.senhaLabel": "Escribe una contraseña para probar su fuerza:",
    "cd.senhaPlaceholder": "Ej: MiEscuela#2026!",
    "cd.senhaStatusPadrao": "Escribe una contraseña para probar",
    "cd.tempoQuebraPadrao": "Tiempo para descifrar: —",
    "cd.senhaMuitoFraca": "Muy Débil",
    "cd.senhaFraca": "Débil",
    "cd.senhaMedia": "Media / Buena",
    "cd.senhaExcelente": "¡Excelente y Segura!",
    "cd.quebrada0001": "Descifrada en: 0.001 segundos",
    "cd.quebradaMinutos": "Descifrada en: unos minutos",
    "cd.quebradaAnos": "Descifrada en: 2 a 3 años",
    "cd.quebrada500Anos": "Descifrada en: ¡Más de 500 años!",
    "cd.reqAriaLabel": "Requisitos para contraseña fuerte",
    "cd.req8Char": "Al menos 8 caracteres",
    "cd.reqMaiusc": "Letras mayúsculas y minúsculas",
    "cd.reqNum": "Al menos un número",
    "cd.reqSimb": "Símbolos (@, #, $, !, %)",
    "cd.dica1Titulo": "La Regla de los 4 Elementos (EF02CO04)",
    "cd.dica1Desc": "Contraseñas solo con números (como 123456) se descifran en milisegundos. Combinar letras, números y símbolos genera billones de posibilidades.",
    "cd.dica2Titulo": "Consejo Mnemotécnico para Estudiantes",
    "cd.dica2Desc": "Crea frases fáciles de recordar para ti pero imposibles de adivinar para otros. Ejemplo: <em>\"MeGustaLaAstronomiaEnIFMA#2026!\"</em>.",
    "cd.sec3Titulo": "Tu Huella Digital en el Mundo (EF05CO04)",
    "cd.sec3Desc": "Todo lo que compartes y registras en internet deja rastros permanentes. Marca tus hábitos para evaluar tu huella.",
    "cd.pegadaLimpaTitulo": "Huella Digital Limpia y Protegida",
    "cd.pegadaLimpaDesc": "Cuidas con esmero tu privacidad y mantienes tu identidad resguardada.",
    "cd.pegadaAtencaoTitulo": "Atención: Huella Digital Visible",
    "cd.pegadaAtencaoDesc": "Parte de tu rutina está pública. Desactiva ubicaciones y revisa quién ve tus publicaciones.",
    "cd.pegadaAlertaTitulo": "Alerta: ¡Huella Digital Vulnerable!",
    "cd.pegadaAlertaDesc": "Demasiados datos personales expuestos. Cualquiera podría rastrear tus pasos offline.",
    "cd.chkUniforme": "Publico fotos con uniforme escolar o mostrando la fachada de mi casa",
    "cd.chkGps": "Dejo la ubicación (GPS) pública en redes sociales",
    "cd.chkTermos": "Acepto términos de apps y juegos sin mirar qué datos recolectan",
    "cd.chkSenhaRepetida": "Uso la misma contraseña simple en correo, juegos y redes",
    "cd.rodapeFim": "Proyecto de Innovación SUAP/IFMA nº 14246/2025 · Startup LMS COMPASSO · Eje Cultura Digital.",
    "rodape.copyrightCulturaDigital": "Proyecto de Innovación SUAP/IFMA nº 14246/2025 · Startup LMS COMPASSO · Eje Cultura Digital.",

  en: {
    // Navigation
    'nav.inicio': 'Home',
    'nav.boasVindas': 'Welcome',
    'nav.atividades': 'Activities',
    'nav.mundoDigital': 'Digital World',
    'nav.culturaDigital': 'Digital Culture',
    'nav.buscar': 'Search',
    'nav.entrar': 'Sign in',
    'nav.criarConta': 'Create account',
    'nav.painel': 'Dashboard',
    'nav.sair': 'Sign out',
    'nav.buscarAriaLabel': 'Search curriculum activities',
    'nav.voltar': 'Back',
    'nav.proximo': 'Next',

    // Language Selector
    'i18n.rotuloSeletor': 'Change language. Current language: {atual}',
    'i18n.listaAriaLabel': 'Available languages',
    'i18n.anuncioTroca': 'Language switched to {nome}.',

    // Wayfinding & Breadcrumbs
    'wf.voceEstaAqui': 'You are here',
    'wf.voltarTrilhas': 'Back to Tracks',
    'wf.inicio': 'Home',
    'wf.pensamentoComputacional': 'Computational Thinking',
    'wf.atividadesLab3d': 'Activities & 3D Lab',

    // Curriculum Axes
    'eixo.pensamento-computacional': 'Computational Thinking',
    'eixo.mundo-digital': 'Digital World',
    'eixo.cultura-digital': 'Digital Culture',

    // Types
    'tipo.ordenar': 'Assemble sequence',
    'tipo.decompor': 'Decompose problem',
    'tipo.robo': 'Program robot',
    'tipo.blocos': 'Block programming',
    'tipo.python3d': '3D Python Lab',

    // Levels
    'nivel.1': 'Beginner',
    'nivel.2': 'Intermediate',
    'nivel.3': 'Challenge',

    // Grade levels
    'faixa.f1': '1st to 3rd grade',
    'faixa.f2': '4th & 5th grade',
    'faixa.f3': '6th to 9th grade',

    // Concepts
    'conceito.algoritmos': 'Everyday algorithms',
    'conceito.decomposicao': 'Logical decomposition',

    // Spotlight Hero (CinemaOS)
    'spotlight.destaqueAriaLabel': 'Featured Activity',
    'spotlight.kickerRecomendada': 'Next Recommended Mission',
    'spotlight.kickerRetomar': 'Continue where you left off',
    'spotlight.kickerConcluida': 'Curriculum Track Mastered!',
    'spotlight.comecarDesafio': 'Start Challenge',
    'spotlight.retomarAtividade': 'Resume Activity',
    'spotlight.jogarNovamente': 'Play Again',
    'spotlight.explorarGrade': 'Explore Grid ({total})',
    'spotlight.certificado3d': '3D Certificate ({concluidas}/{total})',
    'spotlight.certificado3dTitulo': 'Official 3D Python Explorer Certificate',
    'spotlight.trilhaProgresso': 'Activity Track: {concluidas} of {total} completed ({percentual}%)',
    'spotlight.xpConquistados': '+{xp} XP earned',
    'spotlight.cliqueParaJogar': 'Click to play',
    'spotlight.proximaAtividade': 'Next activity',
    'spotlight.verTodas': 'View all activities',

    // Discovery Toolbar & Filters
    'toolbar.secaoAriaLabel': 'General Activity Catalog',
    'toolbar.buscaPlaceholder': 'Search by title, concept or skill code (e.g., EF05CO01, Hanoi, Robot)...',
    'toolbar.buscaAriaLabel': 'Search activities by name or skill code',
    'toolbar.limparBusca': 'Clear search',
    'toolbar.todas': 'All',
    'toolbar.python3d': 'Python 3D',
    'toolbar.algoritmos': 'Algorithms',
    'toolbar.decomposicao': 'Decomposition',
    'toolbar.robo': 'Robot on Map',
    'toolbar.blocos': 'Blocks',
    'toolbar.filtros': 'Filters',
    'toolbar.anoEscolar': 'School year:',
    'toolbar.todosAnos': 'All years',
    'toolbar.habilidadeBncc': 'Curriculum Skill:',
    'toolbar.todasHabilidades': 'All curriculum skills',
    'toolbar.limparFiltros': 'Clear advanced filters',

    // Cards & Progress States
    'card.naoIniciado': 'Not started',
    'card.emAndamento': 'In progress',
    'card.concluido': 'Completed',
    'card.comecar': 'Start',
    'card.continuar': 'Continue',
    'card.jogarDeNovo': 'Play again',
    'card.min': 'min',

    // Empty State / Search
    'vazio.titulo': 'No activities found for this filter',
    'vazio.descricao': 'Try clearing active filters or return to the full catalog.',
    'vazio.mostrarTodas': 'Show all activities',
    'vazio.irInicio': 'Go to home',

    // Home
    'home.eyebrow': 'Innovation Project SUAP/IFMA · Startup LMS COMPASSO',
    'home.titulo': 'Computer Science at school, step by step.',
    'home.lead': 'LMS COMPASSO is a lightweight open platform helping schools and school districts teach Computational Thinking, Digital World, and Digital Culture in K-9 education.',
    'home.ctaAtividade': 'Try an activity',
    'home.ctaBoasVindas': 'Welcome & Partners',
    'home.ctaEntrar': 'Sign in to platform',

    // Activities
    'atv.ordenar-escovar-dentes.titulo': 'Assemble algorithm: brushing teeth',
    'atv.ordenar-escovar-dentes.resumo': 'Put the steps of brushing teeth in the right order.',
    'atv.ordenar-atravessar-rua.titulo': 'Assemble algorithm: crossing the street safely',
    'atv.ordenar-atravessar-rua.resumo': 'Organize the steps to cross the street and leave out dangerous ones.',
    'atv.ordenar-sanduiche.titulo': 'Assemble algorithm: making a sandwich',
    'atv.ordenar-sanduiche.resumo': 'Discover the ingredient sequence to build a tasty sandwich.',
    'atv.py3d-labirinto-1.titulo': '3D Maze: First Steps in Python',
    'atv.py3d-labirinto-1.resumo': 'Control a 3D robot in real time running Python commands right in your browser.',

    // Footer
    'rodape.plataforma': 'Platform',
    'rodape.projeto': 'Project',
    'rodape.descricao': 'Open platform for teaching Computer Science in Elementary and Middle School, aligned with the Brazilian National Curriculum (BNCC).',
    'rodape.paginaInicial': 'Home page',
    'rodape.boasVindas': 'Welcome & Partners',
    'rodape.mundoDigital': 'Digital World (3D Hardware)',
    'rodape.culturaDigital': 'Digital Culture (Chat Simulator)',
    'rodape.entrar': 'Sign in',
    'rodape.criarConta': 'Create student account',
    'rodape.codigoGithub': 'Code on GitHub',
    'rodape.comoCriar': 'How to create activities',
    'rodape.licenca': 'MIT License',
    'rodape.fim': 'Innovation Project SUAP/IFMA nº 14246/2025 · Startup LMS COMPASSO · IFMA Campus Grajaú.',

    // Digital World — Metadata and Wayfinding
    'md.metaTitulo': 'Digital World — 3D Hardware & Networks Lab — LMS COMPASSO',
    'md.metaDesc': 'Interactive laboratory for the Digital World strand aligned with the Computer Science Curriculum: explore the motherboard in 3D, build components, understand the CPU cycle, and simulate internet packet traffic.',
    'md.badgeEixo': 'Strand 2 · Computer Science Curriculum',
    'md.heroTitulo': 'Digital World: <span>Hardware & Networks</span>',
    'md.heroDesc': 'How do computers really think, store memories, and communicate across cables and radio waves? Explore the interactive 3D motherboard, inspect the running CPU, and follow data packets traveling across the internet.',
    'md.ctaPlaca': 'Explore 3D Motherboard',
    'md.ctaCpu': 'Simulate CPU Cycle',
    'md.ctaRedes': 'Internet Packet Traffic',
    'md.tagEF01CO04': 'I/O Peripherals',
    'md.tagEF02CO03': 'Components & Memory',
    'md.tagEF04CO03': 'Data & Networks',
    'md.tagEF05CO03': 'CPU Architecture',
    'md.tagEF69CO05': 'Routing & Internet',

    // Section 1: 3D Motherboard & PC Builder
    'md.sec1Titulo': '3D Motherboard: X-Ray & PC Builder',
    'md.sec1Desc': 'Click components to inspect their educational function or take the assembly challenge to snap parts into place and power on the system.',
    'md.statusPostEspera': 'Standby (Powered Off)',
    'md.statusPostAtivo': 'POST Completed (Operating System Active)',
    'md.ariaVisualizacao': 'Motherboard viewing modes',
    'md.vistaIsometrica': '3D Isometric',
    'md.vistaTopo': 'Top',
    'md.vistaLateral': 'Side Profile',
    'md.compCpuRotulo': 'Processor',
    'md.compRamRotulo': 'RAM Memory',
    'md.compSsdRotulo': 'SSD Storage',
    'md.compGpuRotulo': 'Dedicated GPU',
    'md.compIoRotulo': 'I/O Ports',
    'md.analogiaTitulo': 'Educational Analogy',

    // Hardware Specs Labels
    'md.spec.velTipica': 'Typical Clock Speed',
    'md.spec.unidInternas': 'Internal Units',
    'md.spec.bncc': 'Curriculum Standard',
    'md.spec.tecAtual': 'Current Technology',
    'md.spec.volatilidade': 'Volatility',
    'md.spec.interface': 'Interface',
    'md.spec.memoria': 'Memory',
    'md.spec.saidasVideo': 'Video Outputs',
    'md.spec.entradas': 'Inputs',
    'md.spec.saidas': 'Outputs',

    // CPU Data
    'md.cpu.nome': 'Central Processing Unit (CPU)',
    'md.cpu.categoria': 'Processing Unit (Brain of the Computer)',
    'md.cpu.desc': 'The CPU executes instructions from all programs. It evaluates arithmetic and logic calculations through billions of electrical cycles per second.',
    'md.cpu.analogia': 'Like the Head Chef in a restaurant kitchen: receives orders (instructions), prepares recipes, and directs the kitchen staff.',
    'md.cpu.spec1': '3.2 to 5.0 GHz (Billions of cycles/s)',
    'md.cpu.spec2': 'ALU (Math), CU (Control), Registers',
    'md.cpu.spec3': 'EF05CO03 (Architecture & Instruction Cycle)',

    // RAM Data
    'md.ram.nome': 'Main Memory (DDR5 RAM)',
    'md.ram.categoria': 'High-Speed Volatile Primary Storage',
    'md.ram.desc': 'RAM temporarily holds the data that the CPU needs to access right away. It is ultra-fast but volatile: turning off the computer clears everything inside.',
    'md.ram.analogia': 'Like a student desk: while studying, textbooks and notes are laid out open. When class ends, the desk is wiped clean.',
    'md.ram.spec1': 'DDR5 at 5600 MT/s',
    'md.ram.spec2': 'Yes (Erased without power)',
    'md.ram.spec3': 'EF02CO03 (RAM vs. Storage Differences)',

    // SSD Data
    'md.ssd.nome': 'Secondary Storage (NVMe M.2 SSD)',
    'md.ssd.categoria': 'Permanent Non-Volatile Storage',
    'md.ssd.desc': 'The SSD permanently stores operating systems, photos, games, and documents on flash memory chips that retain data without electricity.',
    'md.ssd.analogia': 'Like a student backpack or home bookshelf: even after going to sleep, all your books remain securely stored.',
    'md.ssd.spec1': 'PCIe 4.0 NVMe (Up to 7,000 MB/s)',
    'md.ssd.spec2': 'Non-volatile (Permanent)',
    'md.ssd.spec3': 'EF02CO03 (Persistent Data Storage)',

    // GPU Data
    'md.gpu.nome': 'Dedicated Graphics Card (GPU)',
    'md.gpu.categoria': 'Parallel & Graphics Processing',
    'md.gpu.desc': 'The GPU contains thousands of small cores engineered to compute millions of geometric polygons, textures, and lighting effects simultaneously in real time.',
    'md.gpu.analogia': 'If the CPU is a single brilliant scientist, the GPU is an army of 5,000 artists drawing every pixel of the scene at the same time.',
    'md.gpu.spec1': 'Dedicated GDDR6 VRAM',
    'md.gpu.spec2': 'HDMI 2.1 & DisplayPort 1.4',
    'md.gpu.spec3': 'EF01CO04 (Peripherals & Visual Output)',

    // IO Data
    'md.io.nome': 'Rear Connection Panel (I/O Ports)',
    'md.io.categoria': 'Input / Output Interface',
    'md.io.desc': 'The physical connection hub linking the computer to the world: USB for inputs (keyboard/mouse), HDMI for display, and RJ-45 for wired networking.',
    'md.io.analogia': 'Like doors and windows in a house: where letters arrive (data in) and through which occupants talk to the outside.',
    'md.io.spec1': 'USB (Keyboard, Mouse, Mic)',
    'md.io.spec2': 'HDMI (Monitor), Audio (Speakers)',
    'md.io.spec3': 'EF01CO04 / EF02CO03 (I/O Classification)',

    // PC Builder Challenge
    'md.pcBuilderTitulo': 'Challenge: Build the Computer',
    'md.pcBuilderProgresso': '{instalados} / {total} Installed',
    'md.pcEtapa1': '1. Insert Processor into Socket',
    'md.pcEtapa2': '2. Install DDR5 RAM Stick',
    'md.pcEtapa3': '3. Connect M.2 NVMe SSD',
    'md.pcEtapa4': '4. Seat Graphics Card in PCIe Slot',
    'md.pcEtapa5': '5. Power On & Run Startup POST',
    'md.btnEncaixar': 'Snap In Next Component',
    'md.btnLigar': 'Turn On Computer (POST)',
    'md.btnMontado': 'PC Fully Assembled & Active!',
    'md.btnReiniciar': 'Reset',

    // Section 2: CPU Cycle
    'md.sec2Titulo': 'The CPU Clock Cycle',
    'md.sec2Desc': 'How do billions of microscopic transistors transform electrical pulses into real software actions? Discover the Fetch-Decode-Execute pipeline.',
    'md.cpuIrTitulo': 'Instruction Register (IR)',
    'md.cpuUcTitulo': 'Control Unit (CU)',
    'md.cpuUcConteudo': 'Decoder: Arithmetic Operation',
    'md.cpuUlaTitulo': 'Arithmetic Logic Unit (ALU)',
    'md.cpuFase1': 'Phase 1',
    'md.cpuBuscaTitulo': 'Fetch',
    'md.cpuBuscaDesc': 'The memory address is referenced and the next instruction is retrieved from RAM into the CPU internal Instruction Register.',
    'md.cpuFase2': 'Phase 2',
    'md.cpuDecodificaTitulo': 'Decode',
    'md.cpuDecodificaDesc': 'The Control Unit decodes binary bits and determines which internal circuits and registers need to be activated.',
    'md.cpuFase3': 'Phase 3',
    'md.cpuExecutaTitulo': 'Execute',
    'md.cpuExecutaDesc': 'The ALU calculates the arithmetic equation or logic comparison and stores the answer in the Accumulator register.',
    'md.cpuAguardandoOperandos': 'Waiting for Operands...',
    'md.cpuCarregadoValores': 'Loaded: 5 and 3',
    'md.cpuInstrucaoConcluida': 'Instruction Finished',
    'md.cpuResultado': 'Result: 8 (00001000₂)',
    'md.btnCpuPasso': 'Step by Step Advance',
    'md.btnCpuAuto': 'Auto Clock Cycle',
    'md.btnCpuPausar': 'Pause Cycle',

    // Section 3: Networks & TCP/IP Packets
    'md.sec3Titulo': 'How Do Data Packets Travel the Internet?',
    'md.sec3Desc': 'Photos and messages never travel in one piece: they are split into packets labeled with IP addresses and reassembled at the destination.',
    'md.redeNoAluno': 'Student Computer',
    'md.redeNoRoteador': 'Wi-Fi Router',
    'md.redeNoProvedor': 'ISP & Fiber Backbone',
    'md.redeNoServidor': 'COMPASSO Server',
    'md.redeProtocoloRotulo': 'Protocol:',
    'md.redeSeqRotulo': 'Sequence (SYN):',
    'md.redePayloadRotulo': 'Payload:',
    'md.redePayloadValor': '"Hello School! Activity Completed"',
    'md.redeStatusRotulo': 'Delivery Status:',
    'md.redeStatusPronto': 'Ready to Send',
    'md.redeStatusEnviando': 'Sending TCP packets through network routers...',
    'md.redeStatusSucesso': '✅ Packets delivered and reassembled on LMS COMPASSO server!',
    'md.redeStatusPerda': '❌ Packet 2 dropped along the path! TCP protocol successfully retransmitted (ACK 3).',
    'md.btnDispararPacote': 'Transmit Data Packet',
    'md.btnSimularPerda': 'Simulate Packet Drop (TCP Retransmit)',
    'md.btnPerdaAtivada': '⚠️ Packet Drop: Enabled',

    // Wayfinding & Footer
    'wf.eixosBncc': 'Curriculum Strands',
    'wf.mundoDigital': 'Digital World',
    'rodape.eixos': 'Curriculum Strands',
    'rodape.acessoRapido': 'Quick Links',
    'rodape.copyrightMundoDigital': 'Innovation Project SUAP/IFMA nº 14246/2025 · Startup LMS COMPASSO · Digital World Strand.',    'cd.metaTitulo': 'Digital Culture — Citizenship & Dialogue — LMS COMPASSO',

    // Cultura Digital (Eixo 3 BNCC)
    "cd.metaTitulo": "Digital Culture — Citizenship & Dialogue — LMS COMPASSO",
    "cd.metaDesc": "Interactive lab for the Digital Culture Strand aligned with the Computing Curriculum: make ethical decisions in interactive chats, spot phishing and fake news, protect your digital footprint, and test password strength.",
    "cd.pularConteudo": "Skip to main content",
    "cd.voltarMundoDigital": "Back to Digital World",
    "cd.culturaDigital": "Digital Culture",
    "cd.eixoBncc": "Strand 3 · Computing Curriculum",
    "cd.heroTitulo": "Digital Culture: <span>Online Citizenship & Ethics</span>",
    "cd.heroDesc": "How do we navigate safely, distinguish truth from rumors, and build mutual respect online? Make decisions in simulated conversations, uncover phishing scams, test password resilience, and measure your digital footprint.",
    "cd.ctaChat": "Start Interactive Chat",
    "cd.ctaCofre": "Secure Password Vault",
    "cd.ctaPegada": "Digital Footprint Meter",
    "cd.tagEF01CO05": "Ethics & Respect",
    "cd.tagEF02CO04": "Data Protection",
    "cd.tagEF03CO04": "Fake News & Facts",
    "cd.tagEF04CO04": "Phishing & Cyberbullying",
    "cd.tagEF05CO04": "Digital Footprint",
    "cd.sec1Titulo": "ZapCompasso: Dialogue & Citizenship Simulator",
    "cd.sec1Desc": "Select a contact from the sidebar, examine incoming messages, and make the right decision to safeguard your data and stop online abuse.",
    "cd.conversas": "Chats",
    "cd.pontosCidadania": "{pontos} Citizenship Points",
    "cd.onlineAgora": "Online now",
    "cd.decisaoRotulo": "What is the best action as a digital citizen?",
    "cd.refazerCenario": "Redo this scenario",
    "cd.analisePedagogica": "Pedagogical Analysis:",
    "cd.horaAgora": "Now",
    "cd.cenariosAriaLabel": "Digital Dialogue Scenarios",
    "cd.chat.phishing.nome": "Leo (Gaming Pal)",
    "cd.chat.phishing.badge": "Phishing & Social Engineering (EF04CO04)",
    "cd.chat.phishing.previa": "Dude, I found a site giving away free coins!",
    "cd.chat.phishing.msg": "Dude, look at this site giving away 10,000 free coins and items in the game today! Click fast and enter your login and password before it is taken down: http://robl0x-free-coins.xyz/login",
    "cd.chat.phishing.opc1.texto": "Thanks Leo! Clicking right now and entering my password to grab the coins.",
    "cd.chat.phishing.opc1.resposta": "Oh no... You fell for the scam! My account was hacked and the attacker sent that link to you!",
    "cd.chat.phishing.opc1.feedback": "⚠️ WATCH OUT: This is a Phishing attack! The link has a fake domain (.xyz). No official game asks for your password on external sites. Your credentials would be stolen.",
    "cd.chat.phishing.opc2.texto": "I will not click now, but I will forward the link to our class group.",
    "cd.chat.phishing.opc2.resposta": "Do not do that! That link is dangerous!",
    "cd.chat.phishing.opc2.feedback": "⚠️ CAUTION: Forwarding suspicious links puts your friends and family at risk. When in doubt, never spread viral chains.",
    "cd.chat.phishing.opc3.texto": "Leo, this is a Phishing scam! Look at that fake (.xyz) address. Nobody gives coins for passwords. Change your password immediately if you logged in there!",
    "cd.chat.phishing.opc3.resposta": "Wow, you saved me! Changing my password right away before they steal my account!",
    "cd.chat.phishing.opc3.feedback": "🌟 EXCELLENT: You recognized the fraudulent URL, secured your account, and helped your friend reset their compromised password. Skill EF04CO04 mastered!",
    "cd.chat.cyberbullying.nome": "Class 5B Group",
    "cd.chat.cyberbullying.badge": "Ethical Coexistence & Respect (EF04CO04 / EF01CO05)",
    "cd.chat.cyberbullying.previa": "Look at Pedro falling in the yard lol",
    "cd.chat.cyberbullying.msg": "[Shared photo of Pedro slipping into a puddle] 'Lol look at Pedro humiliating himself at recess! Let\\'s make a meme sticker and spam it everywhere!'",
    "cd.chat.cyberbullying.opc1.texto": "Hahaha making the sticker right now and posting on TikTok!",
    "cd.chat.cyberbullying.opc1.resposta": "[Pedro left the group feeling hurt]",
    "cd.chat.cyberbullying.opc1.feedback": "⚠️ SERIOUS: This is Cyberbullying. Sharing embarrassing images without consent inflicts real harm and violates school and community safety rules.",
    "cd.chat.cyberbullying.opc2.texto": "I will just mute the group and pretend I did not see anything.",
    "cd.chat.cyberbullying.opc2.resposta": "[The teasing continues with nobody stepping in]",
    "cd.chat.cyberbullying.opc2.feedback": "⚠️ REFLECTION: Silence enables harassment to continue. Conscious digital citizenship means actively supporting peers when they are mistreated.",
    "cd.chat.cyberbullying.opc3.texto": "Guys, cut it out. Imagine if it were you! Delete that photo, do not make stickers, and treat Pedro with respect.",
    "cd.chat.cyberbullying.opc3.resposta": "You are right everyone, we crossed the line. Photo deleted. Sorry Pedro!",
    "cd.chat.cyberbullying.opc3.feedback": "🌟 EXEMPLARY: You acted as an active Upstander, using your digital voice to stop hostility and show empathy. Skills EF01CO05 and EF04CO04!",
    "cd.chat.privacidade.nome": "ShadowGamer_99",
    "cd.chat.privacidade.badge": "Data Protection & Privacy (EF02CO04)",
    "cd.chat.privacidade.previa": "Where do you live? Share your WhatsApp!",
    "cd.chat.privacidade.msg": "Awesome match today! Send me your full name, age, and school name so we can hang out and play in person tomorrow!",
    "cd.chat.privacidade.opc1.texto": "My name is Lucas Silva, I am 10 years old and I attend Municipal School from 1pm to 5pm.",
    "cd.chat.privacidade.opc1.resposta": "Cool, now I know where to find you tomorrow...",
    "cd.chat.privacidade.opc1.feedback": "⚠️ DANGER: Never share your full name, age, school, or daily schedule with strangers in online games. Your personal identity must stay private!",
    "cd.chat.privacidade.opc2.texto": "I will not share my school, but my phone number is (99) 99999-9999.",
    "cd.chat.privacidade.opc2.resposta": "Got it! Calling you right now.",
    "cd.chat.privacidade.opc2.feedback": "⚠️ RISK: Your phone number is also sensitive private data. Strangers can exploit it for unsolicited calls, stalking, or scams.",
    "cd.chat.privacidade.opc3.texto": "I do not share personal details or my daily routine on the internet. We can only communicate through the in-game chat.",
    "cd.chat.privacidade.opc3.resposta": "Fair enough, good call keeping safe. Let us focus on the match!",
    "cd.chat.privacidade.opc3.feedback": "🌟 PERFECT: You set firm privacy boundaries and recognized that sensitive personal data should never circulate freely. Skill EF02CO04!",
    "cd.chat.fakenews.nome": "Aunt Claudia (Family)",
    "cd.chat.fakenews.badge": "Fake News Detective (EF03CO04)",
    "cd.chat.fakenews.previa": "URGENT! Forward to everyone!",
    "cd.chat.fakenews.msg": "URGENT!!! Forward to everyone: scientists warn that tomorrow the entire global internet will shut down for 1 month! Do not drink tap water! Share to save lives!!",
    "cd.chat.fakenews.opc1.texto": "Oh my gosh Auntie! Sending this to all my groups right now!",
    "cd.chat.fakenews.opc1.resposta": "[The rumor went viral and caused panic among neighbors]",
    "cd.chat.fakenews.opc1.feedback": "⚠️ CAUTION: Alarmist posts packed with exclamation marks and zero credible sources are classic Fake News. Forwarding without verification spreads harmful panic.",
    "cd.chat.fakenews.opc2.texto": "I will stock up on bottled water just in case, but I will not share it.",
    "cd.chat.fakenews.opc2.resposta": "Better safe than sorry, right?",
    "cd.chat.fakenews.opc2.feedback": "⚠️ TIP: Before worrying or reacting, run a quick check on reputable news websites or government portals.",
    "cd.chat.fakenews.opc3.texto": "Auntie, I checked official science outlets and verified news: this is completely fake news (a hoax)! Please do not forward it so people do not panic.",
    "cd.chat.fakenews.opc3.resposta": "Oh dear, thank you so much for warning me! I will tell everyone I was mistaken and delete it.",
    "cd.chat.fakenews.opc3.feedback": "🌟 BRILLIANT: You applied critical thinking, verified facts across trusted sources, and broke the chain of misinformation. Skill EF03CO04!",
    "cd.sec2Titulo": "Digital Vault: Secure Password Tester",
    "cd.sec2Desc": "Learn how to forge uncrackable digital keys. See in real time how long a computer would take to guess your password.",
    "cd.senhaLabel": "Type a password to test its strength:",
    "cd.senhaPlaceholder": "E.g.: MySchool#2026!",
    "cd.senhaStatusPadrao": "Enter a password to test",
    "cd.tempoQuebraPadrao": "Time to crack: —",
    "cd.senhaMuitoFraca": "Very Weak",
    "cd.senhaFraca": "Weak",
    "cd.senhaMedia": "Medium / Fair",
    "cd.senhaExcelente": "Excellent & Secure!",
    "cd.quebrada0001": "Cracked in: 0.001 seconds",
    "cd.quebradaMinutos": "Cracked in: a few minutes",
    "cd.quebradaAnos": "Cracked in: 2 to 3 years",
    "cd.quebrada500Anos": "Cracked in: Over 500 years!",
    "cd.reqAriaLabel": "Requirements for a strong password",
    "cd.req8Char": "At least 8 characters",
    "cd.reqMaiusc": "Uppercase and lowercase letters",
    "cd.reqNum": "At least one number",
    "cd.reqSimb": "Symbols (@, #, $, !, %)",
    "cd.dica1Titulo": "The 4-Element Rule (EF02CO04)",
    "cd.dica1Desc": "Passwords with only numbers (like 123456 or birthdays) are cracked in milliseconds by automated tools. Blending words with numbers and symbols yields trillions of combinations.",
    "cd.dica2Titulo": "Mnemonic Tip for Students",
    "cd.dica2Desc": "Craft memorable phrases that are easy for you to recall, yet impossible for others to guess. Example: <em>\"ILoveAstronomyAtIFMA#2026!\"</em>.",
    "cd.sec3Titulo": "Your Digital Footprint in the World (EF05CO04)",
    "cd.sec3Desc": "Everything you like, share, and sign up for online leaves permanent traces. Check your daily habits to evaluate your footprint status.",
    "cd.pegadaLimpaTitulo": "Clean & Protected Digital Footprint",
    "cd.pegadaLimpaDesc": "You actively protect your privacy, avoid sharing sensitive details, and keep your identity secure.",
    "cd.pegadaAtencaoTitulo": "Warning: Visible Digital Footprint",
    "cd.pegadaAtencaoDesc": "Some daily routine details are public. Turn off location sharing and review who can view your posts.",
    "cd.pegadaAlertaTitulo": "Alert: Vulnerable Digital Footprint!",
    "cd.pegadaAlertaDesc": "Too much personal and schedule data is exposed. Strangers could easily track your offline whereabouts.",
    "cd.chkUniforme": "I post photos wearing my school uniform or showing my home front door",
    "cd.chkGps": "I keep public GPS location enabled on social media platforms",
    "cd.chkTermos": "I accept app and game terms of service without checking what data they collect",
    "cd.chkSenhaRepetida": "I reuse the same simple password across email, games, and social media",
    "cd.rodapeFim": "Innovation Project SUAP/IFMA nº 14246/2025 · Startup LMS COMPASSO · Digital Culture Strand.",
    "rodape.copyrightCulturaDigital": "Innovation Project SUAP/IFMA nº 14246/2025 · Startup LMS COMPASSO · Digital Culture Strand.",
  },

  es: {
    'nav.inicio': 'Inicio',
    'nav.boasVindas': 'Bienvenida',
    'nav.atividades': 'Actividades',
    'nav.mundoDigital': 'Mundo Digital',
    'nav.culturaDigital': 'Cultura Digital',
    'nav.buscar': 'Buscar',
    'nav.entrar': 'Iniciar sesión',
    'nav.criarConta': 'Crear cuenta',
    'nav.painel': 'Panel',
    'nav.sair': 'Cerrar sesión',
    'nav.buscarAriaLabel': 'Buscar actividades curriculares',
    'nav.voltar': 'Volver',
    'nav.proximo': 'Siguiente',
    'i18n.rotuloSeletor': 'Cambiar idioma. Idioma actual: {atual}',
    'i18n.listaAriaLabel': 'Idiomas disponibles',
    'i18n.anuncioTroca': 'Idioma cambiado a {nome}.',
    'wf.voceEstaAqui': 'Estás aquí',
    'wf.voltarTrilhas': 'Volver a Rutas',
    'wf.inicio': 'Inicio',
    'wf.pensamentoComputacional': 'Pensamiento Computacional',
    'wf.atividadesLab3d': 'Actividades y Laboratorio 3D',
    'eixo.pensamento-computacional': 'Pensamiento Computacional',
    'eixo.mundo-digital': 'Mundo Digital',
    'eixo.cultura-digital': 'Cultura Digital',
    'tipo.ordenar': 'Armar secuencia',
    'tipo.decompor': 'Dividir el problema',
    'tipo.robo': 'Programar el robot',
    'tipo.blocos': 'Programación en bloques',
    'tipo.python3d': 'Laboratorio 3D Python',
    'nivel.1': 'Principiante',
    'nivel.2': 'Intermedio',
    'nivel.3': 'Desafío',
    'faixa.f1': '1º a 3º año',
    'faixa.f2': '4º y 5º año',
    'faixa.f3': '6º a 9º año',
    'conceito.algoritmos': 'Algoritmos cotidianos',
    'conceito.decomposicao': 'Descomposición lógica',
    'spotlight.destaqueAriaLabel': 'Actividad Destacada',
    'spotlight.kickerRecomendada': 'Próxima Misión Recomendada',
    'spotlight.kickerRetomar': 'Continuar donde lo dejaste',
    'spotlight.kickerConcluida': '¡Ruta Curricular Dominada!',
    'spotlight.comecarDesafio': 'Comenzar Desafío',
    'spotlight.retomarAtividade': 'Reanudar Actividad',
    'spotlight.jogarNovamente': 'Jugar de Nuevo',
    'spotlight.explorarGrade': 'Explorar Cuadrícula ({total})',
    'spotlight.certificado3d': 'Certificado 3D ({concluidas}/{total})',
    'spotlight.certificado3dTitulo': 'Certificado Oficial Explorador Python 3D',
    'spotlight.trilhaProgresso': 'Ruta de Actividades: {concluidas} de {total} completadas ({percentual}%)',
    'spotlight.xpConquistados': '+{xp} XP ganados',
    'spotlight.cliqueParaJogar': 'Haz clic para jugar',
    'spotlight.proximaAtividade': 'Próxima actividad',
    'spotlight.verTodas': 'Ver todas las actividades',
    'toolbar.secaoAriaLabel': 'Catálogo General de Actividades',
    'toolbar.buscaPlaceholder': 'Buscar por título, concepto o código curricular (ej.: EF05CO01, Hanoi, Robot)...',
    'toolbar.buscaAriaLabel': 'Buscar actividades por nombre o código de habilidad',
    'toolbar.limparBusca': 'Limpiar búsqueda',
    'toolbar.todas': 'Todas',
    'toolbar.python3d': 'Python 3D',
    'toolbar.algoritmos': 'Algoritmos',
    'toolbar.decomposicao': 'Descomposición',
    'toolbar.robo': 'Robot en Mapa',
    'toolbar.blocos': 'Bloques',
    'toolbar.filtros': 'Filtros',
    'toolbar.anoEscolar': 'Año escolar:',
    'toolbar.todosAnos': 'Todos los años',
    'toolbar.habilidadeBncc': 'Habilidad Curricular:',
    'toolbar.todasHabilidades': 'Todas las habilidades curriculares',
    'toolbar.limparFiltros': 'Limpiar filtros avanzados',
    'card.naoIniciado': 'No iniciado',
    'card.emAndamento': 'En progreso',
    'card.concluido': 'Completado',
    'card.comecar': 'Comenzar',
    'card.continuar': 'Continuar',
    'card.jogarDeNovo': 'Jugar de nuevo',
    'card.min': 'min',
    'vazio.titulo': 'No se encontraron actividades para este filtro',
    'vazio.descricao': 'Intenta limpiar los filtros activos o vuelve al catálogo completo.',
    'vazio.mostrarTodas': 'Mostrar todas las actividades',
    'vazio.irInicio': 'Ir al inicio',
    'atv.ordenar-escovar-dentes.titulo': 'Arma el algoritmo: cepillarse los dientes',
    'atv.ordenar-escovar-dentes.resumo': 'Pon los pasos para cepillarte los dientes en el orden correcto.',
    'atv.ordenar-atravessar-rua.titulo': 'Arma el algoritmo: cruzar la calle con seguridad',
    'atv.ordenar-atravessar-rua.resumo': 'Organiza los pasos para cruzar la calle y descarta los peligrosos.',
    'atv.ordenar-sanduiche.titulo': 'Arma el algoritmo: preparar un sándwich',
    'atv.ordenar-sanduiche.resumo': 'Descubre el orden de los ingredientes para preparar un sándwich sabroso.',
    'atv.py3d-labirinto-1.titulo': 'Laberinto 3D: Primeros Pasos en Python',
    'atv.py3d-labirinto-1.resumo': 'Controla un robot 3D en tiempo real ejecutando comandos Python en el navegador.',
  },

  de: {
    // Navigation mit langen Begriffen
    'nav.inicio': 'Startseite',
    'nav.boasVindas': 'Willkommen',
    'nav.atividades': 'Aktivitäten',
    'nav.mundoDigital': 'Digitale Welt',
    'nav.culturaDigital': 'Digitale Kultur',
    'nav.buscar': 'Suchen',
    'nav.entrar': 'Anmelden',
    'nav.criarConta': 'Konto erstellen',
    'nav.painel': 'Dashboard',
    'nav.sair': 'Abmelden',
    'nav.buscarAriaLabel': 'Lehrplan-Aktivitäten suchen',
    'nav.voltar': 'Zurück',
    'nav.proximo': 'Weiter',

    // Seletor
    'i18n.rotuloSeletor': 'Sprache ändern. Aktuelle Sprache: {atual}',
    'i18n.listaAriaLabel': 'Verfügbare Sprachen',
    'i18n.anuncioTroca': 'Sprache gewechselt zu {nome}.',

    // Wayfinding
    'wf.voceEstaAqui': 'Sie sind hier',
    'wf.voltarTrilhas': 'Zurück zu Lernpfaden',
    'wf.inicio': 'Startseite',
    'wf.pensamentoComputacional': 'Informatisches Denken',
    'wf.atividadesLab3d': 'Aktivitäten & 3D-Labor',

    // Eixos
    'eixo.pensamento-computacional': 'Informatisches Denken',
    'eixo.mundo-digital': 'Digitale Welt',
    'eixo.cultura-digital': 'Digitale Kultur',

    // Typen
    'tipo.ordenar': 'Schrittfolge ordnen',
    'tipo.decompor': 'Problem zerlegen',
    'tipo.robo': 'Roboter programmieren',
    'tipo.blocos': 'Block-Programmierung',
    'tipo.python3d': '3D-Python-Labor',

    // Niveaus
    'nivel.1': 'Anfänger',
    'nivel.2': 'Mittelstufe',
    'nivel.3': 'Herausforderung',

    // Klassenstufen
    'faixa.f1': '1. bis 3. Klasse',
    'faixa.f2': '4. und 5. Klasse',
    'faixa.f3': '6. bis 9. Klasse',

    // Konzepte
    'conceito.algoritmos': 'Alltagsalgorithmen',
    'conceito.decomposicao': 'Logische Problemzerlegung',

    // Spotlight
    'spotlight.destaqueAriaLabel': 'Empfohlene Aktivität',
    'spotlight.kickerRecomendada': 'Nächste empfohlene Mission',
    'spotlight.kickerRetomar': 'Weitermachen, wo Sie aufgehört haben',
    'spotlight.kickerConcluida': 'Lernpfad gemeistert!',
    'spotlight.comecarDesafio': 'Herausforderung starten',
    'spotlight.retomarAtividade': 'Aktivität fortsetzen',
    'spotlight.jogarNovamente': 'Nochmal spielen',
    'spotlight.explorarGrade': 'Raster erkunden ({total})',
    'spotlight.certificado3d': '3D-Zertifikat ({concluidas}/{total})',
    'spotlight.certificado3dTitulo': 'Offizielles 3D-Python-Entdecker-Zertifikat',
    'spotlight.trilhaProgresso': 'Aktivitäten-Track: {concluidas} von {total} abgeschlossen ({percentual}%)',
    'spotlight.xpConquistados': '+{xp} XP erhalten',
    'spotlight.cliqueParaJogar': 'Klicken zum Spielen',
    'spotlight.proximaAtividade': 'Nächste Aktivität',
    'spotlight.verTodas': 'Alle Aktivitäten ansehen',

    // Toolbar
    'toolbar.secaoAriaLabel': 'Allgemeiner Aktivitätskatalog',
    'toolbar.buscaPlaceholder': 'Nach Titel, Konzept oder Code suchen (z. B. EF05CO01, Hanoi, Roboter)...',
    'toolbar.buscaAriaLabel': 'Aktivitäten nach Name oder Kompetenzcode durchsuchen',
    'toolbar.limparBusca': 'Suche löschen',
    'toolbar.todas': 'Alle',
    'toolbar.python3d': 'Python 3D',
    'toolbar.algoritmos': 'Algorithmen',
    'toolbar.decomposicao': 'Zerlegung',
    'toolbar.robo': 'Roboter auf Karte',
    'toolbar.blocos': 'Blöcke',
    'toolbar.filtros': 'Filter',
    'toolbar.anoEscolar': 'Schuljahr:',
    'toolbar.todosAnos': 'Alle Schuljahre',
    'toolbar.habilidadeBncc': 'Lehrplan-Kompetenz:',
    'toolbar.todasHabilidades': 'Alle Lehrplan-Kompetenzen',
    'toolbar.limparFiltros': 'Erweiterte Filter zurücksetzen',

    // Karten
    'card.naoIniciado': 'Nicht begonnen',
    'card.emAndamento': 'In Bearbeitung',
    'card.concluido': 'Abgeschlossen',
    'card.comecar': 'Starten',
    'card.continuar': 'Fortsetzen',
    'card.jogarDeNovo': 'Wiederholen',
    'card.min': 'Min.',

    // Empty state
    'vazio.titulo': 'Keine Aktivitäten für diesen Filter gefunden',
    'vazio.descricao': 'Versuchen Sie, aktive Filter zu löschen oder zum Gesamtkatalog zurückzukehren.',
    'vazio.mostrarTodas': 'Alle Aktivitäten anzeigen',
    'vazio.irInicio': 'Zur Startseite',

    // Aktivitäten
    'atv.ordenar-escovar-dentes.titulo': 'Algorithmus ordnen: Zähneputzen',
    'atv.ordenar-escovar-dentes.resumo': 'Bringe die Schritte des Zähneputzens in die richtige Reihenfolge.',
    'atv.ordenar-atravessar-rua.titulo': 'Algorithmus ordnen: Sicher die Straße überqueren',
    'atv.ordenar-atravessar-rua.resumo': 'Ordne die Schritte zur Straßenüberquerung und sortiere gefährliche aus.',
    'atv.ordenar-sanduiche.titulo': 'Algorithmus ordnen: Ein Sandwich zubereiten',
    'atv.ordenar-sanduiche.resumo': 'Finde die richtige Reihenfolge der Zutaten für ein leckeres Sandwich.',
    'atv.py3d-labirinto-1.titulo': '3D-Labyrinth: Erste Schritte in Python',
    'atv.py3d-labirinto-1.resumo': 'Steuere einen 3D-Roboter in Echtzeit mit Python-Befehlen direkt im Browser.',
  },    'cd.metaTitulo': 'Digitale Kultur — Bürgersinn & Dialog — LMS COMPASSO',

    // Cultura Digital (Eixo 3 BNCC)
    "cd.metaTitulo": "Digitale Kultur — Bürgersinn & Dialog — LMS COMPASSO",
    "cd.metaDesc": "Interaktives Labor des Bereichs Digitale Kultur: treffen Sie ethische Entscheidungen im Chat, erkennen Sie Phishing und Fake News, schützen Sie Ihren digitalen Fußabdruck und testen Sie Passwörter.",
    "cd.pularConteudo": "Zum Hauptinhalt springen",
    "cd.voltarMundoDigital": "Zurück zu Digitale Welt",
    "cd.culturaDigital": "Digitale Kultur",
    "cd.eixoBncc": "Bereich 3 · Informatik-Lehrplan",
    "cd.heroTitulo": "Digitale Kultur: <span>Bürgersinn & Ethik im Netz</span>",
    "cd.heroDesc": "Wie bewegen wir uns sicher im Netz, unterscheiden Wahrheit von Gerüchten und schaffen gegenseitigen Respekt? Treffen Sie Entscheidungen in simulierten Chats, entlarven Sie Phishing, testen Sie Passwörter und messen Sie Ihren digitalen Fußabdruck.",
    "cd.ctaChat": "Interaktiven Chat starten",
    "cd.ctaCofre": "Passwort-Tresor",
    "cd.ctaPegada": "Digitaler Fußabdruck-Messer",
    "cd.tagEF01CO05": "Ethik & Respekt",
    "cd.tagEF02CO04": "Datenschutz",
    "cd.tagEF03CO04": "Fake News & Fakten",
    "cd.tagEF04CO04": "Phishing & Cybermobbing",
    "cd.tagEF05CO04": "Digitaler Fußabdruck",
    "cd.sec1Titulo": "ZapCompasso: Dialog- & Bürgersinn-Simulator",
    "cd.sec1Desc": "Wählen Sie einen Kontakt in der Seitenleiste, prüfen Sie empfangene Nachrichten und treffen Sie die richtige Entscheidung zum Datenschutz.",
    "cd.conversas": "Gespräche",
    "cd.pontosCidadania": "{pontos} Bürgersinn-Punkte",
    "cd.onlineAgora": "Jetzt online",
    "cd.decisaoRotulo": "Was ist die beste Haltung als digitaler Bürger?",
    "cd.refazerCenario": "Szenario wiederholen",
    "cd.analisePedagogica": "Pädagogische Analyse:",
    "cd.horaAgora": "Jetzt",
    "cd.cenariosAriaLabel": "Digitale Dialogszenarien",
    "cd.chat.phishing.nome": "Leo (Spielkamerad)",
    "cd.chat.phishing.badge": "Phishing & Social Engineering (EF04CO04)",
    "cd.chat.phishing.previa": "Kumpel, ich habe eine Seite mit Gratis-Münzen gefunden!",
    "cd.chat.phishing.msg": "Kumpel, schau dir diese Seite an, die heute 10.000 Gratis-Münzen im Spiel verschenkt! Klick schnell und gib dein Passwort ein: http://robl0x-free-coins.xyz/login",
    "cd.chat.phishing.opc1.texto": "Danke Leo! Ich klicke jetzt und gebe mein Passwort ein, um die Münzen zu holen.",
    "cd.chat.phishing.opc1.resposta": "Oje... Du bist in die Falle getappt! Mein Konto wurde gehackt und der Angreifer schickte diesen Link!",
    "cd.chat.phishing.opc1.feedback": "⚠️ VORSICHT: Das ist ein Phishing-Angriff! Die Adresse ist gefälscht (.xyz). Kein offizielles Spiel verlangt Passwörter auf externen Seiten. Deine Daten wären gestohlen.",
    "cd.chat.phishing.opc2.texto": "Ich klicke jetzt nicht, aber ich leite den Link an die Klassengruppe weiter.",
    "cd.chat.phishing.opc2.resposta": "Tu das nicht! Der Link ist gefährlich!",
    "cd.chat.phishing.opc2.feedback": "⚠️ ACHTUNG: Das Weiterleiten verdächtiger Links gefährdet Freunde und Familie. Im Zweifel niemals Kettenbriefe verbreiten.",
    "cd.chat.phishing.opc3.texto": "Leo, das ist ein Phishing-Betrug! Schau dir die gefälschte URL (.xyz) an. Niemand verschenkt Münzen für Passwörter. Ändere sofort dein Passwort!",
    "cd.chat.phishing.opc3.resposta": "Wahnsinn, du hast mich gerettet! Ich ändere sofort mein Passwort!",
    "cd.chat.phishing.opc3.feedback": "🌟 AUSGEZEICHNET: Du hast die Phishing-URL entlarvt, dein Konto geschützt und deinem Freund geholfen. Kompetenz EF04CO04 gemeistert!",
    "cd.chat.cyberbullying.nome": "Gruppe Klasse 5B",
    "cd.chat.cyberbullying.badge": "Ethisches Miteinander & Respekt (EF04CO04 / EF01CO05)",
    "cd.chat.cyberbullying.previa": "Schaut euch Pedro in der Pause an lol",
    "cd.chat.cyberbullying.msg": "[Geteiltes Foto von Pedro, der in eine Pfütze fällt] 'Haha seht euch Pedro in der Pause an! Lasst uns einen Sticker machen und überall teilen!'",
    "cd.chat.cyberbullying.opc1.texto": "Hahaha, ich mache sofort den Sticker und poste ihn auf TikTok!",
    "cd.chat.cyberbullying.opc1.resposta": "[Pedro hat die Gruppe verletzt verlassen]",
    "cd.chat.cyberbullying.opc1.feedback": "⚠️ SCHWERWIEGEND: Das ist Cybermobbing. Das ungefragte Teilen peinlicher Bilder verletzt Menschen und verstößt gegen Schul- und Netzregeln.",
    "cd.chat.cyberbullying.opc2.texto": "Ich schalte die Gruppe stumm und tue so, als hätte ich nichts gesehen.",
    "cd.chat.cyberbullying.opc2.resposta": "[Der Spott geht weiter, niemand schreitet ein]",
    "cd.chat.cyberbullying.opc2.feedback": "⚠️ NACHDENKEN: Schweigen lässt Aggressionen weitergehen. Ein bewusster Bürger unterstützt Menschen in Not.",
    "cd.chat.cyberbullying.opc3.texto": "Leute, hört auf damit! Wie würdet ihr euch fühlen? Löscht das Foto, macht keine Sticker und respektiert Pedro.",
    "cd.chat.cyberbullying.opc3.resposta": "Ihr habt recht, wir sind zu weit gegangen. Foto gelöscht. Entschuldige, Pedro!",
    "cd.chat.cyberbullying.opc3.feedback": "🌟 VORBILDLICH: Du hast als Upstander gehandelt, Mobbing gestoppt und Empathie gezeigt. Kompetenzen EF01CO05 und EF04CO04!",
    "cd.chat.privacidade.nome": "ShadowGamer_99",
    "cd.chat.privacidade.badge": "Datenschutz & Privatsphäre (EF02CO04)",
    "cd.chat.privacidade.previa": "Wo wohnst du? Gib mir dein WhatsApp!",
    "cd.chat.privacidade.msg": "Tolles Spiel heute! Schick mir deinen vollen Namen, Alter und Schule, damit wir uns morgen persönlich treffen können!",
    "cd.chat.privacidade.opc1.texto": "Ich heiße Lucas Silva, bin 10 Jahre alt und gehe von 13 bis 17 Uhr zur Grundschule.",
    "cd.chat.privacidade.opc1.resposta": "Super, jetzt weiß ich, wo ich dich morgen finde...",
    "cd.chat.privacidade.opc1.feedback": "⚠️ GEFAHR: Gib niemals deinen vollen Namen, dein Alter oder deine Schule an Unbekannte im Netz weiter!",
    "cd.chat.privacidade.opc2.texto": "Die Schule verrate ich nicht, aber meine Nummer ist (99) 99999-9999.",
    "cd.chat.privacidade.opc2.resposta": "Notiert! Ich rufe dich gleich an.",
    "cd.chat.privacidade.opc2.feedback": "⚠️ RISIKO: Deine Telefonnummer ist ebenfalls ein sensibles Datum, das missbraucht werden kann.",
    "cd.chat.privacidade.opc3.texto": "Ich teile keine persönlichen Daten oder meinen Schulalltag im Internet. Wir schreiben nur im Spiel-Chat.",
    "cd.chat.privacidade.opc3.resposta": "Alles klar, gut dass du vorsichtig bist. Konzentrieren wir uns aufs Spiel!",
    "cd.chat.privacidade.opc3.feedback": "🌟 PERFEKT: Du hast klare Grenzen gesetzt und deine persönlichen Daten geschützt. Kompetenz EF02CO04!",
    "cd.chat.fakenews.nome": "Tante Claudia (Familie)",
    "cd.chat.fakenews.badge": "Fake-News-Detektiv (EF03CO04)",
    "cd.chat.fakenews.previa": "DRINGEND! An alle weiterleiten!",
    "cd.chat.fakenews.msg": "DRINGEND!!! An alle weiterleiten: Wissenschaftler warnen, dass morgen das Internet weltweit für 1 Monat ausfällt! Trinkt kein Leitungswasser! Teilt das, um Leben zu retten!!",
    "cd.chat.fakenews.opc1.texto": "Mein Gott Tante! Ich leite das sofort an alle Gruppen weiter!",
    "cd.chat.fakenews.opc1.resposta": "[Das Gerücht verbreitete sich und löste Panik aus]",
    "cd.chat.fakenews.opc1.feedback": "⚠️ ACHTUNG: Alarmistische Nachrichten voller Ausrufezeichen ohne verlässliche Quelle sind typische Fake News. Weitersenden schürt Panik.",
    "cd.chat.fakenews.opc2.texto": "Ich lagere zur Sicherheit Wasser ein, leite es aber nicht weiter.",
    "cd.chat.fakenews.opc2.resposta": "Sicher ist sicher, oder?",
    "cd.chat.fakenews.opc2.feedback": "⚠️ TIPP: Prüfe solche Behauptungen kurz auf vertrauenswürdigen Nachrichtenseiten oder Behördenportalen.",
    "cd.chat.fakenews.opc3.texto": "Tante, ich habe auf offiziellen Nachrichtenseiten nachgeschaut: Das ist eine Falschmeldung! Bitte nicht weiterleiten, um niemanden zu verängstigen.",
    "cd.chat.fakenews.opc3.resposta": "Oh Liebes, danke fürs Bescheid sagen! Ich sage allen, dass ich mich geirrt habe, und lösche es.",
    "cd.chat.fakenews.opc3.feedback": "🌟 BRILLANT: Du hast Fakten geprüft, kritisches Denken bewiesen und Desinformation gestoppt. Kompetenz EF03CO04!",
    "cd.sec2Titulo": "Digitaler Tresor: Sichere Passwörter testen",
    "cd.sec2Desc": "Lernen Sie, unknackbare Schlüssel zu erstellen. Sehen Sie in Echtzeit, wie lange ein Computer bräuchte, um Ihr Passwort zu erraten.",
    "cd.senhaLabel": "Geben Sie ein Passwort ein, um die Stärke zu testen:",
    "cd.senhaPlaceholder": "Z.B.: MeineSchule#2026!",
    "cd.senhaStatusPadrao": "Passwort eingeben zum Testen",
    "cd.tempoQuebraPadrao": "Zeit zum Knacken: —",
    "cd.senhaMuitoFraca": "Sehr schwach",
    "cd.senhaFraca": "Schwach",
    "cd.senhaMedia": "Mittel / Gut",
    "cd.senhaExcelente": "Hervorragend & Sicher!",
    "cd.quebrada0001": "Geknackt in: 0.001 Sekunden",
    "cd.quebradaMinutos": "Geknackt in: wenigen Minuten",
    "cd.quebradaAnos": "Geknackt in: 2 bis 3 Jahren",
    "cd.quebrada500Anos": "Geknackt in: Über 500 Jahren!",
    "cd.reqAriaLabel": "Anforderungen an ein sicheres Passwort",
    "cd.req8Char": "Mindestens 8 Zeichen",
    "cd.reqMaiusc": "Groß- und Kleinbuchstaben",
    "cd.reqNum": "Mindestens eine Zahl",
    "cd.reqSimb": "Sonderzeichen (@, #, $, !, %)",
    "cd.dica1Titulo": "Die 4-Elemente-Regel (EF02CO04)",
    "cd.dica1Desc": "Passwörter nur aus Zahlen (wie 123456 oder Geburtstage) werden in Millisekunden geknackt. Die Mischung aus Wörtern, Zahlen und Symbolen erzeugt Billionen Kombinationen.",
    "cd.dica2Titulo": "Eselsbrücke für Schüler",
    "cd.dica2Desc": "Erfinden Sie Sätze, die für Sie leicht zu merken, aber für andere unmöglich zu erraten sind. Beispiel: <em>\"IchLiebeAstronomieAmIFMA#2026!\"</em>.",
    "cd.sec3Titulo": "Ihr digitaler Fußabdruck in der Welt (EF05CO04)",
    "cd.sec3Desc": "Alles, was Sie im Internet liken, teilen und eingeben, hinterlässt dauerhafte Spuren. Überprüfen Sie Ihre Gewohnheiten.",
    "cd.pegadaLimpaTitulo": "Sauberer & geschützter digitaler Fußabdruck",
    "cd.pegadaLimpaDesc": "Sie achten sorgfältig auf Ihre Privatsphäre und schützen Ihre Identität.",
    "cd.pegadaAtencaoTitulo": "Achtung: Sichtbarer digitaler Fußabdruck",
    "cd.pegadaAtencaoDesc": "Einige Daten Ihres Alltags sind öffentlich sichtbar. Schalten Sie Standorte ab und prüfen Sie Ihre Einstellungen.",
    "cd.pegadaAlertaTitulo": "Alarm: Verletzlicher digitaler Fußabdruck!",
    "cd.pegadaAlertaDesc": "Zu viele persönliche Daten sind öffentlich zugänglich. Unbekannte könnten Ihre Wege nachverfolgen.",
    "cd.chkUniforme": "Ich poste Fotos in Schulkleidung oder vor meinem Zuhause",
    "cd.chkGps": "Ich lasse meinen GPS-Standort in sozialen Netzwerken öffentlich aktiviert",
    "cd.chkTermos": "Ich akzeptiere Nutzungsbedingungen von Apps ohne zu prüfen, welche Daten gesammelt werden",
    "cd.chkSenhaRepetida": "Ich nutze dasselbe einfache Passwort für E-Mail, Spiele und Netzwerke",
    "cd.rodapeFim": "Innovationsprojekt SUAP/IFMA Nr. 14246/2025 · Startup LMS COMPASSO · Bereich Digitale Kultur.",
    "rodape.copyrightCulturaDigital": "Innovationsprojekt SUAP/IFMA Nr. 14246/2025 · Startup LMS COMPASSO · Bereich Digitale Kultur.",

  uk: {
    // Navigation
    'nav.inicio': 'Головна',
    'nav.boasVindas': 'Вітаємо',
    'nav.atividades': 'Завдання',
    'nav.mundoDigital': 'Цифровий світ',
    'nav.culturaDigital': 'Цифрова культура',
    'nav.buscar': 'Пошук',
    'nav.entrar': 'Увійти',
    'nav.criarConta': 'Реєстрація',
    'nav.painel': 'Панель',
    'nav.sair': 'Вийти',
    'nav.buscarAriaLabel': 'Шукати завдання навчальної програми',
    'nav.voltar': 'Назад',
    'nav.proximo': 'Далі',

    // Seletor
    'i18n.rotuloSeletor': 'Змінити мову. Поточна мова: {atual}',
    'i18n.listaAriaLabel': 'Доступні мови',
    'i18n.anuncioTroca': 'Мову змінено на {nome}.',

    // Wayfinding
    'wf.voceEstaAqui': 'Ви тут',
    'wf.voltarTrilhas': 'Повернутися до треків',
    'wf.inicio': 'Головна',
    'wf.pensamentoComputacional': 'Обчислювальне мислення',
    'wf.atividadesLab3d': 'Завдання та 3D Лабораторія',

    // Eixos
    'eixo.pensamento-computacional': 'Обчислювальне мислення',
    'eixo.mundo-digital': 'Цифровий світ',
    'eixo.cultura-digital': 'Цифрова культура',

    // Tipos
    'tipo.ordenar': 'Побудова послідовності',
    'tipo.decompor': 'Розбиття проблеми',
    'tipo.robo': 'Програмування робота',
    'tipo.blocos': 'Блочне програмування',
    'tipo.python3d': '3D Python Лабораторія',

    // Niveis
    'nivel.1': 'Початковий',
    'nivel.2': 'Середній',
    'nivel.3': 'Складний',

    // Faixas
    'faixa.f1': '1-3 класи',
    'faixa.f2': '4-5 класи',
    'faixa.f3': '6-9 класи',

    // Conceitos
    'conceito.algoritmos': 'Повсякденні алгоритми',
    'conceito.decomposicao': 'Логічна декомпозиція',

    // Spotlight
    'spotlight.destaqueAriaLabel': 'Рекомендоване завдання',
    'spotlight.kickerRecomendada': 'Наступна рекомендована місія',
    'spotlight.kickerRetomar': 'Продовжити з місця зупинки',
    'spotlight.kickerConcluida': 'Навчальний трек опановано!',
    'spotlight.comecarDesafio': 'Почати виклик',
    'spotlight.retomarAtividade': 'Продовжити завдання',
    'spotlight.jogarNovamente': 'Пройти знову',
    'spotlight.explorarGrade': 'Переглянути сітку ({total})',
    'spotlight.certificado3d': '3D Сертифікат ({concluidas}/{total})',
    'spotlight.certificado3dTitulo': 'Офіційний сертифікат дослідника Python 3D',
    'spotlight.trilhaProgresso': 'Трек завдань: завершено {concluidas} з {total} ({percentual}%)',
    'spotlight.xpConquistados': '+{xp} XP здобуто',
    'spotlight.cliqueParaJogar': 'Натисніть для гри',
    'spotlight.proximaAtividade': 'Наступне завдання',
    'spotlight.verTodas': 'Усі завдання',

    // Toolbar
    'toolbar.secaoAriaLabel': 'Загальний каталог завдань',
    'toolbar.buscaPlaceholder': 'Шукати за назвою, концепцією або кодом (напр., EF05CO01, Ханой, Робот)...',
    'toolbar.buscaAriaLabel': 'Шукати завдання за назвою або кодом навички',
    'toolbar.limparBusca': 'Очистити пошук',
    'toolbar.todas': 'Усі',
    'toolbar.python3d': 'Python 3D',
    'toolbar.algoritmos': 'Алгоритми',
    'toolbar.decomposicao': 'Декомпозиція',
    'toolbar.robo': 'Робот на карті',
    'toolbar.blocos': 'Блоки',
    'toolbar.filtros': 'Фільтри',
    'toolbar.anoEscolar': 'Клас навчання:',
    'toolbar.todosAnos': 'Усі класи',
    'toolbar.habilidadeBncc': 'Навичка програми:',
    'toolbar.todasHabilidades': 'Усі навички програми',
    'toolbar.limparFiltros': 'Скинути розширені фільтри',

    // Cartões
    'card.naoIniciado': 'Не розпочато',
    'card.emAndamento': 'В процесі',
    'card.concluido': 'Завершено',
    'card.comecar': 'Почати',
    'card.continuar': 'Продовжити',
    'card.jogarDeNovo': 'Пройти ще раз',
    'card.min': 'хв',

    // Empty state
    'vazio.titulo': 'Для цього фільтра не знайдено завдань',
    'vazio.descricao': 'Спробуйте очистити активні фільтри або повернутися до повного каталогу.',
    'vazio.mostrarTodas': 'Показати всі завдання',
    'vazio.irInicio': 'На головну',

    // Atividades
    'atv.ordenar-escovar-dentes.titulo': 'Збери алгоритм: чищення зубів',
    'atv.ordenar-escovar-dentes.resumo': 'Розстав кроки чищення зубів у правильному порядку.',
    'atv.ordenar-atravessar-rua.titulo': 'Збери алгоритм: безпечний перехід вулиці',
    'atv.ordenar-atravessar-rua.resumo': 'Впорядкуй кроки для переходу дороги та вилучи небезпечні.',
    'atv.ordenar-sanduiche.titulo': 'Збери алгоритм: приготування бутерброда',
    'atv.ordenar-sanduiche.resumo': 'Знайди послідовність інгредієнтів для смачного бутерброда.',
    'atv.py3d-labirinto-1.titulo': '3D Лабіринт: Перші кроки в Python',
    'atv.py3d-labirinto-1.resumo': 'Керуй 3D-роботом у реальному часі за допомогою команд Python у браузері.',

    // Mundo Digital — Метадані та Навігація
    'md.metaTitulo': 'Цифровий світ — 3D Лабораторія апаратного забезпечення та мереж — LMS COMPASSO',
    'md.metaDesc': 'Інтерактивна лабораторія напряму "Цифровий світ": досліджуйте материнську плату в 3D, збирайте компоненти, спостерігайте за тактом процесора та пакетами в інтернеті.',
    'md.badgeEixo': 'Напрям 2 · Шкільна Інформатика',
    'md.heroTitulo': 'Цифровий світ: <span>Залізо та Мережі</span>',
    'md.heroDesc': 'Як комп’ютери мислять, зберігають пам’ять і спілкуються через кабелі та радіохвилі? Досліджуйте інтерактивну 3D-плату, роботу процесора та передачу пакетів.',
    'md.ctaPlaca': 'Дослідити 3D-плату',
    'md.ctaCpu': 'Симулювати такт CPU',
    'md.ctaRedes': 'Трафік пакетів в інтернеті',
    'md.tagEF01CO04': 'Периферія вводу/виводу',
    'md.tagEF02CO03': 'Компоненти та пам’ять',
    'md.tagEF04CO03': 'Дані та мережі',
    'md.tagEF05CO03': 'Архітектура процесора',
    'md.tagEF69CO05': 'Маршрутизація та інтернет',

    // Секція 1: 3D Материнська плата та PC Builder
    'md.sec1Titulo': '3D Материнська плата: Рентген та PC Builder',
    'md.sec1Desc': 'Натискайте на компоненти для вивчення їхньої функції або виконайте завдання зі складання ПК та увімкнення системи.',
    'md.statusPostEspera': 'Очікування (Вимкнено)',
    'md.statusPostAtivo': 'POST завершено (ОС активна)',
    'md.ariaVisualizacao': 'Режими перегляду материнської плати',
    'md.vistaIsometrica': '3D Ізометрія',
    'md.vistaTopo': 'Згори',
    'md.vistaLateral': 'Профіль',
    'md.compCpuRotulo': 'Процесор',
    'md.compRamRotulo': 'Оперативна пам’ять',
    'md.compSsdRotulo': 'SSD-накопичувач',
    'md.compGpuRotulo': 'Відеокарта (GPU)',
    'md.compIoRotulo': 'Порти вводу/виводу',
    'md.analogiaTitulo': 'Навчальна аналогія',

    // Характеристики
    'md.spec.velTipica': 'Типова швидкість',
    'md.spec.unidInternas': 'Внутрішні блоки',
    'md.spec.bncc': 'Стандарт програми',
    'md.spec.tecAtual': 'Сучасна технологія',
    'md.spec.volatilidade': 'Енергозалежність',
    'md.spec.interface': 'Інтерфейс',
    'md.spec.memoria': 'Пам’ять',
    'md.spec.saidasVideo': 'Відеовиходи',
    'md.spec.entradas': 'Входи',
    'md.spec.saidas': 'Виходи',

    // CPU Дані
    'md.cpu.nome': 'Центральний процесор (CPU)',
    'md.cpu.categoria': 'Обчислювальний блок (Мозок комп’ютера)',
    'md.cpu.desc': 'CPU виконує інструкції всіх програм, обробляючи мільярди електричних тактів щосекунди.',
    'md.cpu.analogia': 'Як шеф-кухар у ресторані: приймає замовлення (інструкції), готує страви та керує командою.',
    'md.cpu.spec1': '3.2 – 5.0 ГГц (Мільярди тактів/с)',
    'md.cpu.spec2': 'АЛУ (Обчислення), УУ (Керування), Регістри',
    'md.cpu.spec3': 'EF05CO03 (Архітектура та виконання)',

    // RAM Дані
    'md.ram.nome': 'Оперативна пам’ять (DDR5 RAM)',
    'md.ram.categoria': 'Швидка енергозалежна первинна пам’ять',
    'md.ram.desc': 'RAM зберігає дані, необхідні процесору прямо зараз. При вимкненні живлення всі дані очищаються.',
    'md.ram.analogia': 'Як робочий стіл учня: під час уроку підручники відкриті, а після уроку стіл прибирають.',
    'md.ram.spec1': 'DDR5 5600 МТ/с',
    'md.ram.spec2': 'Так (Очищається без живлення)',
    'md.ram.spec3': 'EF02CO03 (RAM проти накопичувача)',

    // SSD Дані
    'md.ssd.nome': 'Постійний накопичувач (SSD NVMe M.2)',
    'md.ssd.categoria': 'Постійна енергонезалежна пам’ять',
    'md.ssd.desc': 'SSD зберігає операційну систему, фотографії та програми на флеш-чипах навіть після вимкнення живлення.',
    'md.ssd.analogia': 'Як шкільний рюкзак чи книжкова полиця: ваші книги надійно зберігаються надовго.',
    'md.ssd.spec1': 'PCIe 4.0 NVMe (до 7 000 МБ/с)',
    'md.ssd.spec2': 'Ні (Енергонезалежна)',
    'md.ssd.spec3': 'EF02CO03 (Збереження інформації)',

    // GPU Дані
    'md.gpu.nome': 'Дискретна відеокарта (GPU)',
    'md.gpu.categoria': 'Графічні та паралельні обчислення',
    'md.gpu.desc': 'GPU містить тисячі ядер для паралельного розрахунку тривимірної графіки та світлових ефектів у реальному часі.',
    'md.gpu.analogia': 'Якщо CPU — це один геніальний вчений, то GPU — це армія з 5000 художників, які малюють кадр одночасно.',
    'md.gpu.spec1': 'Виділена GDDR6 VRAM',
    'md.gpu.spec2': 'HDMI 2.1 та DisplayPort 1.4',
    'md.gpu.spec3': 'EF01CO04 (Периферія та зображення)',

    // IO Дані
    'md.io.nome': 'Задня панель портів (I/O)',
    'md.io.categoria': 'Інтерфейси вводу та виводу',
    'md.io.desc': 'Центр підключення комп’ютера до зовнішнього світу: USB, HDMI та мережевий роз’єм RJ-45.',
    'md.io.analogia': 'Як двері та вікна в будинку: через них надходять листи та відбувається спілкування зі світом.',
    'md.io.spec1': 'USB (Клавіатура, миша, мікрофон)',
    'md.io.spec2': 'HDMI (Монітор), Аудіо (Динаміки)',
    'md.io.spec3': 'EF01CO04 / EF02CO03 (Класифікація I/O)',

    // PC Builder Завдання
    'md.pcBuilderTitulo': 'Завдання: Збери комп’ютер',
    'md.pcBuilderProgresso': '{instalados} / {total} Встановлено',
    'md.pcEtapa1': '1. Встановити процесор у сокет',
    'md.pcEtapa2': '2. Вставити планку пам’яті RAM',
    'md.pcEtapa3': '3. Підключити накопичувач SSD M.2',
    'md.pcEtapa4': '4. Встановити відеокарту в слот PCIe',
    'md.pcEtapa5': '5. Увімкнути та запустити POST-тест',
    'md.btnEncaixar': 'Встановити наступний компонент',
    'md.btnLigar': 'Увімкнути ПК (POST)',
    'md.btnMontado': 'Комп’ютер зібрано та активовано!',
    'md.btnReiniciar': 'Скинути',

    // Секція 2: Такт CPU
    'md.sec2Titulo': 'Такт процесора (Clock Cycle)',
    'md.sec2Desc': 'Як мікроскопічні транзистори перетворюють електричні імпульси на реальні дії? Дізнайтеся про фази такту.',
    'md.cpuIrTitulo': 'Регістр інструкцій (IR)',
    'md.cpuUcTitulo': 'Блок керування (УУ)',
    'md.cpuUcConteudo': 'Декодер: Арифметична дія',
    'md.cpuUlaTitulo': 'Арифметико-логічний пристрій (АЛУ)',
    'md.cpuFase1': 'Фаза 1',
    'md.cpuBuscaTitulo': 'Вибірка (Fetch)',
    'md.cpuBuscaDesc': 'Адреса запитується з пам’яті, і наступна інструкція завантажується з RAM у внутрішній регістр IR.',
    'md.cpuFase2': 'Фаза 2',
    'md.cpuDecodificaTitulo': 'Декодування (Decode)',
    'md.cpuDecodificaDesc': 'Блок керування розпізнає двійковий код інструкції та готує необхідні контури та регістри.',
    'md.cpuFase3': 'Фаза 3',
    'md.cpuExecutaTitulo': 'Виконання (Execute)',
    'md.cpuExecutaDesc': 'АЛУ виконує арифметичне обчислення або логічне порівняння та записує результат в акумулятор.',
    'md.cpuAguardandoOperandos': 'Очікування операндів...',
    'md.cpuCarregadoValores': 'Завантажено: 5 і 3',
    'md.cpuInstrucaoConcluida': 'Інструкцію виконано',
    'md.cpuResultado': 'Результат: 8 (00001000₂)',
    'md.btnCpuPasso': 'Крок за кроком',
    'md.btnCpuAuto': 'Автоматичний такт',
    'md.btnCpuPausar': 'Пауза циклу',

    // Секція 3: Мережевий симулятор
    'md.sec3Titulo': 'Як пакети подорожують інтернетом?',
    'md.sec3Desc': 'Дані передаються не одним шматком, а розбиваються на пакети з IP-адресами та збираються на сервері.',
    'md.redeNoAluno': 'Комп’ютер учня',
    'md.redeNoRoteador': 'Wi-Fi роутер',
    'md.redeNoProvedor': 'Провайдер та оптоволокно',
    'md.redeNoServidor': 'Сервер COMPASSO',
    'md.redeProtocoloRotulo': 'Протокол:',
    'md.redeSeqRotulo': 'Послідовність (SYN):',
    'md.redePayloadRotulo': 'Корисне навантаження:',
    'md.redePayloadValor': '"Привіт, школо! Завдання виконано"',
    'md.redeStatusRotulo': 'Статус доставки:',
    'md.redeStatusPronto': 'Готово до відправки',
    'md.redeStatusEnviando': 'Передача пакетів TCP через маршрутизатори...',
    'md.redeStatusSucesso': '✅ Пакети доставлено та зібрано на сервері LMS COMPASSO!',
    'md.redeStatusPerda': '❌ Пакет 2 втрачено в мережі! Протокол TCP успішно переслав його (ACK 3).',
    'md.btnDispararPacote': 'Надіслати пакет даних',
    'md.btnSimularPerda': 'Симулювати втрату пакета (TCP)',
    'md.btnPerdaAtivada': '⚠️ Втрата пакета: Увімкнено',

    // Wayfinding & Rodapé
    'wf.eixosBncc': 'Напрями навчання',
    'wf.mundoDigital': 'Цифровий світ',
    'rodape.eixos': 'Напрями навчання',
    'rodape.acessoRapido': 'Швидкі посилання',
    'rodape.copyrightMundoDigital': 'Інноваційний проєкт SUAP/IFMA № 14246/2025 · Startup LMS COMPASSO · Напрям "Цифровий світ".',    'cd.metaTitulo': 'Цифрова культура — Громадянство та діалог — LMS COMPASSO',

    // Cultura Digital (Eixo 3 BNCC)
    "cd.metaTitulo": "Цифрова культура — Громадянство та діалог — LMS COMPASSO",
    "cd.metaDesc": "Інтерактивна лабораторія напряму \"Цифрова культура\": етичні рішення в чаті, виявлення фішингу та фейків, захист цифрового сліду та перевірка паролів.",
    "cd.pularConteudo": "Перейти до основного вмісту",
    "cd.voltarMundoDigital": "Назад до Цифрового світу",
    "cd.culturaDigital": "Цифрова культура",
    "cd.eixoBncc": "Напрям 3 · Комп'ютерні науки",
    "cd.heroTitulo": "Цифрова культура: <span>Громадянство та етика в мережі</span>",
    "cd.heroDesc": "Як безпечно користуватися інтернетом, відрізняти правду від чуток та будувати взаємну повагу в мережі? Приймайте рішення в інтерактивних бесідах, виявляйте фішинг, тестуйте стійкість паролів і оцінюйте свій цифровий слід.",
    "cd.ctaChat": "Почати інтерактивний чат",
    "cd.ctaCofre": "Сховище надійних паролів",
    "cd.ctaPegada": "Вимірювач цифрового сліду",
    "cd.tagEF01CO05": "Етика та повага",
    "cd.tagEF02CO04": "Захист даних",
    "cd.tagEF03CO04": "Фейки та факти",
    "cd.tagEF04CO04": "Фішинг та кібербулінг",
    "cd.tagEF05CO04": "Цифровий слід",
    "cd.sec1Titulo": "ZapCompasso: Симулятор діалогу та цифрового громадянства",
    "cd.sec1Desc": "Виберіть контакт у списку, проаналізуйте повідомлення та прийміть правильне рішення для захисту своїх даних та протидії онлайн-булінгу.",
    "cd.conversas": "Бесіди",
    "cd.pontosCidadania": "{pontos} Балів громадянства",
    "cd.onlineAgora": "Зараз онлайн",
    "cd.decisaoRotulo": "Яке рішення найкраще для свідомого користувача?",
    "cd.refazerCenario": "Спробувати цей сценарій знову",
    "cd.analisePedagogica": "Педагогічний аналіз:",
    "cd.horaAgora": "Зараз",
    "cd.cenariosAriaLabel": "Сценарії цифрового діалогу",
    "cd.chat.phishing.nome": "Лео (Друг з гри)",
    "cd.chat.phishing.badge": "Фішинг та соціальна інженерія (EF04CO04)",
    "cd.chat.phishing.previa": "Друже, знайшов сайт з безкоштовними монетами!",
    "cd.chat.phishing.msg": "Друже, дивись, цей сайт роздає по 10.000 монет та безкоштовні речі у грі! Тисни швидше і вводь логін і пароль, поки не закрили: http://robl0x-free-coins.xyz/login",
    "cd.chat.phishing.opc1.texto": "Дякую, Лео! Зараз перейду і введу пароль, щоб забрати монети.",
    "cd.chat.phishing.opc1.resposta": "Ой лишенько... Ти потрапив на гачок шахраїв! Мій акаунт зламали і хакер надіслав це посилання тобі!",
    "cd.chat.phishing.opc1.feedback": "⚠️ ОБЕРЕЖНО: Це фішингова атака! Посилання веде на підроблений домен (.xyz). Жодна офіційна гра не просить пароль на сторонніх сайтах. Твої дані було б викрадено.",
    "cd.chat.phishing.opc2.texto": "Зараз не переходитиму, але перешлю посилання в наш шкільний чат.",
    "cd.chat.phishing.opc2.resposta": "Не роби цього! Це посилання небезпечне!",
    "cd.chat.phishing.opc2.feedback": "⚠️ УВАГА: Пересилання підозрілих посилань ставить під загрозу твоїх друзів та родину. Якщо сумніваєшся — ніколи не розповсюджуй спам-ланцюжки.",
    "cd.chat.phishing.opc3.texto": "Лео, це фішинговий обман! Поглянь на підроблену адресу (.xyz). Ніхто не роздає монети за паролі. Зміни пароль негайно, якщо ти там авторизувався!",
    "cd.chat.phishing.opc3.resposta": "Ого, ти мене врятував! Біжу змінювати пароль, поки не вкрали мій акаунт!",
    "cd.chat.phishing.opc3.feedback": "🌟 ВІДМІННО: Ти розпізнав шахрайський URL, захистив свій акаунт і допоміг другу змінити скомпрометований пароль. Навичку EF04CO04 опановано!",
    "cd.chat.cyberbullying.nome": "Чат 5-Б класу",
    "cd.chat.cyberbullying.badge": "Етичне спілкування та повага (EF04CO04 / EF01CO05)",
    "cd.chat.cyberbullying.previa": "Дивіться, як Петро впав на перерві хаха",
    "cd.chat.cyberbullying.msg": "[Фото Петра, який посковзнувся в калюжі] 'Хаха, дивіться, який конфуз у Петра на перерві! Давайте зробимо стікер і розішлемо всюди!'",
    "cd.chat.cyberbullying.opc1.texto": "Хаха, зараз зроблю стікер і викладу в TikTok!",
    "cd.chat.cyberbullying.opc1.resposta": "[Петро образився і вийшов з групи]",
    "cd.chat.cyberbullying.opc1.feedback": "⚠️ НЕПРИПУСТИМО: Це кібербулінг. Поширення образливих фото без згоди завдає реального болю і порушує правила шкільної та цифрової етики.",
    "cd.chat.cyberbullying.opc2.texto": "Я просто вимкну звук чату і зроблю вигляд, що нічого не бачив.",
    "cd.chat.cyberbullying.opc2.resposta": "[Кпини продовжуються, ніхто не заступається]",
    "cd.chat.cyberbullying.opc2.feedback": "⚠️ РОЗДУМИ: Мовчання дозволяє цькуванню тривати. Свідомий цифровий громадянин підтримує того, кого ображають.",
    "cd.chat.cyberbullying.opc3.texto": "Друзі, припиніть. Уявіть себе на його місці! Видаліть це фото, не робіть стікерів і поважайте Петра.",
    "cd.chat.cyberbullying.opc3.resposta": "Ви праві, ми зайшли занадто далеко. Фото видалено. Вибач, Петре!",
    "cd.chat.cyberbullying.opc3.feedback": "🌟 ЗРАЗКОВО: Ти виступив активним захисником (Upstander), зупинив булінг і проявив емпатію. Навички EF01CO05 та EF04CO04!",
    "cd.chat.privacidade.nome": "ShadowGamer_99",
    "cd.chat.privacidade.badge": "Захист персональних даних (EF02CO04)",
    "cd.chat.privacidade.previa": "Де ти живеш? Дай свій WhatsApp!",
    "cd.chat.privacidade.msg": "Круто зіграли! Напиши своє повне ім'я, вік і номер школи, щоб завтра зустрітися наживо!",
    "cd.chat.privacidade.opc1.texto": "Мене звати Лукас Сілва, мені 10 років, навчаюся в школі №5 з 13:00 до 17:00.",
    "cd.chat.privacidade.opc1.resposta": "Чудово, тепер я знаю, де тебе знайти завтра...",
    "cd.chat.privacidade.opc1.feedback": "⚠️ ВЕЛИКА НЕБЕЗПЕКА: Ніколи не повідомляйте повне ім'я, вік, адресу школи чи свій розклад незнайомцям у мережі. Особисті дані мають бути захищені!",
    "cd.chat.privacidade.opc2.texto": "Школу не скажу, але мій телефон: (99) 99999-9999.",
    "cd.chat.privacidade.opc2.resposta": "Записав! Зараз наберу.",
    "cd.chat.privacidade.opc2.feedback": "⚠️ РИЗИК: Номер телефону — це конфіденційні дані. Незнайомці можуть використати його для шахрайства або небажаних дзвінків.",
    "cd.chat.privacidade.opc3.texto": "Я не ділюся особистими даними та розпорядком дня в інтернеті. Спілкуймося тільки у внутрішньому чаті гри.",
    "cd.chat.privacidade.opc3.resposta": "Зрозумів, ти правильно робиш, що бережеш себе. Зосередьмося на грі!",
    "cd.chat.privacidade.opc3.feedback": "🌟 ІДЕАЛЬНО: Ти встановив чіткі межі приватності та усвідомив цінність захисту персональної інформації. Навичка EF02CO04!",
    "cd.chat.fakenews.nome": "Тітка Клавдія (Родина)",
    "cd.chat.fakenews.badge": "Детектив фейкових новин (EF03CO04)",
    "cd.chat.fakenews.previa": "ТЕРМІНОВО! Перешліть усім!",
    "cd.chat.fakenews.msg": "ТЕРМІНОВО!!! Перешліть усім: вчені попередили, що завтра інтернет вимкнуть у всьому світі на місяць! Не пийте воду з-під крана! Поширте, щоб врятувати життя!!",
    "cd.chat.fakenews.opc1.texto": "Ого, тітонько! Зараз розішлю це в усі свої групи!",
    "cd.chat.fakenews.opc1.resposta": "[Чутка поширилася і спричинила паніку серед сусідів]",
    "cd.chat.fakenews.opc1.feedback": "⚠️ УВАГА: Тривожні повідомлення з купою знаків оклику та без офіційних джерел — це класичний приклад Fake News. Поширення без перевірки сіє дезінформацію.",
    "cd.chat.fakenews.opc2.texto": "Я про всяк випадок наберу води, але нікому пересилати не буду.",
    "cd.chat.fakenews.opc2.resposta": "Краще перестрахуватися, правда?",
    "cd.chat.fakenews.opc2.feedback": "⚠️ ПОРАДА: Перш ніж хвилюватися, швидко перевір інформацію в авторитетних ЗМІ або на урядових порталах.",
    "cd.chat.fakenews.opc3.texto": "Тітонько, я перевірив на офіційних сайтах новин: це вигадка і фейк! Будь ласка, не пересилайте це далі, щоб не лякати людей.",
    "cd.chat.fakenews.opc3.resposta": "Ой, сонечко, дякую, що попередив! Я напишу всім, що помилилася, і видалю.",
    "cd.chat.fakenews.opc3.feedback": "🌟 БЛИСКУЧЕ: Ти застосував критичне мислення, перевірив факти в надійних джерелах і зупинив хвилю паніки. Навичка EF03CO04!",
    "cd.sec2Titulo": "Цифровий сейф: Тестер надійності паролів",
    "cd.sec2Desc": "Навчіться створювати незламні цифрові ключі. Подивіться в реальному часі, скільки часу знадобиться комп'ютеру для підбору вашого пароля.",
    "cd.senhaLabel": "Введіть пароль для перевірки стійкості:",
    "cd.senhaPlaceholder": "Напр.: MoiaShkola#2026!",
    "cd.senhaStatusPadrao": "Введіть пароль для тесту",
    "cd.tempoQuebraPadrao": "Час на злам: —",
    "cd.senhaMuitoFraca": "Дуже слабкий",
    "cd.senhaFraca": "Слабкий",
    "cd.senhaMedia": "Середній / Добрий",
    "cd.senhaExcelente": "Відмінний та безпечний!",
    "cd.quebrada0001": "Зламано за: 0.001 секунди",
    "cd.quebradaMinutos": "Зламано за: кілька хвилин",
    "cd.quebradaAnos": "Зламано за: 2–3 роки",
    "cd.quebrada500Anos": "Зламано за: понад 500 років!",
    "cd.reqAriaLabel": "Вимоги до надійного пароля",
    "cd.req8Char": "Щонайменше 8 символів",
    "cd.reqMaiusc": "Великі та малі літери",
    "cd.reqNum": "Принаймні одна цифра",
    "cd.reqSimb": "Спеціальні символи (@, #, $, !, %)",
    "cd.dica1Titulo": "Правило 4 елементів (EF02CO04)",
    "cd.dica1Desc": "Паролі лише з цифр (як-от 123456 або дати народження) зламуються автоматичними програмами за частки секунди. Поєднання слів, чисел та символів створює трильйони комбінацій.",
    "cd.dica2Titulo": "Мнемонічна підказка для учнів",
    "cd.dica2Desc": "Створюйте фрази, які легко запам'ятати вам, але неможливо вгадати іншим. Приклад: <em>\"YaLyublyuAstronomiyuVIFMA#2026!\"</em>.",
    "cd.sec3Titulo": "Ваш цифровий слід у світі (EF05CO04)",
    "cd.sec3Desc": "Усе, що ви вподобали, поширили або зареєстрували в інтернеті, залишає постійні сліди. Позначте свої щоденні звички, щоб перевірити стан свого сліду.",
    "cd.pegadaLimpaTitulo": "Чистий та захищений цифровий слід",
    "cd.pegadaLimpaDesc": "Ви дбаєте про власну приватність, не поширюєте конфіденційні дані та тримаєте свою особу в безпеці.",
    "cd.pegadaAtencaoTitulo": "Увага: Помітний цифровий слід",
    "cd.pegadaAtencaoDesc": "Частина даних про ваш розпорядок дня є публічною. Вимкніть передачу геолокації та перевірте налаштування приватності.",
    "cd.pegadaAlertaTitulo": "Тривога: Вразливий цифровий слід!",
    "cd.pegadaAlertaDesc": "Забагато особистих даних відкрито. Будь-який незнайомець може відстежити ваші переміщення офлайн.",
    "cd.chkUniforme": "Публікую фото у шкільній формі або біля свого будинку",
    "cd.chkGps": "Залишаю увімкненою публічну геолокацію (GPS) у соцмережах",
    "cd.chkTermos": "Приймаю умови додатків та ігор, не читаючи, які дані вони збирають",
    "cd.chkSenhaRepetida": "Використовую один і той самий простий пароль для пошти, ігор та соцмереж",
    "cd.rodapeFim": "Інноваційний проєкт SUAP/IFMA № 14246/2025 · Startup LMS COMPASSO · Напрям \"Цифрова культура\".",
    "rodape.copyrightCulturaDigital": "Інноваційний проєкт SUAP/IFMA № 14246/2025 · Startup LMS COMPASSO · Напрям \"Цифрова культура\".",
  },

  fr: {
    'nav.inicio': 'Accueil',
    'nav.boasVindas': 'Bienvenue',
    'nav.atividades': 'Activités',
    'nav.mundoDigital': 'Monde Numérique',
    'nav.culturaDigital': 'Culture Numérique',
    'nav.buscar': 'Rechercher',
    'nav.entrar': 'Connexion',
    'nav.criarConta': 'Créer un compte',
    'nav.painel': 'Tableau de bord',
    'nav.sair': 'Déconnexion',
    'nav.buscarAriaLabel': 'Rechercher des activités',
    'nav.voltar': 'Retour',
    'nav.proximo': 'Suivant',
    'i18n.rotuloSeletor': 'Changer de langue. Langue actuelle: {atual}',
    'i18n.listaAriaLabel': 'Langues disponibles',
    'i18n.anuncioTroca': 'Langue changée pour {nome}.',
    'wf.voceEstaAqui': 'Vous êtes ici',
    'wf.voltarTrilhas': 'Retour aux Parcours',
    'wf.inicio': 'Accueil',
    'wf.pensamentoComputacional': 'Pensée Informatique',
    'wf.atividadesLab3d': 'Activités & Labo 3D',
    'eixo.pensamento-computacional': 'Pensée Informatique',
    'eixo.mundo-digital': 'Monde Numérique',
    'eixo.cultura-digital': 'Culture Numérique',
    'tipo.ordenar': 'Ordonner la séquence',
    'tipo.decompor': 'Diviser le problème',
    'tipo.robo': 'Programmer le robot',
    'tipo.blocos': 'Programmation par blocs',
    'tipo.python3d': 'Labo 3D Python',
    'nivel.1': 'Débutant',
    'nivel.2': 'Intermédiaire',
    'nivel.3': 'Défi',
    'faixa.f1': '1re à 3e année',
    'faixa.f2': '4e et 5e année',
    'faixa.f3': '6e à 9e année',
    'spotlight.destaqueAriaLabel': 'Activité en vedette',
    'spotlight.kickerRecomendada': 'Prochaine mission recommandée',
    'spotlight.comecarDesafio': 'Commencer le défi',
    'spotlight.retomarAtividade': 'Reprendre l’activité',
    'spotlight.jogarNovamente': 'Rejouer',
    'spotlight.explorarGrade': 'Explorer la grille ({total})',
    'spotlight.certificado3d': 'Certificat 3D ({concluidas}/{total})',
    'spotlight.cliqueParaJogar': 'Cliquer pour jouer',
    'toolbar.todas': 'Toutes',
    'toolbar.filtros': 'Filtres',
    'card.naoIniciado': 'Non commencé',
    'card.emAndamento': 'En cours',
    'card.concluido': 'Terminé',
    'card.comecar': 'Commencer',
    'card.continuar': 'Continuer',
    'card.jogarDeNovo': 'Rejouer',
    'card.min': 'min',
    'vazio.titulo': 'Aucune activité trouvée',
    'vazio.descricao': 'Essayez de réinitialiser les filtres.',
    'vazio.mostrarTodas': 'Afficher toutes les activités',
    'vazio.irInicio': 'Aller à l’accueil',
  },    'cd.metaTitulo': 'Culture Numérique — Citoyenneté et Dialogue — LMS COMPASSO',

    // Cultura Digital (Eixo 3 BNCC)
    "cd.metaTitulo": "Culture Numérique — Citoyenneté et Dialogue — LMS COMPASSO",
    "cd.metaDesc": "Laboratoire interactif de Culture Numérique: prenez des décisions éthiques dans des chats, identifiez le phishing et les fausses nouvelles, et testez vos mots de passe.",
    "cd.pularConteudo": "Passer au contenu principal",
    "cd.voltarMundoDigital": "Retour au Monde Numérique",
    "cd.culturaDigital": "Culture Numérique",
    "cd.eixoBncc": "Axe 3 · Programme d'Informatique",
    "cd.heroTitulo": "Culture Numérique: <span>Citoyenneté et Éthique en Ligne</span>",
    "cd.heroDesc": "Comment naviguer en toute sécurité, distinguer le vrai du faux et instaurer le respect mutuel en ligne? Prenez des décisions dans des discussions simulées, déjouez le phishing et mesurez votre empreinte numérique.",
    "cd.ctaChat": "Démarrer le Chat Interactif",
    "cd.ctaCofre": "Coffre-fort de Mots de Passe",
    "cd.ctaPegada": "Mesureur d'Empreinte Numérique",
    "cd.tagEF01CO05": "Éthique et Respect",
    "cd.tagEF02CO04": "Protection des Données",
    "cd.tagEF03CO04": "Fake News et Faits",
    "cd.tagEF04CO04": "Phishing et Cyberharcèlement",
    "cd.tagEF05CO04": "Empreinte Numérique",
    "cd.sec1Titulo": "ZapCompasso: Simulateur de Dialogue et Citoyenneté",
    "cd.sec1Desc": "Sélectionnez un contact, analysez les messages et prenez la bonne décision pour protéger vos données.",
    "cd.conversas": "Discussions",
    "cd.pontosCidadania": "{pontos} Points de Citoyenneté",
    "cd.onlineAgora": "En ligne maintenant",
    "cd.decisaoRotulo": "Quelle est la meilleure réaction en tant que citoyen numérique?",
    "cd.refazerCenario": "Recommencer ce scénario",
    "cd.analisePedagogica": "Analyse Pédagogique:",
    "cd.horaAgora": "Maintenant",
    "cd.cenariosAriaLabel": "Scénarios de dialogue numérique",
    "cd.chat.phishing.nome": "Léo (Ami de jeu)",
    "cd.chat.phishing.badge": "Phishing et Ingénierie Sociale (EF04CO04)",
    "cd.chat.phishing.previa": "Mec, j'ai trouvé un site qui donne des pièces gratuites!",
    "cd.chat.phishing.msg": "Mec, regarde ce site qui donne 10.000 pièces dans le jeu aujourd'hui! Clique vite et mets ton mot de passe: http://robl0x-free-coins.xyz/login",
    "cd.chat.phishing.opc1.texto": "Merci Léo! Je clique tout de suite et je mets mon mot de passe.",
    "cd.chat.phishing.opc1.resposta": "Aïe... Tu es tombé dans le piège! Mon compte a été piraté et le pirate t'a envoyé ce lien!",
    "cd.chat.phishing.opc1.feedback": "⚠️ ATTENTION: C'est une attaque de Phishing! Le lien est frauduleux (.xyz). Aucun jeu officiel ne demande votre mot de passe ailleurs.",
    "cd.chat.phishing.opc2.texto": "Je ne clique pas, mais je transfère le lien au groupe de la classe.",
    "cd.chat.phishing.opc2.resposta": "Ne fais pas ça! Le lien est dangereux!",
    "cd.chat.phishing.opc2.feedback": "⚠️ VIGILANCE: Transférer des liens suspects met en danger vos amis. En cas de doute, ne partagez jamais de chaînes.",
    "cd.chat.phishing.opc3.texto": "Léo, c'est du Phishing! Regarde cette fausse adresse (.xyz). Personne ne donne de pièces contre un mot de passe. Change ton mot de passe vite!",
    "cd.chat.phishing.opc3.resposta": "Tu m'as sauvé! Je change mon mot de passe immédiatement.",
    "cd.chat.phishing.opc3.feedback": "🌟 EXCELLENT: Vous avez repéré l'URL frauduleuse, protégé votre compte et guidé votre ami. Compétence EF04CO04 maîtrisée!",
    "cd.chat.cyberbullying.nome": "Groupe de la Classe 5e B",
    "cd.chat.cyberbullying.badge": "Vie Éthique et Respect (EF04CO04 / EF01CO05)",
    "cd.chat.cyberbullying.previa": "Regardez la photo de Pedro à la récré mdr",
    "cd.chat.cyberbullying.msg": "[Photo de Pedro tombant dans une flaque] 'Mdr regardez Pedro à la récré! Faisons un autocollant et partageons-le partout!'",
    "cd.chat.cyberbullying.opc1.texto": "Mdr je fais l'autocollant et je le poste sur TikTok!",
    "cd.chat.cyberbullying.opc1.resposta": "[Pedro a quitté le groupe, très blessé]",
    "cd.chat.cyberbullying.opc1.feedback": "⚠️ GRAVE: C'est du cyberharcèlement. Diffuser des images embarrassantes sans consentement blesse et enfreint les règles.",
    "cd.chat.cyberbullying.opc2.texto": "Je coupe les notifications et je fais semblant de rien.",
    "cd.chat.cyberbullying.opc2.resposta": "[Les moqueries continuent sans intervention]",
    "cd.chat.cyberbullying.opc2.feedback": "⚠️ RÉFLEXION: Se taire laisse l'agression se poursuivre. Être citoyen numérique, c'est soutenir les autres.",
    "cd.chat.cyberbullying.opc3.texto": "Arrêtez tout le monde. Imaginez si c'était vous! Supprimez cette photo et respectez Pedro.",
    "cd.chat.cyberbullying.opc3.resposta": "Vous avez raison, on est allés trop loin. Photo supprimée. Pardon Pedro!",
    "cd.chat.cyberbullying.opc3.feedback": "🌟 EXEMPLAIRE: Vous avez agi en défenseur bienveillant (Upstander) et stoppé le harcèlement. Compétences EF01CO05 et EF04CO04!",
    "cd.chat.privacidade.nome": "ShadowGamer_99",
    "cd.chat.privacidade.badge": "Protection des Données (EF02CO04)",
    "cd.chat.privacidade.previa": "Où habites-tu? Donne ton WhatsApp!",
    "cd.chat.privacidade.msg": "Super partie! Envoie ton nom complet, ton âge et ton école pour qu'on se voie en vrai demain!",
    "cd.chat.privacidade.opc1.texto": "Je m'appelle Lucas Silva, j'ai 10 ans et je suis à l'école de 13h à 17h.",
    "cd.chat.privacidade.opc1.resposta": "Cool, je sais où te trouver demain...",
    "cd.chat.privacidade.opc1.feedback": "⚠️ DANGER: Ne donnez jamais votre nom complet, votre âge ou votre école à des inconnus en ligne.",
    "cd.chat.privacidade.opc2.texto": "Pas l'école, mais mon numéro est (99) 99999-9999.",
    "cd.chat.privacidade.opc2.resposta": "Noté! Je t'appelle.",
    "cd.chat.privacidade.opc2.feedback": "⚠️ RISQUE: Votre numéro de téléphone est une donnée sensible qui peut être utilisée pour des arnaques.",
    "cd.chat.privacidade.opc3.texto": "Je ne partage pas mes données personnelles sur internet. On se parle uniquement sur le chat du jeu.",
    "cd.chat.privacidade.opc3.resposta": "D'accord, tu as raison d'être prudent. Jouons!",
    "cd.chat.privacidade.opc3.feedback": "🌟 PARFAIT: Vous avez posé des limites claires et protégé votre vie privée. Compétence EF02CO04!",
    "cd.chat.fakenews.nome": "Tante Claudia (Famille)",
    "cd.chat.fakenews.badge": "Détective de Fake News (EF03CO04)",
    "cd.chat.fakenews.previa": "URGENT! Transférez à tous!",
    "cd.chat.fakenews.msg": "URGENT!!! Les scientifiques disent que demain internet s'arrête pendant 1 mois! Ne buvez pas l'eau du robinet! Partagez pour sauver des vies!!",
    "cd.chat.fakenews.opc1.texto": "Mon dieu ma tante! Je transfère à tous mes groupes!",
    "cd.chat.fakenews.opc1.resposta": "[La rumeur a créé la panique parmi les voisins]",
    "cd.chat.fakenews.opc1.feedback": "⚠️ ATTENTION: Les messages alarmistes sans source fiable sont typiques des infox. Les partager propage la panique.",
    "cd.chat.fakenews.opc2.texto": "Je stocke de l'eau au cas où, mais je ne partage pas.",
    "cd.chat.fakenews.opc2.resposta": "Prudence est mère de sûreté, non?",
    "cd.chat.fakenews.opc2.feedback": "⚠️ CONSEIL: Avant de paniquer, faites une recherche sur des sites d'actualité reconnus.",
    "cd.chat.fakenews.opc3.texto": "Tante, j'ai vérifié sur les sites officiels: c'est une fausse information! Ne la partage pas pour ne pas effrayer les gens.",
    "cd.chat.fakenews.opc3.resposta": "Merci de m'avoir prévenue! Je dis à tout le monde que je me suis trompée et je supprime.",
    "cd.chat.fakenews.opc3.feedback": "🌟 BRILLANT: Vous avez fait preuve d'esprit critique et stoppé la désinformation. Compétence EF03CO04!",
    "cd.sec2Titulo": "Coffre Numérique: Testeur de Mots de Passe",
    "cd.sec2Desc": "Apprenez à créer des clés inviolables. Observez en temps réel combien de temps un ordinateur mettrait à deviner votre mot de passe.",
    "cd.senhaLabel": "Entrez un mot de passe pour tester sa robustesse:",
    "cd.senhaPlaceholder": "Ex: MonEcole#2026!",
    "cd.senhaStatusPadrao": "Entrez un mot de passe à tester",
    "cd.tempoQuebraPadrao": "Temps pour casser: —",
    "cd.senhaMuitoFraca": "Très Faible",
    "cd.senhaFraca": "Faible",
    "cd.senhaMedia": "Moyen / Bon",
    "cd.senhaExcelente": "Excellent et Sécurisé!",
    "cd.quebrada0001": "Cassé en: 0.001 seconde",
    "cd.quebradaMinutos": "Cassé en: quelques minutes",
    "cd.quebradaAnos": "Cassé en: 2 à 3 ans",
    "cd.quebrada500Anos": "Cassé en: Plus de 500 ans!",
    "cd.reqAriaLabel": "Critères pour un mot de passe fort",
    "cd.req8Char": "Au moins 8 caractères",
    "cd.reqMaiusc": "Majuscules et minuscules",
    "cd.reqNum": "Au moins un chiffre",
    "cd.reqSimb": "Symboles (@, #, $, !, %)",
    "cd.dica1Titulo": "La Règle des 4 Éléments (EF02CO04)",
    "cd.dica1Desc": "Les mots de passe composés uniquement de chiffres sont trouvés en une fraction de seconde. Mélanger lettres, chiffres et symboles crée des trillions de combinaisons.",
    "cd.dica2Titulo": "Astuce Mnémotechnique",
    "cd.dica2Desc": "Créez une phrase facile à retenir pour vous mais impossible à deviner. Exemple: <em>\"JAdoreLAstronomieAIFMA#2026!\"</em>.",
    "cd.sec3Titulo": "Votre Empreinte Numérique (EF05CO04)",
    "cd.sec3Desc": "Tout ce que vous publiez ou consultez laisse des traces durables. Évaluez vos habitudes numériques.",
    "cd.pegadaLimpaTitulo": "Empreinte Numérique Propre et Protégée",
    "cd.pegadaLimpaDesc": "Vous prenez soin de votre vie privée et protégez vos données sensibles.",
    "cd.pegadaAtencaoTitulo": "Attention: Empreinte Numérique Visible",
    "cd.pegadaAtencaoDesc": "Certaines informations de votre routine sont publiques. Désactivez la géolocalisation.",
    "cd.pegadaAlertaTitulo": "Alerte: Empreinte Numérique Vulnérable!",
    "cd.pegadaAlertaDesc": "Trop de données personnelles sont exposées. N'importe qui pourrait vous localiser.",
    "cd.chkUniforme": "Je poste des photos avec l'uniforme de l'école ou devant ma maison",
    "cd.chkGps": "Je laisse le GPS activé publiquement sur les réseaux",
    "cd.chkTermos": "J'accepte les conditions des applications sans vérifier leurs données",
    "cd.chkSenhaRepetida": "J'utilise le même mot de passe simple partout",
    "cd.rodapeFim": "Projet d'Innovation SUAP/IFMA nº 14246/2025 · Startup LMS COMPASSO · Culture Numérique.",
    "rodape.copyrightCulturaDigital": "Projet d'Innovation SUAP/IFMA nº 14246/2025 · Startup LMS COMPASSO · Culture Numérique.",

  it: {
    'nav.inicio': 'Home',
    'nav.boasVindas': 'Benvenuto',
    'nav.atividades': 'Attività',
    'nav.mundoDigital': 'Mondo Digitale',
    'nav.culturaDigital': 'Cultura Digitale',
    'nav.buscar': 'Cerca',
    'nav.entrar': 'Accedi',
    'nav.criarConta': 'Crea account',
    'nav.painel': 'Pannello',
    'nav.sair': 'Esci',
    'nav.voltar': 'Indietro',
    'nav.proximo': 'Avanti',
    'i18n.rotuloSeletor': 'Cambia lingua. Lingua attuale: {atual}',
    'eixo.pensamento-computacional': 'Pensiero Computazionale',
    'eixo.mundo-digital': 'Mondo Digitale',
    'eixo.cultura-digital': 'Cultura Digitale',
    'tipo.ordenar': 'Comporre la sequenza',
    'tipo.decompor': 'Scomporre il problema',
    'tipo.robo': 'Programma il robot',
    'tipo.blocos': 'Programmazione a blocchi',
    'tipo.python3d': 'Laboratorio 3D Python',
    'nivel.1': 'Principiante',
    'nivel.2': 'Intermedio',
    'nivel.3': 'Sfida',
    'spotlight.comecarDesafio': 'Inizia la sfida',
    'spotlight.explorarGrade': 'Esplora griglia ({total})',
    'toolbar.todas': 'Tutte',
    'toolbar.filtros': 'Filtri',
    'card.naoIniciado': 'Non iniziato',
    'card.emAndamento': 'In corso',
    'card.concluido': 'Completato',
    'card.comecar': 'Inizia',
    'card.continuar': 'Continua',
    'card.jogarDeNovo': 'Rigioca',
    'card.min': 'min',
  },    'cd.metaTitulo': 'Cultura Digitale — Cittadinanza e Dialogo — LMS COMPASSO',

    // Cultura Digital (Eixo 3 BNCC)
    "cd.metaTitulo": "Cultura Digitale — Cittadinanza e Dialogo — LMS COMPASSO",
    "cd.metaDesc": "Laboratorio interattivo di Cultura Digitale: prendi decisioni etiche nelle chat, individua phishing e fake news, proteggi la tua impronta digitale e testa le password.",
    "cd.pularConteudo": "Salta al contenuto principale",
    "cd.voltarMundoDigital": "Torna a Mondo Digitale",
    "cd.culturaDigital": "Cultura Digitale",
    "cd.eixoBncc": "Ambito 3 · Informatica nella Scuola",
    "cd.heroTitulo": "Cultura Digitale: <span>Cittadinanza ed Etica Online</span>",
    "cd.heroDesc": "Come navigare in sicurezza, distinguere la verità dalle notizie false e costruire rispetto reciproco in rete? Prendi decisioni in chat simulate, scopri truffe di phishing e valuta la tua impronta digitale.",
    "cd.ctaChat": "Avvia Chat Interattiva",
    "cd.ctaCofre": "Cassaforte Password Sicure",
    "cd.ctaPegada": "Misuratore Impronta Digitale",
    "cd.tagEF01CO05": "Etica e Rispetto",
    "cd.tagEF02CO04": "Protezione Dati",
    "cd.tagEF03CO04": "Fake News e Fatti",
    "cd.tagEF04CO04": "Phishing e Cyberbullismo",
    "cd.tagEF05CO04": "Impronta Digitale",
    "cd.sec1Titulo": "ZapCompasso: Simulatore di Dialogo e Cittadinanza",
    "cd.sec1Desc": "Scegli un contatto, esamina i messaggi ricevuti e prendi la decisione migliore per proteggere i tuoi dati.",
    "cd.conversas": "Conversazioni",
    "cd.pontosCidadania": "{pontos} Punti Cittadinanza",
    "cd.onlineAgora": "Online adesso",
    "cd.decisaoRotulo": "Qual è la scelta migliore come cittadino digitale?",
    "cd.refazerCenario": "Ripeti questo scenario",
    "cd.analisePedagogica": "Analisi Pedagogica:",
    "cd.horaAgora": "Adesso",
    "cd.cenariosAriaLabel": "Scenari di dialogo digitale",
    "cd.chat.phishing.nome": "Leo (Amico di gioco)",
    "cd.chat.phishing.badge": "Phishing e Ingegneria Sociale (EF04CO04)",
    "cd.chat.phishing.previa": "Ehi, ho trovato un sito con monete gratis!",
    "cd.chat.phishing.msg": "Ehi, guarda questo sito che regala 10.000 monete nel gioco oggi! Clicca subito e metti la password: http://robl0x-free-coins.xyz/login",
    "cd.chat.phishing.opc1.texto": "Grazie Leo! Clicco subito e inserisco la password per avere le monete.",
    "cd.chat.phishing.opc1.resposta": "Accidenti... sei caduto nella trappola! Il mio account è stato hackerato e il bot ha mandato quel link!",
    "cd.chat.phishing.opc1.feedback": "⚠️ ATTENZIONE: Questo è un attacco di Phishing! L'indirizzo è falso (.xyz). Nessun gioco ufficiale chiede credenziali su siti esterni.",
    "cd.chat.phishing.opc2.texto": "Non clicco adesso, ma inoltro il link al gruppo della classe.",
    "cd.chat.phishing.opc2.resposta": "Non farlo! Quel link è pericoloso!",
    "cd.chat.phishing.opc2.feedback": "⚠️ CAUTELA: Inoltrare link sospetti mette a rischio amici e familiari. Non diffondere catene di messaggi.",
    "cd.chat.phishing.opc3.texto": "Leo, questa è una truffa di Phishing! Guarda il link falso (.xyz). Nessuno regala monete in cambio di password. Cambia subito password!",
    "cd.chat.phishing.opc3.resposta": "Mi hai salvato! Cambio subito la password prima che rubino il mio account!",
    "cd.chat.phishing.opc3.feedback": "🌟 ECCELLENTE: Hai individuato l'URL ingannevole, protetto il tuo account e aiutato il tuo amico. Abilità EF04CO04 padroneggiata!",
    "cd.chat.cyberbullying.nome": "Gruppo Classe 5ª B",
    "cd.chat.cyberbullying.badge": "Convivenza Etica e Rispetto (EF04CO04 / EF01CO05)",
    "cd.chat.cyberbullying.previa": "Guardate la foto di Pedro durante la ricreazione lol",
    "cd.chat.cyberbullying.msg": "[Foto di Pedro che scivola in una pozzanghera] 'Lol guardate che figuraccia Pedro! Facciamo uno sticker e condividiamolo ovunque!'",
    "cd.chat.cyberbullying.opc1.texto": "Haha faccio lo sticker subito e lo pubblico su TikTok!",
    "cd.chat.cyberbullying.opc1.resposta": "[Pedro è uscito dal gruppo ferito]",
    "cd.chat.cyberbullying.opc1.feedback": "⚠️ GRAVE: Questo è Cyberbullismo. Condividere immagini imbarazzanti senza permesso ferisce le persone.",
    "cd.chat.cyberbullying.opc2.texto": "Silenzio il gruppo e faccio finta di niente.",
    "cd.chat.cyberbullying.opc2.resposta": "[Le prese in giro continuano senza che nessuno intervenga]",
    "cd.chat.cyberbullying.opc2.feedback": "⚠️ RIFLESSIONE: Il silenzio consente all'aggressione di continuare. Sii un cittadino consapevole.",
    "cd.chat.cyberbullying.opc3.texto": "Ragazzi, basta. Immaginate se foste voi! Cancellate quella foto, non fate sticker e rispettate Pedro.",
    "cd.chat.cyberbullying.opc3.resposta": "Avete ragione, abbiamo esagerato. Foto cancellata. Scusa Pedro!",
    "cd.chat.cyberbullying.opc3.feedback": "🌟 ESEMPLARE: Hai agito come Upstander, fermando la prepotenza e mostrando empatia. Abilità EF01CO05 e EF04CO04!",
    "cd.chat.privacidade.nome": "ShadowGamer_99",
    "cd.chat.privacidade.badge": "Protezione Dati e Privacy (EF02CO04)",
    "cd.chat.privacidade.previa": "Dove vivi? Mandami il tuo WhatsApp!",
    "cd.chat.privacidade.msg": "Bella partita! Inviami nome completo, età e scuola per vederci di persona domani!",
    "cd.chat.privacidade.opc1.texto": "Mi chiamo Lucas Silva, ho 10 anni e vado alla scuola elementare dalle 13 alle 17.",
    "cd.chat.privacidade.opc1.resposta": "Ottimo, ora so dove trovarti domani...",
    "cd.chat.privacidade.opc1.feedback": "⚠️ PERICOLO: Non condividere mai nome completo, età o scuola con sconosciuti online!",
    "cd.chat.privacidade.opc2.texto": "La scuola no, ma il mio numero è (99) 99999-9999.",
    "cd.chat.privacidade.opc2.resposta": "Segnato! Ti chiamo subito.",
    "cd.chat.privacidade.opc2.feedback": "⚠️ RISCHIO: Il numero di telefono è un dato personale sensibile che può essere sfruttato da malintenzionati.",
    "cd.chat.privacidade.opc3.texto": "Non condivido dati personali o la mia routine su internet. Parliamo solo nella chat del gioco.",
    "cd.chat.privacidade.opc3.resposta": "Va bene, fai bene ad essere prudente. Pensiamo alla partita!",
    "cd.chat.privacidade.opc3.feedback": "🌟 PERFETTO: Hai stabilito confini chiari di riservatezza e protetto la tua identità. Abilità EF02CO04!",
    "cd.chat.fakenews.nome": "Zia Claudia (Famiglia)",
    "cd.chat.fakenews.badge": "Investigatore di Fake News (EF03CO04)",
    "cd.chat.fakenews.previa": "URGENTE! Inoltrate a tutti!",
    "cd.chat.fakenews.msg": "URGENTE!!! Scienziati avvertono che domani internet sarà disattivato per 1 mese in tutto il mondo! Non bevete acqua del rubinetto! Condividete per salvare vite!!",
    "cd.chat.fakenews.opc1.texto": "Mamma mia zia! Lo mando a tutti i miei gruppi subito!",
    "cd.chat.fakenews.opc1.resposta": "[La voce si è diffusa creando panico]",
    "cd.chat.fakenews.opc1.feedback": "⚠️ ATTENZIONE: Messaggi allarmisti pieni di punti esclamativi senza fonti credibili sono tipiche Fake News.",
    "cd.chat.fakenews.opc2.texto": "Faccio scorta d'acqua per sicurezza, ma non inoltro.",
    "cd.chat.fakenews.opc2.resposta": "Meglio prevenire, no?",
    "cd.chat.fakenews.opc2.feedback": "⚠️ CONSIGLIO: Prima di allarmarti, fai una rapida ricerca su siti di notizie affidabili.",
    "cd.chat.fakenews.opc3.texto": "Zia, ho controllato sui giornali ufficiali: è una notizia falsa! Per favore non inoltrarla per non spaventare nessuno.",
    "cd.chat.fakenews.opc3.resposta": "Grazie di avermi avvisata! Dico a tutti che ho sbagliato e cancello.",
    "cd.chat.fakenews.opc3.feedback": "🌟 BRILLANTE: Hai usato pensiero critico, verificato le fonti e interrotto la disinformazione. Abilità EF03CO04!",
    "cd.sec2Titulo": "Cassaforte Digitale: Tester Password Sicure",
    "cd.sec2Desc": "Impara a costruire chiavi inviolabili. Guarda in tempo reale quanto tempo impiegherebbe un computer a indovinare la tua password.",
    "cd.senhaLabel": "Digita una password per testarne la forza:",
    "cd.senhaPlaceholder": "Es: MiaScuola#2026!",
    "cd.senhaStatusPadrao": "Digita una password da testare",
    "cd.tempoQuebraPadrao": "Tempo per decifrare: —",
    "cd.senhaMuitoFraca": "Molto Debole",
    "cd.senhaFraca": "Debole",
    "cd.senhaMedia": "Media / Buona",
    "cd.senhaExcelente": "Eccellente e Sicura!",
    "cd.quebrada0001": "Decifrata in: 0.001 secondi",
    "cd.quebradaMinutos": "Decifrata in: pochi minuti",
    "cd.quebradaAnos": "Decifrata in: 2 o 3 anni",
    "cd.quebrada500Anos": "Decifrata in: Più di 500 anni!",
    "cd.reqAriaLabel": "Requisiti per una password forte",
    "cd.req8Char": "Almeno 8 caratteri",
    "cd.reqMaiusc": "Lettere maiuscole e minuscole",
    "cd.reqNum": "Almeno un numero",
    "cd.reqSimb": "Simboli (@, #, $, !, %)",
    "cd.dica1Titulo": "La Regola dei 4 Elementi (EF02CO04)",
    "cd.dica1Desc": "Password formate solo da numeri vengono scoperte in una frazione di secondo. Unire lettere, numeri e simboli crea trilioni di combinazioni.",
    "cd.dica2Titulo": "Consiglio Mnemonico per Studenti",
    "cd.dica2Desc": "Crea frasi facili da ricordare per te ma impossibili da indovinare per gli altri. Esempio: <em>\"AmoLAstronomiaAllIFMA#2026!\"</em>.",
    "cd.sec3Titulo": "La Tua Impronta Digitale nel Mondo (EF05CO04)",
    "cd.sec3Desc": "Tutto ciò che condividi online lascia tracce permanenti. Controlla le tue abitudini.",
    "cd.pegadaLimpaTitulo": "Impronta Digitale Pulita e Protetta",
    "cd.pegadaLimpaDesc": "Ti prendi cura della tua privacy e tieni al sicuro la tua identità.",
    "cd.pegadaAtencaoTitulo": "Attenzione: Impronta Digitale Visibile",
    "cd.pegadaAtencaoDesc": "Alcune informazioni della tua routine sono pubbliche. Disattiva la geolocalizzazione.",
    "cd.pegadaAlertaTitulo": "Allarme: Impronta Digitale Vulnerabile!",
    "cd.pegadaAlertaDesc": "Troppi dati personali esposti. Chiunque potrebbe rintracciarti.",
    "cd.chkUniforme": "Pubblico foto con la divisa scolastica o davanti casa",
    "cd.chkGps": "Lascio la posizione GPS sempre pubblica sui social",
    "cd.chkTermos": "Accetto condizioni di app e giochi senza verificare quali dati raccolgono",
    "cd.chkSenhaRepetida": "Uso la stessa semplice password per email, giochi e social",
    "cd.rodapeFim": "Progetto di Innovazione SUAP/IFMA nº 14246/2025 · Startup LMS COMPASSO · Cultura Digitale.",
    "rodape.copyrightCulturaDigital": "Progetto di Innovazione SUAP/IFMA nº 14246/2025 · Startup LMS COMPASSO · Cultura Digitale.",

  tr: {
    'nav.inicio': 'Ana Sayfa',
    'nav.boasVindas': 'Hoş Geldiniz',
    'nav.atividades': 'Etkinlikler',
    'nav.mundoDigital': 'Dijital Dünya',
    'nav.culturaDigital': 'Dijital Kültür',
    'nav.buscar': 'Ara',
    'nav.entrar': 'Giriş Yap',
    'nav.criarConta': 'Hesap Oluştur',
    'nav.painel': 'Panel',
    'nav.sair': 'Çıkış Yap',
    'nav.voltar': 'Geri',
    'nav.proximo': 'İleri',
    'i18n.rotuloSeletor': 'Dili değiştir. Geçerli dil: {atual}',
    'eixo.pensamento-computacional': 'Bilgi-İşlemsel Düşünme',
    'eixo.mundo-digital': 'Dijital Dünya',
    'eixo.cultura-digital': 'Dijital Kültür',
    'tipo.ordenar': 'Sıralama oluştur',
    'tipo.decompor': 'Problemi böl',
    'tipo.robo': 'Robotu programla',
    'tipo.blocos': 'Blok programlama',
    'tipo.python3d': '3D Python Laboratuvarı',
    'nivel.1': 'Başlangıç',
    'nivel.2': 'Orta',
    'nivel.3': 'Meydan Okuma',
    'spotlight.comecarDesafio': 'Meydan Okumaya Başla',
    'toolbar.todas': 'Tümü',
    'toolbar.filtros': 'Filtreler',
    'card.naoIniciado': 'Başlanmadı',
    'card.emAndamento': 'Devam Ediyor',
    'card.concluido': 'Tamamlandı',
    'card.comecar': 'Başla',
    'card.continuar': 'Devam Et',
    'card.jogarDeNovo': 'Tekrar Oyna',
    'card.min': 'dk',
  },    'cd.metaTitulo': 'Dijital Kültür — Vatandaşlık ve Diyalog — LMS COMPASSO',

    // Cultura Digital (Eixo 3 BNCC)
    "cd.metaTitulo": "Dijital Kültür — Vatandaşlık ve Diyalog — LMS COMPASSO",
    "cd.metaDesc": "Dijital Kültür Laboratuvarı: etkileşimli sohbetlerde etik kararlar alın, oltalama ve sahte haberleri tespit edin, dijital ayak izinizi koruyun.",
    "cd.pularConteudo": "Ana içeriğe geç",
    "cd.voltarMundoDigital": "Dijital Dünya'ya Dön",
    "cd.culturaDigital": "Dijital Kültür",
    "cd.eixoBncc": "Alan 3 · Bilişim Müfredatı",
    "cd.heroTitulo": "Dijital Kültür: <span>Çevrimiçi Vatandaşlık ve Etik</span>",
    "cd.heroDesc": "İnternette güvenle nasıl geziniriz, doğruları söylentilerden nasıl ayırt ederiz? Simüle sohbetlerde kararlar verin, oltalama tuzaklarını keşfedin ve dijital ayak izinizi ölçün.",
    "cd.ctaChat": "Etkileşimli Sohbeti Başlat",
    "cd.ctaCofre": "Güvenli Şifre Kasası",
    "cd.ctaPegada": "Dijital Ayak İzi Ölçer",
    "cd.tagEF01CO05": "Etik ve Saygı",
    "cd.tagEF02CO04": "Veri Koruma",
    "cd.tagEF03CO04": "Sahte Haber ve Gerçekler",
    "cd.tagEF04CO04": "Oltalama ve Siber Zorbalık",
    "cd.tagEF05CO04": "Dijital Ayak İzi",
    "cd.sec1Titulo": "ZapCompasso: Diyalog ve Dijital Vatandaşlık Simülatörü",
    "cd.sec1Desc": "Kenar çubuğundan bir kişi seçin, gelen mesajları inceleyin ve verilerinizi korumak için doğru kararı verin.",
    "cd.conversas": "Sohbetler",
    "cd.pontosCidadania": "{pontos} Vatandaşlık Puanı",
    "cd.onlineAgora": "Şimdi çevrimiçi",
    "cd.decisaoRotulo": "Dijital bir vatandaş olarak en doğru tutum nedir?",
    "cd.refazerCenario": "Bu senaryoyu tekrarla",
    "cd.analisePedagogica": "Pedagojik Analiz:",
    "cd.horaAgora": "Şimdi",
    "cd.cenariosAriaLabel": "Dijital diyalog senaryoları",
    "cd.chat.phishing.nome": "Leo (Oyun Arkadaşı)",
    "cd.chat.phishing.badge": "Oltalama ve Sosyal Mühendislik (EF04CO04)",
    "cd.chat.phishing.previa": "Dostum, bedava jeton veren bir site buldum!",
    "cd.chat.phishing.msg": "Dostum, oyunda bugün 10.000 bedava jeton dağıtan bu siteye bak! Hemen tıkla ve şifreni gir: http://robl0x-free-coins.xyz/login",
    "cd.chat.phishing.opc1.texto": "Sağ ol Leo! Jetonları almak için hemen tıklayıp şifremi gireceğim.",
    "cd.chat.phishing.opc1.resposta": "Eyvah... Tuzağa düştün! Hesabım hacklendi ve saldırgan bu linki sana gönderdi!",
    "cd.chat.phishing.opc1.feedback": "⚠️ DİKKAT: Bu bir Oltalama saldırısıdır! Sahte bir alan adı (.xyz) kullanılıyor. Hiçbir resmi oyun harici sitede şifre istemez.",
    "cd.chat.phishing.opc2.texto": "Şimdi tıklamam ama linki sınıf grubuna iletirim.",
    "cd.chat.phishing.opc2.resposta": "Bunu yapma! O link çok tehlikeli!",
    "cd.chat.phishing.opc2.feedback": "⚠️ UYARI: Şüpheli bağlantıları iletmek arkadaşlarınızı tehlikeye atar. Emin olmadığınız zincir mesajları yaymayın.",
    "cd.chat.phishing.opc3.texto": "Leo, bu bir oltalama tuzağı! Sahte (.xyz) adresine bak. Kimse şifre karşılığı bedava jeton vermez. Şifreni hemen değiştir!",
    "cd.chat.phishing.opc3.resposta": "Beni kurtardın! Hesabımı çalmadan hemen şifremi değiştiriyorum!",
    "cd.chat.phishing.opc3.feedback": "🌟 HARİKA: Sahte URL'yi fark ettiniz, hesabınızı korudunuz ve arkadaşınızı uyardınız. Beceri EF04CO04 kazanıldı!",
    "cd.chat.cyberbullying.nome": "5-B Sınıf Grubu",
    "cd.chat.cyberbullying.badge": "Etik Birliktelik ve Saygı (EF04CO04 / EF01CO05)",
    "cd.chat.cyberbullying.previa": "Teneffüste Pedro'nun haline bakın haha",
    "cd.chat.cyberbullying.msg": "[Pedro'nun su birikintisine düştüğü fotoğraf] 'Haha Pedro teneffüste ne hale geldi bakın! Çıkartma yapıp her yere atalım!'",
    "cd.chat.cyberbullying.opc1.texto": "Haha hemen çıkartma yapıp TikTok'ta paylaşıyorum!",
    "cd.chat.cyberbullying.opc1.resposta": "[Pedro kırılarak gruptan ayrıldı]",
    "cd.chat.cyberbullying.opc1.feedback": "⚠️ CİDDİ: Bu Siber Zorbalıktır. İznisiz utanç verici fotoğraflar paylaşmak gerçek zarara yol açar ve kuralları çiğner.",
    "cd.chat.cyberbullying.opc2.texto": "Grubu sessize alıp hiçbir şey görmemiş gibi yapacağım.",
    "cd.chat.cyberbullying.opc2.resposta": "[Alaylar kimse durdurmadan devam ediyor]",
    "cd.chat.cyberbullying.opc2.feedback": "⚠️ DÜŞÜNÜN: Sessiz kalmak saldırının sürmesine izin verir. Bilinçli bir vatandaş zorbalığa uğrayanı destekler.",
    "cd.chat.cyberbullying.opc3.texto": "Arkadaşlar kesin şunu. Ya sizin başınıza gelseydi? O fotoğrafı silin, çıkartma yapmayın ve Pedro'ya saygı gösterin.",
    "cd.chat.cyberbullying.opc3.resposta": "Haklısınız, çok ileri gittik. Fotoğrafı sildik. Özür dileriz Pedro!",
    "cd.chat.cyberbullying.opc3.feedback": "🌟 ÖRNEK DAVRANIŞ: Aktif bir savunucu (Upstander) olarak zorbalığı durdurdunuz ve empati gösterdiniz. Beceriler EF01CO05 ve EF04CO04!",
    "cd.chat.privacidade.nome": "ShadowGamer_99",
    "cd.chat.privacidade.badge": "Veri Koruma ve Gizlilik (EF02CO04)",
    "cd.chat.privacidade.previa": "Nerede oturuyorsun? WhatsApp numaranı ver!",
    "cd.chat.privacidade.msg": "Çok iyi maçtı! Yarın yüz yüze oynamak için adını, yaşını ve okulunu yaz!",
    "cd.chat.privacidade.opc1.texto": "Adım Lucas Silva, 10 yaşındayım ve 13:00-17:00 arası okuldayım.",
    "cd.chat.privacidade.opc1.resposta": "Harika, artık yarın seni nerede bulacağımı biliyorum...",
    "cd.chat.privacidade.opc1.feedback": "⚠️ CİDDİ TEHLİKE: İnternette yabancılara asla tam adınızı, yaşınızı, okulunuzu veya günlük planınızı vermeyin!",
    "cd.chat.privacidade.opc2.texto": "Okulu söylemem ama telefonum: (99) 99999-9999.",
    "cd.chat.privacidade.opc2.resposta": "Kaydettim! Şimdi arıyorum.",
    "cd.chat.privacidade.opc2.feedback": "⚠️ RİSK: Telefon numaranız da hassas bir kişisel veridir ve kötüye kullanılabilir.",
    "cd.chat.privacidade.opc3.texto": "İnternette kişisel bilgilerimi paylaşmam. Sadece oyun içi sohbetten konuşalım.",
    "cd.chat.privacidade.opc3.resposta": "Tamam, dikkatli olmakta haklısın. Maça odaklanalım!",
    "cd.chat.privacidade.opc3.feedback": "🌟 MÜKEMMEL: Net gizlilik sınırları koydunuz ve kişisel verilerinizi korudunuz. Beceri EF02CO04!",
    "cd.chat.fakenews.nome": "Claudia Teyze (Aile)",
    "cd.chat.fakenews.badge": "Sahte Haber Dedektifi (EF03CO04)",
    "cd.chat.fakenews.previa": "ACİL! Herkese iletin!",
    "cd.chat.fakenews.msg": "ACİL!!! Herkese iletin: bilim insanları yarın tüm dünyada internetin 1 ay kesileceğini söylüyor! Musluk suyu içmeyin! Hayat kurtarmak için paylaşın!!",
    "cd.chat.fakenews.opc1.texto": "Aman tanrım teyze! Hemen tüm gruplarıma gönderiyorum!",
    "cd.chat.fakenews.opc1.resposta": "[Söylenti yayıldı ve komşular arasında panik çıktı]",
    "cd.chat.fakenews.opc1.feedback": "⚠️ DİKKAT: Ünlem işaretleriyle dolu kaynaksız alarmist mesajlar tipik Sahte Haberlerdir.",
    "cd.chat.fakenews.opc2.texto": "Ne olur ne olmaz su stoklarım ama kimseye iletmem.",
    "cd.chat.fakenews.opc2.resposta": "Tedbirli olmak iyidir, değil mi?",
    "cd.chat.fakenews.opc2.feedback": "⚠️ İPUCU: Endişelenmeden önce güvenilir haber kaynaklarını kontrol edin.",
    "cd.chat.fakenews.opc3.texto": "Teyze, resmi haber kaynaklarına baktım: bu tamamen uydurma bir haber! Lütfen insanları korkutmamak için yaymayın.",
    "cd.chat.fakenews.opc3.resposta": "Uyardığın için teşekkür ederim canım! Yanıldığımı söyleyip hemen siliyorum.",
    "cd.chat.fakenews.opc3.feedback": "🌟 HARİKA: Eleştirel düşündünüz, bilgiyi doğruladınız ve yanlış bilginin yayılmasını durdurdunuz. Beceri EF03CO04!",
    "cd.sec2Titulo": "Dijital Kasa: Güvenli Şifre Test Edici",
    "cd.sec2Desc": "Kırılamaz dijital anahtarlar oluşturmayı öğrenin. Bir bilgisayarın şifrenizi tahmin etmesinin ne kadar süreceğini görün.",
    "cd.senhaLabel": "Gücünü test etmek için bir şifre girin:",
    "cd.senhaPlaceholder": "Örn: Okulum#2026!",
    "cd.senhaStatusPadrao": "Test etmek için bir şifre yazın",
    "cd.tempoQuebraPadrao": "Kırılma süresi: —",
    "cd.senhaMuitoFraca": "Çok Zayıf",
    "cd.senhaFraca": "Zayıf",
    "cd.senhaMedia": "Orta / İyi",
    "cd.senhaExcelente": "Mükemmel ve Güvenli!",
    "cd.quebrada0001": "Kırılma: 0.001 saniye",
    "cd.quebradaMinutos": "Kırılma: birkaç dakika",
    "cd.quebradaAnos": "Kırılma: 2 - 3 yıl",
    "cd.quebrada500Anos": "Kırılma: 500 yıldan fazla!",
    "cd.reqAriaLabel": "Güçlü şifre gereksinimleri",
    "cd.req8Char": "En az 8 karakter",
    "cd.reqMaiusc": "Büyük ve küçük harfler",
    "cd.reqNum": "En az bir rakam",
    "cd.reqSimb": "Semboller (@, #, $, !, %)",
    "cd.dica1Titulo": "4 Element Kuralı (EF02CO04)",
    "cd.dica1Desc": "Sadece rakamlardan oluşan şifreler saniyeler içinde kırılır. Kelimeleri sayılar ve sembollerle birleştirmek trilyonlarca olasılık yaratır.",
    "cd.dica2Titulo": "Öğrenciler için Hatırlatma İpucu",
    "cd.dica2Desc": "Sizin kolayca hatırlayacağınız ama başkalarının tahmin edemeyeceği cümleler kurun. Örnek: <em>\"IFMAdaGokyuzunuSeviyorum#2026!\"</em>.",
    "cd.sec3Titulo": "Dünyadaki Dijital Ayak İziniz (EF05CO04)",
    "cd.sec3Desc": "İnternette paylaştığınız ve kaydettiğiniz her şey kalıcı izler bırakır. Ayak izinizi değerlendirin.",
    "cd.pegadaLimpaTitulo": "Temiz ve Korumalı Dijital Ayak İzi",
    "cd.pegadaLimpaDesc": "Gizliliğinize özen gösteriyor ve kişisel verilerinizi koruyorsunuz.",
    "cd.pegadaAtencaoTitulo": "Dikkat: Görünür Dijital Ayak İzi",
    "cd.pegadaAtencaoDesc": "Günlük hayatınızla ilgili bazı bilgiler herkese açık. Konumları kapatın ve gizliliği gözden geçirin.",
    "cd.pegadaAlertaTitulo": "Uyarı: Hassas Dijital Ayak İzi!",
    "cd.pegadaAlertaDesc": "Çok fazla kişisel veri açıkta. Biri gerçek hayattaki adımlarınızı takip edebilir.",
    "cd.chkUniforme": "Okul üniformasıyla veya evimin önünde fotoğraf paylaşıyorum",
    "cd.chkGps": "Sosyal medyada halka açık GPS konumunu açık bırakıyorum",
    "cd.chkTermos": "Uygulama ve oyun şartlarını ne topladıklarına bakmadan kabul ediyorum",
    "cd.chkSenhaRepetida": "E-posta, oyun ve sosyal medya için aynı basit şifreyi kullanıyorum",
    "cd.rodapeFim": "SUAP/IFMA İnovasyon Projesi No 14246/2025 · Startup LMS COMPASSO · Dijital Kültür Alanı.",
    "rodape.copyrightCulturaDigital": "SUAP/IFMA İnovasyon Projesi No 14246/2025 · Startup LMS COMPASSO · Dijital Kültür Alanı.",

  ru: {
    // Навигация
    'nav.inicio': 'Главная',
    'nav.boasVindas': 'О платформе',
    'nav.atividades': 'Задания',
    'nav.mundoDigital': 'Цифровой мир',
    'nav.culturaDigital': 'Цифровая культура',
    'nav.buscar': 'Поиск',
    'nav.entrar': 'Войти',
    'nav.criarConta': 'Регистрация',
    'nav.painel': 'Панель',
    'nav.sair': 'Выйти',
    'nav.buscarAriaLabel': 'Поиск заданий BNCC',
    'nav.voltar': 'Назад',
    'nav.proximo': 'Далее',
    'nav.voltarPara': 'Назад к:',

    // Селектор языка
    'i18n.rotuloSeletor': 'Сменить язык. Текущий язык: {atual}',
    'i18n.listaAriaLabel': 'Доступные языки',
    'i18n.anuncioTroca': 'Язык изменен на {nome}.',

    // Wayfinding и хлебные крошки
    'wf.voceEstaAqui': 'Вы здесь',
    'wf.voltarTrilhas': 'Вернуться к трекам',
    'wf.inicio': 'Главная',
    'wf.pensamentoComputacional': 'Вычислительное мышление',
    'wf.atividadesLab3d': 'Задания и 3D Лаборатория',

    // Направления BNCC (Eixos)
    'eixo.pensamento-computacional': 'Вычислительное мышление',
    'eixo.mundo-digital': 'Цифровой мир',
    'eixo.cultura-digital': 'Цифровая культура',

    // Типы заданий
    'tipo.ordenar': 'Собрать последовательность',
    'tipo.decompor': 'Разбить задачу',
    'tipo.robo': 'Программирование робота',
    'tipo.blocos': 'Блочное программирование',
    'tipo.python3d': '3D Python Лаборатория',

    // Уровни
    'nivel.1': 'Начальный',
    'nivel.2': 'Средний',
    'nivel.3': 'Испытание',

    // Классы обучения
    'faixa.f1': '1-3 классы',
    'faixa.f2': '4-5 классы',
    'faixa.f3': '6-9 классы',

    // Концепции
    'conceito.algoritmos': 'Повседневные алгоритмы',
    'conceito.decomposicao': 'Логическая декомпозиция',

    // Spotlight Hero (CinemaOS)
    'spotlight.destaqueAriaLabel': 'Рекомендуемое задание',
    'spotlight.kickerRecomendada': 'Рекомендуемая миссия',
    'spotlight.kickerRetomar': 'Продолжить с места остановки',
    'spotlight.kickerConcluida': 'Трек BNCC освоен!',
    'spotlight.comecarDesafio': 'Начать задание',
    'spotlight.retomarAtividade': 'Возобновить задание',
    'spotlight.jogarNovamente': 'Пройти снова',
    'spotlight.explorarGrade': 'Обзор сетки ({total})',
    'spotlight.certificado3d': '3D Сертификат ({concluidas}/{total})',
    'spotlight.certificado3dTitulo': 'Официальный сертификат исследователя Python 3D',
    'spotlight.trilhaProgresso': 'Трек заданий: выполнено {concluidas} из {total} ({percentual}%)',
    'spotlight.xpConquistados': '+{xp} XP получено',
    'spotlight.cliqueParaJogar': 'Нажмите, чтобы начать',
    'spotlight.proximaAtividade': 'Следующее задание',
    'spotlight.verTodas': 'Все задания',
    'spotlight.certificado3dEmitir': 'Получить сертификат Python 3D',
    'spotlight.certificado3dVisualizar': 'Просмотреть сертификат Python 3D',

    // Панель поиска и фильтров (Toolbar)
    'toolbar.secaoAriaLabel': 'Общий каталог заданий',
    'toolbar.buscaPlaceholder': 'Поиск по названию, концепции или коду BNCC (напр. EF05CO01, Робот)...',
    'toolbar.buscaAriaLabel': 'Поиск заданий по названию или коду навыка BNCC',
    'toolbar.limparBusca': 'Очистить поиск',
    'toolbar.todas': 'Все',
    'toolbar.python3d': 'Python 3D',
    'toolbar.algoritmos': 'Алгоритмы',
    'toolbar.decomposicao': 'Декомпозиция',
    'toolbar.robo': 'Робот на карте',
    'toolbar.blocos': 'Блоки',
    'toolbar.filtros': 'Фильтры',
    'toolbar.anoEscolar': 'Класс обучения:',
    'toolbar.todosAnos': 'Все классы',
    'toolbar.habilidadeBncc': 'Навык BNCC:',
    'toolbar.todasHabilidades': 'Все навыки BNCC',
    'toolbar.limparFiltros': 'Сбросить фильтры',

    // Карточки
    'card.naoIniciado': 'Не начато',
    'card.emAndamento': 'В процессе',
    'card.concluido': 'Завершено',
    'card.comecar': 'Начать',
    'card.continuar': 'Продолжить',
    'card.jogarDeNovo': 'Пройти снова',
    'card.min': 'мин',

    // Пустое состояние
    'vazio.titulo': 'По этому фильтру задания не найдены',
    'vazio.descricao': 'Попробуйте изменить поисковый запрос или сбросить фильтры.',
    'vazio.mostrarTodas': 'Показать все задания',
    'vazio.irInicio': 'На главную',

    // Страница ошибки 404
    'erro404.titulo': 'Задание не найдено (Ошибка 404)',
    'erro404.subtitulo': 'Страница не найдена (404)',
    'erro404.descricao': 'Мы не смогли найти запрошенное задание. Возможно, оно было перемещено или код не существует.',

    // Задания (Заголовки и инструкции)
    'atv.ordenar-escovar-dentes.titulo': 'Построй алгоритм: чистка зубов',
    'atv.ordenar-escovar-dentes.resumo': 'Расположи шаги чистки зубов в правильном порядке.',
    'atv.ordenar-escovar-dentes.instrucao': 'Нажимай на шаги по очереди, чтобы составить алгоритм в правильном порядке. Внимание: один из шагов лишний!',
    'atv.ordenar-atravessar-rua.titulo': 'Построй алгоритм: безопасный переход улицы',
    'atv.ordenar-atravessar-rua.resumo': 'Организуй шаги для безопасного перехода улицы по светофору.',
    'atv.ordenar-atravessar-rua.instrucao': 'Построй верную последовательность действий для перехода дороги.',
    'atv.decompor-sanduiche.titulo': 'Раздели задачу: приготовление сэндвича',
    'atv.decompor-sanduiche.resumo': 'Разбей приготовление сэндвича на простые этапы.',
    'atv.decompor-sanduiche.instrucao': 'Раздели процесс на части и распредели ингредиенты.',
    'atv.py3d-labirinto-1.titulo': 'Python 3D: Лабиринт в трёх измерениях',
    'atv.py3d-labirinto-1.resumo': 'Проведи робота к цели в 3D с помощью команд на Python.',
    'atv.py3d-labirinto-1.instrucao': 'Используй команды вперед, поворот и прыжок для прохождения лабиринта.',

    // Подвал
    'rodape.plataforma': 'Платформа',
    'rodape.projeto': 'Проект',
    'rodape.descricao': 'Открытая платформа для обучения информатике в школе, согласованная со стандартами Computação.',

    // Mundo Digital — Метаданные и Навигация
    'md.metaTitulo': 'Цифровой мир — 3D Лаборатория аппаратного обеспечения и сетей — LMS COMPASSO',
    'md.metaDesc': 'Интерактивная лаборатория направления "Цифровой мир": исследуйте материнскую плату в 3D, собирайте компоненты, изучайте такт процессора и передачу пакетов в сети.',
    'md.badgeEixo': 'Направление 2 · Школьная Информатика',
    'md.heroTitulo': 'Цифровой мир: <span>Железо и Сети</span>',
    'md.heroDesc': 'Как компьютеры мыслят, хранят информацию и общаются через кабели и радиоволны? Исследуйте 3D материнскую плату, работу процессора и движение пакетов по интернету.',
    'md.ctaPlaca': 'Исследовать 3D-плату',
    'md.ctaCpu': 'Симулировать такт CPU',
    'md.ctaRedes': 'Трафик пакетов в интернете',
    'md.tagEF01CO04': 'Периферия ввода/вывода',
    'md.tagEF02CO03': 'Компоненты и память',
    'md.tagEF04CO03': 'Данные и сети',
    'md.tagEF05CO03': 'Архитектура процессора',
    'md.tagEF69CO05': 'Маршрутизация и интернет',

    // Секция 1: 3D Материнская плата и PC Builder
    'md.sec1Titulo': '3D Материнская плата: Рентген и PC Builder',
    'md.sec1Desc': 'Нажимайте на компоненты для изучения их устройства или соберите компьютер в интерактивном вызове.',
    'md.statusPostEspera': 'В ожидании (Выключен)',
    'md.statusPostAtivo': 'POST завершен (ОС активна)',
    'md.ariaVisualizacao': 'Режимы просмотра материнской платы',
    'md.vistaIsometrica': '3D Изометрия',
    'md.vistaTopo': 'Сверху',
    'md.vistaLateral': 'Профиль',
    'md.compCpuRotulo': 'Процессор',
    'md.compRamRotulo': 'Оперативная память',
    'md.compSsdRotulo': 'SSD-накопитель',
    'md.compGpuRotulo': 'Видеокарта (GPU)',
    'md.compIoRotulo': 'Порты ввода/вывода',
    'md.analogiaTitulo': 'Обучающая аналогия',

    // Характеристики
    'md.spec.velTipica': 'Типичная частота',
    'md.spec.unidInternas': 'Внутренние блоки',
    'md.spec.bncc': 'Стандарт программы',
    'md.spec.tecAtual': 'Современная технология',
    'md.spec.volatilidade': 'Энергозависимость',
    'md.spec.interface': 'Интерфейс',
    'md.spec.memoria': 'Память',
    'md.spec.saidasVideo': 'Видеовыходы',
    'md.spec.entradas': 'Входы',
    'md.spec.saidas': 'Выходы',

    // CPU Данные
    'md.cpu.nome': 'Центральный процессор (CPU)',
    'md.cpu.categoria': 'Вычислительный блок (Мозг компьютера)',
    'md.cpu.desc': 'CPU выполняет команды программ, проводя миллиарды математических и логических операций в секунду.',
    'md.cpu.analogia': 'Словно шеф-повар ресторана: получает заказы (инструкции), готовит блюда и руководит кухней.',
    'md.cpu.spec1': '3.2 – 5.0 ГГц (Миллиарды тактов/с)',
    'md.cpu.spec2': 'АЛУ (Расчеты), УУ (Управление), Регистры',
    'md.cpu.spec3': 'EF05CO03 (Архитектура и такт команд)',

    // RAM Данные
    'md.ram.nome': 'Оперативная память (DDR5 RAM)',
    'md.ram.categoria': 'Быстрая энергозависимая основная память',
    'md.ram.desc': 'RAM временно хранит данные, нужные процессору прямо сейчас. При отключении питания данные стираются.',
    'md.ram.analogia': 'Как учебный стол: во время урока на нем лежат тетради, а после занятий стол полностью чист.',
    'md.ram.spec1': 'DDR5 5600 МТ/с',
    'md.ram.spec2': 'Да (Стирается без питания)',
    'md.ram.spec3': 'EF02CO03 (Разница RAM и накопителя)',

    // SSD Данные
    'md.ssd.nome': 'Постоянный накопитель (SSD NVMe M.2)',
    'md.ssd.categoria': 'Постоянная энергонезависимая память',
    'md.ssd.desc': 'SSD надежно хранит систему, файлы и приложения на микросхемах флеш-памяти независимо от питания.',
    'md.ssd.analogia': 'Как книжный шкаф или школьный рюкзак: книги остаются на своих местах даже ночью.',
    'md.ssd.spec1': 'PCIe 4.0 NVMe (до 7 000 МБ/с)',
    'md.ssd.spec2': 'Нет (Энергонезависимая)',
    'md.ssd.spec3': 'EF02CO03 (Постоянное хранение данных)',

    // GPU Данные
    'md.gpu.nome': 'Дискретная видеокарта (GPU)',
    'md.gpu.categoria': 'Графические и параллельные вычисления',
    'md.gpu.desc': 'GPU состоит из тысяч ядер, одновременно рассчитывающих трехмерную графику и освещение в реальном времени.',
    'md.gpu.analogia': 'Если CPU — один гениальный ученый, то GPU — армия из 5000 художников, рисующих каждый пиксель сразу.',
    'md.gpu.spec1': 'Выделенная GDDR6 VRAM',
    'md.gpu.spec2': 'HDMI 2.1 и DisplayPort 1.4',
    'md.gpu.spec3': 'EF01CO04 (Периферия и вывод на экран)',

    // IO Данные
    'md.io.nome': 'Панель портов (I/O)',
    'md.io.categoria': 'Интерфейсы ввода и вывода',
    'md.io.desc': 'Физический узел подключения компьютера: порты USB, видеовыходы HDMI и сетевой разъем RJ-45.',
    'md.io.analogia': 'Словно двери и окна в доме: через них получают почту и общаются с внешним миром.',
    'md.io.spec1': 'USB (Клавиатура, мышь, микрофон)',
    'md.io.spec2': 'HDMI (Монитор), Звук (Колонки)',
    'md.io.spec3': 'EF01CO04 / EF02CO03 (Классификация I/O)',

    // PC Builder Задание
    'md.pcBuilderTitulo': 'Испытание: Собери компьютер',
    'md.pcBuilderProgresso': '{instalados} / {total} Установлено',
    'md.pcEtapa1': '1. Установить процессор в сокет',
    'md.pcEtapa2': '2. Вставить модуль оперативной памяти',
    'md.pcEtapa3': '3. Подключить накопитель SSD M.2',
    'md.pcEtapa4': '4. Установить видеокарту в слот PCIe',
    'md.pcEtapa5': '5. Включить питание и запустить POST',
    'md.btnEncaixar': 'Установить следующий компонент',
    'md.btnLigar': 'Включить компьютер (POST)',
    'md.btnMontado': 'Компьютер собран и запущен!',
    'md.btnReiniciar': 'Сброс',

    // Секция 2: Такт CPU
    'md.sec2Titulo': 'Такт процессора (Clock Cycle)',
    'md.sec2Desc': 'Как миллиарды транзисторов выполняют команды программ? Проследите за стадиями цикла процессора.',
    'md.cpuIrTitulo': 'Регистр команд (IR)',
    'md.cpuUcTitulo': 'Устройство управления (УУ)',
    'md.cpuUcConteudo': 'Декодер: Арифметическая операция',
    'md.cpuUlaTitulo': 'Арифметико-логическое устройство (АЛУ)',
    'md.cpuFase1': 'Фаза 1',
    'md.cpuBuscaTitulo': 'Выборка (Fetch)',
    'md.cpuBuscaDesc': 'Адрес считывается из памяти, и очередная команда загружается из RAM в регистр IR процессора.',
    'md.cpuFase2': 'Фаза 2',
    'md.cpuDecodificaTitulo': 'Декодирование (Decode)',
    'md.cpuDecodificaDesc': 'Устройство управления расшифровывает биты команды и активирует нужные регистры и цепи.',
    'md.cpuFase3': 'Фаза 3',
    'md.cpuExecutaTitulo': 'Выполнение (Execute)',
    'md.cpuExecutaDesc': 'АЛУ выполняет арифметический расчет или сравнение и записывает результат в аккумулятор.',
    'md.cpuAguardandoOperandos': 'Ожидание операндов...',
    'md.cpuCarregadoValores': 'Загружено: 5 и 3',
    'md.cpuInstrucaoConcluida': 'Команда выполнена',
    'md.cpuResultado': 'Результат: 8 (00001000₂)',
    'md.btnCpuPasso': 'Шаг за шагом',
    'md.btnCpuAuto': 'Автоматический такт',
    'md.btnCpuPausar': 'Пауза цикла',

    // Секция 3: Сетевой симулятор
    'md.sec3Titulo': 'Как пакеты перемещаются по интернету?',
    'md.sec3Desc': 'Файлы и сообщения разбиваются на пакеты с IP-адресами и повторно собираются на сервере назначения.',
    'md.redeNoAluno': 'Компьютер ученика',
    'md.redeNoRoteador': 'Wi-Fi роутер',
    'md.redeNoProvedor': 'Провайдер и оптоволокно',
    'md.redeNoServidor': 'Сервер COMPASSO',
    'md.redeProtocoloRotulo': 'Протокол:',
    'md.redeSeqRotulo': 'Номер (SYN):',
    'md.redePayloadRotulo': 'Полезная нагрузка:',
    'md.redePayloadValor': '"Привет, школа! Задание выполнено"',
    'md.redeStatusRotulo': 'Статус доставки:',
    'md.redeStatusPronto': 'Готов к отправке',
    'md.redeStatusEnviando': 'Передача пакетов TCP через маршрутизаторы...',
    'md.redeStatusSucesso': '✅ Пакеты доставлены и собраны на сервере LMS COMPASSO!',
    'md.redeStatusPerda': '❌ Пакет 2 потерян по пути! Протокол TCP успешно повторил отправку (ACK 3).',
    'md.btnDispararPacote': 'Отправить пакет данных',
    'md.btnSimularPerda': 'Симулировать потерю пакета (TCP)',
    'md.btnPerdaAtivada': '⚠️ Потеря пакета: Включена',

    // Wayfinding & Rodapé
    'wf.eixosBncc': 'Направления программы',
    'wf.mundoDigital': 'Цифровой мир',
    'rodape.eixos': 'Направления программы',
    'rodape.acessoRapido': 'Быстрые ссылки',
    'rodape.copyrightMundoDigital': 'Инновационный проект SUAP/IFMA № 14246/2025 · Startup LMS COMPASSO · Направление "Цифровой мир".',    'cd.metaTitulo': 'Цифровая культура — Гражданство и диалог — LMS COMPASSO',

    // Cultura Digital (Eixo 3 BNCC)
    "cd.metaTitulo": "Цифровая культура — Гражданство и диалог — LMS COMPASSO",
    "cd.metaDesc": "Интерактивная лаборатория направления \"Цифровая культура\": этичные решения в чате, распознавание фишинга и фейков, защита цифрового следа и тест надежности паролей.",
    "cd.pularConteudo": "Перейти к основному содержимому",
    "cd.voltarMundoDigital": "Назад в Цифровой мир",
    "cd.culturaDigital": "Цифровая культура",
    "cd.eixoBncc": "Направление 3 · Компьютерные науки",
    "cd.heroTitulo": "Цифровая культура: <span>Гражданство и этика в сети</span>",
    "cd.heroDesc": "Как безопасно пользоваться интернетом, отличать правду от слухов и создавать атмосферу взаимного уважения в сети? Принимайте решения в интерактивных беседах, распознавайте фишинг, проверяйте стойкость паролей и оценивайте цифровой след.",
    "cd.ctaChat": "Начать интерактивный чат",
    "cd.ctaCofre": "Хранилище надежных паролей",
    "cd.ctaPegada": "Измеритель цифрового следа",
    "cd.tagEF01CO05": "Этика и уважение",
    "cd.tagEF02CO04": "Защита данных",
    "cd.tagEF03CO04": "Фейки и факты",
    "cd.tagEF04CO04": "Фишинг и кибербуллинг",
    "cd.tagEF05CO04": "Цифровой след",
    "cd.sec1Titulo": "ZapCompasso: Симулятор диалога и цифрового гражданства",
    "cd.sec1Desc": "Выберите контакт в списке, проанализируйте входящие сообщения и примите правильное решение для защиты своих данных и предотвращения онлайн-травли.",
    "cd.conversas": "Беседы",
    "cd.pontosCidadania": "{pontos} Баллов гражданства",
    "cd.onlineAgora": "Сейчас онлайн",
    "cd.decisaoRotulo": "Какое действие лучше для осознанного пользователя?",
    "cd.refazerCenario": "Пройти этот сценарий снова",
    "cd.analisePedagogica": "Педагогический анализ:",
    "cd.horaAgora": "Сейчас",
    "cd.cenariosAriaLabel": "Сценарии цифрового диалога",
    "cd.chat.phishing.nome": "Лео (Друг по игре)",
    "cd.chat.phishing.badge": "Фишинг и социальная инженерия (EF04CO04)",
    "cd.chat.phishing.previa": "Дружище, нашел сайт с бесплатными монетами!",
    "cd.chat.phishing.msg": "Дружище, смотри, этот сайт сегодня раздает 10.000 монет и бесплатные предметы в игре! Жми скорее и вводи логин с паролем, пока не закрыли: http://robl0x-free-coins.xyz/login",
    "cd.chat.phishing.opc1.texto": "Спасибо, Лео! Сейчас перейду и введу пароль, чтобы забрать монеты.",
    "cd.chat.phishing.opc1.resposta": "Ой... Ты попался на уловку мошенников! Мой аккаунт взломали и хакер отправил эту ссылку тебе!",
    "cd.chat.phishing.opc1.feedback": "⚠️ ОСТОРОЖНО: Это фишинговая атака! Ссылка ведет на поддельный домен (.xyz). Ни одна официальная игра не запрашивает пароль на сторонних сайтах. Твои данные были бы украдены.",
    "cd.chat.phishing.opc2.texto": "Сейчас переходить не буду, но перешлю ссылку в наш школьный чат.",
    "cd.chat.phishing.opc2.resposta": "Не делай этого! Эта ссылка опасна!",
    "cd.chat.phishing.opc2.feedback": "⚠️ ВНИМАНИЕ: Пересылка подозрительных ссылок ставит под угрозу твоих друзей и близких. Если сомневаешься — никогда не распространяй спам-цепочки.",
    "cd.chat.phishing.opc3.texto": "Лео, это фишинговый обман! Посмотри на поддельный адрес (.xyz). Никто не раздает монеты за пароли. Смени пароль немедленно, если ты там входил!",
    "cd.chat.phishing.opc3.resposta": "Ого, ты меня спас! Бегу менять пароль, пока не угнали аккаунт!",
    "cd.chat.phishing.opc3.feedback": "🌟 ОТЛИЧНО: Ты распознал фальшивый URL, защитил свой аккаунт и помог другу сменить скомпрометированный пароль. Навык EF04CO04 освоен!",
    "cd.chat.cyberbullying.nome": "Группа 5-Б класса",
    "cd.chat.cyberbullying.badge": "Этичное общение и уважение (EF04CO04 / EF01CO05)",
    "cd.chat.cyberbullying.previa": "Смотрите, как Петя упал на перемене хаха",
    "cd.chat.cyberbullying.msg": "[Фото упавшего в лужу Пети] 'Хаха, смотрите, какой конфуз у Пети на перемене! Давайте сделаем стикер и разошлем везде!'",
    "cd.chat.cyberbullying.opc1.texto": "Хаха, сейчас сделаю стикер и выложу в TikTok!",
    "cd.chat.cyberbullying.opc1.resposta": "[Петя обиделся и покинул группу]",
    "cd.chat.cyberbullying.opc1.feedback": "⚠️ НЕДОПУСТИМО: Это кибербуллинг. Распространение неловких фото без согласия причиняет реальную боль и нарушает правила школьной и цифровой этики.",
    "cd.chat.cyberbullying.opc2.texto": "Я просто выключу звук в группе и сделаю вид, что ничего не видел.",
    "cd.chat.cyberbullying.opc2.resposta": "[Насмешки продолжаются, никто не вмешивается]",
    "cd.chat.cyberbullying.opc2.feedback": "⚠️ РАЗМЫШЛЕНИЕ: Молчание позволяет травле продолжаться. Осознанный цифровой гражданин поддерживает тех, кого обижают.",
    "cd.chat.cyberbullying.opc3.texto": "Ребята, прекратите. Представьте себя на его месте! Удалите фото, не делайте стикеров и уважайте Петю.",
    "cd.chat.cyberbullying.opc3.resposta": "Вы правы, мы перегнули палку. Фото удалено. Извини, Петя!",
    "cd.chat.cyberbullying.opc3.feedback": "🌟 ОБРАЗЦОВО: Ты проявил позицию активного защитника (Upstander), остановил травлю и поддержал одноклассника. Навыки EF01CO05 и EF04CO04!",
    "cd.chat.privacidade.nome": "ShadowGamer_99",
    "cd.chat.privacidade.badge": "Защита персональных данных (EF02CO04)",
    "cd.chat.privacidade.previa": "Где ты живешь? Дай свой WhatsApp!",
    "cd.chat.privacidade.msg": "Отлично сыграли! Напиши свое полное имя, возраст и номер школы, чтобы завтра встретиться вживую!",
    "cd.chat.privacidade.opc1.texto": "Меня зовут Лукас Силва, мне 10 лет, учусь в школе с 13:00 до 17:00.",
    "cd.chat.privacidade.opc1.resposta": "Отлично, теперь я знаю, где тебя найти завтра...",
    "cd.chat.privacidade.opc1.feedback": "⚠️ ОПАСНОСТЬ: Никогда не сообщайте полное имя, возраст, школу или распорядок дня незнакомцам в сети. Ваши личные данные должны быть защищены!",
    "cd.chat.privacidade.opc2.texto": "Школу не скажу, но мой телефон: (99) 99999-9999.",
    "cd.chat.privacidade.opc2.resposta": "Записал! Сейчас наберу.",
    "cd.chat.privacidade.opc2.feedback": "⚠️ РИСК: Номер телефона — это конфиденциальные данные. Незнакомцы могут использовать его для спама или мошенничества.",
    "cd.chat.privacidade.opc3.texto": "Я не делюсь личными данными и распорядком дня в интернете. Будем общаться только во встроенном чате игры.",
    "cd.chat.privacidade.opc3.resposta": "Понятно, ты правильно поступаешь. Сфокусируемся на матче!",
    "cd.chat.privacidade.opc3.feedback": "🌟 ИДЕАЛЬНО: Ты установил четкие границы приватности и осознал ценность защиты личной информации. Навык EF02CO04!",
    "cd.chat.fakenews.nome": "Тетя Клавдия (Семья)",
    "cd.chat.fakenews.badge": "Детектив фейковых новостей (EF03CO04)",
    "cd.chat.fakenews.previa": "СРОЧНО! Перешлите всем!",
    "cd.chat.fakenews.msg": "СРОЧНО!!! Перешлите всем: ученые предупредили, что завтра интернет отключат во всем мире на 1 месяц! Не пейте воду из-под крана! Поделитесь, чтобы спасти жизни!!",
    "cd.chat.fakenews.opc1.texto": "Ого, тетя! Сейчас перешлю это во все свои группы!",
    "cd.chat.fakenews.opc1.resposta": "[Слух разлетелся и вызвал панику среди соседей]",
    "cd.chat.fakenews.opc1.feedback": "⚠️ ВНИМАНИЕ: Тревожные сообщения с кучей восклицательных знаков и без надежных источников — классический пример Fake News. Пересылка без проверки сеет дезинформацию.",
    "cd.chat.fakenews.opc2.texto": "Я на всякий случай наберу воды, но пересылать никому не стану.",
    "cd.chat.fakenews.opc2.resposta": "Лучше перестраховаться, правда?",
    "cd.chat.fakenews.opc2.feedback": "⚠️ СОВЕТ: Прежде чем паниковать, быстро проверьте информацию в авторитетных новостях или на государственных сайтах.",
    "cd.chat.fakenews.opc3.texto": "Тетя, я проверил на официальных сайтах новостей: это выдумка и слух! Пожалуйста, не пересылайте дальше, чтобы не пугать людей.",
    "cd.chat.fakenews.opc3.resposta": "Ой, милый, спасибо, что предупредил! Я напишу всем, что ошиблась, и удалю.",
    "cd.chat.fakenews.opc3.feedback": "🌟 БЛЕСТЯЩЕ: Ты применил критическое мышление, проверил факты в надежных источниках и остановил волну дезинформации. Навык EF03CO04!",
    "cd.sec2Titulo": "Цифровой сейф: Тестер надежности паролей",
    "cd.sec2Desc": "Узнайте, как создавать невзламываемые цифровые ключи. Посмотрите в реальном времени, сколько потребуется компьютеру для подбора пароля.",
    "cd.senhaLabel": "Введите пароль для проверки стойкости:",
    "cd.senhaPlaceholder": "Напр.: MoiaShkola#2026!",
    "cd.senhaStatusPadrao": "Введите пароль для проверки",
    "cd.tempoQuebraPadrao": "Время на подбор: —",
    "cd.senhaMuitoFraca": "Очень слабый",
    "cd.senhaFraca": "Слабый",
    "cd.senhaMedia": "Средний / Хороший",
    "cd.senhaExcelente": "Отличный и надежный!",
    "cd.quebrada0001": "Подобран за: 0.001 секунды",
    "cd.quebradaMinutos": "Подобран за: несколько минут",
    "cd.quebradaAnos": "Подобран за: 2–3 года",
    "cd.quebrada500Anos": "Подобран за: более 500 лет!",
    "cd.reqAriaLabel": "Требования к надежному паролю",
    "cd.req8Char": "Не менее 8 символов",
    "cd.reqMaiusc": "Заглавные и строчные буквы",
    "cd.reqNum": "Хотя бы одна цифра",
    "cd.reqSimb": "Специальные символы (@, #, $, !, %)",
    "cd.dica1Titulo": "Правило 4 элементов (EF02CO04)",
    "cd.dica1Desc": "Пароли только из цифр (например, 123456 или даты рождения) подбираются программами за доли секунды. Смешивание слов с цифрами и символами создает триллионы комбинаций.",
    "cd.dica2Titulo": "Мнемонический совет для учащихся",
    "cd.dica2Desc": "Придумывайте фразы, которые легко вспомнить вам, но невозможно угадать другим. Пример: <em>\"YaLyublyuAstronomiyuVIFMA#2026!\"</em>.",
    "cd.sec3Titulo": "Ваш цифровой след в мире (EF05CO04)",
    "cd.sec3Desc": "Все, что вы лайкаете, репостите и вводите в интернете, оставляет несмываемые следы. Отметьте свои привычки, чтобы узнать состояние своего следа.",
    "cd.pegadaLimpaTitulo": "Чистый и защищенный цифровой след",
    "cd.pegadaLimpaDesc": "Вы бережно относитесь к приватности, не делитесь секретными данными и сохраняете свою безопасность.",
    "cd.pegadaAtencaoTitulo": "Внимание: Заметный цифровой след",
    "cd.pegadaAtencaoDesc": "Часть информации о вашем распорядке доступна публично. Отключите геолокацию и проверьте настройки видимости.",
    "cd.pegadaAlertaTitulo": "Тревога: Уязвимый цифровой след!",
    "cd.pegadaAlertaDesc": "Слишком много личных данных открыто. Любой посторонний может отследить ваши перемещения в реальной жизни.",
    "cd.chkUniforme": "Публикую фото в школьной форме или на фоне своего дома",
    "cd.chkGps": "Держу геолокацию (GPS) постоянно включенной публично в соцсетях",
    "cd.chkTermos": "Принимаю пользовательские соглашения игр и приложений, не глядя, какие данные они собирают",
    "cd.chkSenhaRepetida": "Использую один и тот же простой пароль для почты, игр и соцсетей",
    "cd.rodapeFim": "Инновационный проект SUAP/IFMA № 14246/2025 · Startup LMS COMPASSO · Направление \"Цифровая культура\".",
    "rodape.copyrightCulturaDigital": "Инновационный проект SUAP/IFMA № 14246/2025 · Startup LMS COMPASSO · Направление \"Цифровая культура\".",
  },
};

/**
 * Obtém o código do idioma ativo no cliente
 */
export function obterIdiomaAtual() {
  try {
    if (typeof localStorage !== 'undefined') {
      const salvo = localStorage.getItem(CHAVE_STORAGE_IDIOMA);
      if (salvo && IDIOMAS_SUPORTADOS.some((i) => i.codigo === salvo)) {
        return salvo;
      }
    }
  } catch {}
  return 'pt';
}

/**
 * Traduz uma chave substituindo interpolações {param}
 */
export function t(chave, params = {}, padrao = null) {
  let fallback = padrao;
  let interpolacoes = params;

  // Suporta tanto t(chave, { x: 1 }, 'Padrão') quanto t(chave, 'Padrão', { x: 1 })
  if (typeof params === 'string') {
    fallback = params;
    interpolacoes = typeof padrao === 'object' && padrao !== null ? padrao : {};
  }

  const idioma = obterIdiomaAtual();
  const dictIdioma = DICIONARIO[idioma] || {};
  const dictPt = DICIONARIO.pt || {};
  const dictEn = DICIONARIO.en || {};

  let texto = dictIdioma[chave] ?? dictPt[chave] ?? dictEn[chave] ?? fallback ?? chave;

  if (interpolacoes && typeof interpolacoes === 'object') {
    Object.entries(interpolacoes).forEach(([k, v]) => {
      texto = texto.replaceAll(`{${k}}`, String(v));
    });
  }

  return texto;
}

/**
 * Retorna o objeto de metadados do idioma por código
 */
export function obterInfoIdioma(codigo) {
  return IDIOMAS_SUPORTADOS.find((i) => i.codigo === codigo) || IDIOMAS_SUPORTADOS[0];
}

/**
 * Atualiza o idioma ativo e traduz a interface
 */
export function definirIdioma(codigo) {
  const info = IDIOMAS_SUPORTADOS.find((i) => i.codigo === codigo);
  if (!info) return;

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CHAVE_STORAGE_IDIOMA, codigo);
    }
  } catch {}

  // WCAG 3.1.1: Idioma oficial da página declarado na tag <html>
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.lang = codigo === 'pt' ? 'pt-BR' : codigo;
    document.documentElement.dir = info.dir || 'ltr';

    traduzirDocumento();
    atualizarEstadoVisualSeletor(codigo);
    anunciarTrocaIdioma(info.nativo);

    // Notifica outros módulos reativos (ex.: catálogo de atividades)
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('idiomaAlterado', {
        detail: { idioma: codigo, info },
      }));
    }
  }
}

/**
 * Anuncia a troca de idioma para leitores de tela (WCAG 4.1.3)
 */
function anunciarTrocaIdioma(nomeNativo) {
  if (typeof document === 'undefined' || !document.body) return;
  let anuncio = document.getElementById?.('a11y-anuncio-idioma');
  if (!anuncio && typeof document.createElement === 'function') {
    anuncio = document.createElement('output');
    anuncio.id = 'a11y-anuncio-idioma';
    anuncio.className = 'somente-leitor';
    anuncio.setAttribute('aria-live', 'polite');
    anuncio.setAttribute('aria-atomic', 'true');
    document.body.appendChild(anuncio);
  }
  if (anuncio) {
    anuncio.textContent = t('i18n.anuncioTroca', { nome: nomeNativo });
  }
}

/**
 * Varre o documento e atualiza elementos com data-i18n e links padrão de cabeçalho/rodapé
 */
export function traduzirDocumento() {
  if (typeof document === 'undefined') return;

  // 1. Elementos com atributo data-i18n
  const elementos = document.querySelectorAll?.('[data-i18n]') || [];
  elementos.forEach((el) => {
    const chave = el.getAttribute?.('data-i18n');
    if (!chave) return;
    const traducao = t(chave);
    if (traducao) {
      if (el.tagName === 'TITLE') {
        document.title = traducao;
      } else {
        el.textContent = traducao;
      }
    }
  });

  // 1.1 Elementos com markup HTML interno (data-i18n-html)
  const elementosHtml = document.querySelectorAll?.('[data-i18n-html]') || [];
  elementosHtml.forEach((el) => {
    const chave = el.getAttribute?.('data-i18n-html');
    if (!chave) return;
    const traducao = t(chave);
    if (traducao) el.innerHTML = traducao;
  });

  // Atualiza título da página para rotas conhecidas
  if (typeof window !== 'undefined' && window.location?.pathname?.includes('mundo-digital')) {
    document.title = t('md.metaTitulo');
  }
  if (typeof window !== 'undefined' && window.location?.pathname?.includes('cultura-digital')) {
    document.title = t('cd.metaTitulo');
  }

  // 1.2 Elementos com acessibilidade aria-label traduzível (data-i18n-aria)
  const elementosAria = document.querySelectorAll?.('[data-i18n-aria]') || [];
  elementosAria.forEach((el) => {
    const chave = el.getAttribute?.('data-i18n-aria');
    if (!chave) return;
    const traducao = t(chave);
    if (traducao) el.setAttribute('aria-label', traducao);
  });

  // 2. Elementos com atributos traduzíveis (data-i18n-attr="placeholder:chave,title:chave")
  const elementosAttr = document.querySelectorAll?.('[data-i18n-attr]') || [];
  elementosAttr.forEach((el) => {
    const raw = el.getAttribute?.('data-i18n-attr');
    if (!raw) return;
    const pares = raw.split(',');
    pares.forEach((par) => {
      const [attr, chave] = par.split(':').map((s) => s.trim());
      if (attr && chave) {
        el.setAttribute(attr, t(chave));
      }
    });
  });

  // 3. Tradução dos links padrão de navegação pública (.pub-nav)
  const mapaRotasNav = {
    '/': 'nav.inicio',
    '/index.html': 'nav.inicio',
    '/boas-vindas.html': 'nav.boasVindas',
    '/atividades.html': 'nav.atividades',
    '/mundo-digital.html': 'nav.mundoDigital',
    '/cultura-digital.html': 'nav.culturaDigital',
  };

  const linksNav = document.querySelectorAll?.('.pub-nav a') || [];
  linksNav.forEach((link) => {
    const href = link.getAttribute?.('href');
    const chave = mapaRotasNav[href];
    if (chave) {
      const spanIcone = link.querySelector?.('.material-symbols-outlined, svg');
      const iconeHtml = spanIcone ? spanIcone.outerHTML : '';
      link.innerHTML = `${iconeHtml} ${t(chave)}`.trim();
    }
  });

  // 4. Botões de ação do topo (.pub-acoes)
  const btnBuscar = document.querySelector?.('.pub-acoes a[href="/atividades.html"]');
  if (btnBuscar) {
    btnBuscar.setAttribute('aria-label', t('nav.buscarAriaLabel'));
    btnBuscar.setAttribute('title', t('nav.buscarAriaLabel'));
    const icone = btnBuscar.querySelector?.('.material-symbols-outlined, svg');
    btnBuscar.innerHTML = `${icone ? icone.outerHTML : ''} ${t('nav.buscar')}`.trim();
  }

  const btnEntrar = document.getElementById?.('acao-entrar');
  if (btnEntrar && !btnEntrar.href?.includes?.('/dashboard.html') && !btnEntrar.href?.includes?.('/cursos.html')) {
    const icone = btnEntrar.querySelector?.('.material-symbols-outlined, svg');
    btnEntrar.innerHTML = `${icone ? icone.outerHTML : ''} ${t('nav.entrar')}`.trim();
  }

  const btnCadastrar = document.getElementById?.('acao-cadastrar');
  if (btnCadastrar) {
    const icone = btnCadastrar.querySelector?.('.material-symbols-outlined, svg');
    btnCadastrar.innerHTML = `${icone ? icone.outerHTML : ''} ${t('nav.criarConta')}`.trim();
  }

  // 5. Rodapé público
  const rodapePlataforma = document.getElementById?.('rodape-plataforma');
  if (rodapePlataforma) rodapePlataforma.textContent = t('rodape.plataforma');

  const rodapeProjeto = document.getElementById?.('rodape-projeto');
  if (rodapeProjeto) rodapeProjeto.textContent = t('rodape.projeto');

  const rodapeDesc = document.querySelector?.('.pub-rodape-grade > div > p');
  if (rodapeDesc) rodapeDesc.textContent = t('rodape.descricao');
}

/**
 * Atualiza classes ativas e atributos de acessibilidade do seletor
 */
function atualizarEstadoVisualSeletor(codigoAtivo) {
  const btn = document.getElementById('btn-seletor-idioma');
  const info = obterInfoIdioma(codigoAtivo);

  if (btn) {
    btn.setAttribute('aria-label', t('i18n.rotuloSeletor', { atual: info.nativo }));
    btn.setAttribute('title', `Idioma: ${info.nativo}`);
  }

  document.querySelectorAll('.opcao-idioma').forEach((opt) => {
    const lang = opt.getAttribute('data-lang');
    const ehAtivo = lang === codigoAtivo;
    opt.setAttribute('aria-selected', String(ehAtivo));
    opt.classList.toggle('selecionado', ehAtivo);
  });
}

/**
 * Cria e insere o componente de seletor de idiomas no container de ações
 */
export function montarSeletorIdioma(container) {
  if (!container || container.querySelector('.seletor-idioma-wrapper')) return;

  const idiomaAtivo = obterIdiomaAtual();
  const infoAtivo = obterInfoIdioma(idiomaAtivo);

  const wrapper = document.createElement('div');
  wrapper.className = 'seletor-idioma-wrapper';

  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = 'btn btn-contorno-escuro btn-sm btn-seletor-idioma flex-inline-icon';
  botao.id = 'btn-seletor-idioma';
  botao.setAttribute('aria-haspopup', 'listbox');
  botao.setAttribute('aria-expanded', 'false');
  botao.setAttribute('aria-controls', 'lista-opcoes-idioma');
  botao.setAttribute('aria-label', t('i18n.rotuloSeletor', { atual: infoAtivo.nativo }));
  botao.setAttribute('title', `Idioma: ${infoAtivo.nativo}`);
  botao.innerHTML = `
    <span class="material-symbols-outlined icon-xs" aria-hidden="true">language</span>
    <span class="material-symbols-outlined seta-idioma icon-xs" aria-hidden="true">expand_more</span>
  `;

  const popover = document.createElement('div');
  popover.className = 'dropdown-idiomas-popover';
  popover.id = 'popover-idiomas';
  popover.hidden = true;

  const setaNotch = document.createElement('div');
  setaNotch.className = 'dropdown-idiomas-seta';
  setaNotch.setAttribute('aria-hidden', 'true');
  popover.appendChild(setaNotch);

  const lista = document.createElement('ul');
  lista.className = 'lista-idiomas';
  lista.id = 'lista-opcoes-idioma';
  lista.setAttribute('role', 'listbox');
  lista.setAttribute('aria-label', t('i18n.listaAriaLabel'));

  IDIOMAS_SUPORTADOS.forEach((idioma) => {
    const li = document.createElement('li');
    li.className = `opcao-idioma ${idioma.codigo === idiomaAtivo ? 'selecionado' : ''}`;
    li.setAttribute('role', 'option');
    li.id = `opt-idioma-${idioma.codigo}`;
    li.setAttribute('data-lang', idioma.codigo);
    li.setAttribute('lang', idioma.codigo);
    li.setAttribute('aria-selected', String(idioma.codigo === idiomaAtivo));
    li.tabIndex = -1;

    li.innerHTML = `
      <span class="nome-idioma">${idioma.nativo}</span>
      <span class="material-symbols-outlined check-idioma icon-xs" aria-hidden="true">check</span>
    `;

    li.addEventListener('click', () => {
      definirIdioma(idioma.codigo);
      fecharPopover();
      botao.focus();
    });

    lista.appendChild(li);
  });

  popover.appendChild(lista);
  wrapper.appendChild(botao);
  wrapper.appendChild(popover);

  function abrirPopover() {
    popover.hidden = false;
    botao.setAttribute('aria-expanded', 'true');
    botao.classList.add('aberto');

    // Foca o item selecionado para navegação imediata por teclado
    const selecionado = lista.querySelector('.opcao-idioma.selecionado') || lista.firstElementChild;
    if (selecionado) selecionado.focus();
  }

  function fecharPopover() {
    popover.hidden = true;
    botao.setAttribute('aria-expanded', 'false');
    botao.classList.remove('aberto');
  }

  function alternarPopover() {
    if (popover.hidden) abrirPopover();
    else fecharPopover();
  }

  botao.addEventListener('click', (e) => {
    e.stopPropagation();
    alternarPopover();
  });

  // Acessibilidade por teclado (WAI-ARIA Listbox Pattern)
  wrapper.addEventListener('keydown', (e) => {
    const itens = Array.from(lista.querySelectorAll('.opcao-idioma'));
    const indexFoco = itens.indexOf(document.activeElement);

    if (e.key === 'Escape') {
      fecharPopover();
      botao.focus();
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (popover.hidden) {
        abrirPopover();
      } else {
        const prox = indexFoco < itens.length - 1 ? itens[indexFoco + 1] : itens[0];
        prox.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (popover.hidden) {
        abrirPopover();
      } else {
        const ant = indexFoco > 0 ? itens[indexFoco - 1] : itens[itens.length - 1];
        ant.focus();
      }
    } else if (e.key === 'Home') {
      e.preventDefault();
      if (!popover.hidden && itens[0]) itens[0].focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      if (!popover.hidden && itens.length) itens[itens.length - 1].focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (!popover.hidden && indexFoco !== -1) {
        e.preventDefault();
        itens[indexFoco].click();
      }
    }
  });

  // Fechar ao clicar fora
  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) {
      fecharPopover();
    }
  });

  // Insere no container imediatamente antes de #acao-entrar (conforme layout anexado)
  const btnEntrar = container.querySelector('#acao-entrar');
  if (btnEntrar) {
    container.insertBefore(wrapper, btnEntrar);
  } else {
    container.appendChild(wrapper);
  }
}

// Inicialização automática ao carregar
if (typeof document !== 'undefined') {
  const init = () => {
    const idiomaSalvo = obterIdiomaAtual();
    document.documentElement.lang = idiomaSalvo === 'pt' ? 'pt-BR' : idiomaSalvo;
    traduzirDocumento();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}
