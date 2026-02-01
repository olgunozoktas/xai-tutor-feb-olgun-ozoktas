"use client";

import { useState, useRef, useEffect } from "react";
import {
  LayoutGrid,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  BarChart3,
  RefreshCw,
  CreditCard,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronsUpDown,
  Star,
  Moon,
  Check,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

interface NavChild {
  label: string;
  active?: boolean;
}

interface NavItem {
  label: string;
  icon: LucideIcon;
  children?: NavChild[];
}

const mainNav: NavItem[] = [
  { label: "Dashboard", icon: LayoutGrid },
  {
    label: "Products",
    icon: Package,
    children: [
      { label: "All Products" },
      { label: "Categories" },
      { label: "Inventory" },
    ],
  },
  {
    label: "Orders",
    icon: ShoppingCart,
    children: [
      { label: "All Orders", active: true },
      { label: "Returns" },
      { label: "Order Tracking" },
    ],
  },
  { label: "Sales", icon: TrendingUp },
  { label: "Customers", icon: Users },
  { label: "Reports", icon: BarChart3 },
];

const settingsNav: NavItem[] = [
  { label: "Marketplace Sync", icon: RefreshCw },
  { label: "Payment Gateways", icon: CreditCard },
  {
    label: "Settings",
    icon: Settings,
    children: [
      { label: "General" },
      { label: "Notifications" },
      { label: "Security" },
    ],
  },
  { label: "Help Center", icon: HelpCircle },
];

function CollapsibleNavItem({
  item,
  defaultOpen = false,
  isActive = false,
}: {
  item: NavItem;
  defaultOpen?: boolean;
  isActive?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const hasChildren = item.children && item.children.length > 0;
  const Icon = item.icon;

  return (
    <li>
      <div
        onClick={() => hasChildren && setOpen(!open)}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-pointer ${
          isActive
            ? "text-gray-900 dark:text-white font-medium"
            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
        }`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="flex-1">{item.label}</span>
        {hasChildren && (
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-0" : "-rotate-90"}`}
          />
        )}
      </div>
      {hasChildren && open && (
        <ul className="mt-0.5 space-y-0.5">
          {item.children!.map((child, idx) => {
            const isLast = idx === item.children!.length - 1;
            return (
              <li key={child.label} className="relative">
                <div className="absolute left-[26px] top-0 bottom-0 flex flex-col items-center pointer-events-none">
                  <div className={`w-px bg-gray-200 dark:bg-gray-600 ${isLast ? "h-1/2" : "h-full"}`} />
                </div>
                <div className="absolute left-[26px] top-1/2 w-3 h-px bg-gray-200 dark:bg-gray-600 pointer-events-none" />
                <div
                  className={`ml-10 px-3 py-1.5 rounded-lg text-sm cursor-pointer ${
                    child.active
                      ? "text-orange-600 dark:text-orange-400 font-medium bg-orange-50 dark:bg-orange-900/30"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {child.label}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

interface Workspace {
  id: string;
  name: string;
  initial: string;
  gradient: string;
}

const workspaces: Workspace[] = [
  { id: "uxerflow", name: "Uxerflow", initial: "U", gradient: "from-purple-500 to-blue-500" },
  { id: "designhub", name: "DesignHub", initial: "D", gradient: "from-green-500 to-teal-500" },
];

interface SidebarProps {
  collapsed: boolean;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function Sidebar({ collapsed, darkMode, onToggleDarkMode }: SidebarProps) {
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>(workspaces[0]);
  const [wsDropdownOpen, setWsDropdownOpen] = useState(false);
  const wsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wsDropdownRef.current && !wsDropdownRef.current.contains(e.target as Node)) {
        setWsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <aside
      className={`h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-200 ${
        collapsed ? "w-[68px] min-w-[68px]" : "w-[260px] min-w-[260px]"
      }`}
    >
      {/* Logo + Workspace */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Star className="w-5 h-5 text-white" />
          </div>
          {!collapsed && <span className="font-bold text-lg dark:text-white">Prodex</span>}
        </div>

        {/* Workspace selector */}
        <div className="relative" ref={wsDropdownRef}>
          {!collapsed ? (
            <div
              onClick={() => setWsDropdownOpen(!wsDropdownOpen)}
              className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <div className={`w-8 h-8 bg-gradient-to-br ${activeWorkspace.gradient} rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                {activeWorkspace.initial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate dark:text-white">{activeWorkspace.name}</p>
                <p className="text-xs text-gray-400">Workspace</p>
              </div>
              <ChevronsUpDown className="w-4 h-4 text-gray-400" />
            </div>
          ) : (
            <div
              className="flex justify-center"
              onClick={() => setWsDropdownOpen(!wsDropdownOpen)}
            >
              <div className={`w-8 h-8 bg-gradient-to-br ${activeWorkspace.gradient} rounded-lg flex items-center justify-center text-white text-xs font-bold cursor-pointer`}>
                {activeWorkspace.initial}
              </div>
            </div>
          )}

          {wsDropdownOpen && (
            <div className={`absolute z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-1 ${collapsed ? "left-0 w-52" : "left-0 right-0"}`}>
              <p className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Workspaces</p>
              {workspaces.map((ws) => (
                <div
                  key={ws.id}
                  onClick={() => {
                    setActiveWorkspace(ws);
                    setWsDropdownOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    activeWorkspace.id === ws.id ? "bg-orange-50 dark:bg-orange-900/30" : ""
                  }`}
                >
                  <div className={`w-7 h-7 bg-gradient-to-br ${ws.gradient} rounded-md flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {ws.initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate dark:text-white">{ws.name}</p>
                  </div>
                  {activeWorkspace.id === ws.id && (
                    <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {!collapsed && (
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Main</p>
        )}
        <ul className="space-y-0.5">
          {mainNav.map((item) => {
            const Icon = item.icon;
            return item.children && !collapsed ? (
              <CollapsibleNavItem
                key={item.label}
                item={item}
                defaultOpen={item.label === "Orders"}
                isActive={item.label === "Orders"}
              />
            ) : (
              <li key={item.label}>
                <div
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-pointer ${
                    collapsed ? "justify-center" : ""
                  } ${
                    item.label === "Orders"
                      ? "text-gray-900 dark:text-white font-medium"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="flex-1">{item.label}</span>}
                </div>
              </li>
            );
          })}
        </ul>

        {!collapsed && (
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mt-6 mb-2">Settings</p>
        )}
        {collapsed && <div className="my-3 mx-2 h-px bg-gray-200 dark:bg-gray-600" />}
        <ul className="space-y-0.5">
          {settingsNav.map((item) => {
            const Icon = item.icon;
            return item.children && !collapsed ? (
              <CollapsibleNavItem key={item.label} item={item} />
            ) : (
              <li key={item.label}>
                <div
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white cursor-pointer ${
                    collapsed ? "justify-center" : ""
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="flex-1">{item.label}</span>}
                </div>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 space-y-3">
        <div className={`flex items-center px-3 py-2 ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Dark Mode</span>
            </div>
          )}
          <button
            onClick={onToggleDarkMode}
            className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
              darkMode ? "bg-orange-500" : "bg-gray-200 dark:bg-gray-600"
            }`}
            title={collapsed ? "Dark Mode" : undefined}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                darkMode ? "translate-x-5" : ""
              }`}
            />
          </button>
        </div>

        {!collapsed && (
          <div className="bg-gray-900 dark:bg-gray-950 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">Upgrade to</span>
              <span className="bg-orange-500 text-xs font-bold px-2 py-0.5 rounded">Premium</span>
            </div>
            <p className="text-xs text-gray-300 mb-3">
              Your Premium Account will expire in 18 days.
            </p>
            <button className="w-full bg-white text-gray-900 text-sm font-medium py-2 rounded-lg hover:bg-gray-100 transition">
              Upgrade Now
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
