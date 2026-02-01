"use client";

interface FilterTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { label: "All", value: "all" },
  { label: "Incomplete", value: "pending" },
  { label: "Overdue", value: "overdue" },
  { label: "Ongoing", value: "ongoing" },
  { label: "Finished", value: "completed" },
];

export default function FilterTabs({ activeTab, onTabChange }: FilterTabsProps) {
  return (
    <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-700 mb-0">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onTabChange(tab.value)}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === tab.value
              ? "border-orange-500 text-orange-600 dark:text-orange-400"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
