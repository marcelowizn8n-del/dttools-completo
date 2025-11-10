# 🔄 Como Sincronizar Artigos do Help Center para Produção

## O Problema

O Replit usa **bancos de dados separados** para:
- **Desenvolvimento** (Preview do Replit) - onde você está trabalhando
- **Produção** (dttools.app) - o site público

Os 9 artigos do Help Center foram criados apenas no banco de **desenvolvimento**. Para que apareçam em **produção**, você precisa populá-los lá também.

## ✅ Solução: Executar Script de Seed em Produção

### Opção 1: Via Painel Admin (RECOMENDADO)

Vou criar um botão no Admin para você popular os artigos com um clique:

1. Faça login no Admin em **dttools.app/admin**
2. Vá para a tab "Artigos"
3. Clique no botão "🌱 Popular Artigos Iniciais"
4. Aguarde a confirmação
5. Atualize a página do Help Center

### Opção 2: Via Replit Console (Avançado)

Se a Opção 1 não funcionar, use o console do Replit:

1. No Replit, vá para o seu deployment/publicação
2. Abra o Shell/Console da **produção** (não do desenvolvimento)
3. Execute o comando:

```bash
tsx scripts/seed-help-articles.ts
```

4. Aguarde a mensagem de sucesso
5. Atualize dttools.app/help

### Opção 3: Via Drizzle Studio (Visual)

1. Conecte-se ao banco de **produção** via Drizzle Studio
2. Use a interface visual para inserir os dados
3. Importe de `scripts/seed-help-articles.ts`

## 🔍 Como Verificar se Funcionou

Após executar o seed:

1. Acesse **dttools.app/help**
2. Você deve ver "Artigos em Destaque" com 5 artigos
3. Clique em cada categoria (Início Rápido, Fases do DT, etc.)
4. Os artigos devem aparecer em cada categoria

## 📊 Artigos que Serão Criados

O script cria **9 artigos**:

### Início Rápido (2 artigos)
- ⭐ Como Começar no DTTools
- ⭐ Estrutura de um Projeto

### Fases do DT (5 artigos)  
- ⭐ Criando um Mapa de Empatia Efetivo (Fase 1)
- ⭐ Desenvolvendo Personas Detalhadas (Fase 1)
- Definindo Problemas com POV Statements (Fase 2)
- ⭐ Como Fazer Brainstorming Efetivo (Fase 3)
- Tipos de Protótipos e Quando Usar (Fase 4)

### Colaboração (1 artigo)
- Colaborando em Equipe no DTTools

### Exportação (1 artigo)
- Como Exportar seus Projetos

⭐ = Artigo em destaque (5 total)

## ⚠️ Importante

- O script verifica se já existem artigos antes de criar
- Se o banco de produção já tiver artigos, não irá duplicar
- Para recriar, primeiro delete os artigos existentes no banco de produção

## 🆘 Se Precisar de Ajuda

Se encontrar erros:
1. Verifique se está conectado ao banco de PRODUÇÃO (não desenvolvimento)
2. Confirme que tem permissões de escrita no banco
3. Veja os logs de erro para detalhes específicos
