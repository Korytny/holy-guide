import { PilgrimagePlannerMain } from "./PilgrimagePlannerMain";
import { type AuthContextType } from "../../context/AuthContext";
import { type LanguageContextType } from "../../context/LanguageContext";
import { Language } from "../../types";

interface PilgrimagePlannerProps {
  auth: AuthContextType;
  language: Language;
  t: LanguageContextType['t'];
  onItemsChange?: (items: any[]) => void;
}

export const PilgrimagePlanner: React.FC<PilgrimagePlannerProps> = ({ 
  auth, 
  language, 
  t, 
  onItemsChange 
}) => {
  return (
    <PilgrimagePlannerMain
      auth={auth}
      language={language}
      t={t}
      onItemsChange={onItemsChange}
    />
  );
};
