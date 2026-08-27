const STORAGE_KEY = "karaoke-app-v2-state";

const defaultState = {
  version: 1,
  theme: "light",
  settings: { thumbnails: true, youtubeApiKey: "", themeNamesV2: true, firstRunComplete: false },
  people: [],
  playlists: [],
  recentSongs: [],
  activeSession: null
};

let state = loadState();
let route = { name: "home", data: {} };
let routeStack = [];
let draggedSongId = null;
let ytPlayer = null;
let ytApiReady = false;
let draftSessionSingerIds = new Set();
let projectorSignature = "";

const view = document.querySelector("#view");
const title = document.querySelector("#screenTitle");
const eyebrow = document.querySelector("#eyebrow");
const backButton = document.querySelector("#backButton");
const topAction = document.querySelector("#topAction");

init();

function init() {
  applyTheme();
  bindShell();
  if (new URLSearchParams(window.location.search).has("projector")) {
    route = { name: "projector", data: {} };
  } else if (!state.settings.firstRunComplete) {
    route = { name: "setup", data: {} };
  }
  render();
}

function bindShell() {
  document.querySelectorAll("[data-nav]").forEach((button) => {
    button.addEventListener("click", () => navigate(button.dataset.nav, {}, true));
  });
  backButton.addEventListener("click", goBack);
  topAction.addEventListener("click", handleTopAction);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultState);
    const parsed = JSON.parse(raw);
    if (parsed.theme === "pink" && !parsed.settings?.themeNamesV2) parsed.theme = "cherry";
    return {
      ...structuredClone(defaultState),
      ...parsed,
      settings: { ...defaultState.settings, ...(parsed.settings || {}) },
      people: Array.isArray(parsed.people) ? parsed.people : [],
      playlists: Array.isArray(parsed.playlists) ? parsed.playlists : [],
      recentSongs: Array.isArray(parsed.recentSongs) ? parsed.recentSongs : [],
      activeSession: parsed.activeSession || null
    };
  } catch {
    localStorage.setItem(`${STORAGE_KEY}-corrupt-${Date.now()}`, localStorage.getItem(STORAGE_KEY) || "");
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
}

function navigate(name, data = {}, resetStack = false) {
  if (resetStack) routeStack = [];
  else routeStack.push(route);
  route = { name, data };
  render();
}

function replaceRoute(name, data = {}) {
  route = { name, data };
  render();
}

function goBack() {
  route = routeStack.pop() || { name: "home", data: {} };
  render();
}

function setHeader(screenTitle, sub = "NextUp") {
  title.textContent = screenTitle;
  eyebrow.textContent = sub;
  document.body.classList.toggle("home-screen", route.name === "home");
  document.body.classList.remove("projector-screen");
  backButton.classList.toggle("hidden", routeStack.length === 0);
  document.querySelectorAll("[data-nav]").forEach((button) => {
    button.classList.toggle("active", button.dataset.nav === route.name);
  });
  const actionMap = {
    playlists: ["＋", "Create playlist"],
    playlistEditor: ["＋", "Add song"],
    queue: ["＋", "Add song"],
    recent: ["＋", "Add song"]
  };
  const action = actionMap[route.name];
  topAction.textContent = action?.[0] || "";
  topAction.setAttribute("aria-label", action?.[1] || "No action");
  topAction.classList.toggle("hidden", !action);
}

function handleTopAction() {
  if (route.name === "playlists") return submitPlaylistCreator();
  if (route.name === "playlistEditor" || route.name === "queue" || route.name === "recent") return navigate("addSong");
}

function render() {
  const routes = {
    setup: renderSetup,
    home: renderHome,
    newSession: renderNewSession,
    queue: renderQueue,
    addSong: renderAddSong,
    ready: renderReady,
    player: renderPlayer,
    complete: renderComplete,
    projector: renderProjector,
    playlists: renderPlaylists,
    playlistEditor: renderPlaylistEditor,
    people: renderPeople,
    recent: renderRecent,
    settings: renderSettings
  };
  view.innerHTML = "";
  (routes[route.name] || renderHome)();
}

function renderSetup() {
  setHeader("Setup", "NextUp");
  const apiKeyField = inputField("YouTube API key", "Paste your key here");
  apiKeyField.input.value = state.settings.youtubeApiKey || "";
  apiKeyField.input.autocomplete = "off";
  apiKeyField.input.spellcheck = false;

  const finish = (saveKey) => {
    if (saveKey) state.settings.youtubeApiKey = apiKeyField.input.value.trim();
    state.settings.firstRunComplete = true;
    saveState();
    routeStack = [];
    replaceRoute("home");
    toast(saveKey && state.settings.youtubeApiKey ? "YouTube API key saved locally." : "You can add the key later in Settings.");
  };

  view.append(el("section", "card setup-card", [
    el("div", "setup-intro", [
      el("h2", "section-title", "Do you want to add a YouTube API?"),
      el("p", "muted", "This lets Browse show video results inside NextUp instead of opening YouTube search.")
    ]),
    el("ol", "setup-steps", [
      el("li", "", "Open Google Cloud Console."),
      el("li", "", "Create or choose a project."),
      el("li", "", "Enable YouTube Data API v3."),
      el("li", "", "Go to Credentials, create an API key, then paste it here.")
    ]),
    apiKeyField.wrapper,
    el("div", "split-actions", [
      button("Save Key", "primary", () => finish(true)),
      button("Skip", "secondary", () => finish(false))
    ])
  ]));
}

