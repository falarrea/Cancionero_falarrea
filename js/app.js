/**
 * GoodChord - Main Application Controller (v3.1 Removed Tendencias)
 * Orchestrates views, accurate transposition, chord diagrams, metronome, setlists, search,
 * Supabase Cloud Sync, Full Song Editor, PWA Native Installation, and Mobile Responsive Bottom Nav.
 */

import { transposeChord, transposeNote, getChordPositions, renderChordSVG } from './chordEngine.js';
import { parseSongText, aiAutoEnhanceSong } from './parser.js';
import { Metronome } from './metronome.js';
import { INITIAL_SONGS } from './songsData.js';
import { SetlistManager } from './setlistManager.js';
import { RHYTHM_CATEGORIES } from './trendsData.js';
import { exportSongToPDF } from './pdfExporter.js';
import { SupabaseService } from './supabaseClient.js';

class App {
  constructor() {
    this.setlistManager = new SetlistManager();
    this.metronome = new Metronome();
    this.supabaseService = new SupabaseService();

    this.allSongs = [...INITIAL_SONGS, ...this.setlistManager.customSongs];

    this.activeSong = null;
    this.currentSemitones = 0;
    this.preferFlat = false;
    this.fontScale = 100;

    // PWA Install Event Handler
    this.deferredPrompt = null;

    // Chord Popover Modal State
    this.activeModalChord = null;
    this.activeModalPositions = null;
    this.activeModalPosIdx = 0;

    // Auto-scroll state
    this.autoScrollInterval = null;
    this.isAutoScrolling = false;

    this.initDOM();
    this.bindEvents();
    this.registerPWA();
    this.initCloudAndStatus();
    this.renderVault();
    this.renderRhythmCategories();
  }

  generateNextSongId() {
    let maxNum = 0;
    this.allSongs.forEach(s => {
      if (s.id && s.id.startsWith('song-')) {
        const numPart = parseInt(s.id.replace('song-', ''), 10);
        if (!isNaN(numPart) && numPart > maxNum) {
          maxNum = numPart;
        }
      }
    });
    const nextNum = maxNum + 1;
    return `song-${String(nextNum).padStart(2, '0')}`;
  }

