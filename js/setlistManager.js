/**
 * GoodChord - Setlist & Favorites Manager
 * Manages user-created setlists, recent plays, favorites, and persistent local storage.
 */

const STORAGE_KEY_SETLISTS = "goodchord_setlists_v1";
const STORAGE_KEY_FAVORITES = "goodchord_favorites_v1";
const STORAGE_KEY_RECENTS = "goodchord_recents_v1";
const STORAGE_KEY_CUSTOM_SONGS = "goodchord_custom_songs_v1";

export class SetlistManager {
  constructor() {
    this.setlists = this.load(STORAGE_KEY_SETLISTS, [
      {
        id: "setlist-demo-1",
        title: "⚡ Recital Acústico Vivo",
        description: "Lista armada para presentación íntima",
        songIds: ["song-1", "song-3", "song-5", "song-6"]
      },
      {
        id: "setlist-demo-2",
        title: "🎸 Clásicos del Rock en Español",
        description: "Para cantar en grupo con amigos",
        songIds: ["song-2", "song-1", "song-5"]
      }
    ]);

    this.favorites = this.load(STORAGE_KEY_FAVORITES, ["song-1", "song-2", "song-3", "song-5", "song-6"]);
    this.recents = this.load(STORAGE_KEY_RECENTS, ["song-1", "song-2", "song-4", "song-6"]);
    this.customSongs = this.load(STORAGE_KEY_CUSTOM_SONGS, []);
  }

  load(key, defaultValue) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.warn("Storage read error:", e);
      return defaultValue;
    }
  }

  save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("Storage write error:", e);
    }
  }

  // Favorites logic
  toggleFavorite(songId) {
    const idx = this.favorites.indexOf(songId);
    if (idx !== -1) {
      this.favorites.splice(idx, 1);
    } else {
      this.favorites.unshift(songId);
    }
    this.save(STORAGE_KEY_FAVORITES, this.favorites);
    return this.isFavorite(songId);
  }

  isFavorite(songId) {
    return this.favorites.includes(songId);
  }

  // Recents logic
  addRecent(songId) {
    this.recents = this.recents.filter(id => id !== songId);
    this.recents.unshift(songId);
    if (this.recents.length > 20) this.recents.pop();
    this.save(STORAGE_KEY_RECENTS, this.recents);
  }

  // Custom Songs logic
  saveCustomSong(song) {
    const idx = this.customSongs.findIndex(s => s.id === song.id);
    if (idx !== -1) {
      this.customSongs[idx] = song;
    } else {
      this.customSongs.unshift(song);
    }
    this.save(STORAGE_KEY_CUSTOM_SONGS, this.customSongs);
  }

  deleteCustomSong(songId) {
    this.customSongs = this.customSongs.filter(s => s.id !== songId);
    this.save(STORAGE_KEY_CUSTOM_SONGS, this.customSongs);
  }

  // Setlists logic
  createSetlist(title, description = "") {
    const newSetlist = {
      id: "setlist-" + Date.now(),
      title,
      description,
      songIds: []
    };
    this.setlists.unshift(newSetlist);
    this.save(STORAGE_KEY_SETLISTS, this.setlists);
    return newSetlist;
  }

  addSongToSetlist(setlistId, songId) {
    const setlist = this.setlists.find(s => s.id === setlistId);
    if (setlist && !setlist.songIds.includes(songId)) {
      setlist.songIds.push(songId);
      this.save(STORAGE_KEY_SETLISTS, this.setlists);
    }
  }

  removeSongFromSetlist(setlistId, songId) {
    const setlist = this.setlists.find(s => s.id === setlistId);
    if (setlist) {
      setlist.songIds = setlist.songIds.filter(id => id !== songId);
      this.save(STORAGE_KEY_SETLISTS, this.setlists);
    }
  }

  reorderSetlist(setlistId, fromIdx, toIdx) {
    const setlist = this.setlists.find(s => s.id === setlistId);
    if (setlist) {
      const [moved] = setlist.songIds.splice(fromIdx, 1);
      setlist.songIds.splice(toIdx, 0, moved);
      this.save(STORAGE_KEY_SETLISTS, this.setlists);
    }
  }

  deleteSetlist(setlistId) {
    this.setlists = this.setlists.filter(s => s.id !== setlistId);
    this.save(STORAGE_KEY_SETLISTS, this.setlists);
  }
}
