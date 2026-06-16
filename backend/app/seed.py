"""
Seed script — creates the initial admin user and default blog posts.
Run with: python -m app.seed
"""
import asyncio
from app.database import async_session, init_db
from app.models.user import AdminUser
from app.models.blog import BlogPost
from app.middleware.auth import hash_password
from sqlalchemy import select


async def seed():
    """Create default admin user and default blog posts if none exist."""
    await init_db()

    async with async_session() as session:
        # Seed Admin
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

        # Seed Blog Posts
        blog_result = await session.execute(select(BlogPost))
        if not blog_result.scalars().first():
            posts = [
                BlogPost(
                    id=1,
                    title="The Role of Trade Unions in the Post-Pandemic Era",
                    description="Analyzing the shifting paradigms of worker rights, safety standards, and collective bargaining agreements in the wake of global industrial disruption. Unions must adapt to keep workers safe and ensure fair wages. Mr. Pandey spoke extensively on the importance of building robust safety infrastructure and revising compensation structures to align with inflation.\n\nWorkers and industries are not rivals, but are to help each other. They need to coordinate and coexist for the growth and betterment of society. In Jamshedpur, our unions have set a standard by cooperating with Tata Steel and other allied groups, ensuring zero production disruption while maintaining progressive hikes in wages.",
                    main_body="Analyzing the shifting paradigms of worker rights, safety standards, and collective bargaining agreements in the wake of global industrial disruption. Unions must adapt to keep workers safe and ensure fair wages. Mr. Pandey spoke extensively on the importance of building robust safety infrastructure and revising compensation structures to align with inflation.\n\nWorkers and industries are not rivals, but are to help each other. They need to coordinate and coexist for the growth and betterment of society. In Jamshedpur, our unions have set a standard by cooperating with Tata Steel and other allied groups, ensuring zero production disruption while maintaining progressive hikes in wages.",
                    image="blog/58.jpg",
                    likes_count=48,
                    view_count=142,
                    is_published=True
                ),
                BlogPost(
                    id=2,
                    title="Empowering Rural Jharkhand Through Education",
                    description="An overview of local initiatives, charity schools, and vocational training centers aimed at providing quality learning tools and bridging the digital divide for rural youths in Jamshedpur and surrounding districts.\n\nEducation is the most powerful weapon which you can use to change the world. By setting up community learning zones and partnering with local technology providers, we have brought smart classes to over 15 villages, empowering students with modern digital skills.",
                    main_body="An overview of local initiatives, charity schools, and vocational training centers aimed at providing quality learning tools and bridging the digital divide for rural youths in Jamshedpur and surrounding districts.\n\nEducation is the most powerful weapon which you can use to change the world. By setting up community learning zones and partnering with local technology providers, we have brought smart classes to over 15 villages, empowering students with modern digital skills.",
                    image="blog/g7.jpg",
                    likes_count=36,
                    view_count=95,
                    is_published=True
                ),
                BlogPost(
                    id=3,
                    title="Industrial Growth and Labor Coexistence",
                    description="Labor and industry are not rivals, but two wheels of the same chariot. Exploration of how collaborative union-management policies drive long-term productivity and ensure shared prosperity.\n\nFor industrial growth to be sustainable, it must be inclusive. When workers are treated as stakeholders, productivity naturally rises, and conflicts decrease.",
                    main_body="Labor and industry are not rivals, but two wheels of the same chariot. Exploration of how collaborative union-management policies drive long-term productivity and ensure shared prosperity.\n\nFor industrial growth to be sustainable, it must be inclusive. When workers are treated as stakeholders, productivity naturally rises, and conflicts decrease.",
                    image="blog/ec02.jpg",
                    likes_count=54,
                    view_count=120,
                    is_published=True
                )
            ]
            session.add_all(posts)
            await session.commit()
            print("✅ Default blog posts seeded successfully!")
        else:
            print("ℹ️  Blog posts already exist, skipping seed.")


if __name__ == "__main__":
    asyncio.run(seed())

