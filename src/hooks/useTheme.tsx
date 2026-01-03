'use client'

import React, { useContext, useEffect, useState, useCallback } from 'react'
import type {
    Theme,
    ThemeVariant,
    ColorMode,
    CustomTheme,
    CustomThemeColors,
    ThemeContextValue,
    FontFamily,
    FontSize
} from '@/lib/theme/types'
import {
    getSystemTheme,
    applyCustomTheme,
    removeCustomTheme,
    getThemeClassName,
    validateTheme,
    generateColorVariants
} from '@/lib/theme/utils'
import { THEME_CONFIG, LocalThemeStorage, FONT_FAMILIES, FONT_SCALES } from '@/lib/theme/types'
import { ThemeContext } from '@/contexts/ThemeContext'

// Default theme
const DEFAULT_THEME: Theme = {
    variant: 'default',
    mode: 'light',
    fontFamily: 'system',
    fontSize: 'normal',
    style: 'flat'
}

/**
 * Hook for managing theme state
 * This is the main interface for theme management in the application
 */
export function useTheme(): ThemeContextValue {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const themeState = useThemeState()
    return (
        <ThemeContext.Provider value={themeState} >
            {children}
        </ThemeContext.Provider>
    )
}

/**
 * Low-level theme hook for internal use or when provider is not needed
 * Most components should use useTheme() instead
 */
