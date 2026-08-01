/**
 * GoodChord - Chord Engine & Transposition System (v3.0 Perfect Match Fix)
 * Handles chord parsing, precise transposition, fretboard diagram generation (SVG),
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
 * Normalizes a root note to an index in the chromatic scale (0-11)
 */
export function noteToIndex(note) {
  if (!note) return -1;
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
export function transposeNote(note, semitones, preferFlat = false) {
  let idx = noteToIndex(note);
  if (idx === -1) return note;
  let newIdx = (idx + semitones) % 12;
  if (newIdx < 0) newIdx += 12;
  const scale = preferFlat ? NOTES_FLAT : NOTES_SHARP;
  return scale[newIdx];
}

/**
 * Transposes a chord symbol (e.g., "C#m", "F#m7b5", "C/E", "Ebm")
 * Preserves quality (m, maj7, dim, 7) and slash bass notes perfectly.
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

  // Match root note (e.g., C#, Eb, G, A) and suffix (e.g., m, maj7, 7, m7b5)
  const match = chordStr.trim().match(/^([A-G][#b]?)(.*)$/);
  if (!match) return chordStr;

  const root = match[1];
  const suffix = match[2] || "";
  const newRoot = transposeNote(root, semitones, preferFlat);

  return newRoot + suffix;
}

/**
 * Rich Chord Database
 */
export const CHORD_DATABASE = {
  "C": [
    { baseFret: 1, frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0], title: "C Mayor (Abierto)" },
    { baseFret: 3, frets: [-1, 3, 5, 5, 5, 3], fingers: [0, 1, 2, 3, 4, 1], barre: { fret: 3, from: 1, to: 5 }, title: "C Mayor (Traste 3)" }
  ],
  "C#": [
    { baseFret: 4, frets: [-1, 4, 6, 6, 6, 4], fingers: [0, 1, 2, 3, 4, 1], barre: { fret: 4, from: 1, to: 5 }, title: "C# Mayor (Traste 4)" }
  ],
  "C#m": [
    { baseFret: 4, frets: [-1, 4, 6, 6, 5, 4], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 4, from: 1, to: 5 }, title: "C# menor (Traste 4)" }
  ],
  "Cm": [
    { baseFret: 3, frets: [-1, 3, 5, 5, 4, 3], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 3, from: 1, to: 5 }, title: "C menor (Traste 3)" }
  ],
  "D": [
    { baseFret: 1, frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2], title: "D Mayor (Abierto)" },
    { baseFret: 5, frets: [-1, 5, 7, 7, 7, 5], fingers: [0, 1, 2, 3, 4, 1], barre: { fret: 5, from: 1, to: 5 }, title: "D Mayor (Traste 5)" }
  ],
  "D#m": [
    { baseFret: 6, frets: [-1, 6, 8, 8, 7, 6], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 6, from: 1, to: 5 }, title: "D#m (Traste 6)" }
  ],
  "Ebm": [
    { baseFret: 6, frets: [-1, 6, 8, 8, 7, 6], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 6, from: 1, to: 5 }, title: "Ebm (Traste 6)" }
  ],
  "Dm": [
    { baseFret: 1, frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1], title: "D menor (Abierto)" }
  ],
  "E": [
    { baseFret: 1, frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0], title: "E Mayor (Abierto)" }
  ],
  "Em": [
    { baseFret: 1, frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0], title: "E menor (Abierto)" }
  ],
  "F": [
    { baseFret: 1, frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, from: 1, to: 6 }, title: "F Mayor (Traste 1)" }
  ],
  "F#m": [
    { baseFret: 2, frets: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 2, from: 1, to: 6 }, title: "F#m (Traste 2)" }
  ],
  "G": [
    { baseFret: 1, frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3], title: "G Mayor (Abierto)" }
  ],
  "Gm": [
    { baseFret: 3, frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 3, from: 1, to: 6 }, title: "G menor (Traste 3)" }
  ],
  "A": [
    { baseFret: 1, frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0], title: "A Mayor (Abierto)" }
  ],
  "Am": [
    { baseFret: 1, frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0], title: "A menor (Abierto)" }
  ],
  "B": [
    { baseFret: 2, frets: [-1, 2, 4, 4, 4, 2], fingers: [0, 1, 2, 3, 4, 1], barre: { fret: 2, from: 1, to: 5 }, title: "B Mayor (Traste 2)" }
  ],
  "Bm": [
    { baseFret: 2, frets: [-1, 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 2, from: 1, to: 5 }, title: "B menor (Traste 2)" }
  ],
  "Cmaj7": [
    { baseFret: 1, frets: [-1, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0], title: "Cmaj7 (Abierto)" }
  ],
  "F#m7b5": [
    { baseFret: 1, frets: [2, -1, 2, 2, 1, -1], fingers: [2, 0, 3, 4, 1, 0], title: "F#m7b5 (Semidisminuido)" }
  ]
};

