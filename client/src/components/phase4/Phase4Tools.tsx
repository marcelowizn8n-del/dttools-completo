import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench, Monitor, Package, FileText, Palette } from "lucide-react";
import PrototypeTool from "./PrototypeTool";
import PrototypeDrawingTool from "./PrototypeDrawingTool";

interface Phase4ToolsProps {
  projectId: string;
}

export default function Phase4Tools({ projectId }: Phase4ToolsProps) {
  const [activeTab, setActiveTab] = useState("prototypes");

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-sm">4</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fase 4: Prototipar</h1>
            <p className="text-gray-600">
              Construa versões testáveis das suas ideias para validar soluções
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 gap-1">
          <TabsTrigger value="prototypes" className="flex items-center justify-center gap-2 text-xs sm:text-sm px-2 py-2">
            <Wrench className="w-4 h-4" />
            <span className="hidden sm:inline">Protótipos</span>
            <span className="sm:hidden">Proto</span>
          </TabsTrigger>
          <TabsTrigger value="drawing" className="flex items-center justify-center gap-2 text-xs sm:text-sm px-2 py-2">
            <Palette className="w-4 h-4" />
            <span>Desenho</span>
          </TabsTrigger>
          <TabsTrigger value="types" className="flex items-center justify-center gap-2 text-xs sm:text-sm px-2 py-2">
            <Monitor className="w-4 h-4" />
            <span>Tipos</span>
          </TabsTrigger>
          <TabsTrigger value="iteration" className="flex items-center justify-center gap-2 text-xs sm:text-sm px-2 py-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Iteração</span>
            <span className="sm:hidden">Iterar</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prototypes" className="space-y-6">
          <PrototypeTool projectId={projectId} />
        </TabsContent>

        <TabsContent value="drawing" className="space-y-6">
          <PrototypeDrawingTool projectId={projectId} />
        </TabsContent>

        <TabsContent value="types" className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Tipos de Protótipos</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Escolha o tipo de protótipo mais adequado para testar sua ideia e coletar feedback valioso.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Monitor className="w-5 h-5 text-blue-600" />
                  <h3 className="font-medium text-gray-900">Digital</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Protótipos criados em ferramentas digitais como Figma, Adobe XD, ou mesmo código.
                </p>
                <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                  <li>Interfaces de usuário interativas</li>
                  <li>Apps e websites funcionais</li>
                  <li>Mockups de alta fidelidade</li>
                </ul>
              </div>

              <div className="bg-white border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Package className="w-5 h-5 text-green-600" />
                  <h3 className="font-medium text-gray-900">Físico</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Protótipos tangíveis feitos com materiais físicos para testar funcionalidades.
                </p>
                <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                  <li>Modelos em papel ou papelão</li>
                  <li>Impressão 3D e maquetes</li>
                  <li>Produtos físicos funcionais</li>
                </ul>
              </div>

              <div className="bg-white border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <h3 className="font-medium text-gray-900">Storyboard</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Sequência visual que conta a história da experiência do usuário.
                </p>
                <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                  <li>Jornada do usuário em quadrinhos</li>
                  <li>Fluxos de interação visualizados</li>
                  <li>Cenários de uso ilustrados</li>
                </ul>
              </div>

              <div className="bg-white border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-5 h-5 text-orange-600" />
                  <h3 className="font-medium text-gray-900">Papel</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Protótipos rápidos e baratos feitos com papel para testar ideias iniciais.
                </p>
                <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                  <li>Wireframes em papel</li>
                  <li>Mockups de baixa fidelidade</li>
                  <li>Testes rápidos de conceito</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="iteration" className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">Iteração e Versionamento</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Aprimore seus protótipos através de ciclos de feedback e iteração contínua.
            </p>
            
            <div className="space-y-4">
              <div className="bg-white border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">🔄 Processo de Iteração</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">1</div>
                    <p className="font-medium">Construir</p>
                    <p className="text-gray-600 text-xs">Crie a primeira versão</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">2</div>
                    <p className="font-medium">Testar</p>
                    <p className="text-gray-600 text-xs">Colete feedback real</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">3</div>
                    <p className="font-medium">Aprender</p>
                    <p className="text-gray-600 text-xs">Analise os resultados</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">4</div>
                    <p className="font-medium">Iterar</p>
                    <p className="text-gray-600 text-xs">Aplique melhorias</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">📝 Documentação</h3>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Registre feedback de cada versão</li>
                    <li>Documente mudanças entre versões</li>
                    <li>Mantenha histórico de decisões</li>
                    <li>Anote materiais utilizados</li>
                  </ul>
                </div>
                
                <div className="bg-white border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">🎯 Dicas de Iteração</h3>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Faça mudanças pequenas e testáveis</li>
                    <li>Teste uma hipótese por vez</li>
                    <li>Colete feedback quantitativo e qualitativo</li>
                    <li>Documente o que funcionou e o que não funcionou</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}