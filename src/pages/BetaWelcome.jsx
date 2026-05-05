import { Link } from 'react-router-dom'
import {
  Calendar, DollarSign, MessageCircle, Gift,
  Syringe, FileText, Shield, Star, ArrowRight, CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import AppLogo from '@/components/shared/AppLogo'

const features = [
  { icon: Calendar, title: 'Calendário Compartilhado', desc: 'Eventos, consultas, custódia e atividades em um único lugar.', color: 'bg-blue-50 text-blue-600' },
  { icon: DollarSign, title: 'Controle de Finanças', desc: 'Registre despesas e visualize relatórios por categoria.', color: 'bg-green-50 text-green-600' },
  { icon: MessageCircle, title: 'Chat Privado', desc: 'Comunicação direta com o co-responsável, centrada nos filhos.', color: 'bg-purple-50 text-purple-600' },
  { icon: Syringe, title: 'Caderneta de Vacinas', desc: 'Calendário vacinal completo com alertas de doses pendentes.', color: 'bg-orange-50 text-orange-600' },
  { icon: Gift, title: 'Lista de Presentes', desc: 'Sugira, aprove e acompanhe presentes para datas especiais.', color: 'bg-pink-50 text-pink-600' },
  { icon: FileText, title: 'Dados Organizados', desc: 'Centralize informações importantes dos filhos com acesso restrito ao par.', color: 'bg-teal-50 text-teal-600' },
]

const plans = [
  {
    name: 'Beta cortesia',
    price: 'R$ 0',
    period: '/mês',
    desc: 'Sem cobrança agora',
    features: ['2 responsáveis', '2 crianças', 'Fotos em thumbnail', 'Anexos desativados no beta', 'Calendário, chat e finanças'],
    cta: 'Começar grátis',
    highlight: false,
  },
  {
    name: 'Família Compartilhada',
    price: 'R$ 30',
    period: '/mês',
    desc: 'Futuro plano pago',
    features: ['R$ 15 por responsável', 'Tudo compartilhado pelo par', 'Pagamentos via Mercado Pago', 'Mais armazenamento controlado', 'Sem cobrança durante o beta'],
    cta: 'Em breve',
    highlight: true,
  },
]

export default function BetaWelcome() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <AppLogo markClassName="h-10 w-14" wordmarkClassName="text-lg" />
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link to="/auth?mode=register">
              <Button size="sm">Começar grátis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 mesh-bg" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-sm text-primary-700 font-medium mb-6">
            <Star className="h-3.5 w-3.5 fill-primary-500 text-primary-500" />
            Beta · 100% gratuito por tempo limitado
          </div>
          <h1 className="font-display text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
            Coparentalidade<br />
            <span className="text-primary-600">sem conflitos</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Uma plataforma privada e segura para dois responsáveis gerenciarem a criação dos filhos juntos — mesmo separados.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth?mode=register">
              <Button size="xl" className="gap-2 shadow-lg shadow-primary-200">
                Criar conta gratuita
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="xl" variant="outline">
                Já tenho conta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Beta notice */}
      <section className="max-w-3xl mx-auto px-4 mb-12">
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5 flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center shrink-0">
            <Shield className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <p className="font-medium text-yellow-900 text-sm">Versão Beta</p>
            <p className="text-yellow-700 text-sm mt-1">
              Estamos em fase de testes e ainda nao ha cobranca. Para proteger os custos do Supabase, o beta cortesia permite ate 2 filhos e somente fotos em thumbnail.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold text-slate-900 mb-3">Tudo que você precisa</h2>
          <p className="text-slate-600">Ferramentas pensadas para a coparentalidade responsável</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-slate-100 bg-white p-6 hover:shadow-md transition-shadow">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display font-semibold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Plans */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-slate-900 mb-3">Planos simples</h2>
            <p className="text-slate-600">Durante o beta, nenhum pagamento e cobrado</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-8 ${plan.highlight
                  ? 'border-primary-200 bg-primary-600 text-white'
                  : 'border-slate-200 bg-white'
                }`}
              >
                <div className="mb-6">
                  <p className={`text-sm font-medium mb-1 ${plan.highlight ? 'text-primary-200' : 'text-muted-foreground'}`}>
                    {plan.desc}
                  </p>
                  <p className={`font-display text-4xl font-bold ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>
                    {plan.price}
                    <span className={`text-lg font-normal ${plan.highlight ? 'text-primary-200' : 'text-muted-foreground'}`}>
                      {plan.period}
                    </span>
                  </p>
                  <p className={`font-display text-xl font-semibold mt-1 ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>
                    {plan.name}
                  </p>
                </div>
                <ul className="space-y-2 mb-8">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`h-4 w-4 shrink-0 ${plan.highlight ? 'text-primary-200' : 'text-green-500'}`} />
                      <span className={plan.highlight ? 'text-primary-100' : 'text-slate-700'}>{feat}</span>
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

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <AppLogo markClassName="h-7 w-10" wordmarkClassName="text-sm" />
          </div>
          <p>© {new Date().getFullYear()} · Privado e seguro com Supabase</p>
        </div>
      </footer>
    </div>
  )
}
