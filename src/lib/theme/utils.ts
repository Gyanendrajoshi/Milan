import { Theme, CustomTheme, CustomThemeColors, ColorMode } from './types'

export function getSystemTheme(): ColorMode {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function getThemeClassName(theme: Theme): string {
    const classes = []

    if (theme.mode === 'dark') {
        classes.push('dark')
    }

    if (theme.style === 'flat') {
        classes.push('theme-flat')
    }

    // Variant is typically handled via data attributes in our previous implementation,
    // but let's return it as a class if the hook expects that, or rely on the hook's attribute setting.
    // The hook does: root.classList.add(...themeClass.split(' '))
    // So we should return the mode likely.
    // The hook ALSO does: root.setAttribute('data-theme', theme.variant)
    // So this util just needs to handle mode essentially.

    return classes.join(' ')
}

export function applyCustomTheme(customTheme: CustomTheme) {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;

    // Apply primary color variable
    // We assume the user provides a hex code. We should convert to HSL if possible,
    // or just set the variable if globals.css can handle it.
    // Given the previous hook logic, let's replicate the Hex to HSL conversion here.

    const hex = customTheme.primary;
    const hsl = hexToHSL(hex);

    root.style.setProperty('--primary', hsl);
    root.style.setProperty('--ring', hsl);

    // Apply Gradients if present
    if (customTheme.gradientStart) {
        root.style.setProperty('--theme-start', hexToHSL(customTheme.gradientStart));
    }
    if (customTheme.gradientEnd) {
        root.style.setProperty('--theme-end', hexToHSL(customTheme.gradientEnd));
    }

    // Apply Tertiary
    // Default to a light slate/muted if not provided, or simply don't set it (CSS fallback)
    if (customTheme.tertiary) {
        root.style.setProperty('--tertiary', hexToHSL(customTheme.tertiary));
    }
}

export function removeCustomTheme() {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    root.style.removeProperty('--primary');
    root.style.removeProperty('--ring');
    root.style.removeProperty('--theme-start');
    root.style.removeProperty('--theme-end');
    root.style.removeProperty('--tertiary');
}

export function validateTheme(colors: CustomThemeColors, mode: ColorMode): { isValid: boolean, errors?: string[] } {
    if (!colors.primary || !colors.primary.startsWith('#')) {
        return { isValid: false, errors: ['Invalid primary color'] };
    }
    return { isValid: true };
}

export function generateColorVariants(baseColor: string): CustomThemeColors {
    // 1. Primary is Base
    // 2. Secondary (Gradient End) is analogous (+30deg hue) or slightly darker/more saturated
    // 3. Tertiary is complimentary or a much lighter background shade

    const hsl = hexToHSL(baseColor); // "220 80% 50%"
    const [h, s, l] = parseHSL(hsl);

    // Generate Gradient End (Analagous - shift hue by 20 deg)
    const endHue = (h + 25) % 360;
    const endColor = hslToHex(endHue, s, l);

    // Generate Tertiary (Desaturated, darker for borders/headers)
    // Actually for headers we want a nice color. Maybe monochromatic darker?
    // Let's try 50% lighter or darker depending on mode, but we don't know mode here easily.
    // Let's go with a muted version of the primary.
    const tertHue = h;
    const tertSat = Math.max(0, s - 30); // Less saturated
    const tertLight = Math.max(10, l - 10); // Slightly darker for clear visibility on white?? Or lighter?
    // User asked for opacity later, so maybe just a solid color that looks good behind white text?
    // Actually the user image shows tertiary is a solid color block.
    // Let's pick a Triadic color for interest? Or Monochromatic?
    // User image shows Purple -> Purple Gradient. 
    // Let's stick to Monochromatic/Analogous for safety.

    // Let's simply make Tertiary a variant of Primary
    const tertColor = hslToHex(h, Math.max(0, s - 20), Math.max(0, l - 15));

    return {
        primary: baseColor,
        gradientStart: baseColor,
        gradientEnd: endColor,
        tertiary: tertColor
    };
}

function parseHSL(hslStr: string): [number, number, number] {
    const parts = hslStr.split(' ');
    const h = parseFloat(parts[0]);
    const s = parseFloat(parts[1]);
    const l = parseFloat(parts[2]);
    return [h, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHSL(hex: string): string {
    // Safety check
    if (!hex || typeof hex !== 'string') return "0 0% 0%";

    let r = 0, g = 0, b = 0;

    // Clean hash if present
    const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;

    if (cleanHex.length === 3) {
        r = parseInt("0x" + cleanHex[0] + cleanHex[0]);
        g = parseInt("0x" + cleanHex[1] + cleanHex[1]);
        b = parseInt("0x" + cleanHex[2] + cleanHex[2]);
    } else if (cleanHex.length === 6) {
        r = parseInt("0x" + cleanHex.substring(0, 2));
        g = parseInt("0x" + cleanHex.substring(2, 4));
        b = parseInt("0x" + cleanHex.substring(4, 6));
    } else {
        return "0 0% 0%"; // Invalid length
    }

    // Check for NaN
    if (isNaN(r) || isNaN(g) || isNaN(b)) return "0 0% 0%";

    r /= 255; g /= 255; b /= 255;

    const cmin = Math.min(r, g, b), cmax = Math.max(r, g, b), delta = cmax - cmin;
    let h = 0, s = 0, l = 0;

    if (delta === 0) h = 0;
    else if (cmax === r) h = ((g - b) / delta) % 6;
    else if (cmax === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
    l = (cmax + cmin) / 2;
    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    // Check for NaN again just in case
    if (isNaN(h) || isNaN(s) || isNaN(l)) return "0 0% 0%";

    return `${h} ${s}% ${l}%`;
}
