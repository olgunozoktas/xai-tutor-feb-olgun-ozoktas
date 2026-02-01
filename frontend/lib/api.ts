import { Order, OrderStats, OrdersResponse } from "@/types/order";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || res.statusText);
  }
  if (res.status === 204) return null as T;
  return res.json();
}

export async function fetchOrders(
  status = "all",
  page = 1,
  limit = 10
): Promise<OrdersResponse> {
  return request<OrdersResponse>(
    `/orders?status=${status}&page=${page}&limit=${limit}`
  );
}

export async function fetchOrderStats(): Promise<OrderStats> {
  return request<OrderStats>("/orders/stats");
}

export async function fetchOrder(id: string): Promise<Order> {
  return request<Order>(`/orders/${id}`);
}

export async function createOrder(data: {
  customer: { name: string; email: string };
  total_amount: number;
  status?: string;
  payment_status?: string;
}): Promise<Order> {
  return request<Order>("/orders", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateOrder(
  id: string,
  data: Record<string, unknown>
): Promise<Order> {
  return request<Order>(`/orders/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteOrder(id: string): Promise<void> {
  return request<void>(`/orders/${id}`, { method: "DELETE" });
}

export async function bulkUpdateStatus(
  orderIds: string[],
  status: string
): Promise<{ updated_count: number }> {
  return request("/orders/bulk/status", {
    method: "PUT",
    body: JSON.stringify({ order_ids: orderIds.map(Number), status }),
  });
}

export async function bulkDuplicate(
  orderIds: string[]
): Promise<{ duplicated_count: number }> {
  return request("/orders/bulk/duplicate", {
    method: "POST",
    body: JSON.stringify({ order_ids: orderIds.map(Number) }),
  });
}

export async function bulkDelete(
  orderIds: string[]
): Promise<{ deleted_count: number }> {
  return request("/orders/bulk", {
    method: "DELETE",
    body: JSON.stringify({ order_ids: orderIds.map(Number) }),
  });
}
