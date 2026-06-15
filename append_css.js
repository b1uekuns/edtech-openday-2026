const fs = require('fs');
const path = require('path');

const lightCss = `
/* ── LIGHT THEME OVERRIDES ── */
[data-theme="light"] {
  --bg: #f8fafc;
  --text: #0f172a;
  --text-main: #0f172a;
  --muted: #475569;
  --subtle: #cbd5e1;
  --glass-rgb: 0, 0, 0;

  --glass-bg: rgba(0, 0, 0, 0.03);
  --glass-bg-h: rgba(0, 0, 0, 0.06);
  --glass-border: rgba(0, 0, 0, 0.08);
  --glass-border-h: rgba(0, 0, 0, 0.12);
  --glass-inset: inset 0 1px 0 rgba(255, 255, 255, 0.5);

  --shadow-sm: 0 4px 16px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 8px 32px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 24px 56px rgba(0, 0, 0, 0.12);
}
`;

fs.appendFileSync(path.join(__dirname, 'assets', 'css', 'main.css'), lightCss, 'utf8');
console.log('Appended light theme to main.css');
