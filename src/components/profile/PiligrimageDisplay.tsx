import { type PlannedItem } from "../../types";
import { type Language } from "../../types";
import { type LanguageContextType } from "../../context/LanguageContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLocalizedText } from "../../utils/languageUtils";

interface PiligrimageDisplayProps {
  items: PlannedItem[];
  onRemove: (id: string) => void;
  onAddPlace: (cityId: string) => void;
  language: Language;
  t: LanguageContextType['t'];
}

export const PiligrimageDisplay: React.FC<PiligrimageDisplayProps> = ({
  items,
  onRemove,
  onAddPlace,
  language,
  t
}) => {
  return (
    <div className="space-y-4">
      {items.map(item => (
        <Card key={item.data.id}>
          <CardHeader>
            <CardTitle>
              {getLocalizedText(item.data.name, language)}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div>
              {item.date && <p>{item.date}</p>}
              {item.time && <p>{item.time}</p>}
            </div>
            <Button 
              variant="destructive"
              size="sm"
              onClick={() => onRemove(item.data.id)}
            >
              {t('remove')}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
