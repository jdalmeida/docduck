import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import "./App.css";

import {
  Authenticated,
  Unauthenticated,
  AuthLoading,
} from 'convex/react'
import MainLayout from './components/MainLayout'
import { SignInButton } from '@clerk/clerk-react'
import { CoverImageModal } from "./components/modals/CoverImageModal";
import { Spinner } from "./components/Spinner";
import { FileText, Share2, CheckSquare, Zap, Users, Shield, Star, ArrowRight } from 'lucide-react';

function App() {
  return (
    <>
      <AuthLoading>
        <div className="bg-[#1f1f1f] flex items-center justify-center h-screen">
          <Spinner size="lg" />
        </div>
      </AuthLoading>
      <Unauthenticated>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#1f1f1f] via-[#2a2a2a] to-[#1f1f1f] text-white">
          <header className="py-6 px-4 md:px-8 backdrop-blur-sm bg-black/20 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src="/duck.png" alt="DocDuck Logo" className="w-12 h-12 drop-shadow-lg" />
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">DocDuck</h1>
              </div>
              <SignInButton mode="modal">
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
                  Entrar
                </button>
              </SignInButton>
            </div>
          </header>

          <main className="flex-grow flex flex-col items-center justify-center text-center px-4 py-16">
            <div className="max-w-4xl">
              <div className="mb-8">
                <span className="bg-blue-600/20 text-blue-400 px-4 py-2 rounded-full text-sm font-medium border border-blue-600/30">
                  ✨ Novo: IA integrada para organização automática
                </span>
              </div>
              <h2 className="text-6xl md:text-7xl font-black tracking-tight mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-tight">
                Transforme suas ideias em conhecimento
              </h2>
              <p className="text-xl md:text-2xl text-gray-300 mb-10 leading-relaxed max-w-3xl mx-auto">
                DocDuck é a plataforma que conecta suas notas, tarefas e conhecimento em um só lugar. 
                <span className="text-blue-400 font-semibold"> Organize. Visualize. Execute.</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <SignInButton mode="modal">
                  <button className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center gap-2">
                    Comece Gratuitamente
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </SignInButton>
                <button className="text-gray-300 hover:text-white font-semibold py-4 px-8 rounded-xl text-xl border border-gray-600 hover:border-gray-400 transition-all duration-300">
                  Ver Demonstração
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-4">💳 Sem cartão de crédito • ⚡ Configuração em 2 minutos</p>
            </div>
          </main>

          {/* Seção de Benefícios */}
          <section className="py-20 bg-black/20">
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-16">
                <h3 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Por que DocDuck?</h3>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">Mais que um app de notas. É o seu segundo cérebro digital.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="group p-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 hover:border-blue-500/50 transition-all duration-300 transform hover:scale-105">
                  <Zap className="w-14 h-14 text-yellow-400 mb-6 group-hover:scale-110 transition-transform" />
                  <h4 className="text-2xl font-bold mb-4">Velocidade Instantânea</h4>
                  <p className="text-gray-400 leading-relaxed">Acesse suas notas em millisegundos. Busca inteligente que encontra exatamente o que você precisa.</p>
                </div>
                <div className="group p-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 hover:border-blue-500/50 transition-all duration-300 transform hover:scale-105">
                  <Users className="w-14 h-14 text-green-400 mb-6 group-hover:scale-110 transition-transform" />
                  <h4 className="text-2xl font-bold mb-4">Colaboração Fluida</h4>
                  <p className="text-gray-400 leading-relaxed">Compartilhe conhecimento com sua equipe. Edição em tempo real e sincronização automática.</p>
                </div>
                <div className="group p-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 hover:border-blue-500/50 transition-all duration-300 transform hover:scale-105">
                  <Shield className="w-14 h-14 text-blue-400 mb-6 group-hover:scale-110 transition-transform" />
                  <h4 className="text-2xl font-bold mb-4">Segurança Total</h4>
                  <p className="text-gray-400 leading-relaxed">Seus dados protegidos com criptografia de ponta. Backup automático e histórico completo.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Seção de Funcionalidades */}
          <section className="py-20 bg-gradient-to-r from-gray-900/50 to-gray-800/50">
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-16">
                <h3 className="text-5xl font-bold mb-4">Funcionalidades Poderosas</h3>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">Tudo que você precisa para organizar sua vida digital</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="group p-8 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl border border-blue-500/30 hover:border-blue-400 transition-all duration-300 transform hover:scale-105">
                  <FileText className="w-16 h-16 text-blue-400 mb-6 group-hover:scale-110 transition-transform" />
                  <h4 className="text-2xl font-bold mb-4">Editor de Notas Avançado</h4>
                  <p className="text-gray-300 leading-relaxed">Editor rico com blocos de conteúdo, formatação inteligente e suporte a markdown. Escreva como pensa.</p>
                  <ul className="mt-4 space-y-2 text-sm text-gray-400">
                    <li>• Blocos de código com syntax highlighting</li>
                    <li>• Tabelas e listas interativas</li>
                    <li>• Incorporação de mídia</li>
                  </ul>
                </div>
                <div className="group p-8 bg-gradient-to-br from-green-900/20 to-blue-900/20 rounded-2xl border border-green-500/30 hover:border-green-400 transition-all duration-300 transform hover:scale-105">
                  <Share2 className="w-16 h-16 text-green-400 mb-6 group-hover:scale-110 transition-transform" />
                  <h4 className="text-2xl font-bold mb-4">Grafo de Conhecimento</h4>
                  <p className="text-gray-300 leading-relaxed">Visualize conexões entre suas ideias. Descubra padrões e insights que você não sabia que existiam.</p>
                  <ul className="mt-4 space-y-2 text-sm text-gray-400">
                    <li>• Mapa interativo do conhecimento</li>
                    <li>• Links automáticos entre notas</li>
                    <li>• Filtros por categorias e tags</li>
                  </ul>
                </div>
                <div className="group p-8 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl border border-purple-500/30 hover:border-purple-400 transition-all duration-300 transform hover:scale-105">
                  <CheckSquare className="w-16 h-16 text-purple-400 mb-6 group-hover:scale-110 transition-transform" />
                  <h4 className="text-2xl font-bold mb-4">Gerenciador de Tarefas</h4>
                  <p className="text-gray-300 leading-relaxed">Transforme notas em ações. Gerencie projetos, defina prioridades e acompanhe seu progresso.</p>
                  <ul className="mt-4 space-y-2 text-sm text-gray-400">
                    <li>• Kanban boards personalizáveis</li>
                    <li>• Lembretes e deadlines</li>
                    <li>• Relatórios de produtividade</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Seção de Depoimentos */}
          <section className="py-20 bg-black/30">
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-16">
                <h3 className="text-5xl font-bold mb-4">O que nossos usuários dizem</h3>
                <div className="flex justify-center items-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                  <span className="text-xl font-semibold ml-2">4.9/5</span>
                </div>
                <p className="text-gray-400">Mais de 10.000 profissionais confiam no DocDuck</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="p-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-6 italic">"DocDuck revolucionou minha forma de trabalhar. Nunca mais perdi uma ideia importante!"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">M</div>
                    <div>
                      <p className="font-semibold">Maria Silva</p>
                      <p className="text-sm text-gray-400">Product Designer</p>
                    </div>
                  </div>
                </div>
                <div className="p-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-6 italic">"O grafo de conhecimento me ajudou a conectar ideias que eu nunca imaginaria. Simplesmente incrível!"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">J</div>
                    <div>
                      <p className="font-semibold">João Santos</p>
                      <p className="text-sm text-gray-400">Pesquisador</p>
                    </div>
                  </div>
                </div>
                <div className="p-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-6 italic">"Interface limpa, funcionalidades poderosas. DocDuck é tudo que eu precisava em um app de produtividade."</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">A</div>
                    <div>
                      <p className="font-semibold">Ana Costa</p>
                      <p className="text-sm text-gray-400">Empreendedora</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Seção de Preços */}
          <section className="py-20 bg-gradient-to-br from-gray-900/50 to-black/50">
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-16">
                <h3 className="text-5xl font-bold mb-4">Planos para todos os perfis</h3>
                <p className="text-xl text-gray-400">Comece grátis e evolua conforme cresce</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="p-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700">
                  <h4 className="text-2xl font-bold mb-2">Gratuito</h4>
                  <p className="text-4xl font-bold mb-4">R$ 0<span className="text-lg text-gray-400">/mês</span></p>
                  <p className="text-gray-400 mb-6">Perfeito para começar</p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-2"><CheckSquare className="w-5 h-5 text-green-400" /> Até 100 notas</li>
                    <li className="flex items-center gap-2"><CheckSquare className="w-5 h-5 text-green-400" /> Editor básico</li>
                    <li className="flex items-center gap-2"><CheckSquare className="w-5 h-5 text-green-400" /> Sincronização em nuvem</li>
                    <li className="flex items-center gap-2"><CheckSquare className="w-5 h-5 text-green-400" /> Suporte por email</li>
                  </ul>
                  <SignInButton mode="modal">
                    <button className="w-full py-3 px-6 border border-gray-600 hover:border-gray-400 rounded-lg transition-colors">
                      Começar Grátis
                    </button>
                  </SignInButton>
                </div>
                <div className="p-8 bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl border-2 border-blue-500 relative">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Mais Popular
                  </div>
                  <h4 className="text-2xl font-bold mb-2">Pro</h4>
                  <p className="text-4xl font-bold mb-4">R$ 29<span className="text-lg text-gray-400">/mês</span></p>
                  <p className="text-gray-400 mb-6">Para profissionais produtivos</p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-2"><CheckSquare className="w-5 h-5 text-green-400" /> Notas ilimitadas</li>
                    <li className="flex items-center gap-2"><CheckSquare className="w-5 h-5 text-green-400" /> Grafo de conhecimento</li>
                    <li className="flex items-center gap-2"><CheckSquare className="w-5 h-5 text-green-400" /> Gerenciador de tarefas</li>
                    <li className="flex items-center gap-2"><CheckSquare className="w-5 h-5 text-green-400" /> IA integrada</li>
                    <li className="flex items-center gap-2"><CheckSquare className="w-5 h-5 text-green-400" /> Suporte prioritário</li>
                  </ul>
                  <SignInButton mode="modal">
                    <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300">
                      Começar Teste Grátis
                    </button>
                  </SignInButton>
                </div>
                <div className="p-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700">
                  <h4 className="text-2xl font-bold mb-2">Equipes</h4>
                  <p className="text-4xl font-bold mb-4">R$ 99<span className="text-lg text-gray-400">/mês</span></p>
                  <p className="text-gray-400 mb-6">Para equipes colaborativas</p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-2"><CheckSquare className="w-5 h-5 text-green-400" /> Tudo do Pro</li>
                    <li className="flex items-center gap-2"><CheckSquare className="w-5 h-5 text-green-400" /> Até 10 usuários</li>
                    <li className="flex items-center gap-2"><CheckSquare className="w-5 h-5 text-green-400" /> Colaboração em tempo real</li>
                    <li className="flex items-center gap-2"><CheckSquare className="w-5 h-5 text-green-400" /> Admin dashboard</li>
                    <li className="flex items-center gap-2"><CheckSquare className="w-5 h-5 text-green-400" /> Suporte dedicado</li>
                  </ul>
                  <SignInButton mode="modal">
                    <button className="w-full py-3 px-6 border border-gray-600 hover:border-gray-400 rounded-lg transition-colors">
                      Contatar Vendas
                    </button>
                  </SignInButton>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action Final */}
          <section className="py-20 bg-gradient-to-r from-blue-900/30 to-purple-900/30">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <h3 className="text-5xl font-bold mb-6">Pronto para transformar sua produtividade?</h3>
              <p className="text-xl text-gray-300 mb-10">Junte-se a milhares de profissionais que já descobriram o poder do DocDuck</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <SignInButton mode="modal">
                  <button className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center gap-2">
                    Comece Seu Teste Grátis
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </SignInButton>
              </div>
              <p className="text-sm text-gray-500 mt-6">14 dias grátis • Cancele quando quiser • Suporte 24/7</p>
            </div>
          </section>

          <footer className="bg-black/50 text-center py-8 text-gray-400 border-t border-gray-800">
            <div className="max-w-6xl mx-auto px-4">
              <div className="flex items-center justify-center gap-4 mb-4">
                <img src="/duck.png" alt="DocDuck Logo" className="w-8 h-8" />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">DocDuck</span>
              </div>
              <p>&copy; {new Date().getFullYear()} DocDuck. Todos os direitos reservados. Feito com 💙 para pessoas produtivas.</p>
            </div>
          </footer>
        </div>
      </Unauthenticated>
      <Authenticated>
        <CoverImageModal />
        <div className="h-full flex flex-col">
          <MainLayout />
        </div>
      </Authenticated>
    </>
  )
}

export default App
