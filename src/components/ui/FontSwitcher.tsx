import { useFont } from '@/context/FontContext'
import { useLanguage } from '@/context/LanguageContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Type } from 'lucide-react'

export function FontSwitcher() {
  const { fonts, setFont, availableFonts } = useFont()
  const { language } = useLanguage()

  const textTypes = [
    { id: 'heading', label: language === 'ru' ? 'Заголовки' : language === 'hi' ? 'शीर्षक' : 'Headings' },
    { id: 'subheading', label: language === 'ru' ? 'Подзаголовки' : language === 'hi' ? 'उपशीर्षक' : 'Subheadings' },
    { id: 'body', label: language === 'ru' ? 'Основной текст' : language === 'hi' ? 'मुख्य पाठ' : 'Body text' }
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`flex items-center gap-2 text-sm ${fonts.subheading.className} hover:text-primary transition-colors`}
          onClick={() => document.getElementById('font-menu')?.click()}
        >
          <Type size={16} className="text-gray-600 sm:hidden" />
          <span className="hidden sm:inline">
            {language === 'ru' ? 'Шрифт' : language === 'hi' ? 'फॉन्ट' : 'Font'}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {textTypes.map((type) => (
          <DropdownMenuSub key={type.id}>
            <DropdownMenuSubTrigger>
              {type.label}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {availableFonts.map((font) => (
                <DropdownMenuItem
                  key={`${type.id}-${font.name}`}
                  className={`${font.className} ${fonts[type.id].name === font.name ? 'bg-accent' : ''}`}
                  onSelect={() => setFont(font.name, type.id as 'heading' | 'subheading' | 'body')}
                  style={{ fontFamily: font.name }}
                >
                  {font.name} {fonts[type.id].name === font.name && '✓'}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
