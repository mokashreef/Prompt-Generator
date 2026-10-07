/**
 * Prompt Generator - Lightweight In-Browser Diff Generator
 * Zero external libraries. Computes line & word diffs for visual inspection.
 */

export const diffViewer = {
  /**
   * Generates formatted HTML comparing original and improved texts
   * @param {string} original - Original text
   * @param {string} improved - Improved text
   * @returns {string} Safe HTML with .diff-del and .diff-ins markers
   */
  generateHtml(original, improved) {
    if (!original && !improved) return "";
    if (!original) return `<div class="diff-block"><span class="diff-ins">${this._escape(improved)}</span></div>`;
    if (!improved) return `<div class="diff-block"><span class="diff-del">${this._escape(original)}</span></div>`;

    const origLines = original.split("\n");
    const impLines = improved.split("\n");

    const htmlLines = [];
    const max = Math.max(origLines.length, impLines.length);

    for (let i = 0; i < max; i++) {
      const o = origLines[i];
      const m = impLines[i];

      if (o === undefined) {
        // Line added
        htmlLines.push(`<div class="diff-line diff-added"><span class="diff-prefix">+</span> <span class="diff-text">${this._escape(m)}</span></div>`);
      } else if (m === undefined) {
        // Line removed
        htmlLines.push(`<div class="diff-line diff-removed"><span class="diff-prefix">-</span> <span class="diff-text">${this._escape(o)}</span></div>`);
      } else if (o === m) {
        // Unchanged line
        htmlLines.push(`<div class="diff-line diff-unchanged"><span class="diff-prefix"> </span> <span class="diff-text">${this._escape(o)}</span></div>`);
      } else {
        // Line modified: compare words
        const wordDiff = this._computeWordDiff(o, m);
        htmlLines.push(`<div class="diff-line diff-modified"><span class="diff-prefix">~</span> <span class="diff-text">${wordDiff}</span></div>`);
      }
    }

    return `<div class="diff-container">${htmlLines.join("")}</div>`;
  },

  _computeWordDiff(origLine, impLine) {
    const oWords = origLine.split(/(\s+)/);
    const mWords = impLine.split(/(\s+)/);

    let result = "";
    let oi = 0, mi = 0;

    while (oi < oWords.length || mi < mWords.length) {
      if (oi < oWords.length && mi < mWords.length && oWords[oi] === mWords[mi]) {
        result += this._escape(oWords[oi]);
        oi++;
        mi++;
      } else if (mi < mWords.length) {
        result += `<span class="diff-ins">${this._escape(mWords[mi])}</span>`;
        mi++;
      } else if (oi < oWords.length) {
        result += `<span class="diff-del">${this._escape(oWords[oi])}</span>`;
        oi++;
      }
    }

    return result;
  },

  _escape(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
};
