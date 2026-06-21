/*
import express from "express";

// init express
const app = new express();
const port = 3001;

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});*/

import { getFullNetwork } from './dao-network.js';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { getUser, getUserById } from './dao-users.js';
import db from './db.js';

const app = express();
const port = 3001;

app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(session({
  secret: 'last-race-secret',
  resave: false,
  saveUninitialized: false
}));

passport.use(new LocalStrategy(async function verify(username, password, callback) {
  try {
    const user = await getUser(username, password);

    if (!user) {
      return callback(null, false, 'Incorrect username or password');
    }

    return callback(null, user);
  } catch (err) {
    return callback(err);
  }
}));

passport.serializeUser((user, callback) => {
  callback(null, user.id);
});

passport.deserializeUser(async (id, callback) => {
  try {
    const user = await getUserById(id);

    if (!user) {
      return callback(null, false);
    }

    return callback(null, user);
  } catch (err) {
    return callback(err);
  }
});

app.use(passport.authenticate('session'));

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.status(401).json({ error: 'Not authenticated' });
}

app.get('/api/health', (req, res) => {
  res.json({ message: 'Last Race server is running' });
});



app.post('/api/sessions', passport.authenticate('local'), (req, res) => {
  res.status(201).json(req.user);
});

app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

app.delete('/api/sessions/current', isLoggedIn, (req, res) => {
  req.logout(() => {
    res.status(204).end();
  });
});


app.get('/api/network', isLoggedIn, async (req, res) => {
  try {
    const network = await getFullNetwork();
    res.json(network);
  } catch (err) {
    console.error('Network error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/ranking', isLoggedIn, async (req, res) => {
  try {
    const ranking = await db.all(`
      SELECT users.username, users.name, MAX(games.score) AS bestScore
      FROM games
      JOIN users ON games.user_id = users.id
      GROUP BY users.id
      ORDER BY bestScore DESC
    `);

    res.json(ranking);
  } catch (err) {
    console.error('Ranking error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});