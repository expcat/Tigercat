const colors = {
  red: '\u001b[0;31m',
  green: '\u001b[0;32m',
  yellow: '\u001b[1;33m',
  blue: '\u001b[0;34m',
  reset: '\u001b[0m',
};

const useColor = Boolean(process.stdout.isTTY);

export function c(color, text) {
  if (!useColor) return text;
  return `${colors[color]}${text}${colors.reset}`;
}
