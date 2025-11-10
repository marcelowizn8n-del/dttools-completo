import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Download, Eye, CheckCircle } from 'lucide-react';
import ScreenshotGenerator from '@/utils/screenshot-generator';

interface ScreenshotTask {
  id: string;
  name: string;
  description: string;
  captured: boolean;
}

const screenshotTasks: ScreenshotTask[] = [
  {
    id: 'home-full',
    name: 'Home - Página Completa',
    description: 'Landing page completa com hero, features e seções',
    captured: false
  },
  {
    id: 'hero-section',
    name: 'Hero Section',
    description: 'Seção principal com logo e call-to-action',
    captured: false
  },
  {
    id: 'phases-section',
    name: '5 Fases do DT',
    description: 'Cards das 5 fases do Design Thinking',
    captured: false
  },
  {
    id: 'features-section',
    name: 'Features & Kanban',
    description: 'Seção de recursos incluindo Kanban',
    captured: false
  },
  {
    id: 'benchmarking-section',
    name: 'DVF Benchmarking',
    description: 'Sistema de benchmarking exclusivo',
    captured: false
  },
  {
    id: 'pricing-page',
    name: 'Página de Preços',
    description: 'Planos e pricing completo',
    captured: false
  },
  {
    id: 'login-page',
    name: 'Tela de Login',
    description: 'Interface de autenticação',
    captured: false
  }
];

export default function ScreenshotCapture() {
  const [tasks, setTasks] = useState<ScreenshotTask[]>(screenshotTasks);
  const [isCapturing, setIsCapturing] = useState(false);
  const [currentTask, setCurrentTask] = useState<string>('');

  const generator = new ScreenshotGenerator();

  const markTaskCompleted = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, captured: true } : task
    ));
  };

  const captureCurrentPage = async () => {
    setIsCapturing(true);
    setCurrentTask('Capturando página atual...');
    
    try {
      await generator.captureCurrentPage('current-page', true);
      markTaskCompleted('home-full');
    } catch (error) {
      console.error('Erro ao capturar:', error);
    }
    
    setIsCapturing(false);
    setCurrentTask('');
  };

  const captureLandingSections = async () => {
    setIsCapturing(true);
    
    const sections = [
      { selector: 'section:nth-child(1)', taskId: 'hero-section', name: 'Hero Section' },
      { selector: 'section:nth-child(2)', taskId: 'phases-section', name: '5 Fases' },
      { selector: 'section:nth-child(3)', taskId: 'features-section', name: 'Features' },
      { selector: 'section:nth-child(4)', taskId: 'benchmarking-section', name: 'Benchmarking' }
    ];

    for (const section of sections) {
      setCurrentTask(`Capturando ${section.name}...`);
      try {
        await generator.captureSection(section.selector, section.taskId);
        markTaskCompleted(section.taskId);
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Erro ao capturar ${section.name}:`, error);
      }
    }
    
    setIsCapturing(false);
    setCurrentTask('');
  };

  const captureAllAtOnce = async () => {
    setIsCapturing(true);
    setCurrentTask('Capturando todas as seções...');
    
    try {
      // Página completa primeiro
      await generator.captureCurrentPage('dttools-complete-page', true);
      markTaskCompleted('home-full');
      
      // Depois as seções
      await captureLandingSections();
      
    } catch (error) {
      console.error('Erro na captura completa:', error);
    }
    
    setIsCapturing(false);
    setCurrentTask('');
  };

  const completedTasks = tasks.filter(task => task.captured).length;
  const totalTasks = tasks.length;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Camera className="w-8 h-8 text-blue-600" />
            <div>
              <CardTitle className="text-2xl">Screenshot Generator</CardTitle>
              <p className="text-gray-600">Capture telas profissionais para divulgação</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-4">
            <Badge variant="outline" className="text-sm">
              {completedTasks}/{totalTasks} Completadas
            </Badge>
            {isCapturing && (
              <Badge className="bg-blue-600 text-white animate-pulse">
                🔄 {currentTask}
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={captureCurrentPage}
              disabled={isCapturing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Camera className="w-4 h-4 mr-2" />
              Capturar Página Atual
            </Button>
            
            <Button 
              onClick={captureLandingSections}
              disabled={isCapturing}
              variant="outline"
            >
              <Eye className="w-4 h-4 mr-2" />
              Capturar Seções
            </Button>
            
            <Button 
              onClick={captureAllAtOnce}
              disabled={isCapturing}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Capturar Tudo
            </Button>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border">
            <h4 className="font-semibold text-blue-900 mb-2">📋 Instruções:</h4>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. <strong>Navegue para a página</strong> que deseja capturar</li>
              <li>2. <strong>Clique nos botões acima</strong> para gerar screenshots</li>
              <li>3. <strong>Os arquivos serão baixados</strong> automaticamente como PNG</li>
              <li>4. <strong>Para outras páginas:</strong> vá para /pricing, /benchmarking, /login</li>
              <li>5. <strong>Para páginas logadas:</strong> faça login primeiro e acesse /projects</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map((task) => (
          <Card key={task.id} className={`transition-all ${task.captured ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  task.captured ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {task.captured ? <CheckCircle className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${task.captured ? 'text-green-900' : 'text-gray-900'}`}>
                    {task.name}
                  </h3>
                  <p className={`text-sm ${task.captured ? 'text-green-700' : 'text-gray-600'}`}>
                    {task.description}
                  </p>
                  {task.captured && (
                    <Badge className="mt-2 bg-green-600 text-white text-xs">
                      ✅ Capturado
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6 bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">💡 Dicas para Screenshots Perfeitos:</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• <strong>Resolução alta:</strong> Screenshots são gerados em 2x para qualidade superior</li>
            <li>• <strong>Página completa:</strong> Captura desde o topo até o final da página</li>
            <li>• <strong>Seções específicas:</strong> Cada feature pode ser capturada individualmente</li>
            <li>• <strong>Para Kanban/Projetos:</strong> Faça login e acesse /projects/1 primeiro</li>
            <li>• <strong>Para ferramentas DT:</strong> Acesse /projects/1/phase/1, /phase/3, etc</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}