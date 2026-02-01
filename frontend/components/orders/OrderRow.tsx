"use client";

import { useState, useRef, useEffect } from "react";
import { Order } from "@/types/order";
import {
  Pencil,
  Trash2,
  MoreVertical,
  Eye,
  Copy,
  Printer,
  Archive,
  Send,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";

interface OrderRowProps {
  order: Order;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (order: Order) => void;
  onDelete: (order: Order) => void;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const moreMenuItems = [
  { label: "View Details", icon: Eye },
  { label: "Duplicate Order", icon: Copy },
  { label: "Print Invoice", icon: Printer },
  { label: "Archive Order", icon: Archive },
  { label: "Send Notification", icon: Send },
];

type BadgeVariant = "pending" | "completed" | "refunded" | "default";

export default function OrderRow({
  order,
  selected,
  onToggleSelect,
  onEdit,
  onDelete,
}: OrderRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [menuOpen]);

  const badgeVariant: BadgeVariant =
    order.status === "pending" || order.status === "completed" || order.status === "refunded"
      ? order.status
      : "default";

  return (
    <tr
      className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
        selected ? "bg-orange-50 dark:bg-orange-900/20" : ""
      }`}
    >
      <td className="px-4 py-3">
        <Checkbox
          checked={selected}
          onChange={() => onToggleSelect(order.id)}
        />
      </td>

      <td className="px-4 py-3">
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {order.order_number}
        </span>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar name={order.customer.name} size="sm" />
          <span className="text-sm text-gray-900 dark:text-white">{order.customer.name}</span>
        </div>
      </td>

      <td className="px-4 py-3">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {formatDate(order.order_date)}
        </span>
      </td>

      <td className="px-4 py-3">
        <Badge variant={badgeVariant}>{order.status}</Badge>
      </td>

      <td className="px-4 py-3">
        <span className="text-sm text-gray-900 dark:text-white">
          ${order.total_amount.toFixed(2)}
        </span>
      </td>

      <td className="px-4 py-3">
        <span
          className={`text-sm font-medium ${
            order.payment_status === "paid" ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
          }`}
        >
          {order.payment_status === "paid" ? "Paid" : "Unpaid"}
        </span>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(order)}
            title="Edit order"
            className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(order)}
            title="Delete order"
            className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <div className="relative" ref={menuRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen(!menuOpen)}
              title="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
            {menuOpen && (
              <div className="absolute right-0 z-50 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-1">
                {moreMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 cursor-default"
                    >
                      <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      {item.label}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}
