import bcrypt from 'bcryptjs';
import db from './db.js';

export async function getUser(username, password) {
  const user = await db.get(
    'SELECT * FROM users WHERE username = ?',
    username
  );

  if (!user) {
    return false;
  }

  const validPassword = bcrypt.compareSync(password, user.hash);

  if (!validPassword) {
    return false;
  }

  return {
    id: user.id,
    username: user.username,
    name: user.name
  };
}

export async function getUserById(id) {
  const user = await db.get(
    'SELECT id, username, name FROM users WHERE id = ?',
    id
  );

  if (!user) {
    return false;
  }

  return user;
}