"""
Integration tests for user database operations.
Tests the User model and database constraints.
"""

import pytest
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
import sql_models


class TestUserCreation:
    """Test user creation and basic database operations."""

    def test_create_user(self, test_db_session: Session):
        """Test creating a new user in the database."""
        user = sql_models.User(
            username="testuser",
            email="test@example.com",
            hashed_password="hashed_password_123"
        )
        test_db_session.add(user)
        test_db_session.commit()
        test_db_session.refresh(user)

        assert user.id is not None
        assert user.username == "testuser"
        assert user.email == "test@example.com"
        assert user.hashed_password == "hashed_password_123"

    def test_retrieve_user_by_username(self, test_db_session: Session):
        """Test retrieving a user by username."""
        user = sql_models.User(
            username="testuser",
            email="test@example.com",
            hashed_password="hashed_password_123"
        )
        test_db_session.add(user)
        test_db_session.commit()

        retrieved_user = test_db_session.query(sql_models.User).filter(
            sql_models.User.username == "testuser"
        ).first()

        assert retrieved_user is not None
        assert retrieved_user.username == "testuser"
        assert retrieved_user.email == "test@example.com"

    def test_retrieve_user_by_email(self, test_db_session: Session):
        """Test retrieving a user by email."""
        user = sql_models.User(
            username="testuser",
            email="test@example.com",
            hashed_password="hashed_password_123"
        )
        test_db_session.add(user)
        test_db_session.commit()

        retrieved_user = test_db_session.query(sql_models.User).filter(
            sql_models.User.email == "test@example.com"
        ).first()

        assert retrieved_user is not None
        assert retrieved_user.username == "testuser"

    def test_duplicate_username_raises_error(self, test_db_session: Session):
        """Test that duplicate usernames raise an integrity error."""
        user1 = sql_models.User(
            username="testuser",
            email="test1@example.com",
            hashed_password="hashed_password_123"
        )
        test_db_session.add(user1)
        test_db_session.commit()

        user2 = sql_models.User(
            username="testuser",
            email="test2@example.com",
            hashed_password="hashed_password_456"
        )
        test_db_session.add(user2)

        with pytest.raises(IntegrityError):
            test_db_session.commit()

    def test_duplicate_email_raises_error(self, test_db_session: Session):
        """Test that duplicate emails raise an integrity error."""
        user1 = sql_models.User(
            username="user1",
            email="test@example.com",
            hashed_password="hashed_password_123"
        )
        test_db_session.add(user1)
        test_db_session.commit()

        user2 = sql_models.User(
            username="user2",
            email="test@example.com",
            hashed_password="hashed_password_456"
        )
        test_db_session.add(user2)

        with pytest.raises(IntegrityError):
            test_db_session.commit()

    def test_update_user(self, test_db_session: Session):
        """Test updating a user's information."""
        user = sql_models.User(
            username="testuser",
            email="test@example.com",
            hashed_password="hashed_password_123"
        )
        test_db_session.add(user)
        test_db_session.commit()

        user.email = "newemail@example.com"
        test_db_session.commit()
        test_db_session.refresh(user)

        assert user.email == "newemail@example.com"

    def test_delete_user(self, test_db_session: Session):
        """Test deleting a user."""
        user = sql_models.User(
            username="testuser",
            email="test@example.com",
            hashed_password="hashed_password_123"
        )
        test_db_session.add(user)
        test_db_session.commit()
        user_id = user.id

        test_db_session.delete(user)
        test_db_session.commit()

        deleted_user = test_db_session.query(sql_models.User).filter(
            sql_models.User.id == user_id
        ).first()

        assert deleted_user is None


class TestUserQuery:
    """Test querying multiple users."""

    def test_get_all_users(self, test_db_session: Session):
        """Test retrieving all users."""
        users_data = [
            ("user1", "user1@example.com", "pass1"),
            ("user2", "user2@example.com", "pass2"),
            ("user3", "user3@example.com", "pass3"),
        ]

        for username, email, password in users_data:
            user = sql_models.User(
                username=username,
                email=email,
                hashed_password=password
            )
            test_db_session.add(user)
        test_db_session.commit()

        all_users = test_db_session.query(sql_models.User).all()

        assert len(all_users) == 3
        assert all(isinstance(u, sql_models.User) for u in all_users)

    def test_user_count(self, test_db_session: Session):
        """Test counting users in the database."""
        for i in range(5):
            user = sql_models.User(
                username=f"user{i}",
                email=f"user{i}@example.com",
                hashed_password=f"pass{i}"
            )
            test_db_session.add(user)
        test_db_session.commit()

        count = test_db_session.query(sql_models.User).count()

        assert count == 5
