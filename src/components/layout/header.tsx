"use client";

import { Menu, Settings, User, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 bg-white/80 backdrop-blur-md px-4 shadow-sm transition-all">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 text-slate-700 hover:bg-blue-50 hover:text-blue-600 lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* App Title (visible on mobile when sidebar is hidden) */}
      <div className="flex flex-1 items-center gap-2 lg:hidden">
        <div className="h-8 w-8 rounded-lg bg-blue-600" />
        <h1 className="text-sm font-bold text-slate-900">ERP Packaging</h1>
      </div>

      {/* Spacer for desktop */}
      <div className="hidden flex-1 lg:block" />

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full text-slate-500 hover:bg-blue-50 hover:text-blue-600"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full ring-2 ring-white bg-red-500" />
          <span className="sr-only">Notifications</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full text-slate-500 hover:bg-blue-50 hover:text-blue-600"
        >
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full text-slate-500 hover:bg-blue-50 hover:text-blue-600"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 ring-2 ring-white">
            U
          </div>
          <span className="sr-only">User profile</span>
        </Button>
      </div>
    </header>
  );
}