function renderHome() {
  setHeader("Home");
  view.append(el("section", "home-landing", [
    el("div", "", [
      el("h2", "", "NextUp")
    ]),
    el("div", "home-menu", [
      homeLink("Start Session"),
      homeLink("Browse"),
      homeLink("Playlists"),
      homeLink("Recent"),
      homeLink("Settings")
    ])
  ]));
}

function renderNewSession() {
  setHeader("New Session", "Choose singers");
  let selected = new Set(state.people.map((p) => p.id));
  draftSessionSingerIds = selected;
  const card = el("section", "card grid");
  const input = inputField("Add someone new", "Name");
  const list = el("div", "picker-list");

  const redraw = () => {
    list.innerHTML = "";
    if (!state.people.length) list.append(emptyInline("No saved people yet."));
    state.people.forEach((person) => {
      const pill = button(person.name, `person-pill ${selected.has(person.id) ? "selected" : ""}`, () => {
        selected.has(person.id) ? selected.delete(person.id) : selected.add(person.id);
        draftSessionSingerIds = selected;
        redraw();
      });
      list.append(pill);
    });
  };

  input.input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      addPerson(input.input.value, selected);
      draftSessionSingerIds = selected;
      input.input.value = "";
      redraw();
    }
  });

  card.append(
    input.wrapper,
    button("Add Person", "secondary", () => {
      addPerson(input.input.value, selected);
      draftSessionSingerIds = selected;
      input.input.value = "";
      redraw();
    }),
    el("h3", "section-title", "Session singers"),
    list,
    button("Done", "primary", () => completeSessionSetup(selected))
  );
  redraw();
  view.append(card);
}

function completeSessionSetup(selectedIds = draftSessionSingerIds) {
  if (!selectedIds.size) return toast("Add at least one singer.");
  state.activeSession = {
    id: id(),
    createdAt: Date.now(),
    status: "Building queue",
    peopleIds: [...selectedIds],
    queue: [],
    completedIds: [],
    currentSongId: null,
    playlistId: null
  };
  saveState();
  navigate("addSong");
}

function homeNextSong(song) {
  return el("article", "home-next", [
    thumbnail(song.videoId),
    el("div", "", [
      el("p", "ready-label", "UP NEXT"),
      el("strong", "", song.title),
      el("p", "muted", names(song.singerIds))
    ])
  ]);
}

function homeRecentSong(song) {
  const item = el("button", "mini-song", [
    thumbnail(song.videoId),
    el("span", "", song.title)
  ], { type: "button" });
  item.addEventListener("click", () => navigate("recent", {}, true));
  return item;
}

function homeLink(label) {
  const routes = {
    "Start Session": "newSession",
    Browse: "addSong",
    Playlists: "playlists",
    Recent: "recent",
    Settings: "settings"
  };
  const link = button(label, "home-link", () => navigate(routes[label]));
  return link;
}

function renderPeople() {
  setHeader("People");
  const input = inputField("Add a singer", "Name");
  const list = el("section", "grid");
  input.input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      addPerson(input.input.value);
      input.input.value = "";
      render();
    }
  });
  view.append(el("section", "card grid", [
    input.wrapper,
    button("Add Person", "primary", () => {
      addPerson(input.input.value);
      input.input.value = "";
      render();
    })
  ]));

  if (!state.people.length) {
    list.append(emptyState("No saved people", "Add singers once and reuse them in future sessions.", "Add Person", () => input.input.focus()));
  } else {
    state.people.forEach((person) => list.append(personRow(person)));
  }
  view.append(list);
}

function personRow(person) {
  return el("article", "card", [
    el("div", "section-head", [
      el("strong", "", person.name),
      el("div", "row-actions", [
        button("Edit", "small-button", () => {
          const next = prompt("Edit name", person.name);
          if (next) updatePerson(person.id, next);
        }),
        button("Delete", "small-button danger", () => deletePerson(person.id))
      ])
    ])
  ]);
}

function renderQueue() {
  setHeader("Queue", "Active session");
  const session = ensureSession();
  if (!session) return;
  const remaining = session.queue.filter((song) => song.status !== "completed");

  view.append(el("section", "card grid", [
    el("div", "section-head", [
      el("div", "", [
        el("h3", "section-title", "Session queue"),
        el("p", "muted", `${remaining.length} upcoming · ${session.completedIds.length} completed`)
      ]),
      button("Ready", "primary", () => openReady())
    ]),
    el("div", "split-actions", [
      button("Add Song", "secondary", () => navigate("addSong")),
      button("Save Playlist", "secondary", () => saveQueueAsPlaylist())
    ])
  ]));

  const list = el("section", "song-list");
  if (!session.queue.length) {
    list.append(emptyState("No songs yet", "Add a YouTube karaoke video to start building your queue.", "Add Song", () => navigate("addSong")));
  } else {
    session.queue.forEach((song, index) => list.append(songCard(song, index, "queue")));
  }
  view.append(list);
}

