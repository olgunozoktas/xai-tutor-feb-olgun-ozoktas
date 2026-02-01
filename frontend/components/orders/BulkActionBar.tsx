"use client";

import { Copy, Printer, Trash2, X } from "lucide-react";
import Button from "@/components/ui/Button";

interface BulkActionBarProps {
  selectedCount: number;
  onDuplicate: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function BulkActionBar({
  selectedCount,
  onDuplicate,
  onDelete,
  onClose,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 px-4 py-2.5 rounded-full shadow-lg">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 pr-1">
          {selectedCount} Selected
        </span>

        <Button variant="outline" size="sm" onClick={onDuplicate}>
          <Copy className="w-4 h-4" />
          Duplicate
        </Button>

        <Button variant="outline" size="sm">
          <Printer className="w-4 h-4" />
          Print
        </Button>

        <Button variant="danger-outline" size="sm" onClick={onDelete}>
          <Trash2 className="w-4 h-4" />
          Delete
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="rounded-full ml-0.5"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
