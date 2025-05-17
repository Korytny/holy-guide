import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

type FontConfig = {
  name: string
  url: string
  className: string
}

type FontContextType = {
  fonts: {
    heading: FontConfig
    subheading: FontConfig
    body: FontConfig
  }
  setFont: (fontName: string, textType: 'heading' | 'subheading' | 'body') => void
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
  const [fonts, setFonts] = useState({
    heading: fontConfigs[0],
    subheading: fontConfigs[0],
    body: fontConfigs[0]
  })
  const [availableFonts] = useState<FontConfig[]>(fontConfigs)

  const loadFont = (font: FontConfig) => {
    const link = document.createElement('link')
    link.href = font.url
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }

  useEffect(() => {
    // Load all fonts in background
    availableFonts.forEach(f => loadFont(f))
  }, [])

  const handleSetFont = (fontName: string, textType: 'heading' | 'subheading' | 'body') => {
    const selectedFont = availableFonts.find(f => f.name === fontName)
    if (selectedFont) {
      setFonts(prev => ({
        ...prev,
        [textType]: selectedFont
      }))
    }
  }

  return (
    <FontContext.Provider value={{ 
      fonts,
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
