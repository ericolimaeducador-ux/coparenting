import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar, DollarSign, MessageCircle, Gift,
  Syringe, FileText, Shield, Star, ArrowRight, CheckCircle,
  HeartHandshake, Lock, Sparkles, Users, FileClock, BadgeDollarSign, XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import AppLogo from '@/components/shared/AppLogo'

const proofPoints = [
  'Agenda compartilhada',
  'Chat privado',
  'Saude e escola',
  'Financas com controle',
]

const features = [
  {
    icon: Calendar,
    title: 'Agenda compartilhada',
    desc: 'Organize visitas, consultas, escola e feriados em uma mesma linha do tempo.',
    accent: 'from-cyan-400/30 to-cyan-200/10',
  },
  {
    icon: MessageCircle,
    title: 'Chat seguro',
    desc: 'Converse sobre os filhos com registro, contexto e sem ruido emocional desnecessario.',
    accent: 'from-sky-400/30 to-sky-200/10',
  },
  {
    icon: DollarSign,
    title: 'Controle de gastos',
    desc: 'Registre despesas, receitas e comprovantes com visao por periodo e categoria.',
    accent: 'from-emerald-400/30 to-emerald-200/10',
  },
  {
    icon: Syringe,
    title: 'Caderneta de vacinas',
    desc: 'Acompanhe doses, lotes, proximas aplicacoes e anexe os comprovantes quando precisar.',
    accent: 'from-amber-400/30 to-amber-200/10',
  },
  {
    icon: Gift,
    title: 'Presentes com aprovacao',
    desc: 'Sugira, aprove e acompanhe presentes em um fluxo simples e visual.',
    accent: 'from-rose-400/30 to-rose-200/10',
  },
  {
    icon: FileText,
    title: 'Dados sensiveis protegidos',
    desc: 'Saude, escola, documentos e informacoes importantes com acesso restrito a parceria.',
    accent: 'from-violet-400/30 to-violet-200/10',
  },
]

const socialProof = [
  { value: '2x', label: 'menos mensagens perdidas' },
  { value: '1', label: 'espaco privado para tudo' },
  { value: '100%', label: 'foco nos filhos, nao no conflito' },
]

const useCases = [
  { icon: FileClock, title: 'Rotina visivel', text: 'Veja a semana inteira sem precisar abrir varias conversas.' },
  { icon: HeartHandshake, title: 'Acordos claros', text: 'Mantenha historico de combinados e responsabilidades.' },
  { icon: Lock, title: 'Privacidade real', text: 'Dados acessiveis apenas pelos dois responsaveis da parceria.' },
]

const steps = [
  {
    title: '1. Convide o outro responsavel',
    text: 'Crie a parceria e compartilhe um link seguro, sem planilhas ou grupos paralelos.',
  },
  {
    title: '2. Organize tudo em um lugar',
    text: 'Calendario, mensagens, gastos, vacinas e escola ficam conectados entre si.',
  },
  {
    title: '3. Mostre clareza imediata',
    text: 'A tela apresenta o valor do produto de forma visual, premium e facil de entender.',
  },
]

const comparison = [
  { label: 'Calendario de visitas', app: true, whatsapp: false, spreadsheet: false },
  { label: 'Chat com historico seguro', app: true, whatsapp: false, spreadsheet: false },
  { label: 'Gastos por crianca', app: true, whatsapp: false, spreadsheet: true },
  { label: 'Vacinas e saude', app: true, whatsapp: false, spreadsheet: false },
  { label: 'Privacidade por parceria', app: true, whatsapp: false, spreadsheet: false },
]

function PhoneFrame({ className, children, glow = 'bg-cyan-400/[0.20]' }) {
  return (
    <div className={`relative ${className}`}>
      <div className={`absolute -inset-8 rounded-[2rem] blur-3xl ${glow}`} />
      <div className="relative mx-auto h-[560px] w-[286px] rounded-[2.4rem] border border-white/[0.15] bg-[#09111b] p-3 shadow-[0_35px_100px_rgba(0,0,0,0.45)]">
        <div className="absolute left-1/2 top-2 z-10 h-1.5 w-28 -translate-x-1/2 rounded-full bg-white/10" />
        <div className="h-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b1320]">
          {children}
        </div>
      </div>
    </div>
  )
}

