/**
 * GoodChord - Chord Engine & Transposition System
 * Handles chord parsing, transposition, fretboard diagram generation (SVG),
 * and complex chord database.
 */

// Chromatic scales
const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTES_FLAT  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const ENHARMONICS = {
  'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
  'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb',
  'E#': 'F',  'B#': 'C',  'Fb': 'E',  'Cb': 'B'
};

/**
 * Normalizes a root note to a index in the chromatic scale (0-11)
 */
function noteToIndex(note) {
  let clean = note.trim();
  let idx = NOTES_SHARP.indexOf(clean);
  if (idx !== -1) return idx;
  idx = NOTES_FLAT.indexOf(clean);
  if (idx !== -1) return idx;
  if (ENHARMONICS[clean]) {
    let alt = ENHARMONICS[clean];
    idx = NOTES_SHARP.indexOf(alt);
    if (idx !== -1) return idx;
    idx = NOTES_FLAT.indexOf(alt);
    if (idx !== -1) return idx;
  }
  return -1;
}

/**
 * Transposes a single note by semitones delta
 */
function transposeNote(note, semitones, preferFlat = false) {
  let idx = noteToIndex(note);
  if (idx === -1) return note;
  let newIdx = (idx + semitones) % 12;
  if (newIdx < 0) newIdx += 12;
  const scale = preferFlat ? NOTES_FLAT : NOTES_SHARP;
  return scale[newIdx];
}

/**
 * Transposes a chord symbol (e.g., "Cmaj7", "F#m7b5", "C/E")
 */
export function transposeChord(chordStr, semitones, preferFlat = false) {
  if (!chordStr || semitones === 0) return chordStr;
  
  // Handle slash chords like C/E or F#m7/C#
  if (chordStr.includes('/')) {
    const parts = chordStr.split('/');
    const transposedMain = transposeChord(parts[0], semitones, preferFlat);
    const transposedBass = transposeNote(parts[1], semitones, preferFlat);
    return `${transposedMain}/${transposedBass}`;
  }

  // Regex to match root note (e.g., C#, Bb, G) and quality suffix
  const match = chordStr.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return chordStr;

  const root = match[1];
  const suffix = match[2];
  const newRoot = transposeNote(root, semitones, preferFlat);

  return newRoot + suffix;
}

/**
 * Rich Chord Database
 * String order: 6th (low E), 5th (A), 4th (D), 3rd (G), 2nd (B), 1st (high E)
 * Format for frets: [E6, A5, D4, G3, B2, E1], -1 means muted (X), 0 means open (O)
 * Format for fingers: [E6, A5, D4, G3, B2, E1] (1: index, 2: middle, 3: ring, 4: pinky)
 */