export function useThemeState(
    defaultTheme: Theme = DEFAULT_THEME,
    storageKey: string = THEME_CONFIG.storageKey,
    enableSystem: boolean = true
) {
    // 1. Lazy Initialization (synchronous read) to prevent race conditions
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window === 'undefined') return defaultTheme;
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) return JSON.parse(saved);

            if (enableSystem) {
                const systemMode = getSystemTheme();
                return { ...defaultTheme, mode: systemMode };
            }
            return defaultTheme;
        } catch (e) {
            console.error("Theme init error:", e);
            return defaultTheme;
        }
    });

    const [customTheme, setCustomThemeState] = useState<CustomTheme | null>(() => {
        if (typeof window === 'undefined') return null;
        try {
            const saved = localStorage.getItem(`${storageKey}-custom`);
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.error("Custom theme init error:", e);
            return null;
        }
    });

    const [isSystemPreference, setIsSystemPreference] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // 2. Hydration Complete
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // 3. Persist & Apply (Triggered by state changes)
    useEffect(() => {
        // We run this even if not mounted yet if possible to apply styles ASAP, 
        // but for safety/hydration match, usually wait for mount.
        // With lazy init, 'theme' is already correct on first render.
        if (typeof window === 'undefined') return;

        const root = document.documentElement;

        // Classes
        const themeClass = getThemeClassName(theme);
        const existingClasses = Array.from(root.classList).filter(cls =>
            cls.startsWith('theme-') || cls === 'light' || cls === 'dark'
        );
        root.classList.remove(...existingClasses);
        const classesToAdd = themeClass.split(' ').filter(c => c.length > 0);
        if (classesToAdd.length > 0) root.classList.add(...classesToAdd);

        // Attribute
        root.setAttribute('data-theme', theme.variant);

        // Custom Theme
        if (theme.variant === 'custom' && customTheme) {
            applyCustomTheme(customTheme);
        } else {
            removeCustomTheme();
        }

        // Fonts
        const fontFamily = theme.fontFamily || 'system';
        if (FONT_FAMILIES[fontFamily]) {
            const fontConfig = FONT_FAMILIES[fontFamily];
            // Fix: Check if FONT_FAMILIES returns valid object
            root.style.setProperty('--font-family-base', fontConfig.value);
        }

        if (theme.fontScale !== undefined) {
            const scale = theme.fontScale / 100;
            root.style.setProperty('--font-scale', scale.toString());
        } else {
            const fontSize = theme.fontSize || 'normal';
            if (FONT_SCALES[fontSize]) {
                const scaleConfig = FONT_SCALES[fontSize];
                root.style.setProperty('--font-scale', scaleConfig.scale.toString());
            }
        }

        // Save (Only if mounted to avoid hydration save?)
        // Actually safe to save what we have as it matches what we loaded or intended default.
        if (isMounted) {
            localStorage.setItem(storageKey, JSON.stringify(theme));
            // Important: We don't save customTheme here usually, as it has its own setter.
            // But if we want to be safe:
            // if (customTheme) localStorage.setItem(`${storageKey}-custom`, JSON.stringify(customTheme));
        }

    }, [theme, customTheme, isMounted, storageKey]);


    // Listen for system theme changes
    useEffect(() => {
        if (!enableSystem || !isSystemPreference) return

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = (e: MediaQueryListEvent) => {
            if (theme.variant === 'default') { // Only auto-switch if not forced? Or simply update mode
                const newMode: ColorMode = e.matches ? 'dark' : 'light'
                setThemeState(prev => ({ ...prev, mode: newMode }))
            }
        }

        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [enableSystem, isSystemPreference, theme.variant])

    // Theme setters
    // Adapter for legacy storage calls if needed, though we primarily use Effect
    const storage = new LocalThemeStorage();

    const setTheme = useCallback(async (newTheme: Theme) => {
        setThemeState(newTheme)
        setIsSystemPreference(false)
        // Redundant save via class for consistency with other parts of app if any
        try {
            await storage.setTheme(storageKey, newTheme)
        } catch (error) {
            console.error('Failed to save theme:', error)
        }
    }, [storageKey])

    const setVariant = useCallback((variant: ThemeVariant) => {
        setTheme({ ...theme, variant })
    }, [theme, setTheme])

    const setMode = useCallback((mode: ColorMode) => {
        setTheme({ ...theme, mode })
    }, [theme, setTheme])

    const toggleMode = useCallback(() => {
        const newMode: ColorMode = theme.mode === 'light' ? 'dark' : 'light'
        setMode(newMode)
    }, [theme.mode, setMode])

    const setStyle = useCallback((style: 'gradient' | 'flat') => {
        setTheme({ ...theme, style })
    }, [theme, setTheme])

    const toggleStyle = useCallback(() => {
        const newStyle = theme.style === 'flat' ? 'gradient' : 'flat'
        setStyle(newStyle)
    }, [theme.style, setStyle])

    const setFontFamily = useCallback((fontFamily: FontFamily) => {
        setTheme({ ...theme, fontFamily })
    }, [theme, setTheme])

    const setFontSize = useCallback((fontSize: FontSize) => {
        setTheme({ ...theme, fontSize, fontScale: undefined })  // Clear custom scale when using preset
    }, [theme, setTheme])

    const setFontScale = useCallback((scale: number) => {
        const clampedScale = Math.max(80, Math.min(150, scale))
        setTheme({ ...theme, fontScale: clampedScale, fontSize: undefined })  // Clear preset when using custom scale
    }, [theme, setTheme])

    // Custom theme management
    const setCustomTheme = useCallback(async (colors: CustomThemeColors, name?: string) => {
        const validation = validateTheme(colors, theme.mode)
        if (!validation.isValid) {
            console.warn('Custom theme validation failed:', validation.errors)
        }

        const newCustomTheme: CustomTheme = {
            ...colors,
            name: name || 'Custom Theme',
            id: `custom-${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        setCustomThemeState(newCustomTheme)
        await setTheme({ ...theme, variant: 'custom' })

        try {
            await storage.setCustomTheme(storageKey, newCustomTheme)
        } catch (error) {
            console.error('Failed to save custom theme:', error)
        }
    }, [theme, setTheme, storageKey])

    const removeCustomThemeCallback = useCallback(async () => {
        setCustomThemeState(null)
        removeCustomTheme()

        await setTheme({ ...theme, variant: 'default' })

        try {
            const currentTheme = await storage.getTheme(storageKey)
            if (currentTheme) {
                await storage.setTheme(storageKey, { ...currentTheme, variant: 'default' })
            }
        } catch (error) {
            console.error('Failed to remove custom theme:', error)
        }
    }, [theme, setTheme, storageKey])

    return {
        theme,
        setTheme,
        setVariant,
        setMode,
        toggleMode,
        setStyle,
        toggleStyle,
        setFontFamily,
        setFontSize,
        setFontScale,
        customTheme,
        setCustomTheme,
        removeCustomTheme: removeCustomThemeCallback,
        isDark: theme.mode === 'dark',
        isSystemPreference,
        availableThemes: [...THEME_CONFIG.variants],
        currentThemeClass: getThemeClassName(theme),
    }
}

/**
 * Hook for generating custom themes from a base color
 */
export function useCustomThemeGenerator() {
    const { setCustomTheme } = useTheme()

    const generateFromColor = useCallback((baseColor: string, name?: string) => {
        try {
            const variants = generateColorVariants(baseColor)
            setCustomTheme(variants, name)
            return { success: true, variants }
        } catch (error) {
            console.error('Failed to generate custom theme:', error)
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
        }
    }, [setCustomTheme])

    const validateColor = useCallback((colors: CustomThemeColors, mode: ColorMode = 'light') => {
        return validateTheme(colors, mode)
    }, [])

    return {
        generateFromColor,
        validateColor,
        generateColorVariants,
    }
}

/**
 * Hook for theme-aware animations
 */
export function useThemeTransitions() {
    const { isDark } = useTheme()
    const [isTransitioning, setIsTransitioning] = useState(false)

    useEffect(() => {
        setIsTransitioning(true)
        const timeout = setTimeout(() => setIsTransitioning(false), 150)
        return () => clearTimeout(timeout)
    }, [isDark])

    return {
        isTransitioning,
        transitionClass: isTransitioning ? 'transition-colors duration-150' : ''
    }
}

/**
 * Hook for persisting theme across sessions (multi-tenant support)
 */
export function useThemePersistence(tenantId?: string) {
    const { theme, setTheme } = useTheme()
    const storageKey = tenantId ? `${THEME_CONFIG.storageKey}-${tenantId}` : THEME_CONFIG.storageKey

    const saveThemeForTenant = useCallback(async (theme: Theme) => {
        const storage = new LocalThemeStorage()
        await storage.setTheme(storageKey, theme)
    }, [storageKey])

    const loadThemeForTenant = useCallback(async (): Promise<Theme | null> => {
        const storage = new LocalThemeStorage()
        return await storage.getTheme(storageKey)
    }, [storageKey])

    return {
        saveThemeForTenant,
        loadThemeForTenant,
        currentStorageKey: storageKey,
    }
}