
import React, { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";
import Layout from './components/Layout'; // Import Layout component

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
const TestPage = lazy(() => import("./pages/TestPage"));
const PilgrimagePlannerPage = lazy(() => import("./pages/PilgrimagePlannerPage"));

const queryClient = new QueryClient();

// Simple loading fallback component
const LoadingFallback = () => (
  <Layout> {/* Optional: Wrap fallback in Layout too? */}
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
  </Layout>
);

// Define routes that should use the Layout
const routesWithLayout = [
  { path: "/", element: <CitiesPage /> },
  { path: "/cities/:id", element: <CityDetail /> },
  { path: "/places/:id", element: <PlaceDetail /> },
  { path: "/routes/:id", element: <RouteDetail /> },
  { path: "/events/:id", element: <EventDetail /> },
  { path: "/profile", element: <Profile /> },
  { path: "/test", element: <TestPage /> },
];


// Define routes that should NOT use the Layout (optional)
const routesWithoutLayout = [
  { path: "/language", element: <LanguageSelection /> },
  { path: "/auth", element: <Auth /> },
  { path: "/auth/callback", element: <AuthCallback /> },
  { path: "/pilgrimage-planner", element: <PilgrimagePlannerPage /> },
];

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Routes wrapped with Layout */}
                {routesWithLayout.map((route) => (
                  <Route 
                    key={route.path}
                    path={route.path} 
                    element={<Layout>{route.element}</Layout>} 
                  />
                ))}
                
                  
                {/* Routes without Layout */}
                 {routesWithoutLayout.map((route) => (
                  <Route 
                    key={route.path}
                    path={route.path} 
                    element={route.element} 
                  />
                ))}
                
                {/* Fallback/Not Found Route (can be inside or outside Layout) */}
                <Route path="*" element={<Layout><NotFound /></Layout>} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
