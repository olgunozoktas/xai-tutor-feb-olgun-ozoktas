"use client";

import { useState, useMemo } from "react";
import { Order } from "@/types/order";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import OrderRow from "./OrderRow";
import Checkbox from "@/components/ui/Checkbox";

type SortKey =
  | "order_number"
  | "customer_name"
  | "order_date"
  | "status"
  | "total_amount"
  | "payment_status";

type SortDirection = "asc" | "desc";

interface OrdersTableProps {
  orders: Order[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  allSelected: boolean;
  onEdit: (order: Order) => void;
  onDelete: (order: Order) => void;
}

const columns: { label: string; key?: SortKey; sortable: boolean }[] = [
  { label: "Order Number", key: "order_number", sortable: true },
  { label: "Customer Name", key: "customer_name", sortable: true },
  { label: "Order Date", key: "order_date", sortable: true },
  { label: "Status", key: "status", sortable: true },
  { label: "Total Amount", key: "total_amount", sortable: true },
  { label: "Payment Status", key: "payment_status", sortable: true },
  { label: "Action", sortable: false },
];

function getSortValue(order: Order, key: SortKey): string | number {
  switch (key) {
    case "order_number":
      return order.order_number;
    case "customer_name":
      return order.customer.name.toLowerCase();
    case "order_date":
      return order.order_date;
    case "status":
      return order.status;
    case "total_amount":
      return order.total_amount;
    case "payment_status":
      return order.payment_status;
  }
}

export default function OrdersTable({
  orders,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  allSelected,
  onEdit,
  onDelete,
}: OrdersTableProps) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        // Third click: clear sort
        setSortKey(null);
        setSortDirection("asc");
      }
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const sortedOrders = useMemo(() => {
    if (!sortKey) return orders;

    return [...orders].sort((a, b) => {
      const aVal = getSortValue(a, sortKey);
      const bVal = getSortValue(b, sortKey);

      let comparison: number;
      if (typeof aVal === "number" && typeof bVal === "number") {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [orders, sortKey, sortDirection]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <th className="px-4 py-3 w-12">
              <Checkbox
                checked={allSelected && orders.length > 0}
                onChange={onToggleSelectAll}
              />
            </th>
            {columns.map((col) => (
              <th
                key={col.label}
                className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                  col.sortable ? "cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200" : ""
                }`}
                onClick={() => col.sortable && col.key && handleSort(col.key)}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && col.key && (
                    sortKey === col.key ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="w-3 h-3 text-orange-500" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-orange-500" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-gray-400" />
                    )
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-12 text-center text-gray-400 dark:text-gray-500">
                No orders found
              </td>
            </tr>
          ) : (
            sortedOrders.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                selected={selectedIds.has(order.id)}
                onToggleSelect={onToggleSelect}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
