export function normalizePhone(input: string) {
  const digits = input.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return digits;
  const bare = digits.replace(/^0+/, '');
  // Default to India (+91) for 10-digit local numbers.
  return bare.length === 10 ? `+91${bare}` : `+${bare}`;
}

export function normalizeEmail(input: string) {
  return input.trim().toLowerCase();
}

export function isValidPhone(input: string) {
  const digits = input.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 13;
}

export function isValidEmail(input: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.trim());
}

/** Parses "DD/MM/YYYY" into ISO "YYYY-MM-DD", or null if invalid. */
export function parseDob(input: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(input.trim());
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  if (d.getFullYear() !== Number(yyyy) || d.getMonth() !== Number(mm) - 1 || d.getDate() !== Number(dd)) {
    return null;
  }
  return `${yyyy}-${mm}-${dd}`;
}

export function formatDob(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/** Inserts slashes as the user types a date: 12041990 → 12/04/1990 */
export function maskDob(input: string) {
  const digits = input.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function ageFromDob(iso: string, now = new Date()) {
  const [y, m, d] = iso.split('-').map(Number);
  let age = now.getFullYear() - y;
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) age--;
  return age;
}

export function formatHeight(inches?: number) {
  if (!inches) return null;
  return `${Math.floor(inches / 12)}.${inches % 12}ft`;
}

/** "5.7" or "5'7" → 67 inches. */
export function parseHeight(input: string): number | null {
  const m = /^(\d)\s*[.'\s]\s*(\d{1,2})/.exec(input.trim());
  if (!m) return null;
  const ft = Number(m[1]);
  const inch = Number(m[2]);
  if (ft < 3 || ft > 8 || inch > 11) return null;
  return ft * 12 + inch;
}
