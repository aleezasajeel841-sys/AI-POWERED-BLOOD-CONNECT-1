import app from "../server.js";
import { connectDB } from "../config/database.js";

let databaseConnection;

export default async function handler(req, res) {
  databaseConnection ??= connectDB();
  await databaseConnection;
  return app(req, res);
}
