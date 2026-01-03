"use client";

import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Settings, Moon, Sun, Monitor, Paintbrush, Undo2, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { THEME_CONFIG, ThemeVariant } from "@/lib/theme/types";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCustomThemeGenerator } from "@/hooks/useTheme";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function ThemeCustomizer({ children }: { children?: React.ReactNode }) {
    const {
        theme,
        setVariant,
        setMode,
        setStyle,
        customTheme,
        removeCustomTheme,
        availableThemes
    } = useTheme();

    const { generateFromColor } = useCustomThemeGenerator();
    const [customColor, setCustomColor] = useState(customTheme?.primary || "#000000");

    const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const color = e.target.value;
        setCustomColor(color);
        // Debounce or just apply on blur? For now direct.
        if (color.length === 7) {
            const result = generateFromColor(color, "My Custom Theme");
            if (result.success) {
                // Success
            }
        }
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                {children || (
                    <Button
                        variant="outline"
                        size="icon"
                        className="fixed right-4 bottom-4 h-12 w-12 rounded-full shadow-lg z-50 bg-white dark:bg-slate-900 border-2 border-primary animate-in fade-in zoom-in hover:scale-110 transition-transform"
                    >
                        <Settings className="w-6 h-6 spin-in-180" />
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent className="w-[300px] sm:w-[400px] overflow-y-auto">
                <SheetHeader className="pb-4">
                    <SheetTitle className="flex items-center gap-2">
                        <Paintbrush className="w-5 h-5 text-primary" />
                        Theme Customizer
                    </SheetTitle>
                </SheetHeader>

                <div className="space-y-6">
                    {/* 1. Mode Toggle */}
                    <div className="space-y-3">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Appearance</Label>
                        <div className="grid grid-cols-3 gap-2">
                            <Button
                                variant={theme.mode === 'light' ? 'default' : 'outline'}
                                className={cn("gap-2", theme.mode === 'light' ? "bg-primary text-primary-foreground" : "")}
                                onClick={() => setMode('light')}
                            >
                                <Sun className="w-4 h-4" /> Light
                            </Button>
                            <Button
                                variant={theme.mode === 'dark' ? 'default' : 'outline'}
                                className={cn("gap-2", theme.mode === 'dark' ? "bg-primary text-primary-foreground" : "")}
                                onClick={() => setMode('dark')}
                            >
                                <Moon className="w-4 h-4" /> Dark
                            </Button>
                            {/* System? */}
                        </div>
                    </div>



                    <Separator />

                    {/* 3. Presets */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pro Presets</Label>
                            {theme.mode === 'dark' && (
                                <span className="text-[10px] text-amber-500 font-medium">Locked in Dark Mode</span>
                            )}
                        </div>
                        <div className={cn("grid grid-cols-2 gap-2", theme.mode === 'dark' && "opacity-50 pointer-events-none grayscale")}>
                            {availableThemes.filter(t => t !== 'custom').map((variant) => (
                                <Button
                                    key={variant}
                                    variant="outline"
                                    className={cn(
                                        "justify-start gap-3 h-auto py-3 px-3 relative overflow-hidden transition-all",
                                        theme.variant === variant && "ring-2 ring-primary bg-primary/5"
                                    )}
                                    onClick={() => setVariant(variant as ThemeVariant)}
                                >
                                    <div className={cn(
                                        "w-6 h-6 rounded-full shadow-sm shrink-0",
                                        getPreviewColor(variant)
                                    )} />
                                    <div className="flex flex-col items-start">
                                        <span className="text-sm font-semibold capitalize">{variant}</span>
                                    </div>
                                    {theme.variant === variant && (
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                                    )}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* 4. Brand Theme */}
                    <div className={cn("space-y-3", theme.mode === 'dark' && "opacity-50 pointer-events-none grayscale")}>
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">AI Brand Theme</Label>
                            {theme.variant === 'custom' && (
                                <Button variant="ghost" size="sm" onClick={removeCustomTheme} className="h-6 text-xs text-destructive hover:text-destructive">
                                    <Undo2 className="w-3 h-3 mr-1" /> Reset
                                </Button>
                            )}
                        </div>
                        <div className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-900 space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs">Brand Primary Color</Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border shadow-sm" style={{ backgroundColor: customColor }} />
                                        <Input
                                            value={customColor}
                                            onChange={handleCustomColorChange}
                                            className="pl-8 uppercase font-mono"
                                            maxLength={7}
                                        />
                                    </div>
                                    <Input
                                        type="color"
                                        value={customColor}
                                        onChange={handleCustomColorChange}
                                        className="w-10 h-10 p-1 cursor-pointer"
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    We automatically generate secondary gradients and table header colors from this base.
                                </p>
                            </div>
                            <Button
                                className="w-full"
                                variant={theme.variant === 'custom' ? "default" : "secondary"}
                                onClick={() => {
                                    const result = generateFromColor(customColor, "My Brand Theme");
                                    if (result.success) {
                                        toast.success("Theme Generated!");
                                    }
                                }}
                            >
                                Apply Brand Theme
                            </Button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

function getPreviewColor(variant: string) {
    switch (variant) {
        case 'default': return "bg-slate-900";
        case 'green': return "bg-emerald-600";
        case 'red': return "bg-red-600";
        case 'purple': return "bg-purple-600";
        case 'orange': return "bg-orange-500";
        case 'black': return "bg-black";
        default: return "bg-slate-400";
    }
}