export function getChordPositions(chordStr) {
  if (!chordStr) return null;
  const clean = chordStr.trim();
  
  if (CHORD_DATABASE[clean]) {
    return CHORD_DATABASE[clean];
  }

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

  return generateFallbackDiagram(clean);
}

function generateFallbackDiagram(chordStr) {
  return [
    {
      baseFret: 1,
      frets: [-1, 0, 2, 2, 1, 0],
      fingers: [0, 0, 2, 3, 1, 0],
      title: `${chordStr} (Diagrama de referencia)`
    }
  ];
}

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
  svg += `<rect width="100%" height="100%" fill="transparent" />`;

  if (baseFret > 1) {
    svg += `<text x="12" y="${startY + 22}" font-family="sans-serif" font-size="14" font-weight="bold" fill="currentColor">${baseFret}fr</text>`;
  }

  const nutStrokeWidth = baseFret === 1 ? "5" : "2";
  svg += `<line x1="${startX}" y1="${startY}" x2="${startX + stringSpacing * 5}" y2="${startY}" stroke="currentColor" stroke-width="${nutStrokeWidth}" stroke-linecap="round" />`;

  for (let i = 1; i <= 5; i++) {
    const y = startY + i * fretSpacing;
    svg += `<line x1="${startX}" y1="${y}" x2="${startX + stringSpacing * 5}" y2="${y}" stroke="currentColor" stroke-width="1.5" opacity="0.4" />`;
  }

  for (let i = 0; i < 6; i++) {
    const x = startX + i * stringSpacing;
    const strWidth = 3 - (i * 0.35);
    svg += `<line x1="${x}" y1="${startY}" x2="${x}" y2="${startY + 5 * fretSpacing}" stroke="currentColor" stroke-width="${strWidth}" opacity="0.8" />`;
  }

  if (barre) {
    const relFret = barre.fret - baseFret + 1;
    if (relFret >= 1 && relFret <= 5) {
      const y = startY + (relFret - 0.5) * fretSpacing;
      const x1 = startX + (6 - barre.to) * stringSpacing;
      const x2 = startX + (6 - barre.from) * stringSpacing;
      svg += `<rect x="${x1 - 8}" y="${y - 7}" width="${x2 - x1 + 16}" height="14" rx="7" fill="var(--accent-color, #6366f1)" opacity="0.95" />`;
    }
  }

  for (let s = 0; s < 6; s++) {
    const fretVal = frets[s];
    const fingerVal = fingers[s];
    const x = startX + s * stringSpacing;

    if (fretVal === -1) {
      svg += `<text x="${x}" y="${startY - 12}" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ef4444">✕</text>`;
    } else if (fretVal === 0) {
      svg += `<circle cx="${x}" cy="${startY - 14}" r="6" stroke="currentColor" stroke-width="2" fill="none" opacity="0.8" />`;
    } else {
      const relFret = fretVal - baseFret + 1;
      if (relFret >= 1 && relFret <= 5) {
        const y = startY + (relFret - 0.5) * fretSpacing;
        svg += `<circle cx="${x}" cy="${y}" r="11" fill="var(--accent-color, #6366f1)" />`;
        if (fingerVal > 0) {
          svg += `<text x="${x}" y="${y + 4}" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ffffff">${fingerVal}</text>`;
        }
      }
    }
  }

  const stringNames = ['E', 'A', 'D', 'G', 'B', 'e'];
  for (let i = 0; i < 6; i++) {
    const x = startX + i * stringSpacing;
    svg += `<text x="${x}" y="${startY + 5 * fretSpacing + 22}" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="600" opacity="0.5" fill="currentColor">${stringNames[i]}</text>`;
  }

  svg += `</svg>`;
  return svg;
}
