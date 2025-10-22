import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory (two levels up from config/)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Verify NASA API key is loaded
if (process.env.NASA_API_KEY) {
  console.log('✅ Environment loaded: NASA API Key found');
} else {
  console.warn('⚠️  Environment loaded: NASA_API_KEY not found, will use DEMO_KEY');
}

export default process.env;

