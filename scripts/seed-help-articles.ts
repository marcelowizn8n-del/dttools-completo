import { db } from "../server/db";
import { helpArticles } from "@shared/schema";

const helpArticlesData = [
  {
    title: "Como Começar no DTTools",
    slug: "como-comecar-dttools",
    content: `# Como Começar no DTTools

Bem-vindo ao DTTools! Este guia vai te ajudar a dar os primeiros passos na plataforma.

## Criando sua Conta

1. Clique em "Entrar" no canto superior direito
2. Use suas credenciais ou crie uma nova conta
3. Complete seu perfil com foto e informações

## Criando seu Primeiro Projeto

1. Vá para "Projetos" no menu principal
2. Clique em "+ Novo Projeto"
3. Dê um nome significativo ao seu projeto
4. Escolha a fase inicial (recomendamos começar pela Fase 1: Empatizar)

## Navegando pelas 5 Fases

O DTTools segue as 5 fases do Design Thinking:

- **Fase 1: Empatizar** - Entenda seu usuário
- **Fase 2: Definir** - Defina o problema
- **Fase 3: Idear** - Gere ideias criativas
- **Fase 4: Prototipar** - Crie protótipos rápidos
- **Fase 5: Testar** - Valide suas soluções

Cada fase tem ferramentas específicas para te ajudar!`,
    category: "inicio-rapido",
    subcategory: "Primeiros Passos",
    phase: null,
    tags: ["iniciante", "tutorial", "setup"],
    featured: true,
    viewCount: 0,
    helpful: 0,
    author: "DTTools Team"
  },
  {
    title: "Estrutura de um Projeto",
    slug: "estrutura-projeto",
    content: `# Estrutura de um Projeto no DTTools

## Organização

Cada projeto no DTTools é organizado seguindo o processo de Design Thinking:

### Fase 1: Empatizar
- Mapas de Empatia
- Personas
- Entrevistas com usuários
- Observações de campo

### Fase 2: Definir
- POV Statements
- Definição de problemas
- How Might We questions

### Fase 3: Idear
- Brainstorming
- Categorização de ideias
- Priorização

### Fase 4: Prototipar
- Criação de protótipos
- Documentação visual
- Iterações

### Fase 5: Testar
- Planos de teste
- Coleta de feedback
- Análise de resultados

## Navegação entre Fases

Você pode navegar livremente entre as fases, mas recomendamos seguir a ordem natural do processo.`,
    category: "inicio-rapido",
    subcategory: "Conceitos Básicos",
    phase: null,
    tags: ["projeto", "organização", "fases"],
    featured: true,
    viewCount: 0,
    helpful: 0,
    author: "DTTools Team"
  },
  {
    title: "Criando um Mapa de Empatia Efetivo",
    slug: "mapa-empatia-efetivo",
    content: `# Criando um Mapa de Empatia Efetivo

O Mapa de Empatia é uma ferramenta poderosa para entender profundamente seus usuários.

## O que o usuário DIZ?

Capture citações reais e comentários diretos dos usuários. Isso ajuda a entender suas necessidades expressas verbalmente.

**Dicas:**
- Use aspas para citações diretas
- Anote durante entrevistas ou pesquisas
- Preste atenção em frases repetidas

## O que o usuário PENSA?

Explore os pensamentos internos, preocupações e aspirações que podem não ser verbalizadas.

**Dicas:**
- Faça perguntas abertas
- Observe linguagem corporal
- Identifique contradições entre fala e pensamento

## O que o usuário FAZ?

Documente ações, comportamentos e práticas observáveis.

**Dicas:**
- Observe no contexto real
- Documente a rotina completa
- Note desvios do comportamento esperado

## O que o usuário SENTE?

Identifique emoções, medos, frustrações e alegrias.

**Dicas:**
- Pergunte sobre sentimentos
- Observe expressões emocionais
- Identifique dores e ganhos`,
    category: "fases",
    subcategory: "Fase 1: Empatizar",
    phase: 1,
    tags: ["empatia", "mapa", "usuário", "fase-1"],
    featured: true,
    viewCount: 0,
    helpful: 0,
    author: "DTTools Team"
  },
  {
    title: "Desenvolvendo Personas Detalhadas",
    slug: "personas-detalhadas",
    content: `# Desenvolvendo Personas Detalhadas

Personas são representações fictícias dos seus usuários baseadas em dados reais.

## Elementos de uma Persona Completa

### 1. Informações Demográficas
- Nome e foto representativa
- Idade, profissão, localização
- Contexto familiar e social

### 2. Comportamentos e Hábitos
- Como usa tecnologia
- Rotina diária
- Canais de comunicação preferidos

### 3. Objetivos e Motivações
- O que quer alcançar
- Por que usa seu produto/serviço
- Aspirações de longo prazo

### 4. Frustrações e Dores
- Problemas atuais
- Barreiras que enfrenta
- Medos e preocupações

### 5. Citação Característica
Uma frase que resume a persona

## Dicas para Criar Boas Personas

1. **Base em dados reais** - Use informações de pesquisas e entrevistas
2. **Seja específico** - Evite generalizações
3. **Mantenha atualizado** - Revise periodicamente
4. **Use com a equipe** - Compartilhe e discuta as personas`,
    category: "fases",
    subcategory: "Fase 1: Empatizar",
    phase: 1,
    tags: ["persona", "usuário", "perfil", "fase-1"],
    featured: true,
    viewCount: 0,
    helpful: 0,
    author: "DTTools Team"
  },
  {
    title: "Definindo Problemas com POV Statements",
    slug: "pov-statements",
    content: `# Definindo Problemas com POV Statements

POV (Point of View) Statements ajudam a sintetizar insights da fase de empatia em uma declaração clara do problema.

## Estrutura do POV Statement

**[Usuário] precisa [necessidade] porque [insight]**

### Exemplo:
"Maria, professora do ensino fundamental, precisa de uma forma rápida de criar atividades interativas porque tem pouco tempo entre as aulas e quer manter os alunos engajados."

## Como Criar um Bom POV

### 1. Identifique o Usuário
Seja específico sobre quem é o usuário (use sua persona!)

### 2. Defina a Necessidade
O que o usuário realmente precisa? (não confunda com solução)

### 3. Articule o Insight
Por que essa necessidade existe? Qual é o contexto?

## Características de um Bom POV

- ✅ Centrado no usuário
- ✅ Específico e concreto
- ✅ Baseado em insights reais
- ✅ Inspirador para ideação
- ❌ Não sugere uma solução específica
- ❌ Não é vago ou genérico`,
    category: "fases",
    subcategory: "Fase 2: Definir",
    phase: 2,
    tags: ["pov", "problema", "definição", "fase-2"],
    featured: false,
    viewCount: 0,
    helpful: 0,
    author: "DTTools Team"
  },
  {
    title: "Como Fazer Brainstorming Efetivo",
    slug: "brainstorming-efetivo",
    content: `# Como Fazer Brainstorming Efetivo

O brainstorming é a técnica central da fase de Ideação. Aqui estão as melhores práticas.

## Regras de Ouro do Brainstorming

### 1. Quantidade sobre Qualidade
Gere o máximo de ideias possível. Não se preocupe com viabilidade neste momento.

### 2. Suspenda o Julgamento
Nenhuma ideia é ruim. Críticas matam a criatividade.

### 3. Encoraje Ideias Malucas
As melhores soluções muitas vezes vêm de ideias aparentemente absurdas.

### 4. Construa sobre as Ideias dos Outros
Use "sim, e..." em vez de "mas..."

## Técnicas de Brainstorming

### Brainwriting
Cada pessoa escreve ideias silenciosamente por 5 minutos, depois compartilha.

### SCAMPER
- **S**ubstituir
- **C**ombinar
- **A**daptar
- **M**odificar
- **P**ropor outros usos
- **E**liminar
- **R**everter

### Worst Possible Idea
Pense nas piores soluções possíveis, depois inverta-as.

## Dicas no DTTools

Use a ferramenta de Brainstorming para:
- Adicionar ideias rapidamente
- Categorizar depois
- Votar nas melhores
- Exportar para documentação`,
    category: "fases",
    subcategory: "Fase 3: Idear",
    phase: 3,
    tags: ["brainstorming", "ideação", "criatividade", "fase-3"],
    featured: true,
    viewCount: 0,
    helpful: 0,
    author: "DTTools Team"
  },
  {
    title: "Tipos de Protótipos e Quando Usar",
    slug: "tipos-prototipos",
    content: `# Tipos de Protótipos e Quando Usar

Na fase de Prototipagem, você pode criar diferentes tipos de protótipos dependendo do objetivo.

## Protótipos de Baixa Fidelidade

### Paper Prototypes (Sketches)
- **Quando usar**: Início da prototipagem, testes rápidos
- **Vantagens**: Rápido, barato, fácil de modificar
- **Desvantagens**: Limitado em interatividade

### Wireframes
- **Quando usar**: Definir estrutura e fluxo
- **Vantagens**: Foco em funcionalidade, não em estética
- **Desvantagens**: Pode parecer abstrato para usuários

## Protótipos de Média Fidelidade

### Mockups Digitais
- **Quando usar**: Validar design visual
- **Vantagens**: Realista, mostra branding
- **Desvantagens**: Mais tempo para criar

### Protótipos Clicáveis
- **Quando usar**: Testar fluxos de navegação
- **Vantagens**: Interativo, simula experiência real
- **Desvantagens**: Requer ferramentas específicas

## Protótipos de Alta Fidelidade

### Protótipos Funcionais
- **Quando usar**: Validação final antes do desenvolvimento
- **Vantagens**: Muito realista, testa funcionalidades
- **Desvantagens**: Demorado, caro

## Dica: Comece Simples

Sempre comece com protótipos de baixa fidelidade. Você aprende mais rápido e gasta menos recursos!`,
    category: "fases",
    subcategory: "Fase 4: Prototipar",
    phase: 4,
    tags: ["protótipo", "design", "wireframe", "fase-4"],
    featured: false,
    viewCount: 0,
    helpful: 0,
    author: "DTTools Team"
  },
  {
    title: "Colaborando em Equipe no DTTools",
    slug: "colaboracao-equipe",
    content: `# Colaborando em Equipe no DTTools

O Design Thinking é um processo colaborativo. Aqui está como trabalhar efetivamente em equipe.

## Compartilhando Projetos

### Como Adicionar Membros
1. Abra seu projeto
2. Clique em "Compartilhar" ou ícone de pessoas
3. Adicione membros por email
4. Defina permissões (visualizar/editar/administrar)

## Boas Práticas de Colaboração

### Comunicação Clara
- Use comentários em cada ferramenta
- Documente decisões importantes
- Mantenha todos atualizados

### Divisão de Trabalho
- Atribua responsabilidades claras
- Use tags para organizar
- Defina prazos realistas

### Sessões Colaborativas
- Faça workshops de Design Thinking juntos
- Use o modo de brainstorming em grupo
- Revise e vote em ideias coletivamente

## Resolução de Conflitos

### Quando Opiniões Divergem
1. Ouça todas as perspectivas
2. Volte aos insights dos usuários
3. Teste ambas as opções se possível
4. Use dados para decidir

## Exportação e Apresentação

Use as ferramentas de exportação para:
- Criar apresentações em PowerPoint
- Gerar relatórios em PDF
- Compartilhar em Markdown para documentação`,
    category: "colaboracao",
    subcategory: "Trabalho em Equipe",
    phase: null,
    tags: ["colaboração", "equipe", "compartilhamento"],
    featured: false,
    viewCount: 0,
    helpful: 0,
    author: "DTTools Team"
  },
  {
    title: "Como Exportar seus Projetos",
    slug: "exportar-projetos",
    content: `# Como Exportar seus Projetos

O DTTools oferece múltiplos formatos de exportação para diferentes necessidades.

## Formatos Disponíveis

### PowerPoint (.pptx)
**Ideal para**: Apresentações executivas, pitches, workshops

**Inclui**:
- Slides formatados profissionalmente
- Gráficos e visualizações
- Conteúdo de todas as fases
- Imagens de protótipos

**Como exportar**:
1. Abra o projeto
2. Clique em "Exportar"
3. Selecione "PowerPoint"
4. Aguarde o download

### PDF (.pdf)
**Ideal para**: Documentação, relatórios, arquivamento

**Inclui**:
- Formato não editável
- Layout profissional
- Todas as informações do projeto
- Fácil compartilhamento

### Markdown (.md)
**Ideal para**: Documentação técnica, wikis, GitHub

**Inclui**:
- Texto estruturado
- Fácil versionamento
- Compatível com ferramentas de desenvolvimento

### CSV (.csv)
**Ideal para**: Análise de dados, importação em outras ferramentas

**Inclui**:
- Dados tabulares
- Ideias, testes, feedback
- Compatível com Excel e Google Sheets

## Dicas de Exportação

- Revise seu projeto antes de exportar
- Escolha o formato adequado ao público
- Personalize após exportar se necessário
- Mantenha backups dos arquivos exportados`,
    category: "exportacao",
    subcategory: "Formatos e Usos",
    phase: null,
    tags: ["exportação", "pdf", "pptx", "relatórios"],
    featured: false,
    viewCount: 0,
    helpful: 0,
    author: "DTTools Team"
  }
];

async function seedHelpArticles() {
  console.log("🌱 Seeding help articles...");
  
  try {
    // Check if articles already exist
    const existingArticles = await db.select().from(helpArticles);
    
    if (existingArticles.length > 0) {
      console.log(`⚠️  Found ${existingArticles.length} existing articles.`);
      console.log("   To reseed, first delete existing articles.");
      return;
    }

    // Insert articles
    await db.insert(helpArticles).values(helpArticlesData);
    
    console.log(`✅ Successfully seeded ${helpArticlesData.length} help articles!`);
    console.log("\nArticles by category:");
    const categories = helpArticlesData.reduce((acc, article) => {
      acc[article.category] = (acc[article.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`   - ${cat}: ${count} articles`);
    });
    
    const featuredCount = helpArticlesData.filter(a => a.featured).length;
    console.log(`\n⭐ Featured articles: ${featuredCount}`);
    
  } catch (error) {
    console.error("❌ Error seeding help articles:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedHelpArticles()
    .then(() => {
      console.log("\n✨ Seed completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Seed failed:", error);
      process.exit(1);
    });
}

export { seedHelpArticles, helpArticlesData };
