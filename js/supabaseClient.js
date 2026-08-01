/**
 * GoodChord - Supabase Integration Module (v2.6 Delete Operations)
 * Pre-configured with default credentials for automatic zero-config cloud sync.
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.8/+esm';

const DEFAULT_SUPABASE_URL = "https://ggnljououyjckgsbpnna.supabase.co";
const DEFAULT_SUPABASE_KEY = "sb_publishable_20ml-0B6GVU60T1YLl8zcQ_BFGjYpZA";

const STORAGE_SUPABASE_URL = "goodchord_supabase_url";
const STORAGE_SUPABASE_KEY = "goodchord_supabase_key";

export class SupabaseService {
  constructor() {
    this.url = localStorage.getItem(STORAGE_SUPABASE_URL) || DEFAULT_SUPABASE_URL;
    this.key = localStorage.getItem(STORAGE_SUPABASE_KEY) || DEFAULT_SUPABASE_KEY;
    this.client = null;

    this.initClient(this.url, this.key);
  }

  initClient(url, key) {
    try {
      this.url = url || DEFAULT_SUPABASE_URL;
      this.key = key || DEFAULT_SUPABASE_KEY;
      localStorage.setItem(STORAGE_SUPABASE_URL, this.url);
      localStorage.setItem(STORAGE_SUPABASE_KEY, this.key);
      this.client = createClient(this.url, this.key);
      console.log("⚡ Conexión inicializada con Supabase Cloud DB");
      return true;
    } catch (e) {
      console.error("Error al inicializar Supabase:", e);
      return false;
    }
  }

  isConfigured() {
    return !!this.client;
  }

  async checkConnection() {
    if (!this.client) return { connected: false, message: "Sin cliente" };
    try {
      const { data, error } = await this.client.from('songs').select('id').limit(1);
      
      if (!error) {
        return { connected: true, message: "🟢 Supabase Conectado" };
      }
      
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        return { connected: true, needsSql: true, message: "⚠️ Conectado (Falta ejecutar SQL)" };
      }

      return { connected: false, message: "🔴 Error de conexión" };
    } catch (e) {
      return { connected: false, message: "🔴 Offline" };
    }
  }

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
        favorite: !!item.is_favorite
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

  // Delete song from Supabase Cloud DB
  async deleteSong(songId) {
    if (!this.client) return false;
    try {
      const { error } = await this.client
        .from('songs')
        .delete()
        .eq('id', songId);

      if (error) throw error;
      console.log(`🗑️ Canción ${songId} eliminada de Supabase`);
      return true;
    } catch (e) {
      console.error("Error eliminando canción de Supabase:", e);
      return false;
    }
  }

  async updateFavoriteStatus(songId, isFavorite) {
    if (!this.client) return false;
    try {
      const { error } = await this.client
        .from('songs')
        .update({ is_favorite: isFavorite })
        .eq('id', songId);

      if (error) throw error;
      return true;
    } catch (e) {
      console.warn("Error actualizando favorito en Supabase:", e);
      return false;
    }
  }

  async seedPreloadedSongs(initialSongs) {
    if (!this.client) return;
    try {
      const existing = await this.fetchSongs();
      const existingIds = new Set((existing || []).map(s => s.id));

      const missing = initialSongs.filter(s => !existingIds.has(s.id));
      if (missing.length > 0) {
        console.log(`Subiendo ${missing.length} canciones iniciales a Supabase...`);
        for (const song of missing) {
          await this.saveSong(song);
        }
      }
    } catch (e) {
      console.warn("Error sembrando canciones iniciales:", e);
    }
  }

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
