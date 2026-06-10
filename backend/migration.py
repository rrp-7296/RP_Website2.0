"""
Website 2.0 — Legacy MySQL to New Database Migration Script
Run with: python migration.py --source "mysql+pymysql://rakes_rrp7296:Ravi@7296@localhost:5236/rakeshwarpandey_blogdtls" --dest "mysql+pymysql://root:password@localhost:5236/rakeshwarpandey_v2"
"""
import argparse
import sys
from datetime import datetime
from sqlalchemy import create_engine, text

# Page ID mappings from legacy metrics table
PAGE_MAPPINGS = {
    1: "Home",
    2: "Biography",
    3: "Education & Career",
    4: "Leader Beyond Politics",
    5: "Timeline",
    6: "Blog List",
    7: "Gallery Index",
    8: "Gallery Details",
    9: "News Archive"
}

def migrate(source_url, dest_url):
    print(f"Connecting to source database: {source_url}")
    try:
        source_engine = create_engine(source_url)
        source_conn = source_engine.connect()
    except Exception as e:
        print(f"ERROR: Cannot connect to source database: {e}")
        sys.exit(1)

    print(f"Connecting to destination database: {dest_url}")
    try:
        dest_engine = create_engine(dest_url)
        dest_conn = dest_engine.connect()
    except Exception as e:
        print(f"ERROR: Cannot connect to destination database: {e}")
        source_conn.close()
        sys.exit(1)

    # Begin migration transaction
    trans = dest_conn.begin()
    try:
        # 1. Migrate Subscriptions
        print("Migrating subscriptions...")
        res = source_conn.execute(text("SELECT email, date FROM subscription"))
        count = 0
        for row in res:
            try:
                sub_date = datetime.strptime(row[1], "%Y/%m/%d") if row[1] else datetime.now()
            except:
                sub_date = datetime.now()
            
            dest_conn.execute(
                text("INSERT INTO subscriptions (email, subscribed_at) VALUES (:email, :date) ON DUPLICATE KEY UPDATE email=email"),
                {"email": row[0], "date": sub_date}
            )
            count += 1
        print(f"✓ Migrated {count} subscriptions.")

        # 2. Migrate Timeline
        print("Migrating timeline events...")
        res = source_conn.execute(text("SELECT post_id, text, location, date, image FROM new_timeline"))
        count = 0
        for row in res:
            try:
                evt_date = datetime.strptime(row[3], "%Y-%m-%d") if row[3] else datetime.now()
            except:
                evt_date = datetime.now()
            
            dest_conn.execute(
                text("INSERT INTO timeline_events (id, text, location, date, image, add_to_gallery, is_deleted) "
                     "VALUES (:id, :text, :location, :date, :image, 1, 0) "
                     "ON DUPLICATE KEY UPDATE text=:text, location=:location"),
                {"id": row[0], "text": row[1], "location": row[2] or "", "date": evt_date, "image": row[4]}
            )
            count += 1
        print(f"✓ Migrated {count} timeline events.")

        # 3. Migrate News
        print("Migrating news items...")
        res = source_conn.execute(text("SELECT news_id, title, text, url, image, date FROM new_news"))
        count = 0
        for row in res:
            try:
                news_date = datetime.strptime(row[5], "%Y-%m-%d") if row[5] else datetime.now()
            except:
                news_date = datetime.now()
            
            dest_conn.execute(
                text("INSERT INTO news_items (id, title, text, url, image, date, is_deleted) "
                     "VALUES (:id, :title, :text, :url, :image, :date, 0) "
                     "ON DUPLICATE KEY UPDATE title=:title, text=:text, url=:url"),
                {"id": row[0], "title": row[1], "text": row[2], "url": row[3] or "", "image": row[4], "date": news_date}
            )
            count += 1
        print(f"✓ Migrated {count} news items.")

        # 4. Migrate Blog Posts (with Views count from blog_post_hits)
        print("Migrating blog posts...")
        res = source_conn.execute(text("SELECT post_id, title, description, main_body, date, post_like, image FROM new_blog"))
        count = 0
        for row in res:
            post_id = row[0]
            # Fetch views count
            view_res = source_conn.execute(text("SELECT hits FROM blog_post_hits WHERE id = :id"), {"id": post_id}).fetchone()
            views = view_res[0] if view_res else 0
            
            try:
                blog_date = datetime.strptime(row[4], "%Y-%m-%d") if row[4] else datetime.now()
            except:
                blog_date = datetime.now()

            dest_conn.execute(
                text("INSERT INTO blog_posts (id, title, description, main_body, date, image, view_count, likes_count, is_published, is_deleted) "
                     "VALUES (:id, :title, :desc, :body, :date, :img, :views, :likes, 1, 0) "
                     "ON DUPLICATE KEY UPDATE title=:title, description=:desc, main_body=:body"),
                {
                    "id": post_id, "title": row[1], "desc": row[2] or "", "body": row[3], 
                    "date": blog_date, "img": row[6], "views": views, "likes": row[5] or 0
                }
            )
            count += 1
        print(f"✓ Migrated {count} blog posts.")

        # 5. Migrate Comments (Pending & Approved)
        print("Migrating blog comments...")
        count = 0
        # 5.a Pending comments
        res = source_conn.execute(text("SELECT name, post_id, datetime, comment, email FROM comments"))
        for row in res:
            try:
                c_date = datetime.strptime(row[2], "%Y-%m-%d %H:%M:%S") if row[2] else datetime.now()
            except:
                c_date = datetime.now()
            dest_conn.execute(
                text("INSERT INTO blog_comments (name, email, comment, is_approved, created_at, post_id) "
                     "VALUES (:name, :email, :text, 0, :date, :post_id)"),
                {"name": row[0], "email": row[4] or "", "text": row[3], "date": c_date, "post_id": row[1]}
            )
            count += 1
        # 5.b Approved comments
        res = source_conn.execute(text("SELECT name, post_id, datetime, comment, email FROM approved_comments"))
        for row in res:
            try:
                c_date = datetime.strptime(row[2], "%Y-%m-%d %H:%M:%S") if row[2] else datetime.now()
            except:
                c_date = datetime.now()
            dest_conn.execute(
                text("INSERT INTO blog_comments (name, email, comment, is_approved, created_at, post_id) "
                     "VALUES (:name, :email, :text, 1, :date, :post_id)"),
                {"name": row[0], "email": row[4] or "", "text": row[3], "date": c_date, "post_id": row[1]}
            )
            count += 1
        print(f"✓ Migrated {count} comments.")

        # 6. Migrate Contact Messages
        print("Migrating contact messages...")
        res = source_conn.execute(text("SELECT name, email, date, main_msg, subject, status FROM new_msg"))
        count = 0
        for row in res:
            try:
                msg_date = datetime.strptime(row[2], "%Y-%m-%d %H:%M:%S") if row[2] else datetime.now()
            except:
                msg_date = datetime.now()
            is_read = 1 if row[5] == 'read' else 0
            dest_conn.execute(
                text("INSERT INTO contact_messages (name, email, subject, message, is_read, created_at, is_deleted) "
                     "VALUES (:name, :email, :subject, :msg, :read, :date, 0)"),
                {"name": row[0], "email": row[1], "subject": row[4] or "Contact Submission", "msg": row[3], "read": is_read, "date": msg_date}
            )
            count += 1
        print(f"✓ Migrated {count} contact messages.")

        # 7. Migrate Page Metrics
        print("Migrating page hit metrics...")
        res = source_conn.execute(text("SELECT page_id, hits FROM metrics"))
        count = 0
        for row in res:
            page_id = row[0]
            hits = row[1]
            page_name = PAGE_MAPPINGS.get(page_id, f"Page_{page_id}")
            dest_conn.execute(
                text("INSERT INTO page_metrics (page_name, hits) VALUES (:name, :hits) "
                     "ON DUPLICATE KEY UPDATE hits = hits + :hits"),
                {"name": page_name, "hits": hits}
            )
            count += 1
        print(f"✓ Migrated {count} page metrics.")

        trans.commit()
        print("\n🎉 DATA MIGRATION COMPLETED SUCCESSFULLY!")
    except Exception as err:
        trans.rollback()
        print(f"\n❌ ERROR during migration: {err}")
    finally:
        source_conn.close()
        dest_conn.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Migrate portfolio legacy database to Website 2.0")
    parser.add_argument("--source", required=True, help="Connection URL for source database")
    parser.add_argument("--dest", required=True, help="Connection URL for destination database")
    args = parser.parse_args()
    migrate(args.source, args.dest)