function CalendarMockup() {
  return (
    <PhoneFrame glow="bg-cyan-400/[0.25]">
      <div className="flex h-full flex-col bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_42%),linear-gradient(180deg,#0f172a_0%,#08101a_100%)] p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-100/60">Agenda</p>
            <p className="font-display text-lg font-bold text-white">Hoje</p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-cyan-100">3 eventos</div>
        </div>
        <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">09:00</p>
              <p className="mt-1 font-medium text-white">Consulta pediatrica</p>
              <p className="text-xs text-slate-400">UBS Central</p>
            </div>
            <div className="rounded-full bg-cyan-400/[0.15] px-2 py-1 text-[10px] text-cyan-100">Saude</div>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-400">
          {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d) => <div key={d}>{d}</div>)}
          {Array.from({ length: 21 }).map((_, i) => (
            <div key={i} className={`flex h-9 items-center justify-center rounded-xl border ${[5, 12, 17].includes(i) ? 'border-cyan-300/[0.3] bg-cyan-400/[0.15] text-cyan-100' : 'border-white/5 bg-white/0 text-slate-500'}`}>
              {i + 1}
            </div>
          ))}
        </div>
        <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Proximo</p>
          <p className="mt-1 text-sm text-white">Retirada na escola as 16:30</p>
        </div>
      </div>
    </PhoneFrame>
  )
}

function ChatMockup() {
  return (
    <PhoneFrame className="translate-y-6 scale-[0.92]" glow="bg-sky-400/[0.25]">
      <div className="flex h-full flex-col bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_40%),linear-gradient(180deg,#0f172a_0%,#08101a_100%)] p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-sky-100/60">Chat</p>
            <p className="font-display text-lg font-bold text-white">Conversas</p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-sky-100">2 participantes</div>
        </div>
        <div className="space-y-3">
          <Bubble align="left" text="Pode confirmar a consulta de sexta?" time="08:12" tone="bg-white/[0.08] text-slate-100" />
          <Bubble align="right" text="Confirmado. Vou levar a caderneta." time="08:15" tone="bg-cyan-400/20 text-cyan-50" />
          <Bubble align="left" text="Perfeito. Vou atualizar o calendario." time="08:18" tone="bg-white/[0.08] text-slate-100" />
        </div>
        <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
          Mensagem registrada e vinculada a parceria segura.
        </div>
      </div>
    </PhoneFrame>
  )
}

function Bubble({ align, text, time, tone }) {
  return (
    <div className={`flex ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[78%] rounded-2xl px-3 py-2 ${tone}`}>
        <p className="text-sm leading-snug">{text}</p>
        <p className="mt-1 text-[10px] text-slate-400">{time}</p>
      </div>
    </div>
  )
}

