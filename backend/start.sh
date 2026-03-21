#!/bin/sh
set -e

echo "MB_ASSISTANT: Preparing database migrations..."

# Fix: If alembic_version has a stale revision that no longer exists 
# (e.g. '001'), clear it so we can start fresh from the real migration history.
uv run python -c "
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from src.core.config import settings

async def fix_stale_revision():
    engine = create_async_engine(settings.DATABASE_URL)
    async with engine.begin() as conn:
        # Check if alembic_version table exists
        result = await conn.execute(text(
            \"SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'alembic_version')\"
        ))
        exists = result.scalar()
        if exists:
            result = await conn.execute(text('SELECT version_num FROM alembic_version'))
            row = result.first()
            if row:
                current = row[0]
                print(f'Current alembic revision: {current}')
                # If the revision doesn't match any known migration, clear it
                known_revisions = ['001', '002', '003']
                if current not in known_revisions:
                    print(f'Stale revision {current} detected. Clearing alembic_version...')
                    await conn.execute(text('DELETE FROM alembic_version'))
    await engine.dispose()

asyncio.run(fix_stale_revision())
" 2>&1 || echo "Note: Could not check alembic_version (DB may be fresh)"

echo "MB_ASSISTANT: Running Alembic migrations..."
uv run alembic upgrade head

echo "MB_ASSISTANT: Starting Uvicorn..."
exec uv run uvicorn main:app --host 0.0.0.0 --port 8000
