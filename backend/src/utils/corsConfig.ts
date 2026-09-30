export function getAllowedOrigins(): string | string[] {
  const allowed = process.env.ALLOWED_ORIGINS;
  if (process.env.NODE_ENV === 'production') {
    if (allowed && allowed.trim().length > 0) {
      const list = allowed.split(',').map((item) => item.trim()).filter(Boolean);
      if (list.length > 0) return list;
    }
    // Production fails closed: empty list prevents wildcard access
    return [];
  }

  if (allowed && allowed.trim().length > 0) {
    return allowed.split(',').map((item) => item.trim()).filter(Boolean);
  }

  return '*';
}
