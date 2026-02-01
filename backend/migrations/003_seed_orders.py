"""
Migration: Seed orders data
Version: 003
Description: Inserts sample order data matching the design specification
"""

import sqlite3
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import DATABASE_PATH


def upgrade():
    """Apply the migration."""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    # Create migrations tracking table if it doesn't exist
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS _migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Check if this migration has already been applied
    cursor.execute("SELECT 1 FROM _migrations WHERE name = ?", ("003_seed_orders",))
    if cursor.fetchone():
        print("Migration 003_seed_orders already applied. Skipping.")
        conn.close()
        return

    # Insert sample orders matching the design
    orders = [
        ("#ORD1008", "Esther Kiehn", "esther@example.com", "", "2024-12-17", "pending", 10.50, "unpaid"),
        ("#ORD1007", "Denise Kuhn", "denise@example.com", "", "2024-12-16", "pending", 100.50, "unpaid"),
        ("#ORD1006", "Clint Hoppe", "clint@example.com", "", "2024-12-16", "completed", 60.56, "paid"),
        ("#ORD1005", "Darin Deckow", "darin@example.com", "", "2024-12-16", "refunded", 640.50, "paid"),
        ("#ORD1004", "Jacquelyn Robel", "jacquelyn@example.com", "", "2024-12-15", "completed", 39.50, "paid"),
        ("#ORD1003", "Clint Hoppe", "clint@example.com", "", "2024-12-16", "completed", 29.50, "paid"),
        ("#ORD1002", "Erin Bins", "erin@example.com", "", "2024-12-16", "completed", 120.35, "paid"),
        ("#ORD1001", "Gretchen Quigley", "gretchen@example.com", "", "2024-12-14", "refunded", 123.50, "paid"),
        ("#ORD1000", "Stewart Kulas", "stewart@example.com", "", "2024-12-13", "completed", 85.00, "paid"),
        ("#ORD0999", "Amanda Rice", "amanda@example.com", "", "2024-12-13", "pending", 45.00, "unpaid"),
    ]

    cursor.executemany(
        """INSERT INTO orders (order_number, customer_name, customer_email, customer_avatar, order_date, status, total_amount, payment_status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        orders,
    )

    # Record this migration
    cursor.execute("INSERT INTO _migrations (name) VALUES (?)", ("003_seed_orders",))

    conn.commit()
    conn.close()
    print("Migration 003_seed_orders applied successfully.")


def downgrade():
    """Revert the migration."""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    # Delete seeded orders
    order_numbers = [
        "#ORD1008", "#ORD1007", "#ORD1006", "#ORD1005", "#ORD1004",
        "#ORD1003", "#ORD1002", "#ORD1001", "#ORD1000", "#ORD0999",
    ]
    placeholders = ",".join("?" for _ in order_numbers)
    cursor.execute(f"DELETE FROM orders WHERE order_number IN ({placeholders})", order_numbers)

    # Remove migration record
    cursor.execute("DELETE FROM _migrations WHERE name = ?", ("003_seed_orders",))

    conn.commit()
    conn.close()
    print("Migration 003_seed_orders reverted successfully.")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Run database migration")
    parser.add_argument(
        "action",
        choices=["upgrade", "downgrade"],
        help="Migration action to perform"
    )

    args = parser.parse_args()

    if args.action == "upgrade":
        upgrade()
    elif args.action == "downgrade":
        downgrade()