  registerPWA() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js')
        .then(() => console.log("📱 Service Worker PWA Registrado"))
        .catch(err => console.warn("PWA SW error:", err));
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      if (this.pwaInstallBtn) {
        this.pwaInstallBtn.style.display = 'inline-flex';
      }
    });
  }

  async initCloudAndStatus() {
    await this.updateConnectionStatus();

    if (this.supabaseService.isConfigured()) {
      await this.supabaseService.seedPreloadedSongs(INITIAL_SONGS);
      const cloudSongs = await this.supabaseService.fetchSongs();
      if (cloudSongs && cloudSongs.length > 0) {
        const map = new Map();
        [...cloudSongs, ...this.allSongs].forEach(s => {
          if (!map.has(s.id)) map.set(s.id, s);
        });
        this.allSongs = Array.from(map.values());
        this.renderVault();
      }
    }
  }

  async updateConnectionStatus() {
    const status = await this.supabaseService.checkConnection();
    if (status.connected) {
      this.dbStatusPill.className = 'status-pill connected';
      this.dbStatusText.textContent = status.message;
    } else {
      this.dbStatusPill.className = 'status-pill disconnected';
      this.dbStatusText.textContent = status.message;
    }
  }

  initDOM() {
    // Navigation (Desktop & Mobile)
    this.navBtns = document.querySelectorAll('.nav-btn[data-view], .mobile-nav-btn[data-view]');
    this.views = document.querySelectorAll('.view-section');
    this.themeToggleBtn = document.getElementById('theme-toggle-btn');
    this.themeIcon = document.getElementById('theme-icon');

    // PWA Install Button & Modals
    this.pwaInstallBtn = document.getElementById('pwa-install-btn');
    this.pwaIosModal = document.getElementById('pwa-ios-modal');
    this.pwaIosModalClose = document.getElementById('pwa-ios-modal-close');
    this.pwaIosOkBtn = document.getElementById('pwa-ios-ok-btn');

    // Status Pill
    this.dbStatusPill = document.getElementById('db-status-pill');
    this.dbStatusText = document.getElementById('db-status-text');

    // Song View DOM
    this.lyricSheet = document.getElementById('lyric-sheet-body');
    this.viewSongTitle = document.getElementById('view-song-title');
    this.viewSongArtist = document.getElementById('view-song-artist');
    this.viewSongKey = document.getElementById('view-song-key');
    this.viewSongRhythm = document.getElementById('view-song-rhythm');
    this.viewSongCapo = document.getElementById('view-song-capo');
    this.viewSongGenre = document.getElementById('view-song-genre');
    this.activeKeyDisplay = document.getElementById('active-key-display');

    // Transpose Buttons
    this.transposeUpBtn = document.getElementById('transpose-up-btn');
    this.transposeDownBtn = document.getElementById('transpose-down-btn');
    this.transposeResetBtn = document.getElementById('transpose-reset-btn');
    this.accidentalToggleBtn = document.getElementById('accidental-toggle-btn');

    // Font Size Controls
    this.fontSizeDecBtn = document.getElementById('font-size-dec-btn');
    this.fontSizeIncBtn = document.getElementById('font-size-inc-btn');
    this.fontSizeValueDisplay = document.getElementById('font-size-value-display');

    // Metronome DOM
    this.metronomeStartBtn = document.getElementById('metronome-start-btn');
    this.bpmRangeInput = document.getElementById('bpm-range-input');
    this.bpmDisplayText = document.getElementById('bpm-display-text');
    this.tapTempoBtn = document.getElementById('tap-tempo-btn');
    this.beatDotsContainer = document.getElementById('beat-indicators-container');

    // Auto Scroll DOM
    this.autoscrollToggleBtn = document.getElementById('autoscroll-toggle-btn');
    this.autoscrollSpeedInput = document.getElementById('autoscroll-speed-input');

    // Chord Modal DOM
    this.chordModalOverlay = document.getElementById('chord-modal-overlay');
    this.chordModalTitle = document.getElementById('chord-modal-title');
    this.chordModalClose = document.getElementById('chord-modal-close');
    this.fretboardHolder = document.getElementById('fretboard-svg-holder');
    this.chordPosIndicator = document.getElementById('chord-pos-indicator');
    this.chordPosPrevBtn = document.getElementById('chord-pos-prev-btn');
    this.chordPosNextBtn = document.getElementById('chord-pos-next-btn');

    // Import / Create Modal DOM
    this.importModalOverlay = document.getElementById('import-modal-overlay');
    this.openImportModalBtn = document.getElementById('open-import-modal-btn');
    this.importModalClose = document.getElementById('import-modal-close');
    this.importCancelBtn = document.getElementById('import-cancel-btn');
    this.importSaveBtn = document.getElementById('import-save-btn');
    this.importAutoDetectBtn = document.getElementById('import-auto-detect-btn');
    this.importTitleInput = document.getElementById('import-title-input');
    this.importArtistInput = document.getElementById('import-artist-input');
    this.importKeyInput = document.getElementById('import-key-input');
    this.importRhythmInput = document.getElementById('import-rhythm-input');
    this.importGenreInput = document.getElementById('import-genre-input');
    this.importBpmInput = document.getElementById('import-bpm-input');
    this.importRawTextArea = document.getElementById('import-raw-text-area');

    // Edit Modal DOM
    this.editModalOverlay = document.getElementById('edit-modal-overlay');
    this.songEditBtn = document.getElementById('song-edit-btn');
    this.songDeleteBtn = document.getElementById('song-delete-btn');
    this.editDeleteBtn = document.getElementById('edit-delete-btn');
    this.editModalClose = document.getElementById('edit-modal-close');
    this.editCancelBtn = document.getElementById('edit-cancel-btn');
    this.editSaveBtn = document.getElementById('edit-save-btn');
    this.editTitleInput = document.getElementById('edit-title-input');
    this.editArtistInput = document.getElementById('edit-artist-input');
    this.editKeyInput = document.getElementById('edit-key-input');
    this.editRhythmInput = document.getElementById('edit-rhythm-input');
    this.editGenreInput = document.getElementById('edit-genre-input');
    this.editBpmInput = document.getElementById('edit-bpm-input');
    this.editRawTextArea = document.getElementById('edit-raw-text-area');

    // Supabase Modal DOM
    this.supabaseModalOverlay = document.getElementById('supabase-modal-overlay');
    this.openSupabaseModalBtn = document.getElementById('open-supabase-modal-btn');
    this.supabaseModalClose = document.getElementById('supabase-modal-close');
    this.supabaseCancelBtn = document.getElementById('supabase-cancel-btn');
    this.supabaseSaveBtn = document.getElementById('supabase-save-btn');
    this.supabaseUrlInput = document.getElementById('supabase-url-input');
    this.supabaseKeyInput = document.getElementById('supabase-key-input');
    this.supabaseStatusMsg = document.getElementById('supabase-status-msg');

    // Search DOM
    this.searchQueryInput = document.getElementById('search-query-input');
    this.filterGenreSelect = document.getElementById('filter-genre-select');
    this.filterRhythmSelect = document.getElementById('filter-rhythm-select');
    this.filterKeySelect = document.getElementById('filter-key-select');
    this.searchResultsGrid = document.getElementById('search-results-grid');

    // PDF Export & Back
    this.songPdfExportBtn = document.getElementById('song-pdf-export-btn');
    this.songBackBtn = document.getElementById('song-back-btn');
    this.songFavToggleBtn = document.getElementById('song-fav-toggle-btn');
  }

  bindEvents() {
    this.navBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const viewId = btn.dataset.view;
        this.switchView(viewId);
      });
    });

    document.getElementById('brand-home-btn').addEventListener('click', () => {
      this.switchView('view-vault');
    });

    this.pwaInstallBtn.addEventListener('click', () => {
      if (this.deferredPrompt) {
        this.deferredPrompt.prompt();
        this.deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('Usuario aceptó instalar PWA');
          }
          this.deferredPrompt = null;
        });
      } else {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        if (isIOS) {
          this.pwaIosModal.classList.add('open');
        } else {
          alert("📱 Para instalar GoodChord en tu celular:\n\n1. Abrí el menú de tu navegador (3 puntos arriba a la derecha).\n2. Seleccioná 'Instalar aplicación' o 'Agregar a la pantalla principal'.");
        }
      }
    });

    if (this.pwaIosModalClose) {
      this.pwaIosModalClose.addEventListener('click', () => this.pwaIosModal.classList.remove('open'));
    }
    if (this.pwaIosOkBtn) {
      this.pwaIosOkBtn.addEventListener('click', () => this.pwaIosModal.classList.remove('open'));
    }

    this.themeToggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      this.themeIcon.textContent = next === 'dark' ? '🌙' : '☀️';
    });

    this.transposeUpBtn.addEventListener('click', () => this.changeTransposition(1));
    this.transposeDownBtn.addEventListener('click', () => this.changeTransposition(-1));
    this.transposeResetBtn.addEventListener('click', () => this.resetTransposition());
    this.accidentalToggleBtn.addEventListener('click', () => {
      this.preferFlat = !this.preferFlat;
      this.renderActiveSongSheet();
    });

    this.fontSizeDecBtn.addEventListener('click', () => this.changeFontSize(-10));
    this.fontSizeIncBtn.addEventListener('click', () => this.changeFontSize(10));

    this.metronomeStartBtn.addEventListener('click', () => {
      const isPlaying = this.metronome.toggle();
      this.metronomeStartBtn.textContent = isPlaying ? '⏸' : '▶';
    });

    this.bpmRangeInput.addEventListener('input', (e) => {
      const bpm = parseInt(e.target.value, 10);
      this.metronome.setBpm(bpm);
      this.bpmDisplayText.textContent = `${bpm} BPM`;
    });

    this.tapTempoBtn.addEventListener('click', () => {
      const newBpm = this.metronome.tapTempo();
      this.bpmRangeInput.value = newBpm;
      this.bpmDisplayText.textContent = `${newBpm} BPM`;
    });

    this.metronome.onBeatCallback = (beatIdx, totalBeats) => {
      this.updateBeatIndicators(beatIdx, totalBeats);
    };

    this.autoscrollToggleBtn.addEventListener('click', () => this.toggleAutoScroll());

    this.chordModalClose.addEventListener('click', () => this.closeChordModal());
    this.chordModalOverlay.addEventListener('click', (e) => {
      if (e.target === this.chordModalOverlay) this.closeChordModal();
    });

    this.chordPosPrevBtn.addEventListener('click', () => {
      if (this.activeModalPositions && this.activeModalPosIdx > 0) {
        this.activeModalPosIdx--;
        this.renderChordModalContent();
      }
    });

    this.chordPosNextBtn.addEventListener('click', () => {
      if (this.activeModalPositions && this.activeModalPosIdx < this.activeModalPositions.length - 1) {
        this.activeModalPosIdx++;
        this.renderChordModalContent();
      }
    });

    this.openImportModalBtn.addEventListener('click', () => this.openImportModal());
    this.importModalClose.addEventListener('click', () => this.closeImportModal());
    this.importCancelBtn.addEventListener('click', () => this.closeImportModal());
    this.importSaveBtn.addEventListener('click', () => this.handleImportSong());

    this.importAutoDetectBtn.addEventListener('click', () => {
      const text = this.importRawTextArea.value.trim();
      if (text) {
        const enhanced = aiAutoEnhanceSong(text);
        this.importTitleInput.value = enhanced.title;
        this.importArtistInput.value = enhanced.artist;
        this.importKeyInput.value = enhanced.key;
        this.importRhythmInput.value = enhanced.rhythm;
        this.importGenreInput.value = enhanced.genre;
      }
    });

    this.songEditBtn.addEventListener('click', () => this.openEditModal());
    this.editModalClose.addEventListener('click', () => this.closeEditModal());
    this.editCancelBtn.addEventListener('click', () => this.closeEditModal());
    this.editSaveBtn.addEventListener('click', () => this.handleSaveEditedSong());

    this.songDeleteBtn.addEventListener('click', () => {
      if (this.activeSong) this.handleDeleteSong(this.activeSong.id);
    });

    this.editDeleteBtn.addEventListener('click', () => {
      if (this.activeSong) {
        this.closeEditModal();
        this.handleDeleteSong(this.activeSong.id);
      }
    });

    this.openSupabaseModalBtn.addEventListener('click', () => {
      this.supabaseUrlInput.value = this.supabaseService.url;
      this.supabaseKeyInput.value = this.supabaseService.key;
      this.supabaseModalOverlay.classList.add('open');
    });

    this.supabaseModalClose.addEventListener('click', () => this.supabaseModalOverlay.classList.remove('open'));
    this.supabaseCancelBtn.addEventListener('click', () => this.supabaseModalOverlay.classList.remove('open'));

    this.supabaseSaveBtn.addEventListener('click', async () => {
      const url = this.supabaseUrlInput.value.trim();
      const key = this.supabaseKeyInput.value.trim();

      if (url && key) {
        const success = this.supabaseService.initClient(url, key);
        if (success) {
          this.supabaseStatusMsg.style.color = '#10b981';
          this.supabaseStatusMsg.textContent = '✅ Conectado a Supabase correctamente.';
          await this.initCloudAndStatus();
          setTimeout(() => this.supabaseModalOverlay.classList.remove('open'), 1200);
        } else {
          this.supabaseStatusMsg.style.color = '#ef4444';
          this.supabaseStatusMsg.textContent = '❌ Error al conectar. Verifica la URL y la Key.';
        }
      }
    });

    this.searchQueryInput.addEventListener('input', () => this.handleSearch());
    this.filterGenreSelect.addEventListener('change', () => this.handleSearch());
    this.filterRhythmSelect.addEventListener('change', () => this.handleSearch());
    this.filterKeySelect.addEventListener('change', () => this.handleSearch());

    document.getElementById('tab-sub-favorites').addEventListener('click', (e) => this.switchSubList('favorites', e.target));
    document.getElementById('tab-sub-recents').addEventListener('click', (e) => this.switchSubList('recents', e.target));
    document.getElementById('tab-sub-setlists').addEventListener('click', (e) => this.switchSubList('setlists', e.target));
    document.getElementById('create-setlist-btn').addEventListener('click', () => this.handleCreateSetlist());

    this.songPdfExportBtn.addEventListener('click', () => {
      if (this.activeSong) {
        exportSongToPDF(this.activeSong, this.currentSemitones);
      }
    });

    this.songBackBtn.addEventListener('click', () => this.switchView('view-vault'));
    
    this.songFavToggleBtn.addEventListener('click', async () => {
      if (this.activeSong) {
        const isFav = this.setlistManager.toggleFavorite(this.activeSong.id);
        this.activeSong.favorite = isFav;
        this.songFavToggleBtn.textContent = isFav ? '★ Favorito' : '☆ Favorito';

        await this.supabaseService.updateFavoriteStatus(this.activeSong.id, isFav);
        this.renderVault();
      }
    });
  }

  async handleDeleteSong(songId) {
    const song = this.allSongs.find(s => s.id === songId);
    if (!song) return;

    const confirmDelete = confirm(`¿Estás seguro de que deseas eliminar "${song.title}" de tu baúl y de Supabase?`);
    if (!confirmDelete) return;

    this.allSongs = this.allSongs.filter(s => s.id !== songId);
    this.setlistManager.deleteCustomSong(songId);
    await this.supabaseService.deleteSong(songId);

    this.renderVault();
    this.switchView('view-vault');
  }

  changeFontSize(delta) {
    this.fontScale = Math.min(Math.max(this.fontScale + delta, 70), 220);
    this.fontSizeValueDisplay.textContent = `${this.fontScale}%`;
    const remValue = (1.0 * (this.fontScale / 100)).toFixed(2);
    
    document.documentElement.style.setProperty('--lyric-font-size', `${remValue}rem`);
    if (this.lyricSheet) {
      this.lyricSheet.style.fontSize = `${remValue}rem`;
    }
  }

  switchView(viewId) {
    this.views.forEach(view => {
      view.classList.toggle('active', view.id === viewId);
    });

    this.navBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewId);
    });

    if (viewId === 'view-lists') {
      this.renderFavoritesSublist();
    }
  }

  renderVault() {
    const grid = document.getElementById('vault-song-grid');
    grid.innerHTML = '';

    this.allSongs.forEach(song => {
      const card = this.createSongCardElement(song);
      grid.appendChild(card);
    });
  }

  createSongCardElement(song) {
    const card = document.createElement('div');
    card.className = 'song-card';
    const isFav = this.setlistManager.isFavorite(song.id) || !!song.favorite;

    card.innerHTML = `
      <div>
        <div class="song-card-title">${song.title}</div>
        <div class="song-card-artist">${song.artist}</div>
        <div class="song-card-tags">
          <span class="badge badge-key">Tono: ${song.key}</span>
          <span class="badge">${song.rhythm}</span>
          <span class="badge">${song.genre}</span>
        </div>
      </div>
      <div class="song-card-footer">
        <span style="font-size: 0.8rem; color: var(--text-muted);">${song.bpm || 120} BPM</span>
        <button class="fav-btn ${isFav ? 'active' : ''}">★</button>
      </div>
    `;

    card.addEventListener('click', async (e) => {
      if (e.target.classList.contains('fav-btn')) {
        e.stopPropagation();
        const updatedFav = this.setlistManager.toggleFavorite(song.id);
        song.favorite = updatedFav;
        e.target.classList.toggle('active', updatedFav);

        await this.supabaseService.updateFavoriteStatus(song.id, updatedFav);
      } else {
        this.openSong(song);
      }
    });

    return card;
  }

  openSong(song) {
    this.activeSong = song;
    this.currentSemitones = 0;
    this.setlistManager.addRecent(song.id);

    this.viewSongTitle.textContent = song.title;
    this.viewSongArtist.textContent = song.artist;
    this.viewSongRhythm.textContent = `Ritmo: ${song.rhythm}`;
    this.viewSongCapo.textContent = song.capo || "Sin capo";
    this.viewSongGenre.textContent = song.genre || "General";

    const isFav = this.setlistManager.isFavorite(song.id) || !!song.favorite;
    this.songFavToggleBtn.textContent = isFav ? '★ Favorito' : '☆ Favorito';

    const songBpm = song.bpm || 120;
    this.bpmRangeInput.value = songBpm;
    this.metronome.setBpm(songBpm);
    this.bpmDisplayText.textContent = `${songBpm} BPM`;

    this.renderActiveSongSheet();
    this.switchView('view-song-detail');
  }

  changeTransposition(delta) {
    this.currentSemitones += delta;
    this.renderActiveSongSheet();
  }

  resetTransposition() {
    this.currentSemitones = 0;
    this.renderActiveSongSheet();
  }

  renderActiveSongSheet() {
    if (!this.activeSong) return;

    const parsed = parseSongText(this.activeSong.rawText);

    let baseRootKey = this.activeSong.key;
    if (!baseRootKey || baseRootKey === 'General') {
      baseRootKey = parsed.key || 'C';
    }

    const transposedRootKey = transposeChord(baseRootKey, this.currentSemitones, this.preferFlat);
    this.activeKeyDisplay.textContent = transposedRootKey;
    this.viewSongKey.textContent = `Tono: ${transposedRootKey}`;

    this.lyricSheet.innerHTML = '';

    parsed.content.forEach(item => {
      if (item.type === 'header') {
        const headerEl = document.createElement('div');
        headerEl.className = 'section-header';
        headerEl.textContent = `[${item.text}]`;
        this.lyricSheet.appendChild(headerEl);
      } else if (item.type === 'aligned') {
        const lineEl = document.createElement('div');
        lineEl.className = 'aligned-line';

        item.pairs.forEach(pair => {
          const pairEl = document.createElement('div');
          pairEl.className = 'aligned-pair';

          if (pair.chord) {
            const transposedChordStr = transposeChord(pair.chord, this.currentSemitones, this.preferFlat);
            const chordBadge = document.createElement('span');
            chordBadge.className = 'chord-badge';
            chordBadge.textContent = transposedChordStr;

            chordBadge.addEventListener('click', (e) => {
              e.stopPropagation();
              this.openChordModal(transposedChordStr);
            });

            pairEl.appendChild(chordBadge);
          }

          const lyricSpan = document.createElement('span');
          lyricSpan.className = 'lyric-text';
          lyricSpan.textContent = pair.lyric || " ";
          pairEl.appendChild(lyricSpan);

          lineEl.appendChild(pairEl);
        });

        this.lyricSheet.appendChild(lineEl);
      } else if (item.type === 'chords-only') {
        const lineEl = document.createElement('div');
        lineEl.className = 'aligned-line';
        
        const chords = item.line.trim().split(/\s+/);
        chords.forEach(c => {
          const transposed = transposeChord(c, this.currentSemitones, this.preferFlat);
          const chordBadge = document.createElement('span');
          chordBadge.className = 'chord-badge';
          chordBadge.style.marginRight = '0.4rem';
          chordBadge.textContent = transposed;

          chordBadge.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openChordModal(transposed);
          });

          lineEl.appendChild(chordBadge);
        });

        this.lyricSheet.appendChild(lineEl);
      } else if (item.type === 'lyric-only') {
        const lineEl = document.createElement('div');
        lineEl.className = 'lyric-text';
        lineEl.style.marginBottom = '0.35rem';
        lineEl.textContent = item.line;
        this.lyricSheet.appendChild(lineEl);
      }
    });
  }

  openChordModal(chordStr) {
    this.activeModalChord = chordStr;
    this.activeModalPositions = getChordPositions(chordStr);
    this.activeModalPosIdx = 0;

    this.chordModalTitle.textContent = `Diagrama de Acorde: ${chordStr}`;
    this.renderChordModalContent();

    this.chordModalOverlay.classList.add('open');
  }

  renderChordModalContent() {
    if (!this.activeModalPositions || this.activeModalPositions.length === 0) {
      this.fretboardHolder.innerHTML = '<div style="padding: 2rem; color: var(--text-muted);">Sin diagrama disponible</div>';
      return;
    }

    const posCount = this.activeModalPositions.length;
    this.chordPosIndicator.textContent = `Posición ${this.activeModalPosIdx + 1} de ${posCount}`;

    this.chordPosPrevBtn.disabled = (this.activeModalPosIdx === 0);
    this.chordPosNextBtn.disabled = (this.activeModalPosIdx === posCount - 1);

    const svgHTML = renderChordSVG(this.activeModalPositions, this.activeModalPosIdx);
    const posTitle = this.activeModalPositions[this.activeModalPosIdx].title || "";
    
    this.fretboardHolder.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center;">
        <div style="font-weight: 700; font-size: 0.88rem; color: var(--accent-color); margin-bottom: 0.5rem;">${posTitle}</div>
        ${svgHTML}
      </div>
    `;
  }

  closeChordModal() {
    this.chordModalOverlay.classList.remove('open');
  }

  updateBeatIndicators(beatIdx, totalBeats) {
    this.beatDotsContainer.innerHTML = '';
    for (let i = 0; i < totalBeats; i++) {
      const dot = document.createElement('div');
      dot.className = `beat-dot ${i === beatIdx ? 'active' : ''}`;
      this.beatDotsContainer.appendChild(dot);
    }
  }

  toggleAutoScroll() {
    if (this.isAutoScrolling) {
      clearInterval(this.autoScrollInterval);
      this.isAutoScrolling = false;
      this.autoscrollToggleBtn.textContent = '▶ Iniciar';
    } else {
      this.isAutoScrolling = true;
      this.autoscrollToggleBtn.textContent = '⏸ Pausar';
      const speed = parseInt(this.autoscrollSpeedInput.value, 10);
      const intervalMs = Math.max(10, 60 - speed * 5);

      this.autoScrollInterval = setInterval(() => {
        window.scrollBy(0, 1);
      }, intervalMs);
    }
  }

  openImportModal() {
    this.importModalOverlay.classList.add('open');
  }

  closeImportModal() {
    this.importModalOverlay.classList.remove('open');
    this.importTitleInput.value = '';
    this.importArtistInput.value = '';
    this.importKeyInput.value = '';
    this.importRhythmInput.value = '';
    this.importGenreInput.value = '';
    this.importRawTextArea.value = '';
  }

  async handleImportSong() {
    const rawText = this.importRawTextArea.value.trim();
    if (!rawText) return;

    let title = this.importTitleInput.value.trim();
    let artist = this.importArtistInput.value.trim();
    let key = this.importKeyInput.value.trim();
    let rhythm = this.importRhythmInput.value.trim();
    let genre = this.importGenreInput.value.trim();
    let bpm = parseInt(this.importBpmInput.value, 10) || 120;

    if (!title || !artist || !key) {
      const enhanced = aiAutoEnhanceSong(rawText);
      if (!title) title = enhanced.title;
      if (!artist) artist = enhanced.artist;
      if (!key) key = enhanced.key;
      if (!rhythm) rhythm = enhanced.rhythm;
      if (!genre) genre = enhanced.genre;
    }

    const nextId = this.generateNextSongId();

    const newSong = {
      id: nextId,
      title,
      artist,
      genre: genre || "Pop",
      rhythm: rhythm || "4/4",
      key: key || "C",
      capo: "Sin capo",
      bpm,
      rawText
    };

    this.setlistManager.saveCustomSong(newSong);
    await this.supabaseService.saveSong(newSong);

    this.allSongs.unshift(newSong);
    this.renderVault();
    this.closeImportModal();
    this.openSong(newSong);
  }

  openEditModal() {
    if (!this.activeSong) return;

    this.editTitleInput.value = this.activeSong.title;
    this.editArtistInput.value = this.activeSong.artist;
    this.editKeyInput.value = this.activeSong.key;
    this.editRhythmInput.value = this.activeSong.rhythm;
    this.editGenreInput.value = this.activeSong.genre;
    this.editBpmInput.value = this.activeSong.bpm || 120;
    this.editRawTextArea.value = this.activeSong.rawText;

    this.editModalOverlay.classList.add('open');
  }

  closeEditModal() {
    this.editModalOverlay.classList.remove('open');
  }

  async handleSaveEditedSong() {
    if (!this.activeSong) return;

    this.activeSong.title = this.editTitleInput.value.trim() || this.activeSong.title;
    this.activeSong.artist = this.editArtistInput.value.trim() || this.activeSong.artist;
    this.activeSong.key = this.editKeyInput.value.trim() || this.activeSong.key;
    this.activeSong.rhythm = this.editRhythmInput.value.trim() || this.activeSong.rhythm;
    this.activeSong.genre = this.editGenreInput.value.trim() || this.activeSong.genre;
    this.activeSong.bpm = parseInt(this.editBpmInput.value, 10) || 120;
    this.activeSong.rawText = this.editRawTextArea.value.trim();

    this.setlistManager.saveCustomSong(this.activeSong);
    await this.supabaseService.saveSong(this.activeSong);

    this.closeEditModal();
    this.openSong(this.activeSong);
    this.renderVault();
  }

  handleSearch() {
    const query = this.searchQueryInput.value.toLowerCase().trim();
    const genreFilter = this.filterGenreSelect.value;
    const rhythmFilter = this.filterRhythmSelect.value;
    const keyFilter = this.filterKeySelect.value;

    const filtered = this.allSongs.filter(song => {
      const matchQuery = !query || song.title.toLowerCase().includes(query) || song.artist.toLowerCase().includes(query) || song.rawText.toLowerCase().includes(query);
      const matchGenre = !genreFilter || song.genre.includes(genreFilter);
      const matchRhythm = !rhythmFilter || song.rhythm.includes(rhythmFilter);
      const matchKey = !keyFilter || song.key === keyFilter;

      return matchQuery && matchGenre && matchRhythm && matchKey;
    });

    this.searchResultsGrid.innerHTML = '';
    if (filtered.length === 0) {
      this.searchResultsGrid.innerHTML = '<div style="grid-column: 1/-1; padding: 3rem; text-align: center; color: var(--text-muted);">No se encontraron canciones con los filtros seleccionados.</div>';
    } else {
      filtered.forEach(song => {
        const card = this.createSongCardElement(song);
        this.searchResultsGrid.appendChild(card);
      });
    }
  }

  switchSubList(subTabKey, targetBtn) {
    document.querySelectorAll('#view-lists .nav-tabs .nav-btn').forEach(btn => btn.classList.remove('active'));
    targetBtn.classList.add('active');

    if (subTabKey === 'favorites') {
      this.renderFavoritesSublist();
    } else if (subTabKey === 'recents') {
      this.renderRecentsSublist();
    } else if (subTabKey === 'setlists') {
      this.renderSetlistsSublist();
    }
  }

  renderFavoritesSublist() {
    const container = document.getElementById('sub-list-content');
    const favSongs = this.allSongs.filter(s => this.setlistManager.isFavorite(s.id) || !!s.favorite);
    
    container.innerHTML = '<div class="song-grid"></div>';
    const grid = container.querySelector('.song-grid');

    if (favSongs.length === 0) {
      container.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-muted);">Aún no tienes canciones favoritas. ¡Toca la estrella en cualquier canción para agregarla!</div>';
    } else {
      favSongs.forEach(song => grid.appendChild(this.createSongCardElement(song)));
    }
  }

  renderRecentsSublist() {
    const container = document.getElementById('sub-list-content');
    const recentSongs = this.setlistManager.recents
      .map(id => this.allSongs.find(s => s.id === id))
      .filter(Boolean);

    container.innerHTML = '<div class="song-grid"></div>';
    const grid = container.querySelector('.song-grid');

    if (recentSongs.length === 0) {
      container.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-muted);">No hay canciones tocadas recientemente.</div>';
    } else {
      recentSongs.forEach(song => grid.appendChild(this.createSongCardElement(song)));
    }
  }

  renderSetlistsSublist() {
    const container = document.getElementById('sub-list-content');
    container.innerHTML = '';

    this.setlistManager.setlists.forEach(setlist => {
      const card = document.createElement('div');
      card.className = 'song-card';
      card.style.marginBottom = '1rem';

      const songsInSetlist = setlist.songIds
        .map(id => this.allSongs.find(s => s.id === id))
        .filter(Boolean);

      let listHTML = songsInSetlist.map(s => `<li style="margin-left: 1.2rem; color: var(--text-secondary);">${s.title} - ${s.artist}</li>`).join('');

      card.innerHTML = `
        <div>
          <h3 style="margin-bottom: 0.25rem;">${setlist.title}</h3>
          <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 0.75rem;">${setlist.description || 'Sin descripción'}</p>
          <ul style="font-size: 0.9rem;">${listHTML || '<li style="color: var(--text-muted);">Lista vacía</li>'}</ul>
        </div>
        <div class="song-card-footer" style="margin-top: 1rem;">
          <span class="badge">${setlist.songIds.length} canciones</span>
          <button class="btn btn-secondary btn-icon delete-setlist-btn" title="Eliminar Setlist">🗑</button>
        </div>
      `;

      card.querySelector('.delete-setlist-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.setlistManager.deleteSetlist(setlist.id);
        this.renderSetlistsSublist();
      });

      container.appendChild(card);
    });
  }

  async handleCreateSetlist() {
    const title = prompt("Nombre para el nuevo setlist (ej. Recital Sábado):");
    if (title) {
      const newSetlist = this.setlistManager.createSetlist(title);
      await this.supabaseService.saveSetlist(newSetlist);
      this.renderSetlistsSublist();
    }
  }

  renderRhythmCategories() {
    const container = document.getElementById('rhythm-categories-container');
    container.innerHTML = '';

    RHYTHM_CATEGORIES.forEach(cat => {
      const card = document.createElement('div');
      card.className = 'song-card';
      card.style.marginBottom = '1.25rem';

      card.innerHTML = `
        <div>
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
            <span style="font-size: 1.8rem;">${cat.icon}</span>
            <h3 style="font-size: 1.2rem; color: var(--accent-color);">${cat.name}</h3>
          </div>
          <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.75rem;">${cat.description}</p>
          <div style="font-weight: 700; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.4rem;">Canciones sugeridas con este ritmo:</div>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            ${cat.suggestedSongs.map(s => `<span class="badge">${s}</span>`).join('')}
          </div>
        </div>
      `;

      container.appendChild(card);
    });
  }
}

// Initialize Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.goodChordApp = new App();
});