export const CHORD_DATABASE = {
  // Basic Major & Minor
  "C": [
    { baseFret: 1, frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0], title: "C Mayor (Abierto)" },
    { baseFret: 3, frets: [-1, 3, 5, 5, 5, 3], fingers: [0, 1, 2, 3, 4, 1], barre: { fret: 3, from: 1, to: 5 }, title: "C Mayor (Cejilla Traste 3)" },
    { baseFret: 8, frets: [8, 10, 10, 9, 8, 8], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 8, from: 1, to: 6 }, title: "C Mayor (Cejilla Traste 8)" }
  ],
  "Cm": [
    { baseFret: 3, frets: [-1, 3, 5, 5, 4, 3], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 3, from: 1, to: 5 }, title: "C menor (Traste 3)" },
    { baseFret: 8, frets: [8, 10, 10, 8, 8, 8], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 8, from: 1, to: 6 }, title: "C menor (Traste 8)" }
  ],
  "D": [
    { baseFret: 1, frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2], title: "D Mayor (Abierto)" },
    { baseFret: 5, frets: [-1, 5, 7, 7, 7, 5], fingers: [0, 1, 2, 3, 4, 1], barre: { fret: 5, from: 1, to: 5 }, title: "D Mayor (Cejilla Traste 5)" }
  ],
  "Dm": [
    { baseFret: 1, frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1], title: "D menor (Abierto)" },
    { baseFret: 5, frets: [-1, 5, 7, 7, 6, 5], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 5, from: 1, to: 5 }, title: "D menor (Cejilla Traste 5)" }
  ],
  "E": [
    { baseFret: 1, frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0], title: "E Mayor (Abierto)" },
    { baseFret: 7, frets: [-1, 7, 9, 9, 9, 7], fingers: [0, 1, 2, 3, 4, 1], barre: { fret: 7, from: 1, to: 5 }, title: "E Mayor (Cejilla Traste 7)" }
  ],
  "Em": [
    { baseFret: 1, frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0], title: "E menor (Abierto)" },
    { baseFret: 7, frets: [-1, 7, 9, 9, 8, 7], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 7, from: 1, to: 5 }, title: "E menor (Cejilla Traste 7)" }
  ],
  "F": [
    { baseFret: 1, frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, from: 1, to: 6 }, title: "F Mayor (Cejilla Traste 1)" },
    { baseFret: 1, frets: [-1, -1, 3, 2, 1, 1], fingers: [0, 0, 3, 2, 1, 1], barre: { fret: 1, from: 1, to: 2 }, title: "F Mayor Simplificado" }
  ],
  "Fm": [
    { baseFret: 1, frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, from: 1, to: 6 }, title: "F menor (Cejilla Traste 1)" }
  ],
  "G": [
    { baseFret: 1, frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3], title: "G Mayor (Abierto Clásico)" },
    { baseFret: 1, frets: [3, 2, 0, 0, 3, 3], fingers: [2, 1, 0, 0, 3, 4], title: "G Mayor (Con Quinta)" },
    { baseFret: 3, frets: [3, 5, 5, 4, 3, 3], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 3, from: 1, to: 6 }, title: "G Mayor (Cejilla Traste 3)" }
  ],
  "Gm": [
    { baseFret: 3, frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 3, from: 1, to: 6 }, title: "G menor (Cejilla Traste 3)" }
  ],
  "A": [
    { baseFret: 1, frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0], title: "A Mayor (Abierto)" },
    { baseFret: 5, frets: [5, 7, 7, 6, 5, 5], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 5, from: 1, to: 6 }, title: "A Mayor (Cejilla Traste 5)" }
  ],
  "Am": [
    { baseFret: 1, frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0], title: "A menor (Abierto)" },
    { baseFret: 5, frets: [5, 7, 7, 5, 5, 5], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 5, from: 1, to: 6 }, title: "A menor (Cejilla Traste 5)" }
  ],
  "B": [
    { baseFret: 2, frets: [-1, 2, 4, 4, 4, 2], fingers: [0, 1, 2, 3, 4, 1], barre: { fret: 2, from: 1, to: 5 }, title: "B Mayor (Traste 2)" }
  ],
  "Bm": [
    { baseFret: 2, frets: [-1, 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 2, from: 1, to: 5 }, title: "B menor (Traste 2)" }
  ],

  // Seventh & Major Seventh Chords (7, maj7, m7)
  "Cmaj7": [
    { baseFret: 1, frets: [-1, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0], title: "Cmaj7 (Abierto)" },
    { baseFret: 3, frets: [-1, 3, 5, 4, 5, 3], fingers: [0, 1, 3, 2, 4, 1], barre: { fret: 3, from: 1, to: 5 }, title: "Cmaj7 (Traste 3)" }
  ],
  "C7": [
    { baseFret: 1, frets: [-1, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0], title: "C Dominante 7 (Abierto)" }
  ],
  "Cm7": [
    { baseFret: 3, frets: [-1, 3, 5, 3, 4, 3], fingers: [0, 1, 3, 1, 2, 1], barre: { fret: 3, from: 1, to: 5 }, title: "Cm7 (Traste 3)" }
  ],
  "Dmaj7": [
    { baseFret: 1, frets: [-1, -1, 0, 2, 2, 2], fingers: [0, 0, 0, 1, 2, 3], title: "Dmaj7 (Abierto)" },
    { baseFret: 5, frets: [-1, 5, 7, 6, 7, 5], fingers: [0, 1, 3, 2, 4, 1], barre: { fret: 5, from: 1, to: 5 }, title: "Dmaj7 (Traste 5)" }
  ],
  "D7": [
    { baseFret: 1, frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3], title: "D Dominante 7 (Abierto)" }
  ],
  "Dm7": [
    { baseFret: 1, frets: [-1, -1, 0, 2, 1, 1], fingers: [0, 0, 0, 2, 1, 1], barre: { fret: 1, from: 1, to: 2 }, title: "Dm7 (Abierto)" }
  ],
  "Emaj7": [
    { baseFret: 1, frets: [0, 2, 1, 1, 0, 0], fingers: [0, 3, 1, 2, 0, 0], title: "Emaj7 (Abierto)" }
  ],
  "E7": [
    { baseFret: 1, frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0], title: "E Dominante 7 (Abierto)" },
    { baseFret: 1, frets: [0, 2, 2, 1, 3, 0], fingers: [0, 2, 3, 1, 4, 0], title: "E7 (Con 7ma Aguda)" }
  ],
  "Em7": [
    { baseFret: 1, frets: [0, 2, 0, 0, 0, 0], fingers: [0, 2, 0, 0, 0, 0], title: "Em7 (Abierto Ultra Simple)" },
    { baseFret: 1, frets: [0, 2, 2, 0, 3, 0], fingers: [0, 2, 3, 0, 4, 0], title: "Em7 (Abierto Rítmico)" }
  ],
  "Fmaj7": [
    { baseFret: 1, frets: [-1, -1, 3, 2, 1, 0], fingers: [0, 0, 3, 2, 1, 0], title: "Fmaj7 (Abierto Típico)" },
    { baseFret: 1, frets: [1, -1, 3, 2, 1, 0], fingers: [1, 0, 4, 3, 2, 0], title: "Fmaj7/E con Pulgar/Bajo E" }
  ],
  "Gmaj7": [
    { baseFret: 1, frets: [3, 2, 0, 0, 0, 2], fingers: [3, 2, 0, 0, 0, 1], title: "Gmaj7 (Abierto)" },
    { baseFret: 3, frets: [3, 5, 4, 4, 3, 3], fingers: [1, 4, 2, 3, 1, 1], barre: { fret: 3, from: 1, to: 6 }, title: "Gmaj7 (Traste 3)" }
  ],
  "G7": [
    { baseFret: 1, frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1], title: "G Dominante 7 (Abierto)" }
  ],
  "Amaj7": [
    { baseFret: 1, frets: [-1, 0, 2, 1, 2, 0], fingers: [0, 0, 2, 1, 3, 0], title: "Amaj7 (Abierto)" }
  ],
  "A7": [
    { baseFret: 1, frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 1, 0, 2, 0], title: "A Dominante 7 (Abierto)" }
  ],
  "Am7": [
    { baseFret: 1, frets: [-1, 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0], title: "Am7 (Abierto)" }
  ],
  "B7": [
    { baseFret: 1, frets: [-1, 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4], title: "B7 (Abierto Clásico)" }
  ],
  "Bm7": [
    { baseFret: 2, frets: [-1, 2, 4, 2, 3, 2], fingers: [0, 1, 3, 1, 2, 1], barre: { fret: 2, from: 1, to: 5 }, title: "Bm7 (Traste 2)" }
  ],

  // Complex, Jazz & Extended Chords (m7b5, dim7, 9, 11, 13, add9, sus2, sus4)
  "F#m7b5": [
    { baseFret: 1, frets: [2, -1, 2, 2, 1, -1], fingers: [2, 0, 3, 4, 1, 0], title: "F#m7b5 (Semidisminuido Jazz)" },
    { baseFret: 2, frets: [-1, 2, 2, 2, 2, 2], fingers: [0, 1, 1, 1, 1, 1], barre: { fret: 2, from: 1, to: 5 }, title: "F#m7b5 (Posición 2)" }
  ],
  "Bm7b5": [
    { baseFret: 1, frets: [-1, 2, 3, 2, 3, -1], fingers: [0, 1, 3, 2, 4, 0], title: "Bm7b5 (Semidisminuido Típico)" }
  ],
  "C#m7b5": [
    { baseFret: 2, frets: [-1, 4, 5, 4, 5, -1], fingers: [0, 1, 3, 2, 4, 0], title: "C#m7b5 (Traste 4)" }
  ],
  "Cdim7": [
    { baseFret: 1, frets: [-1, 3, 4, 2, 4, -1], fingers: [0, 2, 3, 1, 4, 0], title: "C Disminuido 7" }
  ],
  "F#dim7": [
    { baseFret: 1, frets: [2, -1, 1, 2, 1, -1], fingers: [2, 0, 1, 3, 1, 0], title: "F# Disminuido 7" }
  ],
  "Cadd9": [
    { baseFret: 1, frets: [-1, 3, 2, 0, 3, 0], fingers: [0, 2, 1, 0, 3, 0], title: "Cadd9 (Acústico Dulce)" },
    { baseFret: 1, frets: [-1, 3, 2, 0, 3, 3], fingers: [0, 2, 1, 0, 3, 4], title: "Cadd9 (Con Quinta)" }
  ],
  "Gadd9": [
    { baseFret: 1, frets: [3, 0, 0, 0, 0, 3], fingers: [2, 0, 0, 0, 0, 3], title: "Gadd9 (Abierto)" },
    { baseFret: 1, frets: [3, 2, 0, 2, 0, 3], fingers: [3, 2, 0, 1, 0, 4], title: "Gadd9 (Enriquecido)" }
  ],
  "Aadd9": [
    { baseFret: 1, frets: [-1, 0, 2, 4, 2, 0], fingers: [0, 0, 1, 3, 2, 0], title: "Aadd9 (Abierto Resonante)" }
  ],
  "Eadd9": [
    { baseFret: 1, frets: [0, 2, 4, 1, 0, 0], fingers: [0, 2, 4, 1, 0, 0], title: "Eadd9 (Abierto Brillante)" }
  ],
  "Dm9": [
    { baseFret: 5, frets: [-1, 5, 3, 5, 5, 5], fingers: [0, 3, 1, 4, 4, 4], barre: { fret: 5, from: 1, to: 3 }, title: "Dm9 (Jazz Traste 5)" }
  ],
  "Am9": [
    { baseFret: 5, frets: [5, -1, 5, 5, 5, 7], fingers: [1, 0, 1, 1, 1, 4], barre: { fret: 5, from: 2, to: 6 }, title: "Am9 (Bossa / Jazz)" }
  ],
  "Em9": [
    { baseFret: 1, frets: [0, 2, 0, 0, 0, 2], fingers: [0, 1, 0, 0, 0, 2], title: "Em9 (Abierto Místico)" }
  ],
  "C9": [
    { baseFret: 2, frets: [-1, 3, 2, 3, 3, 3], fingers: [0, 2, 1, 3, 3, 3], barre: { fret: 3, from: 1, to: 3 }, title: "C9 (Funk / Blues)" }
  ],
  "G13": [
    { baseFret: 3, frets: [3, -1, 3, 4, 5, -1], fingers: [1, 0, 2, 3, 4, 0], title: "G13 (Bossa Nova / Jazz)" }
  ],
  "A7sus4": [
    { baseFret: 1, frets: [-1, 0, 2, 0, 3, 0], fingers: [0, 0, 1, 0, 3, 0], title: "A7sus4 (Abierto)" }
  ],
  "Dsus4": [
    { baseFret: 1, frets: [-1, -1, 0, 2, 3, 3], fingers: [0, 0, 0, 1, 2, 3], title: "Dsus4 (Abierto)" }
  ],
  "Dsus2": [
    { baseFret: 1, frets: [-1, -1, 0, 2, 3, 0], fingers: [0, 0, 0, 1, 3, 0], title: "Dsus2 (Abierto)" }
  ],
  "Asus4": [
    { baseFret: 1, frets: [-1, 0, 2, 2, 3, 0], fingers: [0, 0, 1, 2, 3, 0], title: "Asus4 (Abierto)" }
  ],
  "Esus4": [
    { baseFret: 1, frets: [0, 2, 2, 2, 0, 0], fingers: [0, 2, 3, 4, 0, 0], title: "Esus4 (Abierto)" }
  ],
  "Caug": [
    { baseFret: 1, frets: [-1, 3, 2, 1, 1, 0], fingers: [0, 3, 2, 1, 1, 0], barre: { fret: 1, from: 2, to: 3 }, title: "C Aumentado" }
  ],

  // Slash Chords (Inversions & Bass notes)
  "C/E": [
    { baseFret: 1, frets: [0, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0], title: "C con Bajo en E" }
  ],
  "G/B": [
    { baseFret: 1, frets: [-1, 2, 0, 0, 0, 3], fingers: [0, 1, 0, 0, 0, 2], title: "G con Bajo en B" },
    { baseFret: 1, frets: [-1, 2, 0, 0, 3, 3], fingers: [0, 1, 0, 0, 3, 4], title: "G/B (Con Quinta Aguda)" }
  ],
  "D/F#": [
    { baseFret: 1, frets: [2, -1, 0, 2, 3, 2], fingers: [1, 0, 0, 2, 4, 3], title: "D con Bajo en F#" },
    { baseFret: 1, frets: [2, 0, 0, 2, 3, 2], fingers: [1, 0, 0, 2, 4, 3], title: "D/F# Con Pulgar" }
  ],
  "Am/G": [
    { baseFret: 1, frets: [3, 0, 2, 2, 1, 0], fingers: [3, 0, 2, 2, 1, 0], title: "Am con Bajo en G" }
  ],
  "F/A": [
    { baseFret: 1, frets: [-1, 0, 3, 2, 1, 1], fingers: [0, 0, 3, 2, 1, 1], barre: { fret: 1, from: 1, to: 2 }, title: "F con Bajo en A" }
  ]
};