function renderAddSong() {
  setHeader("Browse", "YouTube karaoke");
  const session = getOrCreateSession();

  let selectedSingers = new Set(session.peopleIds);
  const searchField = inputField("Search YouTube", "Song name or artist");
  const urlField = inputField("YouTube link or video ID", "https://youtube.com/watch?v=...");
  const titleField = inputField("Song title", "Detected from YouTube when possible");
  const singerList = el("div", "picker-list");
  const searchResults = el("div", "song-list search-results");

  const renderSingers = () => {
    singerList.innerHTML = "";
    if (!state.people.length) singerList.append(emptyInline("Add singers for this song."));
    state.people.forEach((person) => {
      singerList.append(button(person.name, `person-pill ${selectedSingers.has(person.id) ? "selected" : ""}`, () => {
        selectedSingers.has(person.id) ? selectedSingers.delete(person.id) : selectedSingers.add(person.id);
        renderSingers();
      }));
    });
  };
  if (!session.peopleIds.length) {
    view.append(emptyState("Add singers first", "Start a session with names before browsing songs.", "Start Session", () => navigate("newSession")));
    return;
  }

  urlField.input.addEventListener("input", debounce(async () => {
    const videoId = parseYouTubeId(urlField.input.value.trim());
    if (!videoId) return;
    titleField.input.value = await fetchYouTubeTitle(urlField.input.value.trim(), videoId);
  }, 450));
  searchField.input.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") await runSongSearch(searchField.input.value, searchResults, urlField.input, titleField.input);
  });

  view.append(el("section", "card grid", [
    el("div", "search-row", [
      searchField.wrapper,
      button("Search", "secondary", () => runSongSearch(searchField.input.value, searchResults, urlField.input, titleField.input))
    ]),
    searchResults,
    urlField.wrapper,
    titleField.wrapper,
    el("h3", "section-title", "Singers"),
    singerList,
    button("Add To Queue", "primary", async () => {
      const videoId = parseYouTubeId(urlField.input.value.trim());
      if (!videoId) return toast("Add a valid YouTube link or video ID.");
      if (!selectedSingers.size) return toast("Choose at least one singer.");
      const embedCheck = await checkYouTubeEmbeddable(videoId);
      if (!embedCheck.ok) return toast(embedCheck.message);
      session.peopleIds = [...new Set([...session.peopleIds, ...selectedSingers])];
      const song = {
        id: id(),
        videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        title: titleField.input.value.trim() || await fetchYouTubeTitle(urlField.input.value.trim(), videoId),
        singerIds: [...selectedSingers],
        status: "upcoming",
        addedAt: Date.now()
      };
      session.queue.push(song);
      rememberRecent(song);
      saveState();
      toast("Added to queue.");
      navigate("addSong");
    })
  ]));
  renderSingers();

  view.append(el("section", "card grid browse-queue", [
    el("div", "section-head", [
      el("div", "", [
        el("h3", "section-title", "Playlist"),
        el("p", "muted", session.queue.length ? `${session.queue.length} songs queued` : "Add songs above, then press Done")
      ]),
      button("Projector", "small-button", openProjector)
    ]),
    session.queue.length
      ? el("div", "song-list", session.queue.map((song, index) => songCard(song, index, "queue")))
      : emptyInline("No songs yet.")
  ]));
  view.append(el("section", "bottom-action", [
    button("Done", "primary", startReadyFromBrowse)
  ]));
}

function renderReady() {
  setHeader("Ready", "Up next");
  const session = ensureSession();
  if (!session) return;
  const song = nextSong();
  if (!song) return replaceRoute("complete");
  view.append(el("section", "ready", [
    el("p", "ready-label", "UP NEXT"),
    el("h2", "ready-title", song.title),
    el("p", "ready-singers", names(song.singerIds)),
    button("READY", "primary", () => {
      song.status = "current";
      session.currentSongId = song.id;
      saveState();
      navigate("player", { songId: song.id });
    }),
    button("Back To Queue", "secondary", () => navigate("queue"))
  ]));
}

function renderPlayer() {
  setHeader("Now Playing", "YouTube");
  const session = ensureSession();
  if (!session) return;
  const song = session.queue.find((item) => item.id === route.data.songId) || nextSong();
  if (!song) return replaceRoute("complete");
  view.append(el("section", "player-shell", [
    el("div", "video-wrap", [
      el("div", "", "", { id: "youtubePlayer" })
    ]),
    el("div", "player-controls", [
      el("div", "", [
        el("h2", "section-title", song.title),
        el("p", "muted", names(song.singerIds))
      ]),
      el("div", "split-actions", [
        button("Song Finished", "primary", () => completeSong(song.id)),
        button("Back To Queue", "secondary", () => navigate("queue"))
      ]),
      button("Video Unavailable", "danger", () => {
        toast("Marked unavailable. Choose another video or remove it from the queue.");
        navigate("queue");
      })
    ])
  ]));
  loadYouTubeApi().then(() => {
    if (route.name === "player" && document.querySelector("#youtubePlayer")) mountYouTubePlayer(song);
  });
}

function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve();
  if (ytApiReady) return new Promise((resolve) => {
    const wait = setInterval(() => {
      if (window.YT?.Player) {
        clearInterval(wait);
        resolve();
      }
    }, 50);
  });
  ytApiReady = true;
  return new Promise((resolve) => {
    window.onYouTubeIframeAPIReady = () => resolve();
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.head.append(script);
  });
}

