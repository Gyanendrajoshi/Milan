import { useCallback } from 'react';

/**
 * A potentially minimal implementation of useTranslation
 * designed to satisfy the interface expected by ThemeCustomizer.
 * 
 * If a full i18n library (like next-i18next or react-i18next) is added later,
 * this can be replaced or wrapped.
 */
export function useTranslation() {
    const t = useCallback((key: string) => {
        // For now, just return the key as the translation.
        // In a real app, this would look up the key in a dictionary.
        return key;
    }, []);

    return {
        t,
        i18n: {
            language: 'en', // Default to English
            changeLanguage: (lang: string) => {
                console.log(`Language changed to ${lang} (mock)`);
            }
        }
    };
}
