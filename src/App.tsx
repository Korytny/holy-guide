
import React, { Suspense, lazy } from 'react'; // Import Suspense and lazy
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";

// --- Lazy load pages ---
const LanguageSelection = lazy(() => import("./pages/LanguageSelection"));
const CitiesPage = lazy(() => import("./pages/CitiesPage"));
const CityDetail = lazy(() => import("./pages/CityDetail"));
const PlaceDetail = lazy(() => import("./pages/PlaceDetail"));
const RouteDetail = lazy(() => import("./pages/RouteDetail"));
const EventDetail = lazy(() => import("./pages/EventDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const Profile = lazy(() => import("./pages/Profile"));

const queryClient = new QueryClient();

// Simple loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div>Loading...</div> 
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            {/* Wrap Routes with Suspense */}
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<CitiesPage />} />
                <Route path="/language" element={<LanguageSelection />} />
                <Route path="/cities/:id" element={<CityDetail />} />
                <Route path="/places/:id" element={<PlaceDetail />} />
                <Route path="/routes/:id" element={<RouteDetail />} />
                <Route path="/events/:id" element={<EventDetail />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