function mountYouTubePlayer(song) {
  ytPlayer?.destroy?.();
  ytPlayer = new YT.Player("youtubePlayer", {
    width: "100%",
    height: "100%",
    videoId: song.videoId,
    playerVars: {
      autoplay: 1,
      playsinline: 1,
      rel: 0
    },
    events: {
      onReady: (event) => event.target.playVideo(),
      onStateChange: (event) => {
        if (event.data === YT.PlayerState.ENDED && state.activeSession?.currentSongId) {
          completeSong(state.activeSession.currentSongId);
        }
      },
      onError: () => toast("YouTube could not play this video here. Try opening or replacing it.")
    }
  });
}

function renderComplete() {
  setHeader("Complete", "Session finished");
  const session = state.activeSession;
  const performed = session?.completedIds.length || 0;
  const singers = session ? names(session.peopleIds) : "No singers";
  view.append(el("section", "hero", [
    el("div", "", [
      el("p", "ready-label", "SESSION COMPLETE"),
      el("h2", "", "Great set"),
      el("p", "", `${performed} songs performed · ${singers}`)
    ]),
    el("div", "grid", [
      button("Return Home", "primary", () => {
        if (state.activeSession) state.activeSession.status = "Complete";
        saveState();
        navigate("home", {}, true);
      }),
      button("Restart Playlist", "secondary", () => restartSessionQueue()),
      button("Save Queue As Playlist", "secondary", () => saveQueueAsPlaylist())
    ])
  ]));
}

function renderPlaylists() {
  setHeader("Playlists");
  const nameField = inputField("New playlist", "Playlist name");
  nameField.input.setAttribute("data-playlist-name", "true");
  nameField.input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") createPlaylist(nameField.input.value, nameField.input);
  });
  view.append(el("section", "card playlist-create", [
    nameField.wrapper,
    button("＋", "primary add-only", () => createPlaylist(nameField.input.value, nameField.input), "Add playlist")
  ]));
  const list = el("section", "song-list");
  if (!state.playlists.length) {
    list.append(emptyState("No playlists", "Add a playlist for repeat karaoke nights.", null, null));
  } else {
    state.playlists.forEach((playlist) => {
      list.append(el("article", "card grid", [
        el("div", "section-head", [
          el("div", "", [
            el("strong", "", playlist.name),
            el("p", "muted", `${playlist.songs.length} songs`)
          ]),
          button("Open", "small-button", () => navigate("playlistEditor", { playlistId: playlist.id }))
        ]),
        el("div", "row-actions", [
          button("Load", "secondary", () => loadPlaylist(playlist)),
          button("Duplicate", "secondary", () => duplicatePlaylist(playlist.id)),
          button("Delete", "danger", () => deletePlaylist(playlist.id))
        ])
      ]));
    });
  }
  view.append(list);
}

function renderPlaylistEditor() {
  const playlist = state.playlists.find((item) => item.id === route.data.playlistId);
  if (!playlist) return replaceRoute("playlists");
  setHeader(playlist.name, "Playlist");
  view.append(el("section", "card grid", [
    button("Rename Playlist", "secondary", () => {
      const next = prompt("Playlist name", playlist.name);
      if (next) {
        playlist.name = next.trim();
        saveState();
        render();
      }
    }),
    button("Load Into Session", "primary", () => loadPlaylist(playlist))
  ]));
  const list = el("section", "song-list");
  if (!playlist.songs.length) {
    list.append(emptyState("Playlist is empty", "Load a session queue here once it has songs.", "Back", goBack));
  } else {
    playlist.songs.forEach((song, index) => list.append(songCard(song, index, "playlist", playlist)));
  }
  view.append(list);
}

function renderRecent() {
  setHeader("Recent Songs");
  const list = el("section", "song-list");
  if (!state.recentSongs.length) {
    list.append(emptyState("No recent songs", "Songs you add to queues will appear here for faster re-adding.", "Start Karaoke", () => navigate("newSession")));
  } else {
    state.recentSongs.forEach((song) => {
      list.append(el("article", "song-card", [
        thumbnail(song.videoId),
        el("div", "song-main", [
          el("div", "song-title", song.title),
          el("p", "song-meta", song.url),
          button("Add To Queue", "secondary", () => addRecentToQueue(song))
        ])
      ]));
    });
  }
  view.append(list);
}

function renderSettings() {
  setHeader("Settings");
  const apiKeyField = inputField("YouTube API key", "Optional for in-app search");
  apiKeyField.input.value = state.settings.youtubeApiKey || "";
  apiKeyField.input.addEventListener("change", () => {
    state.settings.youtubeApiKey = apiKeyField.input.value.trim();
    saveState();
    toast(state.settings.youtubeApiKey ? "YouTube API key saved locally." : "YouTube API key cleared.");
  });
  view.append(el("section", "card grid", [
    themePicker(),
    apiKeyField.wrapper,
    settingRow("YouTube thumbnails", state.settings.thumbnails ? "On" : "Off", switchToggle(state.settings.thumbnails, () => {
      state.settings.thumbnails = !state.settings.thumbnails;
      saveState();
      render();
    })),
    settingRow("Recent songs", `${state.recentSongs.length} saved`, button("Clear", "danger", () => confirmAction("Clear recent songs?", () => {
      state.recentSongs = [];
      saveState();
      render();
    }))),
    settingRow("Active session", state.activeSession ? "Saved" : "None", button("Clear", "danger", () => confirmAction("Clear active session?", () => {
      state.activeSession = null;
      saveState();
      render();
    }))),
    settingRow("All local data", "Singers, playlists, session, settings", button("Reset", "danger", () => confirmAction("Reset all saved app data?", () => {
      state = structuredClone(defaultState);
      saveState();
      applyTheme();
      routeStack = [];
      replaceRoute("setup");
    })))
  ]));
}

