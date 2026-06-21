import bcrypt from 'bcryptjs';
import db from './db.js';

async function initDatabase() {
  await db.exec(`
    DROP TABLE IF EXISTS games;
    DROP TABLE IF EXISTS events;
    DROP TABLE IF EXISTS segments;
    DROP TABLE IF EXISTS station_lines;
    DROP TABLE IF EXISTS stations;
    DROP TABLE IF EXISTS metro_lines;
    DROP TABLE IF EXISTS users;

    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      hash TEXT NOT NULL,
      salt TEXT NOT NULL
    );

    CREATE TABLE games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      score INTEGER NOT NULL,
      completed_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE stations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE metro_lines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL
    );

    CREATE TABLE station_lines (
      station_id INTEGER NOT NULL,
      line_id INTEGER NOT NULL,
      PRIMARY KEY (station_id, line_id),
      FOREIGN KEY (station_id) REFERENCES stations(id),
      FOREIGN KEY (line_id) REFERENCES metro_lines(id)
    );

    CREATE TABLE segments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      line_id INTEGER NOT NULL,
      station1_id INTEGER NOT NULL,
      station2_id INTEGER NOT NULL,
      FOREIGN KEY (line_id) REFERENCES metro_lines(id),
      FOREIGN KEY (station1_id) REFERENCES stations(id),
      FOREIGN KEY (station2_id) REFERENCES stations(id),
      CHECK (station1_id <> station2_id)
    );

    CREATE TABLE events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      effect INTEGER NOT NULL CHECK (effect >= -4 AND effect <= 4)
    );
  `);

  const users = [
    { username: 'alice@example.com', name: 'Alice', password: 'password' },
    { username: 'bob@example.com', name: 'Bob', password: 'password' },
    { username: 'carol@example.com', name: 'Carol', password: 'password' }
  ];

  for (const user of users) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(user.password, salt);

    await db.run(
      'INSERT INTO users (username, name, hash, salt) VALUES (?, ?, ?, ?)',
      user.username,
      user.name,
      hash,
      salt
    );
  }

  await db.run(
    'INSERT INTO games (user_id, score, completed_at) VALUES (?, ?, ?)',
    1,
    10,
    new Date().toISOString()
  );

  await db.run(
    'INSERT INTO games (user_id, score, completed_at) VALUES (?, ?, ?)',
    2,
    15,
    new Date().toISOString()
  );

  const stationNames = [
    'Central',
    'Museum',
    'Harbor',
    'Old Gate',
    'University',
    'Garden',
    'Library',
    'Stadium',
    'Airport',
    'Market',
    'Castle',
    'River Park',
    'City Hall',
    'Theater'
  ];

  for (const name of stationNames) {
    await db.run('INSERT INTO stations (name) VALUES (?)', name);
  }

  const lines = [
    { name: 'Red Line', color: 'red' },
    { name: 'Blue Line', color: 'blue' },
    { name: 'Green Line', color: 'green' },
    { name: 'Yellow Line', color: 'gold' }
  ];

  for (const line of lines) {
    await db.run(
      'INSERT INTO metro_lines (name, color) VALUES (?, ?)',
      line.name,
      line.color
    );
  }

  const stationIds = await getIdsByName('stations');
  const lineIds = await getIdsByName('metro_lines');

  const lineStations = {
    'Red Line': ['Central', 'Museum', 'Harbor', 'Old Gate', 'University'],
    'Blue Line': ['Central', 'Garden', 'Library', 'Stadium', 'Airport'],
    'Green Line': ['Museum', 'Garden', 'Market', 'Castle', 'River Park'],
    'Yellow Line': ['Old Gate', 'Castle', 'City Hall', 'Theater', 'Airport']
  };

  for (const [lineName, stations] of Object.entries(lineStations)) {
    const lineId = lineIds[lineName];

    for (const stationName of stations) {
      await db.run(
        'INSERT INTO station_lines (station_id, line_id) VALUES (?, ?)',
        stationIds[stationName],
        lineId
      );
    }

    for (let i = 0; i < stations.length - 1; i++) {
      await db.run(
        'INSERT INTO segments (line_id, station1_id, station2_id) VALUES (?, ?, ?)',
        lineId,
        stationIds[stations[i]],
        stationIds[stations[i + 1]]
      );
    }
  }

  const events = [
    { description: 'Quiet journey', effect: 0 },
    { description: 'Wrong platform', effect: -2 },
    { description: 'Kind passenger', effect: 1 },
    { description: 'Ticket inspection bonus', effect: 2 },
    { description: 'Lost backpack', effect: -3 },
    { description: 'Fast connection', effect: 3 },
    { description: 'Crowded train', effect: -1 },
    { description: 'Lucky shortcut', effect: 4 },
    { description: 'Signal delay', effect: -4 }
  ];

  for (const event of events) {
    await db.run(
      'INSERT INTO events (description, effect) VALUES (?, ?)',
      event.description,
      event.effect
    );
  }

  console.log('Database initialized successfully.');
}

async function getIdsByName(tableName) {
  const rows = await db.all(`SELECT id, name FROM ${tableName}`);
  const result = {};

  for (const row of rows) {
    result[row.name] = row.id;
  }

  return result;
}

initDatabase();