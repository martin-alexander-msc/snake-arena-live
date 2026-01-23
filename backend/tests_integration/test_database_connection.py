"""
Integration tests for database connection and basic operations.
Verifies that the SQLite database setup works correctly.
"""

import pytest
from sqlalchemy import inspect
from sqlalchemy.orm import Session
from db_setup import Base
import sql_models


class TestDatabaseConnection:
    """Test database connection and initialization."""

    def test_database_connection(self, test_db_engine):
        """Test that the database connection is working."""
        with test_db_engine.connect() as connection:
            result = connection.execute(
                test_db_engine.dialect.compiler.process("SELECT 1", None)
            )
            assert result is not None

    def test_tables_exist(self, test_db_engine):
        """Test that all expected tables are created."""
        inspector = inspect(test_db_engine)
        tables = inspector.get_table_names()

        # Check for expected tables
        assert "user" in tables

    def test_user_table_columns(self, test_db_engine):
        """Test that the user table has the expected columns."""
        inspector = inspect(test_db_engine)
        columns = [col["name"] for col in inspector.get_columns("user")]

        expected_columns = ["id", "username", "email", "hashed_password"]
        for col in expected_columns:
            assert col in columns

    def test_user_table_constraints(self, test_db_engine):
        """Test that the user table has the expected constraints."""
        inspector = inspect(test_db_engine)
        
        # Check unique constraints
        unique_constraints = inspector.get_unique_constraints("user")
        column_names = [col for constraint in unique_constraints for col in constraint["column_names"]]
        
        assert "username" in column_names or "email" in column_names

    def test_database_session_operations(self, test_db_session: Session):
        """Test basic database session operations."""
        # Create
        user = sql_models.User(
            username="testuser",
            email="test@example.com",
            hashed_password="hashed_password"
        )
        test_db_session.add(user)
        test_db_session.commit()

        # Read
        retrieved = test_db_session.query(sql_models.User).first()
        assert retrieved is not None

        # Update
        retrieved.email = "newemail@example.com"
        test_db_session.commit()
        test_db_session.refresh(retrieved)
        assert retrieved.email == "newemail@example.com"

        # Delete
        test_db_session.delete(retrieved)
        test_db_session.commit()
        deleted = test_db_session.query(sql_models.User).first()
        assert deleted is None


class TestDatabaseIsolation:
    """Test that database tests are properly isolated."""

    def test_first_isolation(self, test_db_session: Session):
        """First test to verify isolation."""
        count_before = test_db_session.query(sql_models.User).count()
        assert count_before == 0

        user = sql_models.User(
            username="user1",
            email="user1@example.com",
            hashed_password="pass1"
        )
        test_db_session.add(user)
        test_db_session.commit()

        count_after = test_db_session.query(sql_models.User).count()
        assert count_after == 1

    def test_second_isolation(self, test_db_session: Session):
        """Second test to verify isolation - should start fresh."""
        count = test_db_session.query(sql_models.User).count()
        assert count == 0

    def test_third_isolation(self, test_db_session: Session):
        """Third test to verify isolation - should also start fresh."""
        count = test_db_session.query(sql_models.User).count()
        assert count == 0
