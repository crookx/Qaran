import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const {
  NODE_ENV = 'development',
  PORT = 8080,
  MONGODB_URI,
  MONGODB_LOCAL_URI = 'mongodb://localhost:27017/qaran',
  JWT_SECRET,
  FRONTEND_URL = 'http://localhost:3000'
} = process.env;

export const isDev = NODE_ENV === 'development';
export const isProd = NODE_ENV === 'production';