"""make analyses.job_id nullable and add career_report

Revision ID: 0002_optional_job_career_report
Revises: 0001_initial_schema
Create Date: 2026-06-22
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "0002_optional_job_career_report"
down_revision = "0001_initial_schema"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column("analyses", "job_id", existing_type=postgresql.UUID(as_uuid=True), nullable=True)
    op.add_column(
        "analyses",
        sa.Column("career_report", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("analyses", "career_report")
    op.alter_column("analyses", "job_id", existing_type=postgresql.UUID(as_uuid=True), nullable=False)
