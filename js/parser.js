/**
 * GoodChord - Smart Song & Chord Parser
 * Automatically parses raw text pasted from CifraClub, LaCuerda, Ultimate-Guitar or manual entry.
 * Recognizes chords over lyrics, bracketed chords [Am], metadata, and sections.
 */

// Regex matching single chord symbols
const CHORD_TOKEN_REGEX = /^[A-G][#b]?(m|maj|dim|aug|add|sus|[0-9])*(b5|#5|b9|#9|#11|\/[A-G][#b]?)?$/;
const CHORD_LINE_REGEX = /^(\s*([A-G][#b]?(m|maj|dim|aug|add|sus|[0-9])*(b5|#5|b9|#9|#11|\/[A-G][#b]?)?)\s*)+$/i;

/**
 * Checks if a string is likely a chord token
 */
export function isChordToken(word) {
  if (!word) return false;
  const clean = word.trim().replace(/[()]/g, '');
  return CHORD_TOKEN_REGEX.test(clean);
}

/**
 * Checks if an entire line consists mostly of chord tokens
 */
export function isChordLine(line) {
  if (!line || !line.trim()) return false;
  const words = line.trim().split(/\s+/);
  if (words.length === 0) return false;
  
  let chordCount = 0;
  for (const word of words) {
    if (isChordToken(word)) chordCount++;
  }

  return (chordCount / words.length) >= 0.7;
}

/**
 * Parses raw song text into a structured Song Object
 */
export function parseSongText(rawText) {
  const lines = rawText.split(/\r?\n/);
  
  let title = "Canción sin título";
  let artist = "Artista Desconocido";
  let key = "C";
  let rhythm = "4/4";
  let capo = "Sin capodastro";
  let genre = "Pop / Rock";

  let bodyLines = [];
  let metaExtracted = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check for metadata tags
    if (trimmed.match(/^(título|title|canción):\s*(.+)$/i)) {
      title = trimmed.replace(/^(título|title|canción):\s*/i, '');
      continue;
    }
    if (trimmed.match(/^(artista|artist|autor):\s*(.+)$/i)) {
      artist = trimmed.replace(/^(artista|artist|autor):\s*/i, '');
      continue;
    }
    if (trimmed.match(/^(tono|key|tonalidad):\s*(.+)$/i)) {
      key = trimmed.replace(/^(tono|key|tonalidad):\s*/i, '');
      continue;
    }
    if (trimmed.match(/^(ritmo|rhythm|compás):\s*(.+)$/i)) {
      rhythm = trimmed.replace(/^(ritmo|rhythm|compás):\s*/i, '');
      continue;
    }
    if (trimmed.match(/^(capo|capodastro):\s*(.+)$/i)) {
      capo = trimmed.replace(/^(capo|capodastro):\s*/i, '');
      continue;
    }
    if (trimmed.match(/^(género|genre):\s*(.+)$/i)) {
      genre = trimmed.replace(/^(género|genre):\s*/i, '');
      continue;
    }

    // Attempt automatic title/artist detection from first 2 lines if not tagged
    if (!metaExtracted && i === 0 && trimmed.length > 0 && !isChordLine(trimmed) && !trimmed.includes('[')) {
      if (lines.length > 1 && lines[1].trim().length > 0 && !isChordLine(lines[1])) {
        title = trimmed;
        artist = lines[1].trim();
        i++; // skip line 1
        metaExtracted = true;
        continue;
      }
    }

    bodyLines.push(line);
  }

  // Parse structure into formatted blocks (Chords over lyrics or Bracketed)
  const parsedContent = processBodyLines(bodyLines);

  // Auto-detect key if not specified
  if (key === "C" && parsedContent.detectedKey) {
    key = parsedContent.detectedKey;
  }

  return {
    title,
    artist,
    key,
    rhythm,
    capo,
    genre,
    content: parsedContent.formattedLines,
    rawText
  };
}

/**
 * Processes lines into structured lyrics with chord overlays
 */
function processBodyLines(lines) {
  const formattedLines = [];
  const chordFrequency = {};

  let i = 0;
  while (i < lines.length) {
    const currentLine = lines[i];

    // Case 1: Bracketed Chords format e.g. "En [Am]esta vida [F]tengo..."
    if (currentLine.includes('[') && currentLine.includes(']')) {
      const items = parseBracketedLine(currentLine, chordFrequency);
      formattedLines.push({ type: 'bracketed', items });
      i++;
      continue;
    }

    // Case 2: Section headers e.g. [Estribillo], [Intro], [Verso 1]
    if (currentLine.trim().match(/^\[(intro|estribillo|coro|verso|verso\s*\d+|puente|outro|solo)\]$/i)) {
      formattedLines.push({ type: 'header', text: currentLine.trim().replace(/[\[\]]/g, '').toUpperCase() });
      i++;
      continue;
    }

    // Case 3: Chords line followed by Lyrics line (CifraClub / LaCuerda standard)
    if (isChordLine(currentLine)) {
      const chordLine = currentLine;
      const nextLine = (i + 1 < lines.length && !isChordLine(lines[i + 1])) ? lines[i + 1] : "";

      // Count chord occurrences for key detection
      const chords = chordLine.trim().split(/\s+/);
      chords.forEach(c => {
        const clean = c.trim();
        if (clean) chordFrequency[clean] = (chordFrequency[clean] || 0) + 1;
      });

      if (nextLine.trim().length > 0) {
        // Merge chord line & lyric line into position-aligned tokens
        const merged = mergeChordAndLyricLines(chordLine, nextLine);
        formattedLines.push({ type: 'aligned', pairs: merged });
        i += 2;
      } else {
        // Standalone chord line (e.g., Intro: C G Am F)
        formattedLines.push({ type: 'chords-only', line: chordLine });
        i++;
      }
      continue;
    }

    // Case 4: Standard lyric line
    formattedLines.push({ type: 'lyric-only', line: currentLine });
    i++;
  }

  // Find most frequent root chord for detected key
  let detectedKey = "C";
  let maxCount = 0;
  for (const [chord, count] of Object.entries(chordFrequency)) {
    if (count > maxCount) {
      maxCount = count;
      detectedKey = chord;
    }
  }

  return { formattedLines, detectedKey };
}

/**
 * Parses lines with bracketed chords [Am]
 */
function parseBracketedLine(line, chordFreq) {
  const parts = line.split(/(\[[^\]]+\])/);
  const items = [];

  parts.forEach(part => {
    if (part.startsWith('[') && part.endsWith(']')) {
      const chord = part.substring(1, part.length - 1).trim();
      if (chord) chordFreq[chord] = (chordFreq[chord] || 0) + 1;
      items.push({ isChord: true, text: chord });
    } else if (part.length > 0) {
      items.push({ isChord: false, text: part });
    }
  });

  return items;
}

/**
 * Merges a line of chords with a line of lyrics preserving character offsets
 */
function mergeChordAndLyricLines(chordLine, lyricLine) {
  const pairs = [];
  const chordMatches = [];
  
  // Extract chords and their character column indices
  const regex = /([A-G][#b]?(m|maj|dim|aug|add|sus|[0-9])*(b5|#5|b9|#9|#11|\/[A-G][#b]?)?)/gi;
  let match;
  while ((match = regex.exec(chordLine)) !== null) {
    chordMatches.push({ chord: match[0], index: match.index });
  }

  if (chordMatches.length === 0) {
    return [{ chord: null, lyric: lyricLine }];
  }

  let lastIndex = 0;
  for (let i = 0; i < chordMatches.length; i++) {
    const current = chordMatches[i];
    const nextIndex = (i + 1 < chordMatches.length) ? chordMatches[i + 1].index : Math.max(lyricLine.length, chordLine.length);

    const lyricSegment = lyricLine.substring(current.index, nextIndex);
    const leadingLyric = (current.index > lastIndex) ? lyricLine.substring(lastIndex, current.index) : "";

    if (leadingLyric) {
      pairs.push({ chord: null, lyric: leadingLyric });
    }

    pairs.push({ chord: current.chord, lyric: lyricSegment || " " });
    lastIndex = nextIndex;
  }

  if (lastIndex < lyricLine.length) {
    pairs.push({ chord: null, lyric: lyricLine.substring(lastIndex) });
  }

  return pairs;
}

/**
 * Intelligent AI Song Enhancer Simulator
 * Enhances raw pasted text with AI chord alignment and metadata inference.
 */
export function aiAutoEnhanceSong(rawText) {
  const parsed = parseSongText(rawText);
  
  // Infer rhythm if unknown
  if (!parsed.rhythm || parsed.rhythm === "4/4") {
    if (rawText.toLowerCase().includes("zamba") || rawText.toLowerCase().includes("vals")) {
      parsed.rhythm = "3/4 (Zamba/Vals)";
    } else if (rawText.toLowerCase().includes("bossa")) {
      parsed.rhythm = "4/4 (Bossa Nova)";
    } else if (rawText.toLowerCase().includes("reggae")) {
      parsed.rhythm = "4/4 (Reggae)";
    } else if (rawText.toLowerCase().includes("chacarera")) {
      parsed.rhythm = "6/8 (Chacarera)";
    }
  }

  return parsed;
}
