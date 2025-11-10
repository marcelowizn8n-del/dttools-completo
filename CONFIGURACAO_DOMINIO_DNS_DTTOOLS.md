# Configuração DNS para dttools.app

## ✅ Status: Domínio configurado no Railway

O domínio personalizado `dttools.app` foi configurado com sucesso no Railway!

## 🔧 Instruções para Configuração DNS

Para finalizar a configuração do domínio personalizado, você precisa adicionar o seguinte record DNS no seu provedor de domínio (registrador):

### Record DNS Necessário:

| Type  | Name | Value                   |
|-------|------|-------------------------|
| CNAME | @    | 8642vf7d.up.railway.app |

### Instruções Detalhadas:

1. **Acesse o painel do seu provedor de domínio** onde você registrou `dttools.app`

2. **Navegue até a seção de DNS/Records/Zone File**

3. **Adicione um novo record CNAME com os seguintes valores:**
   - **Tipo:** CNAME
   - **Nome:** @ (representa o root/raiz do domínio)
   - **Destino/Value:** 8642vf7d.up.railway.app
   - **TTL:** Use o padrão (geralmente 3600 ou Auto)

4. **Salve as alterações**

### ⚠️ Importante:

- **Propagação DNS:** As mudanças podem levar **até 72 horas** para propagar mundialmente
- **Root Domain:** O "@" significa que o record é para o domínio raiz (dttools.app), não um subdomínio
- **SSL/HTTPS:** O Railway automaticamente configurará SSL/HTTPS após a verificação DNS

### 🎯 Resultado Esperado:

Após a configuração e propagação DNS, seu site estará disponível em:
- **https://dttools.app** (novo domínio personalizado)

Em vez da URL padrão:
- https://dttools-production.up.railway.app

### 🔍 Como Verificar:

Você pode usar as seguintes ferramentas para verificar se o DNS foi propagado:
- https://dnschecker.org/
- `nslookup dttools.app`
- `dig dttools.app`

### 📞 Suporte:

Se você tiver problemas com a configuração DNS no seu provedor, entre em contato com o suporte do registrador do domínio com essas informações DNS.