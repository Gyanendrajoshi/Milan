"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  FolderOpen,
  Users,
  FileText,
  Package,
  Scroll,
  Wrench,
  UserCog,
  Settings,
  Tag,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calculator,
  Bell,
  Store,
  ShoppingCart,
  ClipboardList,
  Archive,
  PackageMinus,
  Factory,
  Truck,
  Scissors
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  priority?: boolean;
}

const inventoryItems: NavItem[] = [
  {
    title: "Purchase Order",
    href: "/inventory/purchase-order",
    icon: ShoppingCart,
  },
  {
    title: "Goods Receipt (GRN)",
    href: "/inventory/grn",
    icon: ClipboardList,
  },
  {
    title: "Stock Inventory",
    href: "/inventory/stock",
    icon: Archive,
  },
  {
    title: "Material Issue",
    href: "/inventory/issue",
    icon: PackageMinus,
  },
  {
    title: "Material Return",
    href: "/inventory/return",
    icon: PackageMinus,
  },
  {
    title: "Jumbo Roll Slitting",
    href: "/inventory/slitting",
    icon: Scissors,
  },
];

const masterItems: NavItem[] = [
  {
    title: "Client/Supplier Master",
    href: "/masters/client-supplier",
    icon: Users,
  },
  {
    title: "HSN Master",
    href: "/masters/hsn",
    icon: FileText,
  },
  {
    title: "Material Master",
    href: "/masters/material",
    icon: Package,
  },
  {
    title: "Roll Master",
    href: "/masters/roll-master",
    icon: Scroll,
    priority: true,
  },
  {
    title: "Tool Master",
    href: "/masters/tool-master",
    icon: Wrench,
    priority: true,
  },
  {
    title: "User Master",
    href: "/masters/user",
    icon: UserCog,
  },
  {
    title: "Category Master",
    href: "/masters/category-master",
    icon: Tag,
  },
  {
    title: "Process (Operation) Master",
    href: "/masters/process-master",
    icon: Settings,
  },
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  onItemClick?: () => void;
}

// Helper for Floating Menu Items
const FloatingMenuItem = ({ item, onClick, isActive }: { item: NavItem; onClick?: () => void; isActive: boolean }) => (
  <Link
    href={item.href}
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 rounded-md py-2 px-3 text-sm transition-all hover:bg-white/10 hover:text-white",
      isActive ? "bg-white/20 text-white font-medium" : "text-white/80"
    )}
  >
    <item.icon className="h-4 w-4 shrink-0" />
    <span>{item.title}</span>
  </Link>
);

// Helper for Hover Popover logic
const HoverPopover = ({
  trigger,
  content,
  side = "right",
  align = "start"
}: {
  trigger: React.ReactNode;
  content: React.ReactNode;
  side?: "right" | "top" | "bottom" | "left";
  align?: "start" | "center" | "end";
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 100); // Small delay to prevent flickering
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="w-full flex justify-center py-1"
        >
          {trigger}
        </div>
      </PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        className="w-56 p-2 bg-theme-gradient-b border-white/20 text-white shadow-xl ml-2 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        onMouseEnter={handleMouseEnter} // Keep open when hovering content
        onMouseLeave={handleMouseLeave}
      >
        {content}
      </PopoverContent>
    </Popover>
  );
};

