import app from './app.js';
import { env } from './config/env.js';
import { testConnection } from './config/db.js';

async function start() {
  try {
    await testConnection();
    console.log('MySQL connection established');
  } catch (error) {
    console.error('Failed to connect to MySQL:', error.message);
    console.error('Run "npm run db:setup" from the server folder after configuring .env');
    process.exit(1);
  }

  app.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}`);
  });
}

start();
