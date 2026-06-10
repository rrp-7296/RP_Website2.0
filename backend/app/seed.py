"""
Seed script — creates the initial admin user.
Run with: python -m app.seed
"""
import asyncio
from app.database import async_session, init_db
from app.models.user import AdminUser
from app.middleware.auth import hash_password
from sqlalchemy import select


async def seed():
    """Create default admin user if none exists."""
    await init_db()

    async with async_session() as session:
        result = await session.execute(select(AdminUser))
        if result.scalar_one_or_none() is None:
            admin = AdminUser(
                username="admin",
                password_hash=hash_password("admin123"),
                display_name="Rakeshwar Pandey",
                email="rakeshwarpandey@gmail.com",
            )
            session.add(admin)
            await session.commit()
            print("✅ Admin user created: username='admin', password='admin123'")
            print("⚠️  Change the password immediately in production!")
        else:
            print("ℹ️  Admin user already exists, skipping seed.")


if __name__ == "__main__":
    asyncio.run(seed())
