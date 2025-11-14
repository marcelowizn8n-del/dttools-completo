import { createContext, useContext, useState, useEffect } from "react";

export type Language = "pt-BR" | "en" | "es" | "fr";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
  convertPrice: (originalPriceInCents: number) => { price: number; symbol: string; formattedPrice: string };
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

// Locale mapping for Intl.NumberFormat
const LOCALE_MAP = {
  "pt-BR": "pt-BR",
  "en": "en-US",
  "es": "es-ES", 
  "fr": "fr-FR",
};

// Currency codes for each locale
const CURRENCY_CODES = {
  "pt-BR": "BRL",
  "en": "USD",
  "es": "USD",
  "fr": "EUR",
};

// Translation dictionaries
const translations = {
  "pt-BR": {
    // Navigation
    "nav.projects": "Projetos",
    "nav.library": "Biblioteca",
    "nav.pricing": "Planos",
    "nav.admin": "Admin",
    "nav.logout": "Sair",
    "nav.login": "Entrar",
    
    // Dashboard
    "dashboard.start.project": "Iniciar Projeto Completo",
    "dashboard.explore.phases": "Explorar Fases",
    "dashboard.hero.title": "Design Thinking Tools",
    "dashboard.hero.subtitle": "Uma plataforma interativa e abrangente para guiar designers, equipes de inovação e profissionais criativos pelas etapas do Design Thinking.",
    "dashboard.your.progress": "Seu Progresso",
    "dashboard.beginner": "Iniciante",
    "dashboard.points": "Pontos",
    "dashboard.badges": "Badges", 
    "dashboard.phases": "Fases",
    "dashboard.session": "Sessão",
    "dashboard.progress.by.phase": "Progresso por Fase",
    "dashboard.recent.activity": "Atividade Recente",
    "dashboard.no.activity": "Nenhuma atividade recente. Comece explorando as fases!",
    "dashboard.next.steps": "Próximos Passos Sugeridos",
    "dashboard.5.phases.title": "As 5 Fases do Design Thinking",
    "dashboard.5.phases.subtitle": "Explore cada fase do processo e desenvolva soluções centradas no usuário.",
    "dashboard.why.platform": "Por que usar nossa plataforma?",
    "dashboard.ready.start": "Pronto para começar sua jornada?",
    "dashboard.ready.subtitle": "Transforme problemas complexos em soluções inovadoras com o Design Thinking.",
    "dashboard.start.now": "Começar Agora",

    // Double Diamond
    "doubleDiamond.title": "Modelo Double Diamond do Projeto",
    "doubleDiamond.subtitle": "Visualize a jornada completa do projeto pelas duas etapas divergentes e convergentes do Double Diamond.",
    "doubleDiamond.sequence": "Etapa {number}",
    "doubleDiamond.status.completed": "Concluído",
    "doubleDiamond.status.active": "Em andamento",
    "doubleDiamond.status.upcoming": "Planejado",
    "doubleDiamond.discover.title": "Descobrir",
    "doubleDiamond.discover.description": "Investigue necessidades reais dos usuários e colete insights profundos.",
    "doubleDiamond.discover.phases": "Fase 1 • Empatizar",
    "doubleDiamond.define.title": "Definir",
    "doubleDiamond.define.description": "Transforme descobertas em um ponto de vista claro e priorizado.",
    "doubleDiamond.define.phases": "Fase 2 • Definir",
    "doubleDiamond.develop.title": "Desenvolver",
    "doubleDiamond.develop.description": "Cocrie soluções, protótipos e experimentos de alto impacto.",
    "doubleDiamond.develop.phases": "Fases 3-4 • Idear & Prototipar",
    "doubleDiamond.deliver.title": "Entregar",
    "doubleDiamond.deliver.description": "Teste, valide e evolua a melhor solução para o usuário.",
    "doubleDiamond.deliver.phases": "Fase 5 • Testar",
    "doubleDiamond.export.png": "Exportar PNG",
    "doubleDiamond.export.pdf": "Exportar PDF",
    "doubleDiamond.export.success": "Exportação concluída",
    "doubleDiamond.export.error": "Erro na exportação",
    "doubleDiamond.export.png.success": "A imagem PNG foi baixada com sucesso.",
    "doubleDiamond.export.png.error": "Não foi possível exportar a imagem. Tente novamente.",
    "doubleDiamond.export.pdf.success": "O arquivo PDF foi baixado com sucesso.",
    "doubleDiamond.export.pdf.error": "Não foi possível exportar o PDF. Tente novamente.",
    
    // Phases
    "phases.empathize": "Empatizar",
    "phases.define": "Definir", 
    "phases.ideate": "Idear",
    "phases.prototype": "Prototipar",
    "phases.test": "Testar",
    "phases.empathize.desc": "Compreenda profundamente seus usuários",
    "phases.define.desc": "Sintetize informações e identifique problemas",
    "phases.ideate.desc": "Gere soluções criativas e inovadoras",
    "phases.prototype.desc": "Torne suas ideias tangíveis",
    "phases.test.desc": "Valide soluções com usuários reais",
    
    // Benefits
    "benefits.human.centered": "Centrado no Ser Humano",
    "benefits.human.centered.desc": "Coloque as necessidades e experiências dos usuários no centro do processo de design.",
    "benefits.iterative.process": "Processo Iterativo",
    "benefits.iterative.process.desc": "Refine suas soluções através de ciclos contínuos de teste e aprendizado.",
    "benefits.collaborative": "Colaborativo",
    "benefits.collaborative.desc": "Trabalhe em equipe e combine diferentes perspectivas para soluções mais ricas.",
    
    // Next Steps
    "next.step.1": "Comece pela fase Empatizar para entender seus usuários", 
    "next.step.2": "Explore as ferramentas adicionais no menu Ferramentas",
    "next.step.3": "Complete mais ações para conquistar novos badges",
    
    // Landing Page
    "landing.future": "🚀 O Futuro do Design Thinking",
    "landing.hero.title": "Transforme Ideias em Soluções Revolucionárias",
    "landing.hero.subtitle": "A plataforma mais completa para Design Thinking com ferramentas guiadas, colaboração em tempo real e alcance global em 4 idiomas.",
    "landing.start.free": "Começar Grátis",
    "landing.view.plans": "Ver Planos",
    "landing.trial.info": "✨ Sem cartão de crédito • 7 dias grátis",
    "landing.5.phases.title": "As 5 Fases do Design Thinking",
    "landing.5.phases.subtitle": "Siga uma metodologia comprovada usada pelas empresas mais inovadoras do mundo",
    "landing.everything.title": "Tudo que Você Precisa para Inovar",
    "landing.everything.subtitle": "Ferramentas poderosas projetadas para acelerar seu processo de Design Thinking",
    "landing.trusted.title": "Confiado por Líderes de Inovação",
    "landing.rating": "4.9/5 de mais de 2.500 usuários",
    "landing.testimonial.1": "DTTools transformou completamente como inovamos. Conseguimos reduzir o tempo de desenvolvimento em 40%.",
    "landing.testimonial.2": "A plataforma de Design Thinking mais completa que já usei. Intuitiva e poderosa.",
    "landing.testimonial.3": "Nossos clientes ficaram impressionados com a qualidade dos insights que conseguimos gerar.",
    "landing.ready.title": "Pronto para Transformar seu Processo de Inovação?",
    "landing.ready.subtitle": "Junte-se a milhares de inovadores usando DTTools para criar soluções revolucionárias",
    "landing.start.trial": "Começar Teste Grátis",
    "landing.explore.library": "Explorar Biblioteca",
    
    // Pricing Page
    "pricing.title": "Escolha o Plano Ideal para Você",
    "pricing.subtitle": "Transforme suas ideias em soluções inovadoras com as ferramentas mais avançadas de Design Thinking. Comece grátis e evolua conforme suas necessidades.",
    "pricing.monthly": "Mensal",
    "pricing.yearly": "Anual",
    "pricing.save": "Economize até 10%",
    "pricing.popular": "Mais Popular",
    "pricing.teams": "Equipes",
    "pricing.enterprise": "Corporativo",
    "pricing.comparison": "Comparação Detalhada",
    "pricing.comparison.subtitle": "Veja todas as funcionalidades de cada plano",
    
    // Plan Names
    "plan.free": "Gratuito",
    "plan.pro": "Pro",
    "plan.team": "Team",
    "plan.enterprise": "Enterprise",
    
    // Plan Descriptions
    "plan.free.desc": "Perfeito para começar sua jornada de Design Thinking",
    "plan.pro.desc": "Ideal para profissionais e freelancers que querem mais poder",
    "plan.team.desc": "Para equipes que colaboram em projetos complexos",
    "plan.enterprise.desc": "Solução completa para grandes organizações",
    
    // Buttons
    "btn.start.free": "Começar Grátis",
    "btn.start.trial": "Começar Teste Grátis",
    "btn.contact.sales": "Falar com Vendas",
    "btn.processing": "Processando...",
    
    // Features
    "feature.projects": "Projetos simultâneos",
    "feature.personas": "Personas por projeto", 
    "feature.ai.chat": "Chat IA por mês",
    "feature.team.users": "Usuários na equipe",
    "feature.collaboration": "Colaboração em tempo real",
    "feature.sso": "SSO (Single Sign-On)",
    "feature.support": "Suporte 24/7",
    "feature.unlimited": "Ilimitado",
    
    // Currency
    "currency.symbol": "R$",
    "currency.month": "/mês",
    "currency.year": "/ano",
    "currency.save": "Economize {percent}% anualmente",
    
    // Trial info
    "trial.info": "7 dias grátis • Sem cartão de crédito",
    
    // Loading states
    "loading.plans": "Carregando planos...",
    
    // Additional features
    "pricing.additional.features": "funcionalidades adicionais",
    
    // FAQ
    "faq.title": "Perguntas Frequentes",
    "faq.q1": "Posso cancelar minha assinatura a qualquer momento?",
    "faq.a1": "Sim! Você pode cancelar sua assinatura a qualquer momento. Ao cancelar, você continuará tendo acesso aos recursos até o final do período de billing atual.",
    "faq.q2": "Como funciona o período de teste grátis?",
    "faq.a2": "O teste grátis de 7 dias dá acesso completo a todas as funcionalidades do plano escolhido. Não é necessário cartão de crédito para começar.",
    "faq.q3": "Posso fazer upgrade ou downgrade do meu plano?",
    "faq.a3": "Claro! Você pode alterar seu plano a qualquer momento. As mudanças são aplicadas imediatamente e o valor é ajustado proporcionalmente.",
    
    // Toast messages
    "toast.plan.activated": "Plano ativado!",
    "toast.plan.activated.desc": "Seu plano gratuito foi ativado com sucesso.",
    "toast.error": "Erro",
    "toast.error.desc": "Erro ao processar a assinatura. Tente novamente.",
    
    // Feature table
    "feature.title": "Funcionalidade",
    
    // Free pricing
    "pricing.free": "Grátis",
    
    // Plan Feature Keys (localized)
    "feature.projects.limit": "{count} projetos simultâneos",
    "feature.personas.limit": "{count} personas por projeto",
    "feature.ai.chat.limit": "{count} consultas IA por mês",
    "feature.team.users.limit": "{count} usuários na equipe",
    "feature.export.formats": "Exportação em {formats}",
    "feature.basic.tools": "Ferramentas básicas de Design Thinking",
    "feature.advanced.tools": "Ferramentas avançadas e templates",
    "feature.priority.support": "Suporte prioritário",
    "feature.onboarding": "Onboarding personalizado",
    "feature.custom.integrations": "Integrações customizadas",
    "feature.dedicated.manager": "Gerente de conta dedicado",
    "feature.all.phases": "Todas as 5 fases do Design Thinking",
    "feature.unlimited.projects": "Projetos ilimitados",
    "feature.unlimited.personas": "Personas ilimitadas",
    "feature.unlimited.ai.chat": "Consultas IA ilimitadas",
  },
  
  "en": {
    // Navigation
    "nav.projects": "Projects",
    "nav.library": "Library", 
    "nav.pricing": "Pricing",
    "nav.admin": "Admin",
    "nav.logout": "Logout",
    "nav.login": "Login",
    
    // Dashboard
    "dashboard.start.project": "Start Complete Project",
    "dashboard.explore.phases": "Explore Phases",
    "dashboard.hero.title": "Design Thinking Tools",
    "dashboard.hero.subtitle": "An interactive and comprehensive platform to guide designers, innovation teams and creative professionals through the Design Thinking stages.",
    "dashboard.your.progress": "Your Progress",
    "dashboard.beginner": "Beginner",
    "dashboard.points": "Points",
    "dashboard.badges": "Badges",
    "dashboard.phases": "Phases", 
    "dashboard.session": "Session",
    "dashboard.progress.by.phase": "Progress by Phase",
    "dashboard.recent.activity": "Recent Activity",
    "dashboard.no.activity": "No recent activity. Start exploring the phases!",
    "dashboard.next.steps": "Suggested Next Steps",
    "dashboard.5.phases.title": "The 5 Phases of Design Thinking",
    "dashboard.5.phases.subtitle": "Explore each phase of the process and develop user-centered solutions.",
    "dashboard.why.platform": "Why use our platform?",
    "dashboard.ready.start": "Ready to start your journey?",
    "dashboard.ready.subtitle": "Transform complex problems into innovative solutions with Design Thinking.",
    "dashboard.start.now": "Start Now",

    // Double Diamond
    "doubleDiamond.title": "Project Double Diamond Overview",
    "doubleDiamond.subtitle": "Track how your project advances through the divergent and convergent moments of the Double Diamond.",
    "doubleDiamond.sequence": "Stage {number}",
    "doubleDiamond.status.completed": "Completed",
    "doubleDiamond.status.active": "In Progress",
    "doubleDiamond.status.upcoming": "Planned",
    "doubleDiamond.discover.title": "Discover",
    "doubleDiamond.discover.description": "Investigate real user needs and gather deep insights.",
    "doubleDiamond.discover.phases": "Phase 1 • Empathize",
    "doubleDiamond.define.title": "Define",
    "doubleDiamond.define.description": "Turn findings into a clear, prioritized point of view.",
    "doubleDiamond.define.phases": "Phase 2 • Define",
    "doubleDiamond.develop.title": "Develop",
    "doubleDiamond.develop.description": "Co-create solutions, prototypes and high-impact experiments.",
    "doubleDiamond.develop.phases": "Phases 3-4 • Ideate & Prototype",
    "doubleDiamond.deliver.title": "Deliver",
    "doubleDiamond.deliver.description": "Test, validate and evolve the best solution for users.",
    "doubleDiamond.deliver.phases": "Phase 5 • Test",
    "doubleDiamond.export.png": "Export PNG",
    "doubleDiamond.export.pdf": "Export PDF",
    "doubleDiamond.export.success": "Export completed",
    "doubleDiamond.export.error": "Export error",
    "doubleDiamond.export.png.success": "PNG image downloaded successfully.",
    "doubleDiamond.export.png.error": "Could not export image. Please try again.",
    "doubleDiamond.export.pdf.success": "PDF file downloaded successfully.",
    "doubleDiamond.export.pdf.error": "Could not export PDF. Please try again.",
 
    // Phases
    "phases.empathize": "Empathize",
    "phases.define": "Define",
    "phases.ideate": "Ideate", 
    "phases.prototype": "Prototype",
    "phases.test": "Test",
    "phases.empathize.desc": "Deeply understand your users",
    "phases.define.desc": "Synthesize information and identify problems",
    "phases.ideate.desc": "Generate creative and innovative solutions",
    "phases.prototype.desc": "Make your ideas tangible",
    "phases.test.desc": "Validate solutions with real users",
    
    // Benefits
    "benefits.human.centered": "Human-Centered",
    "benefits.human.centered.desc": "Put user needs and experiences at the center of the design process.",
    "benefits.iterative.process": "Iterative Process",
    "benefits.iterative.process.desc": "Refine your solutions through continuous cycles of testing and learning.",
    "benefits.collaborative": "Collaborative",
    "benefits.collaborative.desc": "Work as a team and combine different perspectives for richer solutions.",
    
    // Next Steps
    "next.step.1": "Start with the Empathize phase to understand your users",
    "next.step.2": "Explore additional tools in the Tools menu", 
    "next.step.3": "Complete more actions to earn new badges",
    
    // Landing Page
    "landing.future": "🚀 The Future of Design Thinking",
    "landing.hero.title": "Transform Ideas into Revolutionary Solutions",
    "landing.hero.subtitle": "The most complete platform for Design Thinking with guided tools, real-time collaboration, and global reach in 4 languages.",
    "landing.start.free": "Start for Free",
    "landing.view.plans": "View Plans",
    "landing.trial.info": "✨ No credit card required • 7-day free trial",
    "landing.5.phases.title": "The 5 Phases of Design Thinking",
    "landing.5.phases.subtitle": "Follow a proven methodology used by the world's most innovative companies",
    "landing.everything.title": "Everything You Need to Innovate",
    "landing.everything.subtitle": "Powerful tools designed to accelerate your Design Thinking process",
    "landing.trusted.title": "Trusted by Innovation Leaders",
    "landing.rating": "4.9/5 from 2,500+ users",
    "landing.testimonial.1": "DTTools completely transformed how we innovate. We managed to reduce development time by 40%.",
    "landing.testimonial.2": "The most complete Design Thinking platform I've ever used. Intuitive and powerful.",
    "landing.testimonial.3": "Our clients were impressed with the quality of insights we were able to generate.",
    "landing.ready.title": "Ready to Transform Your Innovation Process?",
    "landing.ready.subtitle": "Join thousands of innovators using DTTools to create breakthrough solutions",
    "landing.start.trial": "Start Free Trial",
    "landing.explore.library": "Explore Library",
    
    // Pricing Page
    "pricing.title": "Choose the Perfect Plan for You",
    "pricing.subtitle": "Transform your ideas into innovative solutions with the most advanced Design Thinking tools. Start free and evolve as your needs grow.",
    "pricing.monthly": "Monthly",
    "pricing.yearly": "Yearly",
    "pricing.save": "Save up to 10%",
    "pricing.popular": "Most Popular",
    "pricing.teams": "Teams",
    "pricing.enterprise": "Enterprise",
    "pricing.comparison": "Detailed Comparison",
    "pricing.comparison.subtitle": "See all features of each plan",
    
    // Plan Names
    "plan.free": "Free",
    "plan.pro": "Pro",
    "plan.team": "Team",
    "plan.enterprise": "Enterprise",
    
    // Plan Descriptions
    "plan.free.desc": "Perfect to start your Design Thinking journey",
    "plan.pro.desc": "Ideal for professionals and freelancers who want more power",
    "plan.team.desc": "For teams collaborating on complex projects",
    "plan.enterprise.desc": "Complete solution for large organizations",
    
    // Buttons
    "btn.start.free": "Start Free",
    "btn.start.trial": "Start Free Trial",
    "btn.contact.sales": "Contact Sales",
    "btn.processing": "Processing...",
    
    // Features
    "feature.projects": "Simultaneous projects",
    "feature.personas": "Personas per project",
    "feature.ai.chat": "AI Chat per month",
    "feature.team.users": "Team users",
    "feature.collaboration": "Real-time collaboration",
    "feature.sso": "SSO (Single Sign-On)",
    "feature.support": "24/7 Support",
    "feature.unlimited": "Unlimited",
    
    // Currency
    "currency.symbol": "$",
    "currency.month": "/month",
    "currency.year": "/year",
    "currency.save": "Save {percent}% annually",
    
    // Trial info
    "trial.info": "7 days free • No credit card required",
    
    // Loading states
    "loading.plans": "Loading plans...",
    
    // Additional features
    "pricing.additional.features": "additional features",
    
    // FAQ
    "faq.title": "Frequently Asked Questions",
    "faq.q1": "Can I cancel my subscription at any time?",
    "faq.a1": "Yes! You can cancel your subscription at any time. When you cancel, you'll continue to have access to features until the end of your current billing period.",
    "faq.q2": "How does the free trial work?",
    "faq.a2": "The 7-day free trial gives you full access to all features of the chosen plan. No credit card is required to start.",
    "faq.q3": "Can I upgrade or downgrade my plan?",
    "faq.a3": "Absolutely! You can change your plan at any time. Changes are applied immediately and the price is adjusted proportionally.",
    
    // Toast messages
    "toast.plan.activated": "Plan Activated!",
    "toast.plan.activated.desc": "Your free plan has been successfully activated.",
    "toast.error": "Error",
    "toast.error.desc": "Error processing subscription. Please try again.",
    
    // Feature table
    "feature.title": "Feature",
    
    // Free pricing
    "pricing.free": "Free",
    
    // Plan Feature Keys (localized)
    "feature.projects.limit": "{count} simultaneous projects",
    "feature.personas.limit": "{count} personas per project",
    "feature.ai.chat.limit": "{count} AI queries per month",
    "feature.team.users.limit": "{count} team users",
    "feature.export.formats": "Export in {formats}",
    "feature.basic.tools": "Basic Design Thinking tools",
    "feature.advanced.tools": "Advanced tools and templates",
    "feature.priority.support": "Priority support",
    "feature.onboarding": "Personalized onboarding",
    "feature.custom.integrations": "Custom integrations",
    "feature.dedicated.manager": "Dedicated account manager",
    "feature.all.phases": "All 5 Design Thinking phases",
    "feature.unlimited.projects": "Unlimited projects",
    "feature.unlimited.personas": "Unlimited personas",
    "feature.unlimited.ai.chat": "Unlimited AI queries",
  },
  
  "es": {
    // Navigation
    "nav.projects": "Proyectos",
    "nav.library": "Biblioteca",
    "nav.pricing": "Precios",
    "nav.admin": "Admin",
    "nav.logout": "Salir",
    "nav.login": "Iniciar sesión",
    
    // Dashboard
    "dashboard.start.project": "Iniciar Proyecto Completo",
    "dashboard.explore.phases": "Explorar Fases",

    // Double Diamond
    "doubleDiamond.title": "Resumen Double Diamond del Proyecto",
    "doubleDiamond.subtitle": "Acompaña cómo tu proyecto avanza por los momentos divergentes y convergentes del Double Diamond.",
    "doubleDiamond.sequence": "Etapa {number}",
    "doubleDiamond.status.completed": "Completado",
    "doubleDiamond.status.active": "En progreso",
    "doubleDiamond.status.upcoming": "Planificado",
    "doubleDiamond.discover.title": "Descubrir",
    "doubleDiamond.discover.description": "Investiga las necesidades reales de los usuarios y recopila insights profundos.",
    "doubleDiamond.discover.phases": "Fase 1 • Empatizar",
    "doubleDiamond.define.title": "Definir",
    "doubleDiamond.define.description": "Convierte los hallazgos en un punto de vista claro y priorizado.",
    "doubleDiamond.define.phases": "Fase 2 • Definir",
    "doubleDiamond.develop.title": "Desarrollar",
    "doubleDiamond.develop.description": "Cocrear soluciones, prototipos y experimentos de alto impacto.",
    "doubleDiamond.develop.phases": "Fases 3-4 • Idear y Prototipar",
    "doubleDiamond.deliver.title": "Entregar",
    "doubleDiamond.deliver.description": "Probar, validar y evolucionar la mejor solución para los usuarios.",
    "doubleDiamond.deliver.phases": "Fase 5 • Probar",
    "doubleDiamond.export.png": "Exportar PNG",
    "doubleDiamond.export.pdf": "Exportar PDF",
    "doubleDiamond.export.success": "Exportación completada",
    "doubleDiamond.export.error": "Error en la exportación",
    "doubleDiamond.export.png.success": "La imagen PNG se descargó correctamente.",
    "doubleDiamond.export.png.error": "No se pudo exportar la imagen. Inténtalo de nuevo.",
    "doubleDiamond.export.pdf.success": "El archivo PDF se descargó correctamente.",
    "doubleDiamond.export.pdf.error": "No se pudo exportar el PDF. Inténtalo de nuevo.",
 
    // Pricing Page
    "pricing.title": "Elige el Plan Perfecto para Ti",
    "pricing.subtitle": "Transforma tus ideas en soluciones innovadoras con las herramientas más avanzadas de Design Thinking. Comienza gratis y evoluciona según tus necesidades.",
    "pricing.monthly": "Mensual",
    "pricing.yearly": "Anual",
    "pricing.save": "Ahorra hasta 10%",
    "pricing.popular": "Más Popular",
    "pricing.teams": "Equipos",
    "pricing.enterprise": "Empresarial",
    "pricing.comparison": "Comparación Detallada",
    "pricing.comparison.subtitle": "Ve todas las funcionalidades de cada plan",
    
    // Plan Names
    "plan.free": "Gratis",
    "plan.pro": "Pro",
    "plan.team": "Team",
    "plan.enterprise": "Enterprise",
    
    // Plan Descriptions
    "plan.free.desc": "Perfecto para comenzar tu viaje de Design Thinking",
    "plan.pro.desc": "Ideal para profesionales y freelancers que quieren más poder",
    "plan.team.desc": "Para equipos que colaboran en proyectos complejos",
    "plan.enterprise.desc": "Solución completa para grandes organizaciones",
    
    // Buttons
    "btn.start.free": "Comenzar Gratis",
    "btn.start.trial": "Comenzar Prueba Gratis",
    "btn.contact.sales": "Contactar Ventas",
    "btn.processing": "Procesando...",
    
    // Features
    "feature.projects": "Proyectos simultáneos",
    "feature.personas": "Personas por proyecto",
    "feature.ai.chat": "Chat IA por mes",
    "feature.team.users": "Usuarios del equipo",
    "feature.collaboration": "Colaboración en tiempo real",
    "feature.sso": "SSO (Single Sign-On)",
    "feature.support": "Soporte 24/7",
    "feature.unlimited": "Ilimitado",
    
    // Currency
    "currency.symbol": "$",
    "currency.month": "/mes",
    "currency.year": "/año",
    "currency.save": "Ahorra {percent}% anualmente",
    
    // Trial info
    "trial.info": "7 días gratis • Sin tarjeta de crédito",
    
    // Loading states
    "loading.plans": "Cargando planes...",
    
    // Additional features
    "pricing.additional.features": "funcionalidades adicionales",
    
    // FAQ
    "faq.title": "Preguntas Frecuentes",
    "faq.q1": "¿Puedo cancelar mi suscripción en cualquier momento?",
    "faq.a1": "¡Sí! Puedes cancelar tu suscripción en cualquier momento. Al cancelar, continuarás teniendo acceso a los recursos hasta el final del período de facturación actual.",
    "faq.q2": "¿Cómo funciona el período de prueba gratuito?",
    "faq.a2": "La prueba gratuita de 7 días te da acceso completo a todas las funcionalidades del plan elegido. No se requiere tarjeta de crédito para comenzar.",
    "faq.q3": "¿Puedo hacer upgrade o downgrade de mi plan?",
    "faq.a3": "¡Por supuesto! Puedes cambiar tu plan en cualquier momento. Los cambios se aplican inmediatamente y el valor se ajusta proporcionalmente.",
    
    // Toast messages
    "toast.plan.activated": "¡Plan Activado!",
    "toast.plan.activated.desc": "Tu plan gratuito ha sido activado exitosamente.",
    "toast.error": "Error",
    "toast.error.desc": "Error al procesar la suscripción. Inténtalo de nuevo.",
    
    // Feature table
    "feature.title": "Funcionalidad",
    
    // Free pricing
    "pricing.free": "Gratis",
    
    // Plan Feature Keys (localized) 
    "feature.projects.limit": "{count} proyectos simultáneos",
    "feature.personas.limit": "{count} personas por proyecto",
    "feature.ai.chat.limit": "{count} consultas IA por mes", 
    "feature.team.users.limit": "{count} usuarios del equipo",
    "feature.export.formats": "Exportación en {formats}",
    "feature.basic.tools": "Herramientas básicas de Design Thinking",
    "feature.advanced.tools": "Herramientas avanzadas y plantillas",
    "feature.priority.support": "Soporte prioritario",
    "feature.onboarding": "Onboarding personalizado",
    "feature.custom.integrations": "Integraciones personalizadas",
    "feature.dedicated.manager": "Gerente de cuenta dedicado",
    "feature.all.phases": "Todas las 5 fases del Design Thinking",
    "feature.unlimited.projects": "Proyectos ilimitados",
    "feature.unlimited.personas": "Personas ilimitadas",
    "feature.unlimited.ai.chat": "Consultas IA ilimitadas",
  },
  
  "fr": {
    // Navigation
    "nav.projects": "Projets",
    "nav.library": "Bibliothèque",
    "nav.pricing": "Tarifs",
    "nav.admin": "Admin",
    "nav.logout": "Se déconnecter",
    "nav.login": "Se connecter",
    
    // Dashboard
    "dashboard.start.project": "Démarrer Projet Complet",
    "dashboard.explore.phases": "Explorer les Phases",
    
    // Double Diamond
    "doubleDiamond.title": "Vue Double Diamond du Projet",
    "doubleDiamond.subtitle": "Visualisez l'avancement du projet à travers les moments divergents et convergents du Double Diamond.",
    "doubleDiamond.sequence": "Étape {number}",
    "doubleDiamond.status.completed": "Terminé",
    "doubleDiamond.status.active": "En cours",
    "doubleDiamond.status.upcoming": "Prévu",
    "doubleDiamond.discover.title": "Découvrir",
    "doubleDiamond.discover.description": "Explorer les besoins réels des utilisateurs et collecter des insights profonds.",
    "doubleDiamond.discover.phases": "Phase 1 • Empathie",
    "doubleDiamond.define.title": "Définir",
    "doubleDiamond.define.description": "Transformer les apprentissages en un point de vue clair et priorisé.",
    "doubleDiamond.define.phases": "Phase 2 • Définir",
    "doubleDiamond.develop.title": "Développer",
    "doubleDiamond.develop.description": "Cocréer des solutions, prototypes et expérimentations à fort impact.",
    "doubleDiamond.develop.phases": "Phases 3-4 • Idéer & Prototyper",
    "doubleDiamond.deliver.title": "Livrer",
    "doubleDiamond.deliver.description": "Tester, valider et faire évoluer la meilleure solution pour les utilisateurs.",
    "doubleDiamond.deliver.phases": "Phase 5 • Tester",
    "doubleDiamond.export.png": "Exporter PNG",
    "doubleDiamond.export.pdf": "Exporter PDF",
    "doubleDiamond.export.success": "Exportation terminée",
    "doubleDiamond.export.error": "Erreur d'exportation",
    "doubleDiamond.export.png.success": "L'image PNG a été téléchargée avec succès.",
    "doubleDiamond.export.png.error": "Impossible d'exporter l'image. Veuillez réessayer.",
    "doubleDiamond.export.pdf.success": "Le fichier PDF a été téléchargé avec succès.",
    "doubleDiamond.export.pdf.error": "Impossible d'exporter le PDF. Veuillez réessayer.",
 
    // Pricing Page
    "pricing.title": "Choisissez le Plan Parfait pour Vous",
    "pricing.subtitle": "Transformez vos idées en solutions innovantes avec les outils de Design Thinking les plus avancés. Commencez gratuitement et évoluez selon vos besoins.",
    "pricing.monthly": "Mensuel",
    "pricing.yearly": "Annuel",
    "pricing.save": "Économisez jusqu'à 10%",
    "pricing.popular": "Le Plus Populaire",
    "pricing.teams": "Équipes",
    "pricing.enterprise": "Entreprise",
    "pricing.comparison": "Comparaison Détaillée",
    "pricing.comparison.subtitle": "Voir toutes les fonctionnalités de chaque plan",
    
    // Plan Names
    "plan.free": "Gratuit",
    "plan.pro": "Pro",
    "plan.team": "Team",
    "plan.enterprise": "Enterprise",
    
    // Plan Descriptions
    "plan.free.desc": "Parfait pour commencer votre parcours Design Thinking",
    "plan.pro.desc": "Idéal pour les professionnels et freelances qui veulent plus de puissance",
    "plan.team.desc": "Pour les équipes collaborant sur des projets complexes",
    "plan.enterprise.desc": "Solution complète pour les grandes organisations",
    
    // Buttons
    "btn.start.free": "Commencer Gratuitement",
    "btn.start.trial": "Commencer l'Essai Gratuit",
    "btn.contact.sales": "Contacter les Ventes",
    "btn.processing": "En cours...",
    
    // Features
    "feature.projects": "Projets simultanés",
    "feature.personas": "Personas par projet",
    "feature.ai.chat": "Chat IA par mois",
    "feature.team.users": "Utilisateurs d'équipe",
    "feature.collaboration": "Collaboration en temps réel",
    "feature.sso": "SSO (Single Sign-On)",
    "feature.support": "Support 24/7",
    "feature.unlimited": "Illimité",
    
    // Currency
    "currency.symbol": "€",
    "currency.month": "/mois",
    "currency.year": "/an",
    "currency.save": "Économisez {percent}% annuellement",
    
    // Trial info
    "trial.info": "7 jours gratuits • Pas de carte de crédit requise",
    
    // Loading states
    "loading.plans": "Chargement des plans...",
    
    // Additional features
    "pricing.additional.features": "fonctionnalités supplémentaires",
    
    // FAQ
    "faq.title": "Questions Fréquemment Posées",
    "faq.q1": "Puis-je annuler mon abonnement à tout moment?",
    "faq.a1": "Oui! Vous pouvez annuler votre abonnement à tout moment. Lors de l'annulation, vous continuerez à avoir accès aux fonctionnalités jusqu'à la fin de votre période de facturation actuelle.",
    "faq.q2": "Comment fonctionne la période d'essai gratuite?",
    "faq.a2": "L'essai gratuit de 7 jours vous donne un accès complet à toutes les fonctionnalités du plan choisi. Aucune carte de crédit n'est requise pour commencer.",
    "faq.q3": "Puis-je faire un upgrade ou downgrade de mon plan?",
    "faq.a3": "Absolument! Vous pouvez changer votre plan à tout moment. Les changements sont appliqués immédiatement et le prix est ajusté proportionnellement.",
    
    // Toast messages
    "toast.plan.activated": "Plan Activé!",
    "toast.plan.activated.desc": "Votre plan gratuit a été activé avec succès.",
    "toast.error": "Erreur",
    "toast.error.desc": "Erreur lors du traitement de l'abonnement. Veuillez réessayer.",
    
    // Feature table
    "feature.title": "Fonctionnalité",
    
    // Free pricing
    "pricing.free": "Gratuit",
    
    // Plan Feature Keys (localized)
    "feature.projects.limit": "{count} projets simultanés",
    "feature.personas.limit": "{count} personas par projet",
    "feature.ai.chat.limit": "{count} requêtes IA par mois",
    "feature.team.users.limit": "{count} utilisateurs d'équipe",
    "feature.export.formats": "Export en {formats}",
    "feature.basic.tools": "Outils de base Design Thinking",
    "feature.advanced.tools": "Outils avancés et modèles",
    "feature.priority.support": "Support prioritaire",
    "feature.onboarding": "Onboarding personnalisé",
    "feature.custom.integrations": "Intégrations personnalisées",
    "feature.dedicated.manager": "Gestionnaire de compte dédié",
    "feature.all.phases": "Toutes les 5 phases du Design Thinking",
    "feature.unlimited.projects": "Projets illimités",
    "feature.unlimited.personas": "Personas illimitées",
    "feature.unlimited.ai.chat": "Requêtes IA illimitées",
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    // Detect browser language
    const saved = localStorage.getItem("dttools-language");
    if (saved && Object.keys(translations).includes(saved)) {
      return saved as Language;
    }
    
    const browserLang = navigator.language;
    if (browserLang.startsWith("pt")) return "pt-BR";
    if (browserLang.startsWith("es")) return "es";
    if (browserLang.startsWith("fr")) return "fr";
    if (browserLang.startsWith("en")) return "en";
    return "pt-BR"; // Português como padrão para usuários brasileiros
  });

  useEffect(() => {
    localStorage.setItem("dttools-language", language);
  }, [language]);

  const t = (key: string, params?: Record<string, string>): string => {
    let translation = (translations[language] as any)[key] || (translations["en"] as any)[key] || key;
    
    // Replace parameters
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{${param}}`, value);
      });
    }
    
    return translation;
  };

  const convertPrice = (originalPriceInCents: number) => {
    // Currency conversion rates based on language/region
    const conversionConfig = {
      "pt-BR": { rate: 1 }, // Base currency (BRL)
      "en": { rate: 0.31 }, // ~3.2x cheaper in USD
      "es": { rate: 0.28 }, // ~3.6x cheaper in USD
      "fr": { rate: 0.26 }, // ~3.8x cheaper in EUR
    };

    const config = conversionConfig[language];
    const convertedPriceInCents = Math.round(originalPriceInCents * config.rate);
    const price = convertedPriceInCents / 100; // Convert cents to currency units
    
    // Handle free pricing
    if (price === 0) {
      return {
        price: 0,
        symbol: CURRENCY_CODES[language],
        formattedPrice: t("pricing.free")
      };
    }
    
    // Use Intl.NumberFormat for proper currency formatting
    const locale = LOCALE_MAP[language];
    const currencyCode = CURRENCY_CODES[language];
    
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    
    const formattedPrice = formatter.format(price);
    
    return {
      price: convertedPriceInCents,
      symbol: currencyCode,
      formattedPrice: formattedPrice
    };
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, convertPrice }}>
      {children}
    </LanguageContext.Provider>
  );
}