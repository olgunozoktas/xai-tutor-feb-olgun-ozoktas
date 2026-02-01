"use client";

import { OrderStats } from "@/types/order";

interface StatsCardsProps {
  stats: OrderStats | null;
}

const cards = [
  {
    label: "Total Orders This Month",
    key: "total_orders_this_month" as const,
    color: "bg-blue-500",
  },
  {
    label: "Pending Orders",
    key: "pending_orders" as const,
    color: "bg-amber-400",
  },
  {
    label: "Shipped Orders",
    key: "shipped_orders" as const,
    color: "bg-green-500",
  },
  {
    label: "Refunded Orders",
    key: "refunded_orders" as const,
    color: "bg-red-500",
  },
];

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.key}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className={`w-2.5 h-2.5 rounded-full ${card.color}`} />
            <span className="text-sm text-gray-500 dark:text-gray-400">{card.label}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats ? stats[card.key] : "—"}
          </p>
        </div>
      ))}
    </div>
  );
}
