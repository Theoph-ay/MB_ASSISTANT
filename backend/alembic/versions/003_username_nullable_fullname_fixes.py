"""Make username nullable, drop full_name unique, add full_name index

Revision ID: 003
Revises: 002
Create Date: 2026-03-21
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    from sqlalchemy import inspect as sa_inspect
    conn = op.get_bind()
    inspector = sa_inspect(conn)

    # --- Make username nullable ---
    op.alter_column("users", "username", existing_type=sa.String(50), nullable=True)

    # --- Drop full_name unique constraint if it exists ---
    # The constraint name varies depending on how it was created
    user_ucs = [uc["name"] for uc in inspector.get_unique_constraints("users")]
    for uc_name in user_ucs:
        # Find any unique constraint that covers full_name
        uc = next((u for u in inspector.get_unique_constraints("users") if u["name"] == uc_name and "full_name" in u["column_names"]), None)
        if uc:
            op.drop_constraint(uc_name, "users", type_="unique")

    # --- Add full_name index if missing ---
    user_indexes = [idx["name"] for idx in inspector.get_indexes("users")]
    if "ix_users_full_name" not in user_indexes:
        op.create_index(op.f("ix_users_full_name"), "users", ["full_name"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_users_full_name"), table_name="users")
    op.alter_column("users", "username", existing_type=sa.String(50), nullable=False)
