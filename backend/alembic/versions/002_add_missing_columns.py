"""Add missing columns to users and chats

Revision ID: 002
Revises: 001
Create Date: 2026-03-21
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
import sqlmodel

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    from sqlalchemy import inspect as sa_inspect
    conn = op.get_bind()
    inspector = sa_inspect(conn)

    # --- Users: add missing columns ---
    user_columns = [col["name"] for col in inspector.get_columns("users")]

    if "google_id" not in user_columns:
        op.add_column("users", sa.Column("google_id", sqlmodel.sql.sqltypes.AutoString(), nullable=True))
        op.create_unique_constraint("uq_users_google_id", "users", ["google_id"])

    if "auth_provider" not in user_columns:
        op.add_column("users", sa.Column("auth_provider", sqlmodel.sql.sqltypes.AutoString(), nullable=False, server_default="local"))

    if "is_verified" not in user_columns:
        op.add_column("users", sa.Column("is_verified", sa.Boolean(), nullable=False, server_default=sa.text("false")))

    # Drop old is_active column if it exists (replaced by is_verified)
    if "is_active" in user_columns:
        op.drop_column("users", "is_active")

    # Fix hashed_password: must be nullable for Google OAuth users
    if "hashed_password" in user_columns:
        op.alter_column("users", "hashed_password", existing_type=sa.String(), nullable=True)

    # --- Chats: add missing columns ---
    chat_columns = [col["name"] for col in inspector.get_columns("chats")]

    if "share_id" not in chat_columns:
        op.add_column("chats", sa.Column("share_id", sqlmodel.sql.sqltypes.AutoString(), nullable=True))
        op.create_unique_constraint("uq_chats_share_id", "chats", ["share_id"])
        op.create_index(op.f("ix_chats_share_id"), "chats", ["share_id"], unique=True)

    if "is_shared" not in chat_columns:
        op.add_column("chats", sa.Column("is_shared", sa.Boolean(), nullable=False, server_default=sa.text("false")))


def downgrade() -> None:
    op.drop_column("chats", "is_shared")
    op.drop_index(op.f("ix_chats_share_id"), table_name="chats")
    op.drop_constraint("uq_chats_share_id", "chats", type_="unique")
    op.drop_column("chats", "share_id")

    op.add_column("users", sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")))
    op.drop_column("users", "is_verified")
    op.drop_column("users", "auth_provider")
    op.drop_constraint("uq_users_google_id", "users", type_="unique")
    op.drop_column("users", "google_id")
