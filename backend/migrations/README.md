# Database workflow

1. Copy the backend environment values into `.env` and make sure MySQL is running.
2. Run `npm run db:setup` from `backend/` on a fresh machine. It creates the configured database, runs pending migrations, and exits.
3. Run `npm run db:migrate` after adding a new migration file. Applied migration names are stored in `schema_migrations`.
4. Start the API with `npm run dev` or `npm start`. Startup also runs pending migrations before listening.

Add future migrations as sortable files such as `002-add-index.js` exporting `name` and an async `up({ sequelize, transaction })` function. Keep each migration forward-only and make it safe to run once.
