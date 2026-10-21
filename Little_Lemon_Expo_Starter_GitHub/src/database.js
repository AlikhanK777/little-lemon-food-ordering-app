import * as SQLite from 'expo-sqlite';
import { DEMO_MENU_URL, normalizeMenu, SAMPLE_MENU } from './menuData';

let connectionPromise;

export function getDatabase() {
  if (!connectionPromise) {
    connectionPromise = SQLite.openDatabaseAsync('little-lemon.db').then(async (db) => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS user_profile (
          id INTEGER PRIMARY KEY NOT NULL,
          first_name TEXT NOT NULL,
          last_name TEXT,
          email TEXT NOT NULL,
          phone TEXT,
          notifications INTEGER NOT NULL DEFAULT 1
        );
        CREATE TABLE IF NOT EXISTS menu_items (
          id INTEGER PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          price REAL,
          category TEXT NOT NULL,
          emoji TEXT
        );
      `);
      return db;
    }).catch((error) => {
      connectionPromise = undefined;
      throw error;
    });
  }
  return connectionPromise;
}

export async function loadProfile(db) {
  const row = await db.getFirstAsync('SELECT * FROM user_profile WHERE id = 1');
  return row ? {
    firstName: row.first_name,
    lastName: row.last_name || '',
    email: row.email,
    phone: row.phone || '',
    notifications: Boolean(row.notifications),
  } : null;
}

export async function saveProfile(db, profile) {
  await db.runAsync(
    `INSERT INTO user_profile (id, first_name, last_name, email, phone, notifications)
     VALUES (1, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       first_name = excluded.first_name,
       last_name = excluded.last_name,
       email = excluded.email,
       phone = excluded.phone,
       notifications = excluded.notifications`,
    profile.firstName.trim(),
    (profile.lastName || '').trim(),
    profile.email.trim(),
    (profile.phone || '').trim(),
    profile.notifications ? 1 : 0,
  );
}

export async function deleteProfile(db) {
  await db.runAsync('DELETE FROM user_profile WHERE id = 1');
}

export async function loadMenu(db) {
  const stored = await db.getAllAsync('SELECT * FROM menu_items ORDER BY id');
  if (stored.length > 0) return stored;

  let items = SAMPLE_MENU;
  try {
    const controller = new AbortController();
    const handle = setTimeout(() => controller.abort(), 5000);
    let response;
    try {
      response = await fetch(DEMO_MENU_URL, { signal: controller.signal });
    } finally {
      clearTimeout(handle);
    }
    if (!response.ok) throw new Error('Menu fetch failed');
    const fetched = normalizeMenu(await response.json());
    if (fetched.length) items = fetched;
  } catch (error) {
    // Offline demo still works using local seed data.
    console.warn('Using offline sample menu:', String(error));
  }

  for (const item of items) {
    await db.runAsync(
      'INSERT OR REPLACE INTO menu_items (id, name, description, price, category, emoji) VALUES (?, ?, ?, ?, ?, ?)',
      item.id, item.name, item.description, item.price, item.category, item.emoji,
    );
  }
  return db.getAllAsync('SELECT * FROM menu_items ORDER BY id');
}