function songCard(song, index, mode, playlist = null) {
  const status = mode === "queue" ? song.status : "playlist";
  const article = el("article", "song-card", [
    thumbnail(song.videoId, index + 1),
    el("div", "song-main", [
      el("div", "section-head", [
        el("div", "", [
          el("div", "song-title", `${index + 1}. ${song.title}`),
          el("p", "song-meta", names(song.singerIds || []))
        ]),
        el("span", "state-badge", status)
      ]),
      el("div", "row-actions", [
        button("↑", "small-button", () => moveSong(song.id, -1, mode, playlist), "Move up"),
        button("↓", "small-button", () => moveSong(song.id, 1, mode, playlist), "Move down"),
        button("Edit", "small-button", () => editSong(song, mode, playlist)),
        button("Open", "small-button", () => window.open(song.url || `https://youtube.com/watch?v=${song.videoId}`, "_blank")),
        button("Remove", "small-button danger", () => removeSong(song.id, mode, playlist))
      ])
    ])
  ], { draggable: "true" });
  article.addEventListener("dragstart", () => {
    draggedSongId = song.id;
    article.classList.add("dragging");
  });
  article.addEventListener("dragend", () => {
    draggedSongId = null;
    article.classList.remove("dragging");
  });
  article.addEventListener("dragover", (event) => event.preventDefault());
  article.addEventListener("drop", () => reorderByDrop(draggedSongId, song.id, mode, playlist));
  return article;
}

function ensureSession() {
  if (state.activeSession) return state.activeSession;
  view.append(emptyState("No active session", "Start a new karaoke session to build a queue.", "Start Karaoke", () => navigate("newSession")));
  return null;
}

function getOrCreateSession() {
  if (state.activeSession) return state.activeSession;
  state.activeSession = {
    id: id(),
    createdAt: Date.now(),
    status: "In progress",
    peopleIds: [],
    queue: [],
    completedIds: [],
    currentSongId: null,
    playlistId: null
  };
  saveState();
  return state.activeSession;
}

function nextSong() {
  return state.activeSession?.queue.find((song) => song.status !== "completed") || null;
}

function openReady() {
  const song = nextSong();
  if (!song) return navigate("complete");
  navigate("ready");
}

function startReadyFromBrowse() {
  const session = state.activeSession;
  if (!session?.queue.length) return toast("Add at least one song first.");
  openReady();
}

function openProjector() {
  const url = new URL(window.location.href);
  url.searchParams.set("projector", "1");
  const projector = window.open(url.toString(), "nextup-projector", "popup=yes,width=1280,height=720");
  if (!projector) toast("Allow popups to open the projector display.");
}

function renderProjector() {
  document.body.classList.remove("home-screen");
  document.body.classList.add("projector-screen");
  const session = state.activeSession;
  const current = session?.queue.find((song) => song.id === session.currentSongId);
  const upcoming = nextSong();
  const song = current || upcoming;
  projectorSignature = getProjectorSignature();
  view.append(el("section", "projector-stage", song ? [
    el("p", "ready-label", current ? "NOW PLAYING" : "UP NEXT"),
    el("h2", "ready-title", song.title),
    el("p", "ready-singers", names(song.singerIds)),
    current ? el("div", "video-wrap projector-video", [
      el("iframe", "", "", {
        src: `https://www.youtube.com/embed/${current.videoId}?autoplay=1&rel=0&playsinline=1`,
        title: current.title,
        allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
        allowfullscreen: "true"
      })
    ]) : el("p", "muted", "Start the song from the host screen when everyone is ready."),
    button("Fullscreen", "primary projector-fullscreen", () => document.documentElement.requestFullscreen?.())
  ] : [
    el("h2", "ready-title", "NextUp"),
    el("p", "ready-singers", "Waiting for a song")
  ]));
  scheduleProjectorRefresh();
}

function scheduleProjectorRefresh() {
  setTimeout(() => {
    if (route.name !== "projector") return;
    state = loadState();
    const nextSignature = getProjectorSignature();
    if (nextSignature !== projectorSignature) render();
    else scheduleProjectorRefresh();
  }, 1200);
}

function getProjectorSignature() {
  const session = state.activeSession;
  const current = session?.queue.find((song) => song.id === session.currentSongId);
  const upcoming = nextSong();
  const song = current || upcoming;
  return JSON.stringify({
    current: current?.id || "",
    next: upcoming?.id || "",
    title: song?.title || "",
    singers: song?.singerIds || []
  });
}

function completeSong(songId) {
  const session = state.activeSession;
  const song = session?.queue.find((item) => item.id === songId);
  if (!song) return;
  song.status = "completed";
  session.currentSongId = null;
  if (!session.completedIds.includes(song.id)) session.completedIds.push(song.id);
  saveState();
  replaceRoute(nextSong() ? "ready" : "complete");
}

function restartSessionQueue() {
  const session = state.activeSession;
  if (!session) return navigate("home", {}, true);
  session.queue.forEach((song) => song.status = "upcoming");
  session.completedIds = [];
  session.currentSongId = null;
  session.status = "In progress";
  saveState();
  navigate("ready");
}