/**
 * Gets diagram data for a chord symbol, with intelligent fallback for transposition or enharmonics
 */
export function getChordPositions(chordStr) {
  if (!chordStr) return null;
  const clean = chordStr.trim();
  
  if (CHORD_DATABASE[clean]) {
    return CHORD_DATABASE[clean];
  }

  // Try converting enharmonics
  const match = clean.match(/^([A-G][#b]?)(.*)$/);
  if (match) {
    const root = match[1];
    const suffix = match[2];
    if (ENHARMONICS[root]) {
      const altChord = ENHARMONICS[root] + suffix;
      if (CHORD_DATABASE[altChord]) {
        return CHORD_DATABASE[altChord];
      }
    }
  }

  // Fallback: Generate an algorithmic approximation if not in DB
  return generateFallbackDiagram(clean);
}

/**
 * Fallback generator for unlisted complex chords
 */
function generateFallbackDiagram(chordStr) {
  // Simple default shape representation
  return [
    {
      baseFret: 1,
      frets: [-1, 0, 2, 2, 1, 0],
      fingers: [0, 0, 2, 3, 1, 0],
      title: `${chordStr} (Diagrama genérico de referencia)`
    }
  ];
}

/**
 * Render an SVG Chord Diagram Element
 */
export function renderChordSVG(posData, currentPosIndex = 0) {
  if (!posData || !posData.length) return '<div class="no-diagram">Sin diagrama disponible</div>';
  
  const pos = posData[currentPosIndex] || posData[0];
  const frets = pos.frets;
  const fingers = pos.fingers || [0,0,0,0,0,0];
  const baseFret = pos.baseFret || 1;
  const barre = pos.barre;

  const width = 210;
  const height = 240;
  const startX = 40;
  const startY = 50;
  const stringSpacing = 26;
  const fretSpacing = 34;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="chord-svg">`;

  // Background / Styling
  svg += `<rect width="100%" height="100%" fill="transparent" />`;

  // Base fret text if > 1
  if (baseFret > 1) {
    svg += `<text x="12" y="${startY + 22}" font-family="sans-serif" font-size="14" font-weight="bold" fill="currentColor">${baseFret}fr</text>`;
  }

  // Nut / First line (thicker if baseFret === 1)
  const nutStrokeWidth = baseFret === 1 ? "5" : "2";
  svg += `<line x1="${startX}" y1="${startY}" x2="${startX + stringSpacing * 5}" y2="${startY}" stroke="currentColor" stroke-width="${nutStrokeWidth}" stroke-linecap="round" />`;

  // Draw 5 Fret lines
  for (let i = 1; i <= 5; i++) {
    const y = startY + i * fretSpacing;
    svg += `<line x1="${startX}" y1="${y}" x2="${startX + stringSpacing * 5}" y2="${y}" stroke="currentColor" stroke-width="1.5" opacity="0.4" />`;
  }

  // Draw 6 Strings (E A D G B E -> left to right)
  for (let i = 0; i < 6; i++) {
    const x = startX + i * stringSpacing;
    // Thicker bass strings
    const strWidth = 3 - (i * 0.35);
    svg += `<line x1="${x}" y1="${startY}" x2="${x}" y2="${startY + 5 * fretSpacing}" stroke="currentColor" stroke-width="${strWidth}" opacity="0.8" />`;
  }

  // Draw Barre if present
  if (barre) {
    const relFret = barre.fret - baseFret + 1;
    if (relFret >= 1 && relFret <= 5) {
      const y = startY + (relFret - 0.5) * fretSpacing;
      const x1 = startX + (6 - barre.to) * stringSpacing;
      const x2 = startX + (6 - barre.from) * stringSpacing;
      svg += `<rect x="${x1 - 8}" y="${y - 7}" width="${x2 - x1 + 16}" height="14" rx="7" fill="var(--accent-color, #6366f1)" opacity="0.95" />`;
    }
  }

  // Draw Finger Dots, Open 'O' & Muted 'X'
  for (let s = 0; s < 6; s++) {
    const fretVal = frets[s];
    const fingerVal = fingers[s];
    const x = startX + s * stringSpacing;

    if (fretVal === -1) {
      // Muted X above nut
      svg += `<text x="${x}" y="${startY - 12}" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ef4444">✕</text>`;
    } else if (fretVal === 0) {
      // Open O above nut
      svg += `<circle cx="${x}" cy="${startY - 14}" r="6" stroke="currentColor" stroke-width="2" fill="none" opacity="0.8" />`;
    } else {
      // Fretted note dot
      const relFret = fretVal - baseFret + 1;
      if (relFret >= 1 && relFret <= 5) {
        const y = startY + (relFret - 0.5) * fretSpacing;
        
        // Don't draw individual dot if part of barre except to show finger
        svg += `<circle cx="${x}" cy="${y}" r="11" fill="var(--accent-color, #6366f1)" />`;
        
        if (fingerVal > 0) {
          svg += `<text x="${x}" y="${y + 4}" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ffffff">${fingerVal}</text>`;
        }
      }
    }
  }

  // String labels at bottom (E A D G B E)
  const stringNames = ['E', 'A', 'D', 'G', 'B', 'e'];
  for (let i = 0; i < 6; i++) {
    const x = startX + i * stringSpacing;
    svg += `<text x="${x}" y="${startY + 5 * fretSpacing + 22}" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="600" opacity="0.5" fill="currentColor">${stringNames[i]}</text>`;
  }

  svg += `</svg>`;
  return svg;
}
