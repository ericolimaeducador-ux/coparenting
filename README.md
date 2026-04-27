# 👨‍👩‍👧 CoParent — Plataforma de Coparentalidade

Uma aplicação web completa para pais separados que compartilham a criação dos filhos.  
**Stack:** React 18 + Vite + Tailwind CSS + Supabase + GitHub Pages

---

## 🚀 Funcionalidades

- **🏠 Dashboard** — Visão geral com filhos, eventos próximos e movimentações
- **📅 Calendário** — Eventos compartilhados com visualização mensal
- **💰 Finanças** — Controle de despesas e receitas com gráficos
- **💬 Chat** — Comunicação direta em tempo real entre os responsáveis
- **🎁 Presentes** — Kanban de sugestões de presentes por status
- **💉 Vacinação** — Caderneta vacinal completa com calendário SBP
- **👶 Perfil da Criança** — Dados completos: saúde, escola, documentos
- **⚙️ Configurações** — Gestão de parceria com link de convite

---

## 📋 Configuração — Passo a Passo

### 1. Criar conta no Supabase (gratuito)

1. Acesse [supabase.com](https://supabase.com) e crie uma conta gratuita
2. Clique em **"New Project"**
3. Escolha um nome (ex: `coparent`), senha do banco e região (South America - São Paulo)
4. Aguarde o projeto ser criado (~2 min)

### 2. Executar o schema do banco de dados

1. No dashboard do Supabase, acesse **SQL Editor > New Query**
2. Cole todo o conteúdo do arquivo `supabase/schema.sql`
3. Clique em **Run** (ou Ctrl+Enter)
4. Verifique se todas as tabelas foram criadas em **Table Editor**

### 3. Criar o bucket de storage

1. No Supabase, acesse **Storage > New Bucket**
2. Nome: `uploads`
3. Marque **Public bucket**
4. Clique em **Create bucket**

### 4. Configurar autenticação

1. No Supabase, acesse **Authentication > Providers**
2. **Email** já está habilitado por padrão ✓
3. Para Google OAuth (opcional):
   - Habilite o provider **Google**
   - Crie credenciais OAuth no [Google Console](https://console.cloud.google.com)
   - Adicione `https://seu-projeto.supabase.co/auth/v1/callback` como Redirect URI
   - Cole Client ID e Secret no Supabase

### 5. Pegar as credenciais

1. No Supabase, acesse **Project Settings > API**
2. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### 6. Publicar no GitHub Pages

#### Opção A — Automático via GitHub Actions (recomendado)

1. Crie um repositório no GitHub
2. Faça upload de todos os arquivos (via Codespace ou git push)
3. No GitHub, vá em **Settings > Secrets and variables > Actions**
4. Adicione dois secrets:
   - `VITE_SUPABASE_URL` = sua URL do Supabase
   - `VITE_SUPABASE_ANON_KEY` = sua anon key
5. Vá em **Settings > Pages**
6. Em "Source", selecione **GitHub Actions**
7. O deploy acontece automaticamente a cada push na branch `main`

#### Opção B — Manual via Codespace

```bash
# No terminal do Codespace:

# 1. Instale dependências
npm install

# 2. Crie o arquivo .env
cp .env.example .env
# Edite .env com suas credenciais

# 3. Build
npm run build

# 4. Commit e push
git add .
git commit -m "Deploy inicial"
git push origin main
```

---

## 🖥️ Desenvolvimento local

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/coparent.git
cd coparent

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais Supabase

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:5173](http://localhost:5173)

---

## 📁 Estrutura do projeto

```
coparenting/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD automático
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── calendar/
│   │   │   └── EventForm.jsx
│   │   ├── children/
│   │   │   └── ChildForm.jsx
│   │   ├── finances/
│   │   │   └── ExpenseForm.jsx
│   │   ├── gifts/
│   │   │   └── GiftForm.jsx
│   │   ├── layout/
│   │   │   └── Layout.jsx      # Sidebar + mobile menu
│   │   ├── shared/
│   │   │   ├── CategoryBadge.jsx
│   │   │   └── PartnershipGuard.jsx
│   │   ├── ui/                 # Componentes base (shadcn-style)
│   │   │   ├── alert-dialog.jsx
│   │   │   ├── button.jsx
│   │   │   ├── card.jsx
│   │   │   ├── dialog.jsx
│   │   │   ├── input.jsx
│   │   │   ├── misc.jsx        # Label, Textarea, Badge, Spinner, Avatar
│   │   │   ├── select.jsx
│   │   │   ├── switch.jsx
│   │   │   └── tabs.jsx
│   │   └── vaccination/
│   │       └── VaccinationForm.jsx
│   ├── context/
│   │   └── AuthContext.jsx     # Auth com Supabase
│   ├── hooks/
│   │   └── usePartnershipChildren.js
│   ├── lib/
│   │   ├── supabase.js         # Cliente Supabase
│   │   └── utils.js            # Utilitários
│   ├── pages/
│   │   ├── Auth.jsx
│   │   ├── BetaWelcome.jsx
│   │   ├── Calendar.jsx
│   │   ├── Chat.jsx
│   │   ├── ChildProfile.jsx
│   │   ├── Finances.jsx
│   │   ├── Gifts.jsx
│   │   ├── Home.jsx
│   │   ├── PageNotFound.jsx
│   │   ├── Settings.jsx
│   │   └── Vaccination.jsx
│   ├── App.jsx                 # Rotas principais
│   ├── index.css               # Design tokens + Tailwind
│   └── main.jsx
├── supabase/
│   └── schema.sql              # Schema completo + seed vacinas
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

---

## 🔒 Segurança

- **Row Level Security (RLS)** ativado em todas as tabelas
- Cada usuário acessa apenas dados da sua parceria
- A parceria vincula exatamente 2 responsáveis
- Token de convite único e de uso único
- Autenticação gerenciada pelo Supabase Auth
- Storage de arquivos com acesso público mas upload autenticado

---

## 💾 Plano gratuito do Supabase inclui:

| Recurso | Limite gratuito |
|---|---|
| Database | 500 MB |
| Storage | 1 GB |
| Auth | Usuários ilimitados |
| Realtime | 200 conexões simultâneas |
| API calls | 500.000/mês |
| Bandwidth | 5 GB/mês |

Mais do que suficiente para uso familiar!

---

## 🛠️ Tecnologias utilizadas

| Tecnologia | Uso |
|---|---|
| React 18 | Interface |
| Vite | Build tool |
| Tailwind CSS | Estilização |
| Radix UI | Componentes acessíveis |
| TanStack Query | Gerenciamento de dados |
| React Router v6 | Navegação (HashRouter para GitHub Pages) |
| Supabase | Auth + Database + Storage + Realtime |
| Recharts | Gráficos |
| date-fns | Manipulação de datas |
| Sonner | Notificações toast |
| Lucide React | Ícones |

---

## 📱 URLs após deploy

Após configurar o GitHub Pages, seu app estará em:
```
https://seu-usuario.github.io/nome-do-repositorio/
```

As rotas usam HashRouter (`#/home`, `#/calendar`, etc.) para compatibilidade com páginas estáticas.

---

## 🐛 Problemas comuns

**App em branco após deploy:**
- Verifique se o `base: './'` está no `vite.config.js` ✓
- Verifique se os secrets do GitHub estão configurados

**Erro de autenticação:**
- Verifique se a URL do Supabase está correta no secret
- No Supabase > Authentication > URL Configuration, adicione a URL do seu GitHub Pages

**Usuário não consegue aceitar convite:**
- No Supabase > Authentication > URL Configuration
- Em "Redirect URLs", adicione: `https://seu-usuario.github.io/nome-do-repo/#/settings`

---

## 📞 Suporte

Este projeto foi gerado como uma solução completa e auto-suficiente.  
Para dúvidas sobre o Supabase: [docs.supabase.com](https://docs.supabase.com)