function addPerson(name, selectedSet = null) {
  const clean = name.trim();
  if (!clean) return toast("Enter a name first.");
  const existing = state.people.find((p) => p.name.toLowerCase() === clean.toLowerCase());
  if (existing) {
    selectedSet?.add(existing.id);
    return toast("That singer is already saved.");
  }
  const person = { id: id(), name: clean, createdAt: Date.now() };
  state.people.push(person);
  selectedSet?.add(person.id);
  saveState();
}

function updatePerson(personId, name) {
  const clean = name.trim();
  if (!clean) return;
  if (state.people.some((p) => p.id !== personId && p.name.toLowerCase() === clean.toLowerCase())) return toast("That name is already saved.");
  const person = findPerson(personId);
  if (person) person.name = clean;
  saveState();
  render();
}

function deletePerson(personId) {
  confirmAction("Delete this person?", () => {
    state.people = state.people.filter((p) => p.id !== personId);
    state.activeSession?.peopleIds && (state.activeSession.peopleIds = state.activeSession.peopleIds.filter((idValue) => idValue !== personId));
    state.activeSession?.queue.forEach((song) => song.singerIds = song.singerIds.filter((idValue) => idValue !== personId));
    saveState();
    render();
  });
}

function findPerson(personId) {
  return state.people.find((person) => person.id === personId);
}

function names(ids) {
  const resolved = ids.map(findPerson).filter(Boolean).map((person) => person.name);
  return resolved.length ? resolved.join(" + ") : "No singer assigned";
}

function editSong(song, mode, playlist) {
  const nextTitle = prompt("Song title", song.title);
  if (!nextTitle) return;
  song.title = nextTitle.trim();
  if (mode === "queue") editSingers(song);
  if (mode === "playlist" && playlist) {
    const nextUrl = prompt("YouTube link or video ID", song.url || song.videoId);
    if (nextUrl) {
      const videoId = parseYouTubeId(nextUrl.trim());
      if (videoId) {
        song.videoId = videoId;
        song.url = `https://www.youtube.com/watch?v=${videoId}`;
      } else {
        toast("Kept the previous YouTube video because that link was not valid.");
      }
    }
  }
  saveState();
  render();
}

function editSingers(song) {
  const session = state.activeSession;
  const current = new Set(song.singerIds);
  const options = session.peopleIds.map(findPerson).filter(Boolean).map((p) => `${current.has(p.id) ? "✓" : "○"} ${p.name}`).join("\n");
  const answer = prompt(`Type singer names separated by commas:\n\n${options}`, names(song.singerIds));
  if (!answer) return;
  const wanted = answer.split(",").map((name) => name.trim().toLowerCase()).filter(Boolean);
  const ids = session.peopleIds.filter((personId) => wanted.includes(findPerson(personId)?.name.toLowerCase()));
  if (!ids.length) return toast("No matching singers selected.");
  song.singerIds = ids;
  saveState();
  render();
}

function saveQueueAsPlaylist() {
  const session = state.activeSession;
  if (!session?.queue.length) return toast("Add songs before saving a playlist.");
  const name = prompt("Playlist name", "Karaoke Night");
  if (!name) return;
  const playlist = {
    id: id(),
    name: name.trim(),
    createdAt: Date.now(),
    songs: session.queue.map((song) => ({
      id: id(),
      videoId: song.videoId,
      url: song.url,
      title: song.title,
      singerIds: [...(song.singerIds || [])]
    }))
  };
  state.playlists.unshift(playlist);
  session.playlistId = playlist.id;
  saveState();
  toast("Playlist saved.");
  render();
}

function createPlaylist(name = "", inputEl = null) {
  const clean = name.trim();
  if (!clean) {
    toast("Name the playlist first.");
    inputEl?.focus();
    return;
  }
  state.playlists.unshift({ id: id(), name: clean, createdAt: Date.now(), songs: [] });
  saveState();
  if (inputEl) inputEl.value = "";
  render();
}

function focusPlaylistCreator() {
  const field = document.querySelector("[data-playlist-name]");
  field?.focus();
}

function submitPlaylistCreator() {
  const field = document.querySelector("[data-playlist-name]");
  if (!field) return;
  if (field.value.trim()) createPlaylist(field.value, field);
  else focusPlaylistCreator();
}

function duplicatePlaylist(playlistId) {
  const playlist = state.playlists.find((item) => item.id === playlistId);
  if (!playlist) return;
  state.playlists.unshift({
    ...structuredClone(playlist),
    id: id(),
    name: `${playlist.name} Copy`,
    createdAt: Date.now(),
    songs: playlist.songs.map((song) => ({ ...song, id: id() }))
  });
  saveState();
  render();
}

function deletePlaylist(playlistId) {
  confirmAction("Delete this playlist?", () => {
    state.playlists = state.playlists.filter((playlist) => playlist.id !== playlistId);
    saveState();
    render();
  });
}

function loadPlaylist(playlist) {
  const playlistPeople = playlist.songs.flatMap((song) => song.singerIds || []);
  const selectedPeople = new Set(state.activeSession?.peopleIds?.length ? state.activeSession.peopleIds : playlistPeople);
  const queue = playlist.songs.map((song) => ({
    ...structuredClone(song),
    id: id(),
    singerIds: song.singerIds?.filter((personId) => selectedPeople.has(personId)) || [],
    status: "upcoming",
    addedAt: Date.now()
  }));
  state.activeSession = {
    id: state.activeSession?.id || id(),
    createdAt: state.activeSession?.createdAt || Date.now(),
    status: "In progress",
    peopleIds: [...selectedPeople],
    queue,
    completedIds: [],
    currentSongId: null,
    playlistId: playlist.id
  };
  saveState();
  navigate("queue");
}

