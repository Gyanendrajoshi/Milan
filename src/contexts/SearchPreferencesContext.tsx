import React, { createContext, useContext, useState } from 'react'

const SearchPreferencesContext = createContext<any>(null)

export function SearchPreferencesProvider({ children }: { children: React.ReactNode }) {
    const [preferences, setPreferences] = useState({})

    return (
        <SearchPreferencesContext.Provider value={{ preferences, setPreferences }}>
            {children}
        </SearchPreferencesContext.Provider>
    )
}

export function useSearchPreferences() {
    return useContext(SearchPreferencesContext) || { preferences: {}, setPreferences: () => { } }
}
