"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Order, OrderStats } from "@/types/order";
import {
  fetchOrders,
  fetchOrderStats,
  createOrder,
  deleteOrder,
  updateOrder,
  bulkDuplicate,
  bulkDelete,
  bulkUpdateStatus,
} from "@/lib/api";
import { RefreshCw, Download, Plus, ChevronDown } from "lucide-react";
import Button from "@/components/ui/Button";
import StatsCards from "@/components/orders/StatsCards";
import FilterTabs from "@/components/orders/FilterTabs";
import OrdersTable from "@/components/orders/OrdersTable";
import BulkActionBar from "@/components/orders/BulkActionBar";
import Pagination from "@/components/orders/Pagination";
import EditOrderModal from "@/components/orders/EditOrderModal";
import DeleteConfirmModal from "@/components/orders/DeleteConfirmModal";
import CreateOrderModal from "@/components/orders/CreateOrderModal";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Modal state
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const limit = 10;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setStatusDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, statsRes] = await Promise.all([
        fetchOrders(activeTab, currentPage, limit),
        fetchOrderStats(),
      ]);
      setOrders(ordersRes.orders);
      setTotalPages(ordersRes.total_pages);
      setTotalOrders(ordersRes.total);
      setStats(statsRes);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (orders.every((o) => selectedIds.has(o.id))) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(orders.map((o) => o.id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const allSelected =
    orders.length > 0 && orders.every((o) => selectedIds.has(o.id));

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
    clearSelection();
  };

  // Create order
  const handleCreateOrder = async (data: {
    customer: { name: string; email: string };
    total_amount: number;
    status: string;
    payment_status: string;
    order_date: string;
  }) => {
    await createOrder(data);
    await loadData();
  };

  // Edit order
  const handleSaveOrder = async (id: string, data: Record<string, unknown>) => {
    await updateOrder(id, data);
    await loadData();
  };

  // Delete single order (called after confirmation)
  const handleConfirmDelete = async (id: string) => {
    try {
      await deleteOrder(id);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      await loadData();
    } catch (err) {
      console.error("Failed to delete order:", err);
    }
  };

  const handleBulkDuplicate = async () => {
    try {
      await bulkDuplicate([...selectedIds]);
      clearSelection();
      await loadData();
    } catch (err) {
      console.error("Failed to duplicate orders:", err);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDelete([...selectedIds]);
      clearSelection();
      await loadData();
    } catch (err) {
      console.error("Failed to bulk delete:", err);
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    try {
      await bulkUpdateStatus([...selectedIds], status);
      clearSelection();
      await loadData();
    } catch (err) {
      console.error("Failed to bulk update status:", err);
    }
  };

  return (
    <div>
      <StatsCards stats={stats} />

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Orders</h2>
          <div className="flex items-center gap-3">
            <div className="relative" ref={statusDropdownRef}>
              <button
                onClick={() => {
                  if (selectedIds.size > 0) setStatusDropdownOpen(!statusDropdownOpen);
                }}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors ${
                  selectedIds.size > 0 ? "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer" : "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                Bulk Update Status
                <ChevronDown className={`w-4 h-4 transition-transform ${statusDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {statusDropdownOpen && (
                <div className="absolute right-0 z-50 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-1">
                  <p className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Set status to
                  </p>
                  {[
                    { value: "pending", label: "Pending", dot: "bg-amber-400" },
                    { value: "completed", label: "Completed", dot: "bg-green-500" },
                    { value: "refunded", label: "Refunded", dot: "bg-red-500" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        handleBulkStatusUpdate(opt.value);
                        setStatusDropdownOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
                    >
                      <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button variant="secondary">
              <Download className="w-4 h-4" />
              Export Orders
            </Button>
            <Button variant="dark" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4" />
              Add Orders
            </Button>
          </div>
        </div>

        <div className="px-5">
          <FilterTabs activeTab={activeTab} onTabChange={handleTabChange} />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <OrdersTable
            orders={orders}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            allSelected={allSelected}
            onEdit={(order) => setEditingOrderId(order.id)}
            onDelete={(order) => setDeletingOrder(order)}
          />
        )}
      </div>

      <Pagination
        page={currentPage}
        totalPages={totalPages}
        total={totalOrders}
        limit={limit}
        onPageChange={setCurrentPage}
      />

      <BulkActionBar
        selectedCount={selectedIds.size}
        onDuplicate={handleBulkDuplicate}
        onDelete={handleBulkDelete}
        onClose={clearSelection}
      />

      {/* Create Order Modal */}
      {showCreateModal && (
        <CreateOrderModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateOrder}
        />
      )}

      {/* Edit Order Modal */}
      {editingOrderId && (
        <EditOrderModal
          orderId={editingOrderId}
          onClose={() => setEditingOrderId(null)}
          onSave={handleSaveOrder}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingOrder && (
        <DeleteConfirmModal
          orderNumber={deletingOrder.order_number}
          onConfirm={() => handleConfirmDelete(deletingOrder.id)}
          onClose={() => setDeletingOrder(null)}
        />
      )}
    </div>
  );
}
