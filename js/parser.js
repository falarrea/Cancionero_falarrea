/**
 * GoodChord - Lyrics & Chords Intelligence Parser (v3.2 Clean Word Alignment)
 * Intelligently separates song text into sections, chord lines, and lyrics.
 * Aligns chords above exact words without splitting words into broken characters.
 */

// Chord regex matching standard & complex extension chords
const CHORD_REGEX = /^[A-G][#b]?(m|maj|min|dim|aug|sus[24]?|add[91113]?|[0-9]{1,2})*(\/[A-G][#b]?)?$/;

/**
 * Tests if a line consists almost exclusively of chord symbols
 */
export function isChordLine(line) {
  if (!line || !line.trim()) return false;
  const tokens = line.trim().split(/\s+/);
  if (tokens.length === 0) return false;

  let chordCount = 0;
  tokens.forEach(tok => {
    // Strip trailing punctuation if present
    const cleanTok = tok.replace(/[(),]/g, '');
    if (CHORD_REGEX.test(cleanTok)) {
      chordCount++;
    }
  });

  return (chordCount / tokens.length) >= 0.7;
}

/**
 * Parses raw text into structured section blocks, chord-lyric aligned pairs, or plain text
 */
export function parseSongText(rawText) {
  if (!rawText) return { title: "Sin título", artist: "Desconocido", key: "C", content: [] };

  const lines = rawText.split('\n');
  const result = {
    title: "",
    artist: "",
    key: "",
    rhythm: "",
    genre: "",
    content: []
  };

  let i = 0;

  // Extract header metadata lines if present
  while (i < lines.length && i < 6) {
    const line = lines[i].trim();
    if (line.toLowerCase().startsWith('título:') || line.toLowerCase().startsWith('titulo:')) {
      result.title = line.split(':')[1].trim();
    } else if (line.toLowerCase().startsWith('artista:')) {
      result.artist = line.split(':')[1].trim();
    } else if (line.toLowerCase().startsWith('tono:')) {
      result.key = line.split(':')[1].trim();
    } else if (line.toLowerCase().startsWith('ritmo:')) {
      result.rhythm = line.split(':')[1].trim();
    } else if (line.toLowerCase().startsWith('género:') || line.toLowerCase().startsWith('genero:')) {
      result.genre = line.split(':')[1].trim();
    }
    i++;
  }

  // Parse body lines
  for (let idx = 0; idx < lines.length; idx++) {
    const currentLine = lines[idx];
    const trimmed = currentLine.trim();

    if (!trimmed) {
      continue;
    }

    // Section Headers [Intro], [Verso 1], [Estribillo], etc.
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      result.content.push({
        type: 'header',
        text: trimmed.slice(1, -1)
      });
      continue;
    }

    // Check if this line is a chord line
    if (isChordLine(currentLine)) {
      const nextLine = (idx + 1 < lines.length) ? lines[idx + 1] : "";
      const nextTrimmed = nextLine.trim();

      // If next line exists and is a lyric line (not a chord line, not a header)
      if (nextLine && nextTrimmed && !isChordLine(nextLine) && !nextTrimmed.startsWith('[')) {
        const pairs = alignChordAndLyricLine(currentLine, nextLine);
        result.content.push({
          type: 'aligned',
          pairs: pairs
        });
        idx++; // Skip next line since it was consumed as lyrics
      } else {
        result.content.push({
          type: 'chords-only',
          line: currentLine
        });
      }
    } else {
      result.content.push({
        type: 'lyric-only',
        line: currentLine
      });
    }
  }

  return result;
}

/**
 * Aligns a chord line with its matching lyric line, preserving word integrity
 */
function alignChordAndLyricLine(chordLine, lyricLine) {
  const pairs = [];
  
  // Extract chord positions from chord line
  const chordMatches = [];
  const regex = /\S+/g;
  let match;
  while ((match = regex.exec(chordLine)) !== null) {
    const chordStr = match[0].replace(/[(),]/g, '');
    if (CHORD_REGEX.test(chordStr)) {
      chordMatches.push({
        chord: chordStr,
        pos: match.index
      });
    }
  }

  if (chordMatches.length === 0) {
    return [{ chord: null, lyric: lyricLine }];
  }

  // Segment the lyric line around chord positions without breaking words
  let currentLyricIndex = 0;

  for (let k = 0; k < chordMatches.length; k++) {
    const cMatch = chordMatches[k];
    const chordPos = cMatch.pos;
    const nextChordPos = (k + 1 < chordMatches.length) ? chordMatches[k + 1].pos : lyricLine.length;

    // Grab preceding lyrics if chord is further ahead
    if (chordPos > currentLyricIndex) {
      const leadLyric = lyricLine.slice(currentLyricIndex, chordPos);
      if (leadLyric) {
        pairs.push({ chord: null, lyric: leadLyric });
        currentLyricIndex = chordPos;
      }
    }

    // Grab segment under current chord
    let segmentEnd = Math.max(chordPos + cMatch.chord.length, nextChordPos);
    if (k === chordMatches.length - 1) {
      segmentEnd = lyricLine.length;
    }

    const chordLyricSegment = lyricLine.slice(currentLyricIndex, segmentEnd);
    pairs.push({
      chord: cMatch.chord,
      lyric: chordLyricSegment || " "
    });

    currentLyricIndex = segmentEnd;
  }

  if (currentLyricIndex < lyricLine.length) {
    pairs.push({
      chord: null,
      lyric: lyricLine.slice(currentLyricIndex)
    });
  }

  return pairs;
}

/**
 * AI Helper for auto-detecting song parameters from raw pasted text
 */
export function aiAutoEnhanceSong(rawText) {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  let title = "Nueva Canción";
  let artist = "Artista Desconocido";
  let key = "C";
  let rhythm = "4/4";
  let genre = "Pop / Rock";

  if (lines.length > 0) {
    if (!isChordLine(lines[0]) && !lines[0].startsWith('[')) {
      title = lines[0].replace(/^(título|titulo|song):\s*/i, '');
    }
  }
  if (lines.length > 1) {
    if (!isChordLine(lines[1]) && !lines[1].startsWith('[')) {
      artist = lines[1].replace(/^(artista|by|autor):\s*/i, '');
    }
  }

  // Auto detect key from first chord in text
  for (const line of lines) {
    if (isChordLine(line)) {
      const firstChord = line.split(/\s+/)[0];
      const match = firstChord.match(/^([A-G][#b]?m?)/);
      if (match) {
        key = match[1];
        break;
      }
    }
  }

  return { title, artist, key, rhythm, genre };
}
