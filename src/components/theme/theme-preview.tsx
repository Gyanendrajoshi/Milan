"use client";

import { motion } from "framer-motion";
import {
    BarChart3,
    Box,
    ChevronRight,
    Home,
    LayoutDashboard,
    Search,
    Settings,
    ShoppingCart,
    Users
} from "lucide-react";

interface ThemePreviewProps {
    startColor: string;
    endColor: string;
}

export function ThemePreview({ startColor, endColor }: ThemePreviewProps) {
    const sidebarStyle = {
        background: `linear-gradient(to bottom, ${startColor}, ${endColor})`,
    };

    const activeItemStyle = {
        background: "rgba(255, 255, 255, 0.2)",
        color: "white",
    };

    return (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl border border-slate-200/50 bg-slate-50 flex">
            {/* Mock Sidebar */}
            <div
                className="w-1/4 h-full flex flex-col p-3 gap-4"
                style={sidebarStyle}
            >
                {/* Logo Area */}
                <div className="flex items-center gap-2 px-1 mb-2">
                    <div className="h-6 w-6 rounded-md bg-white/20 backdrop-blur-sm" />
                    <div className="h-3 w-20 rounded bg-white/40" />
                </div>

                {/* Nav Items */}
                <div className="space-y-1">
                    <div className="flex items-center gap-2 p-2 rounded-lg" style={activeItemStyle}>
                        <Home className="h-3 w-3 text-white" />
                        <div className="h-2 w-16 rounded bg-white/80" />
                    </div>
                    {[Box, ShoppingCart, Users, BarChart3].map((Icon, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-lg opacity-60">
                            <Icon className="h-3 w-3 text-white" />
                            <div className="h-2 w-16 rounded bg-white/60" />
                        </div>
                    ))}
                </div>

                <div className="mt-auto flex items-center gap-2 p-2 opacity-60">
                    <Settings className="h-3 w-3 text-white" />
                    <div className="h-2 w-12 rounded bg-white/60" />
                </div>
            </div>

            {/* Mock Main Content */}
            <div className="flex-1 flex flex-col h-full bg-slate-50/50">
                {/* Header */}
                <div className="h-12 border-b bg-white/80 backdrop-blur px-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Search className="h-3 w-3" />
                        <div className="h-2 w-24 rounded bg-slate-200" />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-slate-200" />
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-4 space-y-4 overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                        <div className="h-5 w-32 rounded bg-slate-300" />
                        <div className="h-8 w-24 rounded bg-blue-600/10" />
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="h-24 rounded-xl bg-white shadow-sm p-3 border border-slate-100 flex flex-col justify-between">
                            <div className="h-8 w-8 rounded-lg bg-blue-50" />
                            <div className="space-y-2">
                                <div className="h-2 w-12 rounded bg-slate-200" />
                                <div className="h-4 w-10 rounded bg-slate-300" />
                            </div>
                        </div>
                        <div className="h-24 rounded-xl bg-white shadow-sm p-3 border border-slate-100 flex flex-col justify-between">
                            <div className="h-8 w-8 rounded-lg bg-emerald-50" />
                            <div className="space-y-2">
                                <div className="h-2 w-12 rounded bg-slate-200" />
                                <div className="h-4 w-10 rounded bg-slate-300" />
                            </div>
                        </div>
                    </div>

                    {/* List */}
                    <div className="rounded-xl bg-white shadow-sm border border-slate-100 flex-1 p-3 space-y-3">
                        <div className="flex items-center justify-between border-b pb-2">
                            <div className="h-3 w-20 rounded bg-slate-300" />
                        </div>
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded bg-slate-100" />
                                    <div className="space-y-1">
                                        <div className="h-2 w-24 rounded bg-slate-200" />
                                    </div>
                                </div>
                                <div className="h-2 w-8 rounded bg-slate-200" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Overlay Label */}
            <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/50 backdrop-blur text-[10px] font-medium text-white uppercase tracking-wider">
                Live Preview
            </div>
        </div>
    );
}
