import html2canvas from 'html2canvas';

interface ScreenshotConfig {
  name: string;
  url: string;
  description: string;
  waitForElement?: string;
  scrollToTop?: boolean;
  fullPage?: boolean;
}

const screenshots: ScreenshotConfig[] = [
  {
    name: 'home-landing',
    url: '/',
    description: 'Página inicial com hero section e features',
    scrollToTop: true,
    fullPage: true
  },
  {
    name: 'pricing',
    url: '/pricing',
    description: 'Página de planos e preços',
    scrollToTop: true,
    fullPage: true
  },
  {
    name: 'benchmarking',
    url: '/benchmarking',
    description: 'Sistema DVF de Benchmarking',
    scrollToTop: true,
    fullPage: true
  },
  {
    name: 'login',
    url: '/login',
    description: 'Tela de login profissional',
    scrollToTop: true
  },
  {
    name: 'signup',
    url: '/signup',
    description: 'Tela de cadastro',
    scrollToTop: true
  },
  {
    name: 'dashboard-projects',
    url: '/projects',
    description: 'Dashboard de projetos (requer login)',
    waitForElement: '[data-testid="projects-container"]'
  },
  {
    name: 'project-detail-kanban',
    url: '/projects/1',
    description: 'Kanban board em ação (requer login)',
    waitForElement: '[data-testid="kanban-board"]'
  },
  {
    name: 'phase1-empathize',
    url: '/projects/1/phase/1',
    description: 'Fase 1 - Empatizar com ferramentas',
    waitForElement: '[data-testid="phase-container"]'
  },
  {
    name: 'phase3-ideate',
    url: '/projects/1/phase/3',
    description: 'Fase 3 - Idear com brainstorming',
    waitForElement: '[data-testid="phase-container"]'
  }
];

export class ScreenshotGenerator {
  private downloadLink: HTMLAnchorElement;

  constructor() {
    this.downloadLink = document.createElement('a');
    this.downloadLink.style.display = 'none';
    document.body.appendChild(this.downloadLink);
  }

  async captureCurrentPage(filename: string, fullPage: boolean = false): Promise<void> {
    try {
      // Scroll to top
      window.scrollTo(0, 0);
      
      // Wait a bit for render
      await new Promise(resolve => setTimeout(resolve, 1000));

      const options: any = {
        useCORS: true,
        allowTaint: true,
        scale: 2, // Alta resolução
        backgroundColor: '#ffffff',
        width: window.innerWidth,
        height: fullPage ? document.documentElement.scrollHeight : window.innerHeight,
        scrollX: 0,
        scrollY: 0
      };

      // Se for full page, captura toda a altura
      if (fullPage) {
        options.height = Math.max(
          document.body.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.clientHeight,
          document.documentElement.scrollHeight,
          document.documentElement.offsetHeight
        );
      }

      const canvas = await html2canvas(document.body, options);
      
      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          this.downloadLink.href = url;
          this.downloadLink.download = `dttools-${filename}.png`;
          this.downloadLink.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/png', 0.95);

      console.log(`✅ Screenshot captured: ${filename}`);
    } catch (error) {
      console.error(`❌ Error capturing ${filename}:`, error);
    }
  }

  async captureSection(selector: string, filename: string): Promise<void> {
    try {
      const element = document.querySelector(selector) as HTMLElement;
      if (!element) {
        console.error(`❌ Element not found: ${selector}`);
        return;
      }

      // Scroll element into view
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
          this.downloadLink.href = url;
          this.downloadLink.download = `dttools-section-${filename}.png`;
          this.downloadLink.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/png', 0.95);

      console.log(`✅ Section screenshot captured: ${filename}`);
    } catch (error) {
      console.error(`❌ Error capturing section ${filename}:`, error);
    }
  }

  // Captura seções específicas da landing page
  async captureLandingSections(): Promise<void> {
    const sections = [
      { selector: 'section:nth-child(1)', name: 'hero-section' },
      { selector: 'section:nth-child(2)', name: '5-phases-section' },
      { selector: 'section:nth-child(3)', name: 'features-section' },
      { selector: 'section:nth-child(4)', name: 'benchmarking-section' },
      { selector: 'section:nth-child(5)', name: 'testimonials-section' }
    ];

    for (const section of sections) {
      await this.captureSection(section.selector, section.name);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Método principal para capturar todas as telas importantes
  async captureAllScreenshots(): Promise<void> {
    console.log('🚀 Iniciando captura de screenshots do DTTools...');
    
    // Captura a página atual
    const currentPath = window.location.pathname;
    
    switch (currentPath) {
      case '/':
        await this.captureCurrentPage('home-full', true);
        await this.captureLandingSections();
        break;
      case '/pricing':
        await this.captureCurrentPage('pricing-full', true);
        break;
      case '/benchmarking':
        await this.captureCurrentPage('benchmarking-full', true);
        break;
      case '/login':
        await this.captureCurrentPage('login');
        break;
      case '/signup':
        await this.captureCurrentPage('signup');
        break;
      case '/projects':
        await this.captureCurrentPage('dashboard-projects');
        break;
      default:
        if (currentPath.includes('/projects/') && currentPath.includes('/phase/')) {
          const phaseNumber = currentPath.split('/phase/')[1];
          await this.captureCurrentPage(`phase${phaseNumber}-tools`);
        } else if (currentPath.includes('/projects/')) {
          await this.captureCurrentPage('project-detail-kanban');
        } else {
          await this.captureCurrentPage('current-page');
        }
    }
    
    console.log('✅ Screenshots capturados com sucesso!');
    console.log('📁 Arquivos salvos como: dttools-[nome].png');
  }
}

// Função global para usar no console
(window as any).captureScreenshots = () => {
  const generator = new ScreenshotGenerator();
  generator.captureAllScreenshots();
};

// Função para capturar apenas a página atual
(window as any).captureCurrentPage = (filename?: string) => {
  const generator = new ScreenshotGenerator();
  const name = filename || `page-${Date.now()}`;
  generator.captureCurrentPage(name, true);
};

// Função para capturar seção específica
(window as any).captureSection = (selector: string, filename?: string) => {
  const generator = new ScreenshotGenerator();
  const name = filename || `section-${Date.now()}`;
  generator.captureSection(selector, name);
};

export default ScreenshotGenerator;