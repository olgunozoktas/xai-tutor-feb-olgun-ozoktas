"use client";

import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";

interface DeleteConfirmModalProps {
  orderNumber: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeleteConfirmModal({
  orderNumber,
  onConfirm,
  onClose,
}: DeleteConfirmModalProps) {
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="absolute top-4 right-4"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="flex flex-col items-center text-center">
          <Avatar size="lg" color="bg-red-100 dark:bg-red-900/30" className="mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </Avatar>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Delete Order
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Are you sure you want to delete order{" "}
            <span className="font-medium text-gray-700 dark:text-gray-200">{orderNumber}</span>?
            This action cannot be undone.
          </p>

          <div className="flex items-center gap-3 w-full">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
