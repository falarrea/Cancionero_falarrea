/**
 * GoodChord - Spanish Web Trends & CifraClub-Style Rhythm Recommendations
 * Provides current popular songs in Spanish and recommendations grouped by rhythm/groove.
 */

export const TRENDING_SPANISH_SONGS = [
  {
    id: "trend-1",
    title: "Bzrp Music Sessions, Vol. 52 (Quédate)",
    artist: "Bizarrap & Quevedo",
    genre: "Pop Urbano",
    rhythm: "4/4 (Dance Pop / Reggaeton)",
    bpm: 128,
    key: "D",
    capo: "Sin capo",
    trendingRank: 1,
    rawText: `Título: Bzrp Music Sessions, Vol. 52 (Quédate)
Artista: Bizarrap & Quevedo
Tono: D
Ritmo: 4/4 (Dance Pop / Reggaeton)
Género: Pop Urbano

[Intro]
D  F#m  Bm  G

[Estribillo]
D                      F#m
Quédate, que la noche sin ti duele
Bm                         G
Tengo en la mente las poses y todos los besos que nos dimos
D                          F#m
Quédate, que la noche sin ti duele
Bm                         G
Tú te fuiste y me dejaste solo con este dilema

[Verso 1]
D                          F#m
Y yo no sé qué pasó si todo iba tan bien
Bm                         G
Baby dime si me extrañas como yo a ti también`
  },
  {
    id: "trend-2",
    title: "Baño de María",
    artist: "CA7RIEL & Paco Amoroso",
    genre: "Funk Pop / Neo Soul",
    rhythm: "4/4 (Funk Groove)",
    bpm: 115,
    key: "Em7",
    capo: "Sin capo",
    trendingRank: 2,
    rawText: `Título: Baño de María
Artista: CA7RIEL & Paco Amoroso
Tono: Em7
Ritmo: 4/4 (Funk Groove)
Género: Funk Pop / Neo Soul

[Intro]
Em7  Am9  Bm7  Cmaj7 (x2)

[Verso 1]
Em7                       Am9
Salgo a la calle con estilo y elegancia
Bm7                       Cmaj7
Siento la brisa y el aroma de fragancia
Em7                       Am9
Tú me miras de reojo y sabes lo que pasa
Bm7                       Cmaj7
Cuando estos dos locos entran a la casa`
  },
  {
    id: "trend-3",
    title: "Arrancarmelo",
    artist: "WOS",
    genre: "Balada Rap Acústica",
    rhythm: "4/4 (Balada Lenta)",
    bpm: 72,
    key: "C",
    capo: "Sin capo",
    trendingRank: 3,
    rawText: `Título: Arrancarmelo
Artista: WOS
Tono: C
Ritmo: 4/4 (Balada Lenta)
Género: Balada Rap Acústica

[Intro]
C  G/B  Am  F (x2)

[Verso 1]
C             G/B            Am       F
No me pidas que no vuelva a intentar
C             G/B            Am       F
Que las cosas no salieron tan mal
C             G/B            Am       F
Y no tengo miedo de la oscuridad
C             G/B            Am       F
Si al final del día te puedo abrazar

[Estribillo]
C             G/B            Am       F
Y si esto es una guerra yo no me rindo
C             G/B            Am       F
Prefiero morir peleando por algo lindo`
  },
  {
    id: "trend-4",
    title: "Despeinada",
    artist: "Silvana Estrada",
    genre: "Indie Folclore / Bossa",
    rhythm: "4/4 (Bossa Nova)",
    bpm: 92,
    key: "Gmaj7",
    capo: "Capo 1er traste",
    trendingRank: 4,
    rawText: `Título: Despeinada
Artista: Silvana Estrada
Tono: Gmaj7
Ritmo: 4/4 (Bossa Nova)
Género: Indie Folclore / Bossa

[Intro]
Gmaj7  Am7  Bm7  Cmaj7

[Verso 1]
Gmaj7                    Am7
Vengo despeinada por el viento del mar
Bm7                      Cmaj7
Con la cabeza llena de cosas por cantar
Gmaj7                    Am7
Si me miras a los ojos me vas a descifrar
Bm7                      Cmaj7
Como un mapa secreto que no se puede borrar`
  }
];

export const RHYTHM_CATEGORIES = [
  {
    id: "rhythm-balada",
    name: "Balada 4/4 Acústica",
    icon: "🎵",
    description: "Ritmo suave ideal para arpegios y rasgueos pausados.",
    suggestedSongs: ["Muchacha (Ojos de papel)", "11 y 6", "Arrancarmelo"]
  },
  {
    rhythmId: "rhythm-rock",
    name: "Pop Rock / Rock 4/4",
    icon: "🎸",
    description: "Rasgueo directo con fuerza en tiempos 2 y 4.",
    suggestedSongs: ["De Música Ligera", "Bzrp Music Sessions, Vol. 52"]
  },
  {
    rhythmId: "rhythm-zamba",
    name: "Zamba y Vals 3/4",
    icon: "💃",
    description: "Compás ternario folclórico (Chasquido y bajeo característico).",
    suggestedSongs: ["Luna Tucumana", "Te Guardo"]
  },
  {
    rhythmId: "rhythm-bossa",
    name: "Bossa Nova / Jazz Groove",
    icon: "🎷",
    description: "Síncopa sofisticada ideal para acordes de 7ma y 9na.",
    suggestedSongs: ["Despeinada", "Te Guardo"]
  },
  {
    rhythmId: "rhythm-reggae",
    name: "Reggae Off-Beat",
    icon: "🌴",
    description: "Acento acontratiempo en la mano derecha con staccato.",
    suggestedSongs: ["Tus Ojos", "Hasta la Raíz"]
  }
];