function FinanceMockup() {
  return (
    <PhoneFrame className="-translate-y-4 scale-[0.96]" glow="bg-emerald-400/[0.25]">
      <div className="flex h-full flex-col bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.14),_transparent_38%),linear-gradient(180deg,#0f172a_0%,#08101a_100%)] p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-100/60">Financas</p>
            <p className="font-display text-lg font-bold text-white">Resumo mensal</p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-emerald-100">R$ 1.240</div>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Receitas</p>
            <p className="mt-2 text-2xl font-bold text-emerald-100">R$ 2.300</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Despesas</p>
            <p className="mt-2 text-2xl font-bold text-rose-100">R$ 1.060</p>
          </div>
        </div>
        <div className="space-y-2">
          {[
            ['Material escolar', 'R$ 180', 'school'],
            ['Consulta', 'R$ 120', 'health'],
            ['Uniforme', 'R$ 240', 'clothing'],
          ].map(([label, value, category]) => (
            <div key={label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <div>
                <p className="text-sm text-white">{label}</p>
                <p className="text-[11px] text-slate-400">{category}</p>
              </div>
              <p className="font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center gap-2">
            <BadgeDollarSign className="h-4 w-4 text-emerald-200" />
            <p className="text-sm text-slate-200">Comprovantes anexados e organizados.</p>
          </div>
        </div>
      </div>
    </PhoneFrame>
  )
}

function FeatureCard({ icon: Icon, title, desc, accent }) {
  return (
    <div className="group rounded-[1.6rem] border border-white/10 bg-white/[0.05] p-6 backdrop-blur transition-all hover:-translate-y-1 hover:border-white/20">
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${accent}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <h3 className="font-display text-xl font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{desc}</p>
    </div>
  )
}

function BooleanMark({ value }) {
  if (value) return <CheckCircle className="h-4 w-4 text-emerald-300" />
  return <XCircle className="h-4 w-4 text-slate-600" />
}

export default function BetaWelcome() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#060b12] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#060b12]/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <AppLogo markClassName="h-10 w-14" wordmarkClassName="text-lg text-white" />
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">Entrar</Button>
            </Link>
            <Link to="/auth?mode=register">
              <Button size="sm" className="bg-white text-slate-950 hover:bg-cyan-100">Teste gratis</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="hero-grain relative overflow-hidden py-16 lg:py-24">
        <div className="absolute inset-0 luxury-grid opacity-60" />
        <div className="absolute -top-40 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-cyan-400/[0.18] blur-3xl" />
        <div className="absolute left-[-12rem] top-28 h-96 w-96 rounded-full bg-emerald-300/10 blur-3xl" />
        <div className="absolute right-[-8rem] bottom-0 h-96 w-96 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-4 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.08] px-4 py-1.5 text-sm font-medium text-cyan-100 backdrop-blur">
              <Star className="h-3.5 w-3.5 fill-cyan-200 text-cyan-200" />
              Beta gratuito por tempo limitado
            </div>
            <h1 className="mt-6 font-display text-5xl font-bold leading-[0.92] tracking-tight sm:text-6xl lg:text-7xl">
              Menos conflito.
              <br />
              Mais clareza para
              <span className="bg-gradient-to-r from-cyan-200 via-white to-amber-100 bg-clip-text text-transparent"> cuidar dos filhos.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
              Uma plataforma privada para dois responsaveis organizarem calendario, chat, gastos, saude e escola em um unico lugar.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link to="/auth?mode=register">
                <Button size="xl" className="gap-2 bg-white text-slate-950 shadow-2xl shadow-cyan-500/20 hover:bg-cyan-100">
                  Criar conta gratis
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="xl" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
                  Ver acesso
                </Button>
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {proofPoints.map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3">
                  <CheckCircle className="h-4 w-4 text-cyan-200" />
                  <span className="text-sm text-slate-200">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {socialProof.map((item) => (
                <div key={item.label} className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
                  <p className="font-display text-3xl font-bold text-white">{item.value}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[760px]">
            <div className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />
            <div className="relative flex items-center justify-center">
              <CalendarMockup />
              <div className="absolute left-3 top-12 hidden lg:block">
                <ChatMockup />
              </div>
              <div className="absolute right-0 top-20 hidden lg:block">
                <FinanceMockup />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur md:grid-cols-3">
          {[
            ['Calendario', 'Eventos, visitas e lembretes', Calendar],
            ['Conversa', 'Mensagens com contexto e historico', MessageCircle],
            ['Controle', 'Financas, vacinas e documentos', Shield],
          ].map(([title, text, Icon]) => (
            <div key={title} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.08]">
                <Icon className="h-5 w-5 text-cyan-100" />
              </div>
              <div>
                <p className="font-medium text-white">{title}</p>
                <p className="text-sm text-slate-400">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-100/60">Como funciona</p>
            <h2 className="mt-3 font-display text-4xl font-bold text-white">Uma narrativa simples vende mais.</h2>
            <p className="mt-4 text-slate-400">
              A landing leva o visitante do problema para a solucao e depois para a prova visual. Sem excesso de texto.
            </p>
            <div className="mt-8 space-y-4">
              {steps.map((step) => (
                <div key={step.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="font-medium text-white">{step.title}</p>
                  <p className="mt-2 text-sm text-slate-400">{step.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04]">
            <div className="border-b border-white/10 p-6">
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-100/60">Comparacao</p>
              <h2 className="mt-3 font-display text-3xl font-bold text-white">Melhor do que improvisar em WhatsApp ou planilha.</h2>
            </div>
            <div className="grid grid-cols-[1.3fr_0.7fr_0.7fr_0.7fr] gap-px bg-white/10 text-sm">
              <div className="bg-[#09111b] px-4 py-3 font-medium text-white">Capacidade</div>
              <div className="bg-[#09111b] px-4 py-3 text-center font-medium text-white">2for1</div>
              <div className="bg-[#09111b] px-4 py-3 text-center font-medium text-white">WhatsApp</div>
              <div className="bg-[#09111b] px-4 py-3 text-center font-medium text-white">Planilha</div>
              {comparison.map((row) => (
                <Fragment key={row.label}>
                  <div key={`${row.label}-label`} className="bg-[#0b1320] px-4 py-3 text-slate-300">{row.label}</div>
                  <div className="bg-[#0b1320] px-4 py-3 text-center"><BooleanMark value={row.app} /></div>
                  <div className="bg-[#0b1320] px-4 py-3 text-center"><BooleanMark value={row.whatsapp} /></div>
                  <div className="bg-[#0b1320] px-4 py-3 text-center"><BooleanMark value={row.spreadsheet} /></div>
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-100/60">Por que converte</p>
            <h2 className="mt-3 font-display text-4xl font-bold text-white">O app deixa o valor visivel em segundos.</h2>
            <p className="mt-4 text-slate-400">
              Em vez de listar apenas features, mostramos a experiencia: a agenda, a conversa e o dinheiro em telas
              reais de celular. Isso reduz a friccao de entendimento e aumenta conversao.
            </p>
            <div className="mt-8 space-y-3">
              {useCases.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-cyan-200" />
                  <div>
                    <p className="font-medium text-white">{title}</p>
                    <p className="text-sm text-slate-400">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-400/10 to-transparent p-5">
              <div className="mb-3 flex items-center gap-2 text-cyan-100">
                <Users className="h-4 w-4" />
                <span className="text-xs uppercase tracking-[0.3em]">Para quem</span>
              </div>
              <p className="font-display text-2xl font-bold text-white">Pais separados que precisam cooperar sem atrito.</p>
              <p className="mt-3 text-sm text-slate-400">Organizacao, previsibilidade e privacidade em um fluxo simples.</p>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-emerald-400/10 to-transparent p-5">
              <div className="mb-3 flex items-center gap-2 text-emerald-100">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs uppercase tracking-[0.3em]">Beneficio</span>
              </div>
              <p className="font-display text-2xl font-bold text-white">Tudo organizado em um lugar, com foco no bem-estar das criancas.</p>
              <p className="mt-3 text-sm text-slate-400">A interface comunica valor sem precisar de texto tecnico demais.</p>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 md:col-span-2">
              <div className="mb-4 flex items-center gap-2 text-amber-100">
                <BadgeDollarSign className="h-4 w-4" />
                <span className="text-xs uppercase tracking-[0.3em]">Oferta beta</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="font-display text-4xl font-bold text-white">R$ 0</p>
                  <p className="mt-2 text-sm text-slate-400">Beta cortesia com limite de 2 filhos e anexos reduzidos.</p>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                  <Shield className="h-5 w-5 text-cyan-200" />
                  <p className="text-sm text-slate-300">Privacidade, RLS e storage privado por parceria.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-100/60">Detalhes</p>
          <h2 className="mt-3 font-display text-4xl font-bold text-white">Detalhes que fazem o produto parecer real</h2>
          <p className="mt-4 text-slate-400">A pagina agora mostra telas do app em mockups de celular, como a referencia comercial faz.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.03] py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
            <div className="max-w-2xl">
              <h2 className="font-display text-4xl font-bold text-white">Pronto para vender melhor.</h2>
              <p className="mt-3 text-slate-400">
                A landing agora mostra o produto em uso, com narrativa comercial, prova visual e uma hierarquia mais forte de conversao.
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/auth?mode=register">
                <Button size="xl" className="gap-2 bg-white text-slate-950 hover:bg-cyan-100">
                  Criar conta
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="xl" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
                  Entrar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-slate-500 sm:flex-row">
          <AppLogo markClassName="h-7 w-10" wordmarkClassName="text-sm text-white" />
          <p>(c) {new Date().getFullYear()} - Privado e seguro com Supabase</p>
        </div>
      </footer>
    </div>
  )
}
