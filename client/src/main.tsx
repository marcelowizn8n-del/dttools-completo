import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import ScreenshotGenerator from "./utils/screenshot-generator";

// Global error handling
window.onerror = (message, source, lineno, colno, error) => {
  console.error("Global Error:", {
    message,
    source,
    line: lineno,
    column: colno,
    error: error?.stack
  });
  
  // Log to monitoring service in production
  if (import.meta.env.PROD) {
    // Send to analytics/monitoring service
    console.warn("Error logged for monitoring:", message);
  }
  
  return false; // Let default error handling continue
};

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error("Unhandled Promise Rejection:", {
    reason: event.reason,
    promise: event.promise
  });
  
  // Log to monitoring service in production
  if (import.meta.env.PROD) {
    console.warn("Promise rejection logged for monitoring:", event.reason);
  }
  
  // Prevent default behavior only in production
  if (import.meta.env.PROD) {
    event.preventDefault();
  }
});

// Global screenshot functions available in any page - Simple version using html2canvas directly

// Simple screenshot function using html2canvas directly
(window as any).captureFullPage = async (filename = 'dttools-page') => {
  try {
    console.log('🚀 Iniciando captura...');
    
    // Dynamic import of html2canvas
    const html2canvas = (await import('html2canvas')).default;
    
    // Scroll to top
    window.scrollTo(0, 0);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const canvas = await html2canvas(document.body, {
      useCORS: true,
      allowTaint: true,
      scale: 2,
      backgroundColor: '#ffffff',
      height: Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      )
    });
    
    // Create download link
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `dttools-${filename}.png`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log(`✅ Screenshot saved as: dttools-${filename}.png`);
      }
    }, 'image/png', 0.95);
    
  } catch (error) {
    console.error('❌ Error capturing screenshot:', error);
  }
};

// Simple section capture
(window as any).captureSection = async (selector: string, filename = 'dttools-section') => {
  try {
    console.log(`🚀 Capturando seção: ${selector}`);
    
    const html2canvas = (await import('html2canvas')).default;
    const element = document.querySelector(selector) as HTMLElement;
    
    if (!element) {
      console.error(`❌ Element not found: ${selector}`);
      return;
    }

    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    await new Promise(resolve => setTimeout(resolve, 1000));

    const canvas = await html2canvas(element, {
      useCORS: true,
      allowTaint: true,
      scale: 2,
      backgroundColor: '#ffffff'
    });
    
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `dttools-${filename}.png`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log(`✅ Section screenshot saved as: dttools-${filename}.png`);
      }
    }, 'image/png', 0.95);
    
  } catch (error) {
    console.error('❌ Error capturing section:', error);
  }
};

// Quick capture functions for common sections
(window as any).captureHero = () => (window as any).captureSection('section:first-child', 'hero');
(window as any).captureFeatures = () => (window as any).captureSection('section:nth-child(3)', 'features');

// Helper to show available commands
(window as any).showScreenshotHelp = () => {
  console.log(`
🎯 DTTOOLS SCREENSHOT COMMANDS:

📸 FUNÇÕES DISPONÍVEIS:
captureFullPage()                    - Captura página completa
captureFullPage('nome-personalizado') - Captura com nome específico
captureSection('seletor', 'nome')    - Captura elemento específico
captureHero()                        - Captura hero section
captureFeatures()                    - Captura seção de features

💡 EXEMPLOS:
captureFullPage('home-completa')
captureHero()
captureSection('.minha-classe', 'minha-secao')

🔧 TESTE SIMPLES:
captureFullPage('teste')
  `);
};

// Test function loading
setTimeout(() => {
  if (typeof (window as any).captureFullPage === 'function') {
    console.log('✅ DTTools Screenshot System loaded successfully!');
    console.log('📋 Type: showScreenshotHelp() for commands');
  } else {
    console.error('❌ Failed to load screenshot functions');
  }
}, 2000);

// Service Worker disabled - cleanup handled in index.html
// PWA features temporarily disabled until cache issues are resolved

createRoot(document.getElementById("root")!).render(<App />);
