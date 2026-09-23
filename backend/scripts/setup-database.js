import { connectDB, sequelize } from '../config/database.js';

try {
  await connectDB();
  console.log('Database setup complete');
} finally {
  await sequelize.close();
}
