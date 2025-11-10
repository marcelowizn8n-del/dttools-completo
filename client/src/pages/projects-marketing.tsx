import { useState } from "react";
import { Link } from "wouter";
import { 
  ArrowRight, 
  Users, 
  Target, 
  Lightbulb, 
  Wrench, 
  TestTube, 
  Star, 
  CheckCircle, 
  Zap, 
  FileText, 
  TrendingUp, 
  Clock, 
  Bot, 
  BookOpen,
  Award,
  Download,
  Sparkles,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import dttoolsIcon from "../assets/dttools-icon.png";

const phases = [
  {
    id: 1,
    icon: Users,
    name: "Empatizar",
    nameEn: "Empathize",
    description: "Compreenda profundamente seus usuários através de personas, entrevistas e mapas de empatia estruturados.",
    descriptionEn: "Deeply understand your users through structured personas, interviews and empathy maps.",
    bgColor: "#FFF5F5", 
    borderColor: "#E53E3E",
    iconColor: "#C53030",
    tools: ["Personas", "Entrevistas", "Mapas de Empatia", "Observações"]
  },
  {
    id: 2,
    icon: Target,
    name: "Definir",
    nameEn: "Define", 
    description: "Defina claramente problemas com declarações POV e perguntas 'Como Poderíamos...' focadas.",
    descriptionEn: "Clearly define problems with POV statements and focused 'How Might We...' questions.",
    bgColor: "#FFFAF0", 
    borderColor: "#DD6B20",
    iconColor: "#C05621",
    tools: ["Declarações POV", "Perguntas HMW", "Problem Statements", "Insights"]
  },
  {
    id: 3,
    icon: Lightbulb,
    name: "Idear", 
    nameEn: "Ideate",
    description: "Gere centenas de ideias criativas com brainstorming estruturado e ferramentas de ideação.",
    descriptionEn: "Generate hundreds of creative ideas with structured brainstorming and ideation tools.",
    bgColor: "#FFFBEB", 
    borderColor: "#D69E2E",
    iconColor: "#B7791F",
    tools: ["Brainstorming", "Crazy 8s", "Ideação Guiada", "Seleção de Ideias"]
  },
  {
    id: 4,
    icon: Wrench,
    name: "Prototipar",
    nameEn: "Prototype",
    description: "Construa protótipos rápidos e baratos para testar suas melhores ideias de forma iterativa.",
    descriptionEn: "Build quick and inexpensive prototypes to test your best ideas iteratively.",
    bgColor: "#EBF8FF", 
    borderColor: "#3182CE",
    iconColor: "#2C5282",
    tools: ["Wireframes", "Storyboards", "Protótipos Papel", "MVPs"]
  },
  {
    id: 5,
    icon: TestTube,
    name: "Testar",
    nameEn: "Test",
    description: "Teste com usuários reais e colete feedback valioso para iteração contínua.",
    descriptionEn: "Test with real users and collect valuable feedback for continuous iteration.",
    bgColor: "#F0FFF4", 
    borderColor: "#38A169",
    iconColor: "#2F855A",
    tools: ["Testes de Usabilidade", "A/B Testing", "Feedback Forms", "Métricas"]
  }
];

const competitiveAdvantages = [
  {
    icon: FileText,
    title: "PDF Profissional com Logo DTTools",
    titleEn: "Professional PDF with DTTools Logo",
    description: "Exporte seus projetos completos em PDF com design profissional e logo DTTools para apresentações executivas.",
    descriptionEn: "Export your complete projects in PDF with professional design and DTTools logo for executive presentations.",
    highlight: true
  },
  {
    icon: Bot,
    title: "IA Integrada para Análises Avançadas", 
    titleEn: "Integrated AI for Advanced Analytics",
    description: "Chat IA especializado em Design Thinking para insights personalizados e sugestões em cada fase.",
    descriptionEn: "AI chat specialized in Design Thinking for personalized insights and suggestions in each phase."
  },
  {
    icon: Zap,
    title: "Colaboração em Tempo Real",
    titleEn: "Real-time Collaboration", 
    description: "Trabalhe simultaneamente com sua equipe em projetos complexos com sincronização instantânea.",
    descriptionEn: "Work simultaneously with your team on complex projects with instant synchronization."
  },
  {
    icon: Award,
    title: "Progresso Gamificado",
    titleEn: "Gamified Progress",
    description: "Acompanhe progresso com métricas visuais, badges e sistema de pontuação motivacional.",
    descriptionEn: "Track progress with visual metrics, badges and motivational scoring system."
  },
  {
    icon: BookOpen,
    title: "Biblioteca de Artigos Especializados",
    titleEn: "Specialized Article Library",
    description: "Acesso a centenas de artigos, templates e melhores práticas de Design Thinking.",
    descriptionEn: "Access to hundreds of articles, templates and Design Thinking best practices."
  },
  {
    icon: TrendingUp,
    title: "Ferramentas Guiadas e Profissionais",
    titleEn: "Guided Professional Tools",
    description: "Ferramentas especializadas para cada fase com orientações passo-a-passo para resultados consistentes.",
    descriptionEn: "Specialized tools for each phase with step-by-step guidance for consistent results."
  }
];

const benefits = [
  {
    icon: CheckCircle,
    title: "Processo Estruturado vs Métodos Ad-Hoc",
    titleEn: "Structured Process vs Ad-Hoc Methods",
    description: "Methodology comprovada vs tentativa e erro sem direção",
    descriptionEn: "Proven methodology vs trial and error without direction"
  },
  {
    icon: Clock,
    title: "40% Mais Rápido",
    titleEn: "40% Faster",
    description: "Reduza tempo de desenvolvimento com ferramentas otimizadas",
    descriptionEn: "Reduce development time with optimized tools"
  },
  {
    icon: Users,
    title: "Melhor Colaboração",
    titleEn: "Better Collaboration", 
    description: "Equipes alinhadas com visibilidade completa do projeto",
    descriptionEn: "Aligned teams with complete project visibility"
  }
];

const testimonials = [
  {
    name: "Maria Fernanda Silva",
    role: "Head of Innovation",
    company: "TechCorp Brasil",
    content: "DTTools revolucionou nossa abordagem de inovação. Com o sistema de projetos estruturado, conseguimos reduzir em 40% o tempo de desenvolvimento de novas soluções. Os PDFs com logo DTTools impressionam nossos stakeholders.",
    contentEn: "DTTools revolutionized our innovation approach. With the structured project system, we managed to reduce new solution development time by 40%. The PDFs with DTTools logo impress our stakeholders.",
    avatar: "MF"
  },
  {
    name: "Roberto Santos", 
    role: "Product Manager",
    company: "InovaTech",
    content: "A integração com IA é um diferencial imenso. O chat especializado me ajuda a tomar decisões melhores em cada fase do Design Thinking. Nunca vi uma ferramenta tão completa.",
    contentEn: "The AI integration is a huge differentiator. The specialized chat helps me make better decisions in each Design Thinking phase. I've never seen such a complete tool.",
    avatar: "RS"
  },
  {
    name: "Ana Carolina Costa",
    role: "Design Lead", 
    company: "Creative Agency",
    content: "Nossos clientes ficaram impressionados com a qualidade dos projetos que entregamos usando DTTools. O progresso gamificado motiva toda a equipe e os resultados são excepcionais.",
    contentEn: "Our clients were impressed with the quality of projects we deliver using DTTools. The gamified progress motivates the entire team and results are exceptional.",
    avatar: "AC"
  }
];

export default function ProjectsMarketingPage() {
  const { t, language } = useLanguage();
  const [hoveredPhase, setHoveredPhase] = useState<number | null>(null);
  const isEnglish = language === 'en';

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative container mx-auto px-6 py-20 lg:py-32">
          <div className="text-center max-w-5xl mx-auto">
            {/* DTTools Icon */}
            <div className="mb-6">
              <img 
                src={dttoolsIcon} 
                alt="DTTools" 
                className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 mx-auto mb-4 object-contain drop-shadow-lg"
                data-testid="dttools-icon-projects"
              />
            </div>

            <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200" data-testid="badge-projects-hero">
              <Sparkles className="w-4 h-4 mr-1" />
              {isEnglish ? "Design Thinking Projects" : "Projetos de Design Thinking"}
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {isEnglish 
                ? "Transform Complex Problems into Revolutionary Solutions" 
                : "Transforme Problemas Complexos em Soluções Revolucionárias"
              }
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              {isEnglish
                ? "The most complete platform for Design Thinking projects with guided tools, real-time collaboration, and professional PDF exports with DTTools branding."
                : "A plataforma mais completa para projetos de Design Thinking com ferramentas guiadas, colaboração em tempo real e exportação profissional em PDF com logo DTTools."
              }
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/signup">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6" data-testid="button-start-free-projects">
                  {isEnglish ? "Start for Free" : "Começar Grátis"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-blue-600 text-blue-700 hover:bg-blue-50" data-testid="button-view-plans-projects">
                  {isEnglish ? "View Plans" : "Ver Planos"}
                </Button>
              </Link>
            </div>

            <p className="text-sm text-gray-500">
              {isEnglish ? "✨ No credit card required • 7-day free trial" : "✨ Sem cartão de crédito • 7 dias grátis"}
            </p>
          </div>
        </div>
      </section>

      {/* How It Works - 5 Phases */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {isEnglish ? "How Design Thinking Projects Work" : "Como Funcionam os Projetos de Design Thinking"}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {isEnglish 
                ? "Follow a proven 5-phase methodology used by the world's most innovative companies. Each phase has specialized tools and guided workflows for consistent results."
                : "Siga uma metodologia comprovada de 5 fases usada pelas empresas mais inovadoras do mundo. Cada fase possui ferramentas especializadas e fluxos guiados para resultados consistentes."
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {phases.map((phase, index) => {
              const Icon = phase.icon;
              const isHovered = hoveredPhase === phase.id;
              
              return (
                <Card 
                  key={phase.id}
                  className="relative transition-all duration-300 cursor-pointer border-2 hover:shadow-xl hover:scale-105"
                  style={{
                    backgroundColor: phase.bgColor,
                    borderColor: isHovered ? phase.borderColor : '#e5e7eb'
                  }}
                  onMouseEnter={() => setHoveredPhase(phase.id)}
                  onMouseLeave={() => setHoveredPhase(null)}
                  data-testid={`card-phase-marketing-${phase.id}`}
                >
                  <CardHeader className="text-center pb-3">
                    <div 
                      className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-all duration-300"
                      style={{
                        backgroundColor: isHovered ? phase.borderColor : 'white',
                        color: isHovered ? 'white' : phase.iconColor,
                        transform: isHovered ? 'scale(1.1)' : 'scale(1)'
                      }}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                    <CardTitle className="text-lg font-semibold mb-2">
                      {index + 1}. {isEnglish ? phase.nameEn : phase.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm text-gray-700 leading-relaxed mb-3">
                      {isEnglish ? phase.descriptionEn : phase.description}
                    </CardDescription>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        {isEnglish ? "Tools:" : "Ferramentas:"}
                      </p>
                      {phase.tools.slice(0, 2).map((tool, i) => (
                        <div key={i} className="text-xs text-gray-600 flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                          {tool}
                        </div>
                      ))}
                      <p className="text-xs text-gray-500">+{phase.tools.length - 2} mais</p>
                    </div>
                  </CardContent>
                  
                  {index < phases.length - 1 && (
                    <div className="hidden lg:block absolute -right-3 top-1/2 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Benchmarking CTA */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <div className="max-w-3xl mx-auto">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  {isEnglish ? "Measure Your Design Thinking Maturity" : "Meça sua Maturidade em Design Thinking"}
                </h3>
                <p className="text-lg opacity-90 mb-6">
                  {isEnglish 
                    ? "Compare your team's performance with industry benchmarks and identify areas for improvement with our advanced analytics."
                    : "Compare o desempenho da sua equipe com benchmarks da indústria e identifique áreas de melhoria com nossa análise avançada."
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link href="/benchmarking">
                    <Button 
                      size="lg" 
                      className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3"
                      data-testid="button-try-benchmarking"
                    >
                      <BarChart3 className="w-5 h-5 mr-2" />
                      {isEnglish ? "Try Benchmarking Tool" : "Experimente a Ferramenta"}
                    </Button>
                  </Link>
                  <div className="flex items-center gap-2 text-sm opacity-80">
                    <CheckCircle className="w-4 h-4" />
                    {isEnglish ? "Free for all users" : "Grátis para todos os usuários"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Competitive Advantages */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {isEnglish ? "Why DTTools is Different" : "Por que DTTools é Diferente"}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {isEnglish 
                ? "Advanced features that set us apart from traditional Design Thinking methods and other platforms."
                : "Recursos avançados que nos diferenciam dos métodos tradicionais de Design Thinking e outras plataformas."
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {competitiveAdvantages.map((advantage, index) => {
              const Icon = advantage.icon;
              
              return (
                <Card 
                  key={index} 
                  className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
                    advantage.highlight ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:scale-105'
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-3">
                      <div 
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          advantage.highlight 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-blue-100 text-blue-600'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      {advantage.highlight && (
                        <Badge className="bg-blue-600 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          {isEnglish ? "Featured" : "Destaque"}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl font-semibold">
                      {isEnglish ? advantage.titleEn : advantage.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 leading-relaxed">
                      {isEnglish ? advantage.descriptionEn : advantage.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Comparison */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {isEnglish ? "Structured Platform vs Traditional Methods" : "Plataforma Estruturada vs Métodos Tradicionais"}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {isEnglish 
                ? "See the measurable difference when you use a professional Design Thinking platform."
                : "Veja a diferença mensurável quando você usa uma plataforma profissional de Design Thinking."
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              
              return (
                <Card key={index} className="text-center border-0 shadow-lg">
                  <CardHeader>
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-8 h-8 text-green-600" />
                    </div>
                    <CardTitle className="text-xl font-semibold">
                      {isEnglish ? benefit.titleEn : benefit.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 leading-relaxed">
                      {isEnglish ? benefit.descriptionEn : benefit.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {isEnglish ? "Trusted by Innovation Leaders" : "Confiado por Líderes de Inovação"}
            </h2>
            <div className="flex justify-center items-center gap-2 mb-8">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-2 text-blue-100 font-medium">
                {isEnglish ? "4.9/5 from 2,500+ users" : "4.9/5 de mais de 2.500 usuários"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 italic mb-4 leading-relaxed">
                    "{isEnglish ? testimonial.contentEn : testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {testimonial.avatar}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                      <div className="text-sm text-blue-600 font-medium">{testimonial.company}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {isEnglish ? "Start Your Design Thinking Journey Today" : "Comece sua Jornada de Design Thinking Hoje"}
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {isEnglish 
              ? "Join thousands of innovators using DTTools to create breakthrough solutions with structured Design Thinking projects."
              : "Junte-se a milhares de inovadores usando DTTools para criar soluções revolucionárias com projetos estruturados de Design Thinking."
            }
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link href="/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6" data-testid="button-start-trial-cta">
                {isEnglish ? "Start 7-Day Free Trial" : "Começar Teste Grátis de 7 Dias"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-blue-600 text-blue-700 hover:bg-blue-50" data-testid="button-see-plans-cta">
                {isEnglish ? "See All Plans & Pricing" : "Ver Todos os Planos e Preços"}
              </Button>
            </Link>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">
              {isEnglish ? "✨ No credit card required • Cancel anytime" : "✨ Sem cartão de crédito • Cancele a qualquer momento"}
            </p>
            <p className="text-sm text-blue-600 font-medium">
              {isEnglish ? "🎁 Start creating professional Design Thinking projects in minutes" : "🎁 Comece a criar projetos profissionais de Design Thinking em minutos"}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}