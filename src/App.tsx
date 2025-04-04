
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";

// Pages
import LanguageSelection from "./pages/LanguageSelection";
import CitiesPage from "./pages/CitiesPage";
import CityDetail from "./pages/CityDetail";
import PlaceDetail from "./pages/PlaceDetail";
import RouteDetail from "./pages/RouteDetail";
import EventDetail from "./pages/EventDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LanguageSelection />} />
            <Route path="/cities" element={<CitiesPage />} />
            <Route path="/cities/:id" element={<CityDetail />} />
            <Route path="/places/:id" element={<PlaceDetail />} />
            <Route path="/routes/:id" element={<RouteDetail />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
