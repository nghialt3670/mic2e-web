#!/bin/sh
set -e

echo "🔄 Running database migrations..."
echo "📍 DATABASE_URL: ${DATABASE_URL}"

# Wait for postgres to be ready
echo "⏳ Waiting for PostgreSQL..."
MAX_RETRIES=30
RETRY_COUNT=0

until [ $RETRY_COUNT -ge $MAX_RETRIES ]; do
  if pg_isready -d "${DATABASE_URL}" > /dev/null 2>&1; then
    echo "✓ PostgreSQL is ready!"
    break
  fi
  
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "   PostgreSQL is unavailable (attempt $RETRY_COUNT/$MAX_RETRIES) - sleeping"
  
  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo "✗ PostgreSQL did not become ready in time"
    exit 1
  fi
  
  sleep 2
done

# Run migrations
echo "📦 Running migrations..."
export DRIZZLE_DATABASE_URL="${DATABASE_URL}"

npx drizzle-kit migrate --config=drizzle.config.js

if [ $? -eq 0 ]; then
  echo "✓ Migrations completed successfully"
else
  echo "✗ Migration failed"
  exit 1
fi

echo "🚀 Starting application..."
exec "$@"
