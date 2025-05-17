import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

type FontConfig = {
  name: string
  url: string
  className: string
}

type FontContextType = {
  font: FontConfig
  setFont: (fontName: string) => void
  availableFonts: FontConfig[]
  loadFont: (font: FontConfig) => void
}

const FontContext = createContext<FontContextType | undefined>(undefined)

const fontConfigs: FontConfig[] = [
  {
    name: 'Roboto',
    url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap',
    className: 'font-roboto'
  },
  {
    name: 'Open Sans',
    url: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap',
    className: 'font-open-sans'
  },
  {
    name: 'Montserrat',
    url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap',
    className: 'font-montserrat'
  }
]

export function FontProvider({ children }: { children: ReactNode }) {
  const [font, setFont] = useState<FontConfig>(fontConfigs[0])
  const [availableFonts] = useState<FontConfig[]>(fontConfigs)

  const loadFont = (font: FontConfig) => {
    const link = document.createElement('link')
    link.href = font.url
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }

  useEffect(() => {
    // Load initial font
    loadFont(font)
    
    // Load all fonts in background
    availableFonts.forEach(f => loadFont(f))
  }, [])

  const handleSetFont = (fontName: string) => {
    const selectedFont = availableFonts.find(f => f.name === fontName)
    if (selectedFont) {
      // Remove all font classes first
      availableFonts.forEach(f => {
        document.documentElement.classList.remove(f.className)
      })
      // Add selected font class
      setFont(selectedFont)
      document.documentElement.classList.add(selectedFont.className)
    }
  }

  return (
    <FontContext.Provider value={{ 
      font, 
      setFont: handleSetFont, 
      availableFonts,
      loadFont
    }}>
      {children}
    </FontContext.Provider>
  )
}

export function useFont() {
  const context = useContext(FontContext)
  if (context === undefined) {
    throw new Error('useFont must be used within a FontProvider')
  }
  return context
}
