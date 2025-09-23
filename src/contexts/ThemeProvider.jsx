import React, { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { createTheme, ThemeProvider as MUIThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

const ThemeContext = createContext()

export function useAppTheme() {
  return useContext(ThemeContext)
}

export default function ThemeProvider({ children, user }) {
  const [mode, setMode] = useState('light')
  // load from Firestore user settings if available
  useEffect(() => {
    let mounted = true
    async function load() {
      if (!user) return
      try {
        const ref = doc(db, 'users', user.uid)
        const snap = await getDoc(ref)
        if (snap.exists()) {
          const data = snap.data()
          if (mounted && data.theme) setMode(data.theme)
        }
      } catch (e) {
        console.warn('Failed to load user settings', e.message)
      }
    }
    load()
    return () => mounted = false
  }, [user])

  const toggle = async () => {
    const next = mode === 'light' ? 'dark' : 'light'
    setMode(next)
    // persist
    try {
      if (user) {
        await setDoc(doc(db, 'users', user.uid), { theme: next }, { merge: true })
      } else {
        localStorage.setItem('theme', next)
      }
    } catch (e) {
      console.warn('Failed to save theme', e.message)
    }
  }

  const theme = useMemo(() => createTheme({
    palette: { mode }
  }), [mode])

  return (
    <ThemeContext.Provider value={{ mode, toggle }}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  )
}
