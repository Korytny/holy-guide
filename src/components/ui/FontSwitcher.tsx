import { useFont } from '@/context/FontContext'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function FontSwitcher() {
  const { font, setFont, availableFonts } = useFont()

  return (
    <Select value={font.name} onValueChange={(value) => setFont(value)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select font" />
      </SelectTrigger>
      <SelectContent>
        {availableFonts.map((fontOption) => (
          <SelectItem 
            key={fontOption.name} 
            value={fontOption.name}
            className={fontOption.className}
          >
            {fontOption.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
