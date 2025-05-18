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
    url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap&subset=cyrillic',
    className: 'font-roboto'
  },
  {
    name: 'Open Sans',
    url: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap&subset=cyrillic',
    className: 'font-open-sans'
  },
  {
    name: 'Montserrat',
    url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap&subset=cyrillic',
    className: 'font-montserrat'
  },
  {
    name: 'Lato',
    url: 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap&subset=cyrillic',
    className: 'font-lato'
  },
  {
    name: 'PT Serif',
    url: 'https://fonts.googleapis.com/css2?family=PT+Serif:wght@400;700&display=swap&subset=cyrillic',
    className: 'font-pt-serif'
  },
  {
    name: 'Ubuntu',
    url: 'https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;700&display=swap&subset=cyrillic',
    className: 'font-ubuntu'
  },
  {
    name: 'Playfair Display',
    url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap&subset=cyrillic',
    className: 'font-playfair-display'
  },
  {
    name: 'PT Sans',
    url: 'https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap&subset=cyrillic',
    className: 'font-pt-sans'
  }
]

export function FontProvider({ children }: { children: ReactNode }) {
  const [fonts, setFonts] = useState({
    heading: fontConfigs.find(f => f.name === 'Montserrat') || fontConfigs[0],
    subheading: fontConfigs.find(f => f.name === 'Ubuntu') || fontConfigs[0],
    body: fontConfigs.find(f => f.name === 'Open Sans') || fontConfigs[0]
  })
  const [availableFonts] = useState<FontConfig[]>(fontConfigs)

  const loadFont = (font: FontConfig) => {
    return new Promise<void>((resolve) => {
      const existingLink = document.querySelector(`link[href="${font.url}"]`)
      if (existingLink) {
        resolve()
        return
      }

      const link = document.createElement('link')
      link.href = font.url
      link.rel = 'stylesheet'
      link.onload = () => {
        console.log(`Font ${font.name} loaded`)
        // Force font update by adding/removing class
        document.body.classList.add('font-loading')
        setTimeout(() => {
          document.body.classList.remove('font-loading')
          resolve()
        }, 100)
      }
      link.onerror = () => {
        console.error(`Failed to load font ${font.name}`)
        resolve()
      }
      document.head.appendChild(link)
    })
  }

  useEffect(() => {
    // Load all fonts in background
    availableFonts.forEach(f => loadFont(f))
  }, [])

  const handleSetFont = async (fontName: string, textType: 'heading' | 'subheading' | 'body') => {
    const selectedFont = availableFonts.find(f => f.name === fontName)
    if (selectedFont) {
      await loadFont(selectedFont)
      setFonts(prev => ({
        ...prev,
        [textType]: selectedFont
      }))
      // Force re-render by toggling a class
      document.body.classList.add('font-changing')
      setTimeout(() => {
        document.body.classList.remove('font-changing')
      }, 50)
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
