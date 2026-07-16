import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { env } from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';

export async function login(email, password) {
  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const users = await query('SELECT * FROM users WHERE email = ?', [email]);

  if (users.length === 0) {
    throw new AppError('Invalid email or password', 401);
  }

  const user = users[0];
  const isValid = await bcrypt.compare(password, user.password_hash);

  if (!isValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export async function getUserById(id) {
  const users = await query(
    'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?',
    [id]
  );

  if (users.length === 0) {
    throw new AppError('User not found', 404);
  }

  return users[0];
}
