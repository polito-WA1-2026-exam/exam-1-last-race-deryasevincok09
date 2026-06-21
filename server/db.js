import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const db = await open({
  filename: path.join(dirname, 'last-race.sqlite'),
  driver: sqlite3.Database
});

export default db;