import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "@shared/schema";

// Para desarrollo local, usar una base de datos SQLite
console.log("Configurando base de datos SQLite para desarrollo...");
const sqlite = new Database('./dev.db');
const db = drizzle(sqlite, { schema });

export { db };