export function Sidebar({ isCollapsed = false, onToggle, onItemClick }: SidebarProps) {
  const pathname = usePathname();
  const [isMastersOpen, setIsMastersOpen] = useState(true);
  const [isInventoryOpen, setIsInventoryOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="flex h-full flex-col bg-theme-gradient-b text-white transition-all duration-300 w-[240px]" />; // Return placeholder or null
  }

  return (
    <div className="flex h-full flex-col bg-theme-gradient-b text-white transition-all duration-300">
      {/* Logo/Brand */}
      <div className={cn(
        "flex h-14 items-center bg-transparent transition-all",
        isCollapsed ? "justify-center px-0" : "px-3 justify-between"
      )}>
        <Link href="/" className={cn(
          "flex items-center gap-2 font-semibold text-white transition-transform hover:scale-105",
          isCollapsed && "justify-center"
        )}>
          <div className="rounded-lg bg-white/20 p-1.5 shadow-lg shadow-black/10">
            <Package className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && <span className="text-sm font-bold tracking-wide">ERP Packaging</span>}
        </Link>

        {/* Toggle Button (Desktop Only) */}
        {!isCollapsed && onToggle && (
          <Button variant="ghost" size="icon" onClick={onToggle} className="h-6 w-6 text-white/70 hover:bg-white/10 hover:text-white">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Toggle Button (Collapsed Only) */}
      {isCollapsed && onToggle && (
        <div className="flex justify-center py-2 bg-transparent">
          <Button variant="ghost" size="icon" onClick={onToggle} className="h-6 w-6 text-white/70 hover:text-white">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 py-3 px-2">
        <div className="space-y-1">
          {/* Dashboard */}
          <Link
            href="/"
            onClick={onItemClick}
            title={isCollapsed ? "Dashboard" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-lg py-2 text-sm font-medium transition-all group",
              isCollapsed ? "justify-center px-0" : "px-3",
              pathname === "/"
                ? "bg-white dark:bg-white/90 text-blue-600 dark:text-blue-500 shadow-lg shadow-black/10"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <Home className="h-4 w-4" />
            {!isCollapsed && <span>Dashboard</span>}
          </Link>

          {/* Estimation */}
          <Link
            href="/estimation"
            onClick={onItemClick}
            title={isCollapsed ? "Estimation" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-lg py-2 text-sm font-medium transition-all group",
              isCollapsed ? "justify-center px-0" : "px-3",
              pathname === "/estimation"
                ? "bg-white dark:bg-white/90 text-blue-600 dark:text-blue-500 shadow-lg shadow-black/10"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <Calculator className="h-4 w-4" />
            {!isCollapsed && <span>Estimation & Job Card</span>}
          </Link>

          {/* Production */}
          <Link
            href="/production"
            onClick={onItemClick}
            title={isCollapsed ? "Production" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-lg py-2 text-sm font-medium transition-all group",
              isCollapsed ? "justify-center px-0" : "px-3",
              pathname.startsWith("/production")
                ? "bg-white dark:bg-white/90 text-blue-600 dark:text-blue-500 shadow-lg shadow-black/10"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <Factory className="h-4 w-4" />
            {!isCollapsed && <span>Production Management</span>}
          </Link>

          {/* Dispatch */}
          <Link
            href="/dispatch"
            onClick={onItemClick}
            title={isCollapsed ? "Dispatch" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-lg py-2 text-sm font-medium transition-all group",
              isCollapsed ? "justify-center px-0" : "px-3",
              pathname.startsWith("/dispatch")
                ? "bg-white dark:bg-white/90 text-blue-600 dark:text-blue-500 shadow-lg shadow-black/10"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <Truck className="h-4 w-4" />
            {!isCollapsed && <span>Dispatch</span>}
          </Link>

          {/* Inventory Section */}
          {isCollapsed ? (
            <HoverPopover
              trigger={
                <Button variant="ghost" size="icon" className="h-9 w-9 text-white/70 hover:text-white hover:bg-white/10 rounded-lg">
                  <Store className="h-4 w-4" />
                </Button>
              }
              content={
                <>
                  <div className="mb-2 px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/50 border-b border-white/10 flex items-center gap-2">
                    <Store className="h-3 w-3" />
                    Inventory
                  </div>
                  <div className="space-y-0.5">
                    {inventoryItems.map((item) => (
                      <FloatingMenuItem
                        key={item.href}
                        item={item}
                        onClick={onItemClick}
                        isActive={pathname === item.href}
                      />
                    ))}
                  </div>
                </>
              }
            />
          ) : (
            <Collapsible
              open={isInventoryOpen}
              onOpenChange={setIsInventoryOpen}
              className="space-y-1"
            >
              <div className="flex items-center px-3 py-2">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex w-full items-center justify-between p-0 hover:bg-transparent text-white/70 hover:text-white">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">
                        Inventory
                      </span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        isInventoryOpen ? "rotate-0" : "-rotate-90"
                      )}
                    />
                  </Button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent className="space-y-1 data-[state=closed]:hidden data-[state=open]:block">
                {inventoryItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onItemClick}
                      className={cn(
                        "flex items-center gap-2 rounded-lg py-2 text-sm transition-all pl-8 px-3",
                        isActive
                          ? "bg-white dark:bg-white/90 font-medium text-blue-600 dark:text-blue-500 shadow-lg shadow-black/10"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Masters Section */}
          {isCollapsed ? (
            <HoverPopover
              trigger={
                <Button variant="ghost" size="icon" className="h-9 w-9 text-white/70 hover:text-white hover:bg-white/10 rounded-lg">
                  <FolderOpen className="h-4 w-4" />
                </Button>
              }
              content={
                <>
                  <div className="mb-2 px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/50 border-b border-white/10 flex items-center gap-2">
                    <FolderOpen className="h-3 w-3" />
                    Masters
                  </div>
                  <div className="space-y-0.5 font-normal">
                    {masterItems.map((item) => (
                      <FloatingMenuItem
                        key={item.href}
                        item={item}
                        onClick={onItemClick}
                        isActive={pathname === item.href}
                      />
                    ))}
                  </div>
                </>
              }
            />
          ) : (
            <Collapsible
              open={isMastersOpen}
              onOpenChange={setIsMastersOpen}
              className="space-y-1"
            >
              <div className="flex items-center px-3 py-2">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex w-full items-center justify-between p-0 hover:bg-transparent text-white/70 hover:text-white">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">
                        Masters
                      </span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        isMastersOpen ? "rotate-0" : "-rotate-90"
                      )}
                    />
                  </Button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent className="space-y-1 data-[state=closed]:hidden data-[state=open]:block">
                {masterItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onItemClick}
                      className={cn(
                        "flex items-center gap-2 rounded-lg py-2 text-sm transition-all pl-8 px-3",
                        isActive
                          ? "bg-white dark:bg-white/90 font-medium text-blue-600 dark:text-blue-500 shadow-lg shadow-black/10"
                          : "text-white/70 hover:bg-white/10 hover:text-white",
                        item.priority && !isActive && "text-white/90"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </ScrollArea>

      {/* User Footer */}
      <div className="mt-auto border-t border-white/20 p-3">
        {!isCollapsed ? (
          <div className="flex items-center gap-3 rounded-lg bg-white/10 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-blue-600 shadow-md">
              JD
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-white">John Doe</p>
              <p className="truncate text-xs text-white/60">Admin</p>
            </div>
            <div className="flex flex-col gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6 text-white/70 hover:text-white" title="Notifications">
                <Bell className="h-3 w-3" />
              </Button>
              <Link href="/settings" onClick={onItemClick}>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-white/70 hover:text-white" title="Settings">
                  <Settings className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-bold text-blue-600 shadow-md cursor-pointer" title="John Doe">
              JD
            </div>
            <Link href="/settings" onClick={onItemClick}>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white" title="Settings">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
