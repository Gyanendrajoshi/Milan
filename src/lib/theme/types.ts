export type ThemeVariant =
    | 'default'
    | 'green'
    | 'red'
    | 'purple'
    | 'orange'
    | 'black'
    | 'custom';

export type ColorMode = 'light' | 'dark';

export type FontFamily = 'system' | 'inter' | 'roboto' | 'outfit';
export type FontSize = 'small' | 'normal' | 'large' | 'xlarge';

export interface Theme {
    variant: ThemeVariant;
    mode: ColorMode;
    primaryColor?: string;
    fontFamily?: FontFamily;
    fontSize?: FontSize;
    fontScale?: number; // percentage, e.g. 100
    style?: 'gradient' | 'flat';
}

export interface CustomThemeColors {
    primary: string;
    secondary?: string;
    accent?: string;
    gradientStart?: string;
    gradientEnd?: string;
    tertiary?: string;
}

export interface CustomTheme extends CustomThemeColors {
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ThemeContextValue {
    theme: Theme;
    setTheme: (theme: Theme) => Promise<void>;
    setVariant: (variant: ThemeVariant) => void;
    setMode: (mode: ColorMode) => void;
    toggleMode: () => void;
    setStyle: (style: 'gradient' | 'flat') => void;
    toggleStyle: () => void;
    setFontFamily: (fontFamily: FontFamily) => void;
    setFontSize: (fontSize: FontSize) => void;
    setFontScale: (scale: number) => void;
    customTheme: CustomTheme | null;
    setCustomTheme: (colors: CustomThemeColors, name?: string) => Promise<void>;
    removeCustomTheme: () => Promise<void>;
    isDark: boolean;
    isSystemPreference: boolean;
    availableThemes: string[];
    currentThemeClass: string;
}

export const THEME_CONFIG = {
    storageKey: 'app-theme',
    variants: ['default', 'green', 'red', 'purple', 'orange', 'black', 'custom'] as ThemeVariant[]
};

export const FONT_FAMILIES: Record<FontFamily, { name: string; value: string }> = {
    system: { name: 'System', value: 'system-ui, sans-serif' },
    inter: { name: 'Inter', value: '"Inter", sans-serif' },
    roboto: { name: 'Roboto', value: '"Roboto", sans-serif' },
    outfit: { name: 'Outfit', value: '"Outfit", sans-serif' }
};

export const FONT_SCALES: Record<FontSize, { label: string; scale: number }> = {
    small: { label: 'Small', scale: 0.875 },
    normal: { label: 'Normal', scale: 1 },
    large: { label: 'Large', scale: 1.125 },
    xlarge: { label: 'Extra Large', scale: 1.25 }
};

export class LocalThemeStorage {
    async getTheme(key: string): Promise<Theme | null> {
        if (typeof window === 'undefined') return null;
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : null;
    }

    async setTheme(key: string, theme: Theme): Promise<void> {
        if (typeof window === 'undefined') return;
        localStorage.setItem(key, JSON.stringify(theme));
    }

    async getCustomTheme(key: string): Promise<CustomTheme | null> {
        if (typeof window === 'undefined') return null;
        const stored = localStorage.getItem(`${key}-custom`);
        return stored ? JSON.parse(stored) : null;
    }

    async setCustomTheme(key: string, theme: CustomTheme): Promise<void> {
        if (typeof window === 'undefined') return;
        localStorage.setItem(`${key}-custom`, JSON.stringify(theme));
    }
}
