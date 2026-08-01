/**
 * GoodChord - Supabase Integration Module
 * Handles cloud database synchronization for songs, setlists, and user favorites.
 * Gracefully falls back to LocalStorage if credentials are not provided.
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.8/+esm';

const STORAGE_SUPABASE_URL = "goodchord_supabase_url";
const STORAGE_SUPABASE_KEY = "goodchord_supabase_key";

export class SupabaseService {
  constructor() {
    this.url = localStorage.getItem(STORAGE_SUPABASE_URL) || "";
    this.key = localStorage.getItem(STORAGE_SUPABASE_KEY) || "";
    this.client = null;

    if (this.url && this.key) {
      this.initClient(this.url, this.key);
    }
  }

  initClient(url, key) {
    try {
      this.url = url;
      this.key = key;
      localStorage.setItem(STORAGE_SUPABASE_URL, url);
      localStorage.setItem(STORAGE_SUPABASE_KEY, key);
      this.client = createClient(url, key);
      console.log("⚡ Conectado exitosamente a Supabase Cloud DB");
      return true;
    } catch (e) {
      console.error("Error al inicializar Supabase:", e);
      return false;
    }
  }

  isConfigured() {
    return !!this.client;
  }

  // Sync Songs with Supabase
  async fetchSongs() {
    if (!this.client) return null;
    try {
      const { data, error } = await this.client
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(item => ({
        id: item.id,
        title: item.title,
        artist: item.artist,
        genre: item.genre,
        rhythm: item.rhythm,
        key: item.key,
        bpm: item.bpm,
        capo: item.capo,
        rawText: item.raw_text,
        favorite: item.is_favorite
      }));
    } catch (e) {
      console.warn("Error leyendo canciones desde Supabase:", e);
      return null;
    }
  }

  async saveSong(song) {
    if (!this.client) return false;
    try {
      const payload = {
        id: song.id,
        title: song.title,
        artist: song.artist,
        genre: song.genre || 'General',
        rhythm: song.rhythm || '4/4',
        key: song.key || 'C',
        bpm: song.bpm || 120,
        capo: song.capo || 'Sin capo',
        raw_text: song.rawText,
        is_favorite: !!song.favorite
      };

      const { error } = await this.client
        .from('songs')
        .upsert(payload, { onConflict: 'id' });

      if (error) throw error;
      return true;
    } catch (e) {
      console.error("Error guardando canción en Supabase:", e);
      return false;
    }
  }

  // Sync Setlists with Supabase
  async fetchSetlists() {
    if (!this.client) return null;
    try {
      const { data, error } = await this.client
        .from('setlists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        songIds: item.song_ids || []
      }));
    } catch (e) {
      console.warn("Error leyendo setlists desde Supabase:", e);
      return null;
    }
  }

  async saveSetlist(setlist) {
    if (!this.client) return false;
    try {
      const payload = {
        id: setlist.id,
        title: setlist.title,
        description: setlist.description || "",
        song_ids: setlist.songIds || []
      };

      const { error } = await this.client
        .from('setlists')
        .upsert(payload, { onConflict: 'id' });

      if (error) throw error;
      return true;
    } catch (e) {
      console.error("Error guardando setlist en Supabase:", e);
      return false;
    }
  }
}
