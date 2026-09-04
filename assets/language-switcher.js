(function () {
  const STORAGE_KEY = "rodSpaceLanguagePreferenceV2";
  const DEFAULT_LANGUAGE = "en";
  const LANGUAGES = {
    en: "English",
    pt: "Português (Portugal)"
  };

  const TEXT = {
    "Active Archive Hub": "Arquivo ativo",
    "Rodrigo's curated collection of live applications, offline-first party games, retro utilities, and experimental prototypes.": "A coleção selecionada do Rodrigo de aplicações ao vivo, jogos de grupo offline, utilitários retro e protótipos experimentais.",
    "Search projects, tags, pills... (Press '/' to focus)": "Procurar projetos, etiquetas, categorias... (carrega em '/' para focar)",
    "Sort:": "Ordenar:",
    "Newest Added": "Mais recentes",
    "Oldest Added": "Mais antigos",
    "Alphabetical (A-Z)": "Alfabético (A-Z)",
    "Alphabetical (Z-A)": "Alfabético (Z-A)",
    "System Operational": "Sistema operacional",
    "SYSTEM OPERATIONAL": "SISTEMA OPERACIONAL",
    "GitHub": "GitHub",
    "Settings": "Definições",
    "SETTINGS": "DEFINIÇÕES",
    "Options": "Opções",
    "OPTIONS": "OPÇÕES",
    "Language": "Idioma",
    "English": "Inglês",
    "Portuguese": "Português",
    "Truth or Dare": "Verdade ou Desafio",
    "Who's More Likely To?": "Quem é mais provável?",
    "Would You": "O que",
    "Rather": "preferias?",
    "Content lock": "Bloqueio de conteúdo",
    "This game can include mature prompts, swearing, or 16+ reading content. Enter the password to continue.": "Este jogo pode incluir perguntas maduras, palavrões ou conteúdo de leitura 16+. Introduz a palavra-passe para continuar.",
    "Password": "Palavra-passe",
    "Enter": "Entrar",
    "Wrong password.": "Palavra-passe errada.",
    "Play": "Jogar",
    "PLAY": "JOGAR",
    "Play Now": "Jogar agora",
    "Start": "Começar",
    "START": "COMEÇAR",
    "START GAME": "COMEÇAR JOGO",
    "START THE QUIZ": "COMEÇAR QUIZ",
    "New Game": "Novo jogo",
    "NEW GAME": "NOVO JOGO",
    "Continue": "Continuar",
    "CONTINUE": "CONTINUAR",
    "Resume": "Retomar",
    "RESUME": "RETOMAR",
    "Restart": "Recomeçar",
    "RESTART": "RECOMEÇAR",
    "Retry": "Tentar outra vez",
    "RETRY": "TENTAR OUTRA VEZ",
    "Again": "Outra vez",
    "Play Again": "Jogar outra vez",
    "PLAY AGAIN": "JOGAR OUTRA VEZ",
    "Next Round": "Próxima ronda",
    "NEXT ROUND": "PRÓXIMA RONDA",
    "Next": "Seguinte",
    "NEXT": "SEGUINTE",
    "Back": "Voltar",
    "← Back": "← Voltar",
    "BACK": "VOLTAR",
    "Back to Menu": "Voltar ao menu",
    "Cancel": "Cancelar",
    "CANCEL": "CANCELAR",
    "Close": "Fechar",
    "CLOSE": "FECHAR",
    "Menu": "Menu",
    "MENU": "MENU",
    "Main Menu": "Menu principal",
    "MAIN MENU": "MENU PRINCIPAL",
    "Paused": "Pausa",
    "PAUSED": "PAUSA",
    "Pause": "Pausa",
    "Game Over": "Fim do jogo",
    "GAME OVER": "FIM DO JOGO",
    "You Win!": "Ganhaste!",
    "YOU WIN!": "GANHASTE!",
    "You Lose!": "Perdeste!",
    "YOU LOSE!": "PERDESTE!",
    "Victory": "Vitória",
    "VICTORY": "VITÓRIA",
    "Defeated": "Derrotado",
    "DEFEATED": "DERROTADO",
    "Score": "Pontuação",
    "SCORE": "PONTUAÇÃO",
    "High Score": "Recorde",
    "Best Score": "Melhor pontuação",
    "Level": "Nível",
    "LEVEL": "NÍVEL",
    "Select Level": "Escolher nível",
    "SELECT LEVEL": "ESCOLHER NÍVEL",
    "Locked": "Bloqueado",
    "LOCKED": "BLOQUEADO",
    "Unlocked": "Desbloqueado",
    "UNLOCKED": "DESBLOQUEADO",
    "Shop": "Loja",
    "SHOP": "LOJA",
    "Owned": "Obtido",
    "OWNED": "OBTIDO",
    "Buy": "Comprar",
    "BUY": "COMPRAR",
    "Coins": "Moedas",
    "COINS": "MOEDAS",
    "Stars": "Estrelas",
    "STARS": "ESTRELAS",
    "Total Stars:": "Total de estrelas:",
    "TOTAL STARS:": "TOTAL DE ESTRELAS:",
    "Bird Shop": "Loja de pássaros",
    "BIRD SHOP": "LOJA DE PÁSSAROS",
    "Red Bird": "Pássaro vermelho",
    "Swift Bird": "Pássaro veloz",
    "Blast Bird": "Pássaro explosivo",
    "Iron Bird": "Pássaro de ferro",
    "Classic Fighter": "Lutador clássico",
    "High Velocity": "Alta velocidade",
    "Big Explosion": "Grande explosão",
    "Massive Damage": "Dano massivo",
    "Birds:": "Pássaros:",
    "BIRDS:": "PÁSSAROS:",
    "World Selection": "Escolha do mundo",
    "World Name...": "Nome do mundo...",
    "New": "Novo",
    "NEW": "NOVO",
    "Zoom Level": "Nível de zoom",
    "Auto Jump": "Salto automático",
    "Character Inventory": "Inventário da personagem",
    "Press 'E' or 'ESC' to close": "Carrega em 'E' ou 'ESC' para fechar",
    "Strategic Card Game": "Jogo de cartas estratégico",
    "Rules": "Regras",
    "RULES": "REGRAS",
    "How to Play": "Como jogar",
    "Got it!": "Percebido!",
    "House Hand": "Mão da banca",
    "Your Hand": "A tua mão",
    "Total:": "Total:",
    "Hit": "Pedir carta",
    "Stand": "Ficar",
    "Arcade maze in first-person": "Labirinto arcade na primeira pessoa",
    "Press ESC to resume": "Carrega ESC para retomar",
    "Queens still needs a web-slinger.": "Queens ainda precisa de um lançador de teias.",
    "RESPAWN": "RENASCER",
    "Sound effects": "Efeitos sonoros",
    "Player Setup": "Configuração do jogador",
    "Profile": "Perfil",
    "Profile picture": "Imagem de perfil",
    "Choose profile picture": "Escolher imagem de perfil",
    "Choose a kingdom": "Escolher um reino",
    "Your game, your progress": "O teu jogo, o teu progresso",
    "Portable local account": "Conta local portátil",
    "Account Save System": "Sistema de gravação da conta",
    "Cards": "Cartas",
    "Decks": "Baralhos",
    "Win / loss ratio": "Rácio vitórias / derrotas",
    "Test mode locked": "Modo de teste bloqueado",
    "UNLOCK": "DESBLOQUEAR",
    "Player": "Jogador",
    "Multiplayer": "Multijogador",
    "Single Player": "Um jogador",
    "Party": "Grupo",
    "Tool": "Ferramenta",
    "Horror": "Terror",
    "Arcade": "Arcade",
    "Puzzle": "Puzzle",
    "Quiz": "Quiz",
    "Experimental": "Experimental",
    "Invalid Input": "Entrada inválida",
    "Select at least one card pack": "Escolhe pelo menos um pacote de cartas",
    "Loading": "A carregar",
    "Loading...": "A carregar...",
    "Save": "Guardar",
    "SAVE": "GUARDAR",
    "Delete": "Apagar",
    "DELETE": "APAGAR",
    "Reset": "Repor",
    "RESET": "REPOR",
    "Reset Data": "Repor dados",
    "Reset All Combinations": "Repor todas as combinações",
    "Clear Progress?": "Limpar progresso?",
    "Clear History": "Limpar histórico",
    "Confirm": "Confirmar",
    "CONFIRM": "CONFIRMAR",
    "Skip": "Saltar",
    "SKIP": "SALTAR",
    "Quit": "Sair",
    "QUIT": "SAIR",
    "Select a category to play": "Escolhe uma categoria para jogar",
    "Pick your side": "Escolhe o teu lado",
    "Truth": "Verdade",
    "TRUTH": "VERDADE",
    "Dare": "Desafio",
    "DARE": "DESAFIO",
    "Next Player": "Próximo jogador",
    "Finish Session": "Terminar sessão",
    "Category": "Categoria",
    "Random": "Aleatório",
    "Fun": "Divertido",
    "Weird": "Estranho",
    "Embarrassing": "Constrangedor",
    "Sus": "Suspeito",
    "0 cards played": "0 cartas jogadas",
    "1 cards played": "1 carta jogada",
    "All cards in this category used! Reset progress to play again.": "Todas as cartas desta categoria já foram usadas! Repõe o progresso para jogar outra vez.",
    "Prompt text here...": "Texto da pergunta aqui...",
    "What's the weirdest compliment you've ever received?": "Qual foi o elogio mais estranho que alguma vez recebeste?",
    "Pick a theme and discuss your answers out loud!": "Escolhe um tema e discutam as respostas em voz alta!",
    "School Life": "Vida escolar",
    "The Future": "O futuro",
    "Silly & Wild": "Parvo e selvagem",
    "Adventure": "Aventura",
    "Dark": "Sombrio",
    "Freaky": "Assustador",
    "Freaky Teens": "Adolescentes atrevidos",
    "Weird Fantasies": "Fantasias estranhas",
    "Category Name": "Nome da categoria",
    "Next Prompt →": "Próxima pergunta →",
    "Read the question aloud and everyone point to the person they choose!": "Lê a pergunta em voz alta e todos apontam para a pessoa escolhida!",
    "🔄 Reshuffle": "🔄 Baralhar",
    "Social Nightmares": "Pesadelos sociais",
    "Useless Powers": "Poderes inúteis",
    "Daily Pain": "Dores do dia a dia",
    "First Time": "Primeira vez",
    "OPTION A": "OPÇÃO A",
    "OPTION B": "OPÇÃO B",
    "OR": "OU",
    "CATEGORY": "CATEGORIA",
    "Tap choice to continue": "Toca numa opção para continuar",
    "ALL COMBOS SEEN": "TODAS AS COMBINAÇÕES VISTAS",
    "PARTY DECK": "BARALHO DE FESTA",
    "SHARPER TABLE, FASTER TURNS, MEANER BOT ANSWERS.": "MESA MAIS AFIADA, RONDAS MAIS RÁPIDAS, RESPOSTAS DOS BOTS MAIS MALDOSAS.",
    "GAME SETUP": "CONFIGURAÇÃO DO JOGO",
    "PLAYERS": "JOGADORES",
    "ROUNDS": "RONDAS",
    "CARD PACKS": "PACOTES DE CARTAS",
    "BOT PERSONALITIES": "PERSONALIDADES DOS BOTS",
    "START PARTY": "COMEÇAR FESTA",
    "Genesis": "Génese",
    "GENESIS": "GÉNESE",
    "Logs": "Registos",
    "LOGS": "REGISTOS",
    "Rise": "Ascensão",
    "RISE": "ASCENSÃO",
    "Ascension": "Ascensão",
    "ASCENSION": "ASCENSÃO",
    "Shed this shell for Aether.": "Abandona esta forma por Éter.",
    "Current": "Atual",
    "CURRENT": "ATUAL",
    "Gained": "Ganho",
    "GAINED": "GANHO",
    "Ascend": "Ascender",
    "ASCEND": "ASCENDER",
    "Chronos": "Chronos",
    "RECORDED": "REGISTADO",
    "The Pre-Void": "O pré-vazio",
    "Darkness moves upon the deep.": "A escuridão move-se sobre as profundezas.",
    "Essence": "Essência",
    "ESSENCE": "ESSÊNCIA",
    "Flow": "Fluxo",
    "FLOW": "FLUXO",
    "Divine Will": "Vontade divina",
    "Primal Mass": "Massa primordial",
    "Solar Flare": "Erupção solar",
    "Iron Heart": "Coração de ferro",
    "World Forge": "Forja de mundos",
    "Architect the weave.": "Constrói a trama.",
    "What is the strangest fear you have about everyday objects?": "Qual é o medo mais estranho que tens em relação a objetos do dia a dia?",
    "What's the strangest fear you have about everyday objects?": "Qual é o medo mais estranho que tens em relação a objetos do dia a dia?"
  };

  const REGEX_TEXT = [
    [/^LEVEL\s+(\d+)$/i, "NÍVEL $1"],
    [/^Level\s+(\d+)$/i, "Nível $1"],
    [/^BIRDS:\s*(\d+)\s*\/\s*(\d+)$/i, "PÁSSAROS: $1 / $2"],
    [/^TOTAL STARS:\s*(\d+)$/i, "TOTAL DE ESTRELAS: $1"],
    [/^Total:\s*(.+)$/i, "Total: $1"],
    [/^Cards?\s+(.+)$/i, "Cartas $1"],
    [/^Page\s+(\d+)\s*\/\s*(\d+)$/i, "Página $1 / $2"],
    [/^(\d+)\s+cards played$/i, "$1 cartas jogadas"],
    [/^(\d+)\s+card played$/i, "$1 carta jogada"],
    [/^(\d+)\s*\/\s*(\d+)\s+PAIRS$/i, "$1 / $2 PARES"],
    [/^(\d+)\s+COMBOS$/i, "$1 COMBINAÇÕES"]
  ];

  const PHRASE_TEXT = [
    ["Who's more likely to", "Quem é mais provável que"],
    ["Who is more likely to", "Quem é mais provável que"],
    ["Who's more likely", "Quem é mais provável"],
    ["Would you rather", "Preferias"],
    ["Have you ever", "Alguma vez"],
    ["What would you do if", "O que farias se"],
    ["What is your", "Qual é o teu"],
    ["What's your", "Qual é o teu"],
    ["What is the", "Qual é"],
    ["What's the", "Qual é"],
    ["Pick your", "Escolhe o teu"],
    ["you've ever", "que alguma vez"],
    ["you have ever", "que alguma vez"],
    ["you would", "tu irias"],
    ["you could", "pudesses"],
    ["your friends", "os teus amigos"],
    ["your crush", "a tua crush"],
    ["your teacher", "o teu professor"],
    ["the group", "o grupo"],
    ["everyone", "toda a gente"],
    ["received", "recebeste"],
    ["just because", "só porque"],
    ["tasted something", "provaste alguma coisa"],
    ["because it looked weird", "porque parecia estranha"],
    ["weirdest compliment", "elogio mais estranho"],
    ["ever received", "alguma vez recebeste"],
    ["out loud", "em voz alta"],
    ["say", "dizer"],
    ["tell", "contar"],
    ["show", "mostrar"],
    ["act like", "agir como"],
    ["for the next round", "na próxima ronda"],
    ["without laughing", "sem te rires"],
    ["most embarrassing", "mais constrangedor"],
    ["most likely", "mais provável"],
    ["without going over", "sem passar do limite"],
    ["Select a category", "Escolhe uma categoria"],
    ["Next Prompt", "Próxima pergunta"],
    ["Next Player", "Próximo jogador"],
    ["Finish Session", "Terminar sessão"],
    ["Back to Menu", "Voltar ao menu"],
    ["Reset Data", "Repor dados"],
    ["cards played", "cartas jogadas"],
    ["card played", "carta jogada"]
  ];

  const SKIP_SELECTOR = "script, style, noscript, textarea, code, pre, svg, canvas, .rod-language-switcher, [data-no-translate]";
  const SETTINGS_SELECTORS = [
    ".rod-password-gate__panel",
    "#rod-password-gate",
    "#settings-panel",
    "#settings-menu",
    "#content-settings",
    "#settingsView",
    "#bindPanel",
    "[id*='settings' i]",
    "[class*='settings' i]"
  ];
  const MENU_SELECTORS = [
    "#main-menu",
    "#start-menu",
    "#screen-main-menu",
    "#view-menu",
    ".main-menu",
    ".menu-screen",
    ".menu",
    "[id*='menu' i]",
    "[class*='menu' i]"
  ];

  let language = DEFAULT_LANGUAGE;
  let control;
  let translating = false;
  let refreshTimer = 0;
  const fallbackStorage = {};
  const storage = {
    getItem(key) {
      try {
        return window.localStorage ? window.localStorage.getItem(key) : fallbackStorage[key] || null;
      } catch (err) {
        return fallbackStorage[key] || null;
      }
    },
    setItem(key, value) {
      fallbackStorage[key] = String(value);
      try {
        if (window.localStorage) window.localStorage.setItem(key, value);
      } catch (err) {
        /* Some embedded/browser contexts block localStorage. */
      }
    }
  };

  language = storage.getItem(STORAGE_KEY) || DEFAULT_LANGUAGE;
  function cssEscape(value) {
    if (window.CSS && CSS.escape) return CSS.escape(value);
    return String(value).replace(/["\\]/g, "\\$&");
  }

  function isVisible(el) {
    if (!el || !el.isConnected) return false;
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function findSettingsHost() {
    for (const selector of SETTINGS_SELECTORS) {
      const hosts = Array.from(document.querySelectorAll(selector));
      const host = hosts.find(el => !el.matches(SKIP_SELECTOR) && el !== document.body && el !== document.documentElement && isVisible(el));
      if (host) return host;
    }
    return null;
  }

  function findMenuHost() {
    for (const selector of MENU_SELECTORS) {
      const hosts = Array.from(document.querySelectorAll(selector));
      const host = hosts.find(el => !el.matches(SKIP_SELECTOR) && el !== control && isVisible(el));
      if (host) return host;
    }
    return null;
  }

  function findPageHost() {
    return Array.from(document.querySelectorAll("footer, main, .app, #app, .container, .page, body"))
      .find(el => el !== control && isVisible(el)) || document.body;
  }

  function findLanguageHost() {
    return findSettingsHost() || findMenuHost() || (!document.querySelector("canvas") ? findPageHost() : null);
  }

  function makeControl() {
    const wrap = document.createElement("div");
    wrap.className = "rod-language-switcher";
    wrap.setAttribute("data-no-translate", "");
    wrap.innerHTML = `
      <button class="rod-language-switcher__btn" type="button" data-lang="en" aria-label="Switch to English">EN</button>
      <button class="rod-language-switcher__btn" type="button" data-lang="pt" aria-label="Mudar para português">PT</button>
    `;
    wrap.querySelectorAll("[data-lang]").forEach(button => {
      button.addEventListener("click", () => {
        language = button.dataset.lang || DEFAULT_LANGUAGE;
        storage.setItem(STORAGE_KEY, language);
        document.documentElement.lang = language === "pt" ? "pt-PT" : "en";
        translatePage();
      });
    });
    return wrap;
  }

  function installStyles() {
    if (document.getElementById("rod-language-switcher-style")) return;
    const style = document.createElement("style");
    style.id = "rod-language-switcher-style";
    style.textContent = `
      .rod-language-switcher {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        flex: 0 0 auto;
        align-self: flex-end;
        gap: 2px;
        width: fit-content;
        max-width: min(92vw, 160px);
        margin: 18px 0 0 auto;
        padding: 4px;
        border: 1px solid rgba(255,255,255,.22);
        border-radius: 999px;
        background: rgba(5, 8, 14, .76);
        color: #fff;
        font: 900 12px/1 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        letter-spacing: 0;
        box-shadow: 0 10px 26px rgba(0,0,0,.28);
        backdrop-filter: blur(10px);
        pointer-events: auto;
        z-index: 2147483000;
      }
      body > .rod-language-switcher {
        margin: 22px max(18px, env(safe-area-inset-right)) 18px auto;
      }
      .rod-language-switcher--hidden { display: none; }
      .rod-language-switcher__btn {
        min-width: 38px;
        height: 30px;
        border: 0;
        border-radius: 999px;
        background: rgba(255,255,255,.12);
        color: rgba(255,255,255,.7);
        font: inherit;
        cursor: pointer;
        transition: background .16s ease, color .16s ease, transform .16s ease;
      }
      .rod-language-switcher__btn:hover {
        color: #fff;
        background: rgba(255,255,255,.2);
      }
      .rod-language-switcher__btn:active {
        transform: translateY(1px);
      }
      .rod-language-switcher__btn.is-active {
        color: #08111d;
        background: #f8fafc;
      }
      @media (max-width: 560px) {
        .rod-language-switcher {
          margin-top: 14px;
        }
        .rod-language-switcher__btn {
          min-width: 34px;
          height: 28px;
          font-size: 11px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function placeControl() {
    if (!control) control = makeControl();
    const host = findLanguageHost();
    if (host && control.parentElement !== host) host.appendChild(control);
    control.classList.toggle("rod-language-switcher--hidden", !host);
  }

  function translateString(value) {
    const trimmed = value.replace(/\s+/g, " ").trim();
    if (!trimmed) return value;
    if (language !== "pt") return null;
    if (TEXT[trimmed]) return value.replace(trimmed, TEXT[trimmed]);
    for (const [regex, replacement] of REGEX_TEXT) {
      if (regex.test(trimmed)) return value.replace(trimmed, trimmed.replace(regex, replacement));
    }
    let phraseTranslated = trimmed;
    for (const [from, to] of PHRASE_TEXT) {
      phraseTranslated = phraseTranslated.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), to);
    }
    if (phraseTranslated !== trimmed) return value.replace(trimmed, phraseTranslated);
    return null;
  }

  function currentTranslation(original) {
    if (!original) return null;
    const previousLanguage = language;
    language = "pt";
    const translated = translateString(original);
    language = previousLanguage;
    return translated;
  }

  function translateTextNode(node) {
    const parent = node.parentElement;
    if (!parent || parent.closest(SKIP_SELECTOR)) return;

    if (!node.__rodOriginalText) node.__rodOriginalText = node.nodeValue;
    if (language === "pt") {
      const lastTranslated = currentTranslation(node.__rodOriginalText);
      if (node.nodeValue !== node.__rodOriginalText && node.nodeValue !== lastTranslated) {
        node.__rodOriginalText = node.nodeValue;
      }
    }
    if (language === "en") {
      node.nodeValue = node.__rodOriginalText;
      return;
    }

    const translated = translateString(node.__rodOriginalText);
    if (translated !== null) node.nodeValue = translated;
  }

  function translateElementAttributes(el) {
    if (el.closest(SKIP_SELECTOR)) return;
    ["placeholder", "title", "aria-label", "value"].forEach(attr => {
      if (!el.hasAttribute(attr)) return;
      const key = `__rodOriginal_${attr}`;
      if (!el[key]) el[key] = el.getAttribute(attr);
      if (language === "pt") {
        const lastTranslated = currentTranslation(el[key]);
        const currentValue = el.getAttribute(attr);
        if (currentValue !== el[key] && currentValue !== lastTranslated) {
          el[key] = currentValue;
        }
      }
      if (language === "en") {
        el.setAttribute(attr, el[key]);
        return;
      }
      const translated = translateString(el[key]);
      if (translated !== null) el.setAttribute(attr, translated);
    });
  }

  function translatePage() {
    if (translating) return;
    translating = true;
    document.documentElement.lang = language === "pt" ? "pt-PT" : "en";

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach(translateTextNode);
    Array.from(document.body.querySelectorAll("input, button, select, option, [title], [aria-label]")).forEach(translateElementAttributes);
    if (control) {
      Object.keys(LANGUAGES).forEach(code => {
        const button = control.querySelector(`[data-lang="${cssEscape(code)}"]`);
        if (button) {
          button.classList.toggle("is-active", code === language);
          button.setAttribute("aria-pressed", code === language ? "true" : "false");
        }
      });
    }
    translating = false;
  }

  function scheduleRefresh() {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => {
      placeControl();
      translatePage();
    }, 60);
  }

  function init() {
    if (!document.body) return;
    installStyles();
    placeControl();
    translatePage();
    new MutationObserver(scheduleRefresh).observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["class", "style", "hidden", "value"]
    });
    window.addEventListener("resize", placeControl);
    setInterval(placeControl, 500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
