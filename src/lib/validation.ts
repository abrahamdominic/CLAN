export function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validName(name: string): boolean {
  return name.trim().length >= 2;
}

export function validMessage(msg: string): boolean {
  return msg.trim().length >= 5;
}

export function sanitizeText(input: string): string {
  return String(input || "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

export function truncate(input: string, max: number): string {
  const v = String(input || "");
  return v.length > max ? v.slice(0, max) : v;
}
