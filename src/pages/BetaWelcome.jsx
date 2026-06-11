import { Link } from 'react-router-dom'
import {
  Calendar, DollarSign, MessageCircle, Gift,
  Syringe, FileText, Shield, Star, ArrowRight, CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import AppLogo from '@/components/shared/AppLogo'

const features = [
  { icon: Calendar, title: 'Agenda compartilhada', desc: 'Eventos, consultas, custodia e atividades em uma linha do tempo clara.', color: 'bg-cyan-300/15 text-cyan-100' },
  { icon: DollarSign, title: 'Financas sem atrito', desc: 'Registre custos, receitas e comprovantes com visao por periodo.', color: 'bg-emerald-300/15 text-emerald-100' },
  { icon: MessageCircle, title: 'Chat privado', desc: 'Comunicacao direta entre os responsaveis, centrada nos filhos.', color: 'bg-sky-300/15 text-sky-100' },
  { icon: Syringe, title: 'Vacinas em dia', desc: 'Caderneta vacinal com historico, doses aplicadas e pendencias.', color: 'bg-amber-300/15 text-amber-100' },
  { icon: Gift, title: 'Presentes organizados', desc: 'Sugestoes, aprovacao e acompanhamento para datas especiais.', color: 'bg-rose-300/15 text-rose-100' },
  { icon: FileText, title: 'Dados sensiveis seguros', desc: 'Saude, escola e documentos com acesso restrito a parceria.', color: 'bg-teal-300/15 text-teal-100' },
]

const plans = [
  {
    name: 'Beta cortesia',
    price: 'R$ 0',
    period: '/mes',
    desc: 'Sem cobranca agora',
    features: ['2 responsaveis', '2 criancas', 'Fotos em thumbnail', 'Anexos desativados no beta', 'Calendario, chat e financas'],
    cta: 'Comecar gratis',
    highlight: false,
  },
  {
    name: 'Familia compartilhada',
    price: 'R$ 30',
    period: '/mes',
    desc: 'Futuro plano pago',
    features: ['R$ 15 por responsavel', 'Tudo compartilhado pelo par', 'Pagamentos via Mercado Pago', 'Mais armazenamento controlado', 'Sem cobranca durante o beta'],
    cta: 'Em breve',
    highlight: true,
  },
]

function ProductPreview() {
  return (
    <div className="relative mx-auto mt-16 h-72 max-w-4xl">
      <div className="orbital-ring absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full" />
      <div className="orbital-ring absolute left-1/2 top-1/2 h-48 w-[34rem] -translate-x-1/2 -translate-y-1/2 rotate-12 rounded-full" />
      <div className="absolute inset-x-4 top-8 rounded-[2rem] border border-white/10 bg-white/[0.08] p-5 shadow-2xl shadow-black/40 backdrop-blur-xl sm:left-24 sm:right-24">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-100/70">Family OS</p>
            <p className="font-display text-2xl font-bold">Painel coparental</p>
          </div>
          <div className="rounded-full border border-emerald-200/20 bg-emerald-200/10 px-3 py-1 text-xs text-emerald-100">
            Privado
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-left">
          {[
            ['Agenda', '12', 'eventos'],
            ['Saude', '98%', 'em dia'],
            ['Custos', 'R$', 'controlado'],
          ].map(([label, value, caption]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-100/70">{label}</p>
              <p className="mt-7 font-display text-3xl font-bold">{value}</p>
              <p className="text-xs text-slate-400">{caption}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function BetaWelcome() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#070b12] text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070b12]/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <AppLogo markClassName="h-10 w-14" wordmarkClassName="text-lg text-white" />
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">Entrar</Button>
            </Link>
            <Link to="/auth?mode=register">
              <Button size="sm" className="bg-white text-slate-950 hover:bg-cyan-100">Comecar gratis</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="hero-grain relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 luxury-grid" />
        <div className="absolute -top-40 left-1/2 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute right-[-10rem] top-28 h-80 w-80 rounded-full bg-emerald-300/10 blur-3xl" />
        <div className="absolute left-[-12rem] bottom-0 h-96 w-96 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-medium text-cyan-100 backdrop-blur">
              <Star className="h-3.5 w-3.5 fill-cyan-200 text-cyan-200" />
              Beta gratuito por tempo limitado
            </div>
            <h1 className="mb-6 font-display text-6xl font-bold leading-[0.9] tracking-tight sm:text-7xl lg:text-8xl">
              Coparentalidade<br />
              <span className="bg-gradient-to-r from-cyan-200 via-white to-amber-100 bg-clip-text text-transparent">sem conflitos</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl">
              Uma plataforma privada para dois responsaveis gerenciarem rotina, saude, custos e comunicacao dos filhos.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/auth?mode=register">
                <Button size="xl" className="gap-2 bg-white text-slate-950 shadow-2xl shadow-cyan-500/20 hover:bg-cyan-100">
                  Criar conta gratuita
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="xl" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
                  Ja tenho conta
                </Button>
              </Link>
            </div>
          </div>

          <ProductPreview />
        </div>
      </section>

      <section className="mx-auto mb-12 max-w-3xl px-4">
        <div className="flex gap-4 rounded-3xl border border-amber-200/20 bg-amber-200/10 p-5 backdrop-blur">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-200/15">
            <Shield className="h-5 w-5 text-amber-200" />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-100">Versao beta</p>
            <p className="mt-1 text-sm text-amber-50/70">
              Ainda nao ha cobranca. Para proteger custos, o beta permite ate 2 filhos e somente fotos em thumbnail.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="mb-3 font-display text-4xl font-bold">Tudo que voce precisa</h2>
          <p className="text-slate-400">Ferramentas para uma coparentalidade mais clara, privada e objetiva.</p>
        </div>
        <div className="stagger-children grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="group rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur transition-all hover:-translate-y-1 hover:border-cyan-200/30 hover:bg-white/[0.09]">
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${feature.color}`}>
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 font-display font-semibold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative border-y border-white/10 bg-white/[0.03] py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-3 font-display text-4xl font-bold">Planos simples</h2>
            <p className="text-slate-400">Durante o beta, nenhum pagamento e cobrado.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-3xl border p-8 ${plan.highlight ? 'border-cyan-200/20 bg-cyan-300/10 text-white' : 'border-white/10 bg-white/[0.06]'}`}
              >
                <div className="mb-6">
                  <p className={`mb-1 text-sm font-medium ${plan.highlight ? 'text-cyan-100' : 'text-slate-400'}`}>{plan.desc}</p>
                  <p className="font-display text-4xl font-bold">
                    {plan.price}
                    <span className="text-lg font-normal text-slate-400">{plan.period}</span>
                  </p>
                  <p className="mt-1 font-display text-xl font-semibold">{plan.name}</p>
                </div>
                <ul className="mb-8 space-y-2">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 shrink-0 text-cyan-200" />
                      <span className="text-slate-300">{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link to={plan.highlight ? '#' : '/auth?mode=register'}>
                  <Button
                    className="w-full"
                    variant={plan.highlight ? 'secondary' : 'default'}
                    disabled={plan.highlight}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-slate-500 sm:flex-row">
          <AppLogo markClassName="h-7 w-10" wordmarkClassName="text-sm text-white" />
          <p>(c) {new Date().getFullYear()} - Privado e seguro com Supabase</p>
        </div>
      </footer>
    </div>
  )
}