function rememberRecent(song) {
  state.recentSongs = state.recentSongs.filter((item) => item.videoId !== song.videoId);
  state.recentSongs.unshift({
    videoId: song.videoId,
    url: song.url,
    title: song.title,
    lastUsedAt: Date.now()
  });
  state.recentSongs = state.recentSongs.slice(0, 30);
}

function addRecentToQueue(song) {
  const session = ensureSession();
  if (!session) return;
  const singerName = prompt("Singer names separated by commas", names(session.peopleIds));
  if (!singerName) return;
  const wanted = singerName.split(",").map((name) => name.trim().toLowerCase()).filter(Boolean);
  const singerIds = session.peopleIds.filter((personId) => wanted.includes(findPerson(personId)?.name.toLowerCase()));
  if (!singerIds.length) return toast("No matching singers selected.");
  session.queue.push({ ...structuredClone(song), id: id(), singerIds, status: "upcoming", addedAt: Date.now() });
  saveState();
  navigate("queue");
}

function moveSong(songId, delta, mode, playlist) {
  const list = mode === "playlist" ? playlist.songs : state.activeSession.queue;
  const index = list.findIndex((song) => song.id === songId);
  const next = index + delta;
  if (index < 0 || next < 0 || next >= list.length) return;
  const [song] = list.splice(index, 1);
  list.splice(next, 0, song);
  saveState();
  render();
}

function reorderByDrop(sourceId, targetId, mode, playlist) {
  if (!sourceId || sourceId === targetId) return;
  const list = mode === "playlist" ? playlist.songs : state.activeSession.queue;
  const from = list.findIndex((song) => song.id === sourceId);
  const to = list.findIndex((song) => song.id === targetId);
  if (from < 0 || to < 0) return;
  const [song] = list.splice(from, 1);
  list.splice(to, 0, song);
  saveState();
  render();
}

function removeSong(songId, mode, playlist) {
  confirmAction("Remove this song?", () => {
    if (mode === "playlist") playlist.songs = playlist.songs.filter((song) => song.id !== songId);
    else state.activeSession.queue = state.activeSession.queue.filter((song) => song.id !== songId);
    saveState();
    render();
  });
}

function parseYouTubeId(value) {
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value;
  try {
    const url = new URL(value);
    if (url.hostname.includes("youtu.be")) return url.pathname.slice(1).split("/")[0];
    if (url.searchParams.get("v")) return url.searchParams.get("v");
    const match = url.pathname.match(/\/(?:embed|shorts|live)\/([a-zA-Z0-9_-]{11})/);
    return match?.[1] || "";
  } catch {
    return "";
  }
}

function openYouTubeSearch(query) {
  const clean = query.trim();
  if (!clean) return toast("Type a song to search.");
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${clean} karaoke`)}`;
  window.open(url, "_blank");
}

async function runSongSearch(query, container, urlInput, titleInput) {
  const clean = query.trim();
  if (!clean) return toast("Type a song to search.");
  const apiKey = state.settings.youtubeApiKey?.trim();
  if (!apiKey) {
    openYouTubeSearch(clean);
    return;
  }
  container.innerHTML = "";
  container.append(emptyInline("Searching YouTube..."));
  try {
    const endpoint = new URL("https://www.googleapis.com/youtube/v3/search");
    endpoint.search = new URLSearchParams({
      key: apiKey,
      part: "snippet",
      type: "video",
      maxResults: "6",
      videoEmbeddable: "true",
      q: `${clean} karaoke`
    }).toString();
    const response = await fetch(endpoint);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "YouTube search failed.");
    const results = (data.items || []).filter((item) => item.id?.videoId);
    container.innerHTML = "";
    if (!results.length) {
      container.append(emptyInline("No videos found."));
      return;
    }
    results.forEach((item) => {
      const videoId = item.id.videoId;
      const titleText = decodeHtml(item.snippet?.title || `YouTube video ${videoId}`);
      container.append(el("button", "search-result", [
        thumbnail(videoId),
        el("span", "", titleText)
      ], { type: "button" }));
      container.lastElementChild.addEventListener("click", () => {
        urlInput.value = `https://www.youtube.com/watch?v=${videoId}`;
        titleInput.value = titleText;
        container.innerHTML = "";
      });
    });
  } catch (error) {
    container.innerHTML = "";
    container.append(emptyInline(error.message || "YouTube search did not work."));
  }
}

async function checkYouTubeEmbeddable(videoId) {
  const apiKey = state.settings.youtubeApiKey?.trim();
  if (!apiKey || !videoId) return { ok: true };
  try {
    const endpoint = new URL("https://www.googleapis.com/youtube/v3/videos");
    endpoint.search = new URLSearchParams({
      key: apiKey,
      part: "status",
      id: videoId
    }).toString();
    const response = await fetch(endpoint);
    const data = await response.json();
    if (!response.ok) return { ok: true };
    const video = data.items?.[0];
    if (!video) return { ok: false, message: "YouTube could not find that video." };
    if (video.status?.embeddable === false) {
      return { ok: false, message: "That video cannot play inside NextUp. Pick another result or use Watch on YouTube." };
    }
  } catch {
    return { ok: true };
  }
  return { ok: true };
}

