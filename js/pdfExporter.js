/**
 * GoodChord - PDF & Printable Sheet Exporter
 * Generates a clean, print-ready document formatted for sheet music & songbooks.
 */

export function exportSongToPDF(song, currentTranspositionKey, chordList = []) {
  // Trigger standard browser print which outputs a high-resolution PDF
  const originalTitle = document.title;
  document.title = `${song.title} - ${song.artist} [GoodChord Sheet]`;
  
  window.print();

  setTimeout(() => {
    document.title = originalTitle;
  }, 1000);
}
