import { useFont } from '@/context/FontContext'
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

const textTypes = [
  { id: 'heading', label: 'Заголовки' },
  { id: 'subheading', label: 'Подзаголовки' },
  { id: 'body', label: 'Основной текст' }
]

export function FontSwitcher() {
  const { fonts, setFont, availableFonts } = useFont()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Шрифты</Button>
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