async function fetchYouTubeTitle(url, videoId) {
  try {
    const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url || `https://youtube.com/watch?v=${videoId}`)}&format=json`);
    if (!response.ok) throw new Error("No title");
    const data = await response.json();
    return data.title || `YouTube Karaoke ${videoId}`;
  } catch {
    return `YouTube Karaoke ${videoId}`;
  }
}

function thumbnail(videoId, fallback = "♪") {
  if (state.settings.thumbnails && videoId) {
    return el("img", "thumb", "", {
      src: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
      alt: ""
    });
  }
  return el("div", "thumb", String(fallback));
}

function settingRow(label, value, action) {
  return el("div", "section-head", [
    el("div", "", [el("strong", "", label), el("p", "muted", value)]),
    action
  ]);
}

function themePicker() {
  const themes = [
    ["midnight", "Midnight"],
    ["dark", "Dark"],
    ["light", "Light"],
    ["blinding", "Blinding"],
    ["velvet", "Velvet"],
    ["cherry", "Cherry"],
    ["pink", "Pink"],
    ["purple", "Purple"],
    ["yellow", "Yellow"],
    ["green", "Green"],
    ["sky", "Light Blue"],
    ["deepblue", "Dark Blue"]
  ];
  const choices = themes.filter(([theme]) => theme !== state.theme);
  const picker = el("section", "theme-picker", [
    el("div", "theme-picker-head", [
      el("strong", "", "Theme")
    ]),
    button("", `theme-current theme-${state.theme}`, () => {
      toggleThemePicker(picker);
    }, `Current theme ${themeName(state.theme)}`),
    el("div", "theme-dropdown", choices.map(([theme, label]) => {
      const item = button("", `theme-option theme-${theme}`, () => {
        closeThemePicker(picker, () => {
          state.theme = theme;
          saveState();
          applyTheme();
          render();
        });
      }, label);
      item.style.setProperty("--i", choices.findIndex(([choice]) => choice === theme));
      item.style.setProperty("--r", choices.length - choices.findIndex(([choice]) => choice === theme));
      item.append(el("span", "", label));
      return item;
    }))
  ]);
  picker.querySelector(".theme-current").append(
    el("span", "", themeName(state.theme)),
    el("span", "chevron", "⌄")
  );
  return picker;
}

function toggleThemePicker(picker) {
  if (picker.classList.contains("open")) closeThemePicker(picker);
  else {
    picker.classList.remove("closing");
    picker.classList.add("settling");
    picker.classList.add("open");
    setTimeout(() => picker.classList.remove("settling"), 360);
  }
}

function closeThemePicker(picker, afterClose = null) {
  picker.classList.add("closing");
  picker.classList.remove("open");
  setTimeout(() => {
    picker.classList.remove("closing");
    afterClose?.();
  }, 430);
}

function themeName(theme) {
  const namesByTheme = {
    midnight: "Midnight",
    dark: "Dark",
    light: "Light",
    blinding: "Blinding",
    velvet: "Velvet",
    cherry: "Cherry",
    pink: "Pink",
    purple: "Purple",
    yellow: "Yellow",
    green: "Green",
    sky: "Light Blue",
    deepblue: "Dark Blue"
  };
  return namesByTheme[theme] || "Midnight";
}

function switchToggle(checked, onChange) {
  const control = el("button", `switch ${checked ? "on" : ""}`, [
    el("span", "switch-knob", "")
  ], { type: "button", role: "switch", "aria-checked": String(checked) });
  control.addEventListener("click", onChange);
  return control;
}

function stat(value, label) {
  return el("div", "stat", [el("strong", "", String(value)), el("span", "", label)]);
}

function inputField(label, placeholder) {
  const inputEl = el("input", "input", "", { placeholder });
  const wrapper = el("div", "field", [el("label", "", label), inputEl]);
  return { wrapper, input: inputEl };
}

function emptyState(headline, copy, actionLabel, action) {
  return el("section", "empty-state", [
    el("strong", "", headline),
    el("p", "muted", copy),
    actionLabel ? button(actionLabel, "primary", action) : null
  ]);
}

function emptyInline(copy) {
  return el("p", "muted", copy);
}

function button(text, className, onClick, ariaLabel = "") {
  const btn = el("button", className, text, { type: "button" });
  if (ariaLabel) btn.setAttribute("aria-label", ariaLabel);
  btn.addEventListener("click", onClick);
  return btn;
}

function el(tag, className = "", children = "", attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  Object.entries(attrs).forEach(([key, value]) => {
    if (value !== undefined && value !== null) node.setAttribute(key, value);
  });
  if (Array.isArray(children)) {
    children.filter(Boolean).forEach((child) => node.append(child));
  } else if (children instanceof Node) {
    node.append(children);
  } else if (children) {
    node.textContent = children;
  }
  return node;
}

function confirmAction(message, onConfirm) {
  if (confirm(message)) onConfirm();
}

function toast(message) {
  document.querySelector(".toast")?.remove();
  const note = el("div", "toast", message);
  document.body.append(note);
  setTimeout(() => note.remove(), 2600);
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function decodeHtml(value) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
}

function id() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
