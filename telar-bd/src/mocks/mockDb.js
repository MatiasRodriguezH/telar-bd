const PREFIX = 'restaurante_db_';

export function simulateDelay(ms = 180) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function readCollection(tableName, seedData = []) {
  const key = `${PREFIX}${tableName}`;
  const raw = localStorage.getItem(key);

  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // Si el JSON se corrompe, restauramos la semilla
    }
  }

  localStorage.setItem(key, JSON.stringify(seedData));
  return structuredClone(seedData);
}

export function writeCollection(tableName, items) {
  const key = `${PREFIX}${tableName}`;
  localStorage.setItem(key, JSON.stringify(items));
  return items;
}

export function nextId(items, idField) {
  if (!items.length) return 1;
  return Math.max(...items.map((item) => Number(item[idField] || 0))) + 1;
}

export function resetMockDb() {
  Object.keys(localStorage)
    .filter((key) => key.startsWith(PREFIX))
    .forEach((key) => localStorage.removeItem(key));
}