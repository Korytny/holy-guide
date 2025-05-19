import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Filter out react-beautiful-dnd defaultProps warning
if (process.env.NODE_ENV === 'development') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (args.length > 0 && typeof args[0] === 'string' && 
        args[0].includes('defaultProps will be removed from memo components')) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

createRoot(document.getElementById("root")!).render(<App />);
