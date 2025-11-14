import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Filter out react-beautiful-dnd defaultProps warning
if (process.env.NODE_ENV === 'development') {
  const originalWarn = console.warn;
  const originalError = console.error;

  const shouldFilterWarning = (args: any[]) => {
    const message = args[0]?.toString() || '';
    return message.includes('defaultProps will be removed from memo components') ||
           message.includes('Connect(Droppable): Support for defaultProps') ||
           message.includes('react-beautiful-dnd');
  };

  console.warn = (...args) => {
    if (!shouldFilterWarning(args)) {
      originalWarn.apply(console, args);
    }
  };

  console.error = (...args) => {
    if (!shouldFilterWarning(args)) {
      originalError.apply(console, args);
    }
  };
}

createRoot(document.getElementById("root")!).render(<App />);
