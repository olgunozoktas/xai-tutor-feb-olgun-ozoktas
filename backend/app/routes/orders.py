import math
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.database import get_db

router = APIRouter(prefix="/orders", tags=["orders"])


# --- Pydantic models ---

class CustomerInput(BaseModel):
    name: str
    email: str
    avatar: str = ""


class OrderCreate(BaseModel):
    customer: Optional[CustomerInput] = None
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    total_amount: float
    status: str = "pending"
    payment_status: str = "unpaid"
    order_date: Optional[str] = None


class OrderUpdate(BaseModel):
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    customer_avatar: Optional[str] = None
    order_date: Optional[str] = None
    status: Optional[str] = None
    total_amount: Optional[float] = None
    payment_status: Optional[str] = None


class BulkStatusUpdate(BaseModel):
    order_ids: List[int]
    status: str


class BulkOrderIds(BaseModel):
    order_ids: List[int]


# --- Helpers ---

def row_to_dict(row) -> dict:
    return {
        "id": str(row["id"]),
        "order_number": row["order_number"],
        "customer": {
            "name": row["customer_name"],
            "email": row["customer_email"],
            "avatar": row["customer_avatar"] or "",
        },
        "order_date": row["order_date"],
        "status": row["status"],
        "total_amount": row["total_amount"],
        "payment_status": row["payment_status"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }


def next_order_number(cursor) -> str:
    cursor.execute("SELECT MAX(CAST(SUBSTR(order_number, 5) AS INTEGER)) as max_num FROM orders")
    result = cursor.fetchone()
    max_num = result["max_num"] if result["max_num"] is not None else 999
    return f"#ORD{max_num + 1}"


# --- Routes (static paths first, then parameterized) ---

@router.get("")
def list_orders(status: str = "all", page: int = 1, limit: int = 10):
    try:
        with get_db() as conn:
            cursor = conn.cursor()

            where = ""
            params: list = []
            if status == "overdue":
                where = "WHERE status = 'pending' AND order_date < date('now')"
            elif status == "ongoing":
                where = "WHERE status = 'pending' AND order_date >= date('now')"
            elif status != "all":
                where = "WHERE status = ?"
                params.append(status)

            # Count total
            cursor.execute(f"SELECT COUNT(*) as cnt FROM orders {where}", params)
            total = cursor.fetchone()["cnt"]

            total_pages = max(1, math.ceil(total / limit))
            offset = (page - 1) * limit

            cursor.execute(
                f"SELECT * FROM orders {where} ORDER BY id DESC LIMIT ? OFFSET ?",
                params + [limit, offset],
            )
            rows = cursor.fetchall()

            return {
                "orders": [row_to_dict(r) for r in rows],
                "total": total,
                "page": page,
                "limit": limit,
                "total_pages": total_pages,
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/stats")
def get_order_stats():
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) as cnt FROM orders")
            total = cursor.fetchone()["cnt"]

            cursor.execute("SELECT COUNT(*) as cnt FROM orders WHERE status = 'pending'")
            pending = cursor.fetchone()["cnt"]

            cursor.execute("SELECT COUNT(*) as cnt FROM orders WHERE status = 'completed'")
            shipped = cursor.fetchone()["cnt"]

            cursor.execute("SELECT COUNT(*) as cnt FROM orders WHERE status = 'refunded'")
            refunded = cursor.fetchone()["cnt"]

            return {
                "total_orders_this_month": total,
                "pending_orders": pending,
                "shipped_orders": shipped,
                "refunded_orders": refunded,
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.put("/bulk/status")
def bulk_update_status(data: BulkStatusUpdate):
    if data.status not in ("pending", "completed", "refunded"):
        raise HTTPException(status_code=400, detail="Invalid status value")
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            placeholders = ",".join("?" for _ in data.order_ids)
            # Check all orders exist
            cursor.execute(f"SELECT id FROM orders WHERE id IN ({placeholders})", data.order_ids)
            found_ids = {r["id"] for r in cursor.fetchall()}
            missing = [oid for oid in data.order_ids if oid not in found_ids]
            if missing:
                raise HTTPException(status_code=404, detail=f"Orders not found: {missing}")
            cursor.execute(
                f"UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id IN ({placeholders})",
                [data.status] + data.order_ids,
            )
            # Fetch updated orders
            cursor.execute(f"SELECT * FROM orders WHERE id IN ({placeholders})", data.order_ids)
            rows = cursor.fetchall()
            return {
                "updated_count": len(rows),
                "orders": [{"id": str(r["id"]), "status": r["status"]} for r in rows],
            }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.post("/bulk/duplicate", status_code=201)
def bulk_duplicate(data: BulkOrderIds):
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            # Check all orders exist
            placeholders = ",".join("?" for _ in data.order_ids)
            cursor.execute(f"SELECT id FROM orders WHERE id IN ({placeholders})", data.order_ids)
            found_ids = {r["id"] for r in cursor.fetchall()}
            missing = [oid for oid in data.order_ids if oid not in found_ids]
            if missing:
                raise HTTPException(status_code=404, detail=f"Orders not found: {missing}")
            new_orders = []
            for oid in data.order_ids:
                cursor.execute("SELECT * FROM orders WHERE id = ?", (oid,))
                row = cursor.fetchone()
                new_number = next_order_number(cursor)
                cursor.execute(
                    """INSERT INTO orders (order_number, customer_name, customer_email, customer_avatar,
                       order_date, status, total_amount, payment_status)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                    (
                        new_number,
                        row["customer_name"],
                        row["customer_email"],
                        row["customer_avatar"],
                        row["order_date"],
                        row["status"],
                        row["total_amount"],
                        row["payment_status"],
                    ),
                )
                new_id = cursor.lastrowid
                new_orders.append({
                    "id": str(new_id),
                    "order_number": new_number,
                    "original_order_id": str(oid),
                })
            return {
                "duplicated_count": len(new_orders),
                "new_orders": new_orders,
            }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.delete("/bulk")
def bulk_delete(data: BulkOrderIds):
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            placeholders = ",".join("?" for _ in data.order_ids)
            # Check all orders exist
            cursor.execute(f"SELECT id FROM orders WHERE id IN ({placeholders})", data.order_ids)
            found_ids = {r["id"] for r in cursor.fetchall()}
            missing = [oid for oid in data.order_ids if oid not in found_ids]
            if missing:
                raise HTTPException(status_code=404, detail=f"Orders not found: {missing}")
            cursor.execute(
                f"DELETE FROM orders WHERE id IN ({placeholders})",
                data.order_ids,
            )
            return {
                "deleted_count": len(data.order_ids),
                "deleted_ids": [str(i) for i in data.order_ids],
            }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/{order_id}")
def get_order(order_id: int):
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
            row = cursor.fetchone()
            if row is None:
                raise HTTPException(status_code=404, detail="Order not found")
            return row_to_dict(row)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.post("", status_code=201)
def create_order(order: OrderCreate):
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            order_number = next_order_number(cursor)

            # Support both nested customer object and flat fields
            if order.customer:
                name = order.customer.name
                email = order.customer.email
                avatar = order.customer.avatar
            else:
                name = order.customer_name or ""
                email = order.customer_email or ""
                avatar = ""

            from datetime import date
            order_date = order.order_date or date.today().isoformat()

            cursor.execute(
                """INSERT INTO orders (order_number, customer_name, customer_email, customer_avatar,
                   order_date, status, total_amount, payment_status)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    order_number, name, email, avatar,
                    order_date, order.status, order.total_amount, order.payment_status,
                ),
            )
            new_id = cursor.lastrowid
            cursor.execute("SELECT * FROM orders WHERE id = ?", (new_id,))
            row = cursor.fetchone()
            return row_to_dict(row)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.put("/{order_id}")
def update_order(order_id: int, order: OrderUpdate):
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
            if cursor.fetchone() is None:
                raise HTTPException(status_code=404, detail="Order not found")

            updates = order.model_dump(exclude_none=True)
            if not updates:
                cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
                return row_to_dict(cursor.fetchone())

            set_parts = [f"{k} = ?" for k in updates.keys()]
            set_parts.append("updated_at = CURRENT_TIMESTAMP")
            values = list(updates.values()) + [order_id]

            cursor.execute(
                f"UPDATE orders SET {', '.join(set_parts)} WHERE id = ?",
                values,
            )
            cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
            return row_to_dict(cursor.fetchone())
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.delete("/{order_id}", status_code=204)
def delete_order(order_id: int):
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM orders WHERE id = ?", (order_id,))
            if cursor.fetchone() is None:
                raise HTTPException(status_code=404, detail="Order not found")
            cursor.execute("DELETE FROM orders WHERE id = ?", (order_id,))
            return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
