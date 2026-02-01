export interface OrderCustomer {
  name: string;
  email: string;
  avatar: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer: OrderCustomer;
  order_date: string;
  status: "pending" | "completed" | "refunded";
  total_amount: number;
  payment_status: "paid" | "unpaid";
  created_at: string;
  updated_at: string;
}

export interface OrderStats {
  total_orders_this_month: number;
  pending_orders: number;
  shipped_orders: number;
  refunded_orders: number;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
