#!/bin/sh
set -e

echo "🔄 Running database migrations..."

# Wait for postgres to be ready
echo "⏳ Waiting for PostgreSQL..."
until node -e "
  const postgres = require('postgres');
  const sql = postgres(process.env.DATABASE_URL);
  sql\`SELECT 1\`.then(() => {
    console.log('✓ PostgreSQL is ready!');
    sql.end();
    process.exit(0);
  }).catch(() => process.exit(1));
" 2>/dev/null; do
  echo "   PostgreSQL is unavailable - sleeping"
  sleep 2
done

# Run migrations
echo "📦 Pushing schema changes..."
npx drizzle-kit push --config=drizzle.config.js

if [ $? -eq 0 ]; then
  echo "✓ Migrations completed successfully"
else
  echo "✗ Migration failed"
  exit 1
fi

echo "🚀 Starting application..."
exec "$@"
