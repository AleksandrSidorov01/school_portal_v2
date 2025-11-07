import jwt from 'jsonwebtoken';
import config from '../config/config.js';

export const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

