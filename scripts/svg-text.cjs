function escapeXML(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapText(text, maxChars = 45) {
  const words = String(text || '').trim().split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length <= maxChars) {
      cur = (cur + ' ' + w).trim();
    } else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function renderTextLines(x, y, text, maxChars = 45, fontSize = 11, color = '#1e293b', lineHeight = 16, weight = 'normal') {
  const lines = wrapText(text, maxChars);
  return lines.map((l, i) => `
    <text x="${x}" y="${y + i * lineHeight}" font-family="'DM Sans', system-ui, sans-serif" font-size="${fontSize}" font-weight="${weight}" fill="${color}">${escapeXML(l)}</text>
  `).join('');
}

module.exports = {
  escapeXML,
  wrapText,
  renderTextLines
};
