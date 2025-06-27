import { useAction, useMutation, useQuery } from "convex/react";
import { useState, useEffect, useMemo } from "react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { Spinner } from "./Spinner";
import { useCreateBlockNote } from "@blocknote/react";
import { Button } from "./ui/button";
import { BookText, AlertTriangle, Settings, Filter, X, Calendar, Star, ExternalLink, Bookmark, Search, SlidersHorizontal, ChevronDown, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./KnowledgeRepository.css";

const SkeletonCard = () => (
  <div className="p-6 bg-gradient-to-r from-neutral-700 to-neutral-600 rounded-xl flex justify-between items-center animate-pulse">
    <div className="w-3/4">
      <div className="h-6 bg-neutral-600 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-neutral-600 rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-neutral-600 rounded w-2/3"></div>
    </div>
    <div className="h-12 w-32 bg-neutral-600 rounded-lg"></div>
  </div>
);

const getCategoryInfo = (category: string) => {
  const categoryMap: Record<string, { icon: string; description: string }> = {
    "Tecnologia": { icon: "💻", description: "Notícias sobre inovação e tech" },
    "Programação": { icon: "⚡", description: "Desenvolvimento e coding" },
    "Marketing": { icon: "📈", description: "Estratégias e growth" },
    "Produtividade": { icon: "🚀", description: "Ferramentas e métodos" },
    "Música": { icon: "🎵", description: "Descobertas musicais" },
    "Negócios": { icon: "💼", description: "Empreendedorismo e business" },
    "Design": { icon: "🎨", description: "UI/UX e design visual" },
    "Estilo de Vida": { icon: "💡", description: "Dicas e lifestyle" },
    "Ciência": { icon: "🔬", description: "Pesquisas e descobertas" },
    "Fotografia": { icon: "📸", description: "Arte e técnicas" },
    "Finanças": { icon: "💰", description: "Investimentos e economia" },
    "Saúde": { icon: "💪", description: "Fitness e bem-estar" }
  };
  
  return categoryMap[category] || { icon: "📰", description: "Conteúdo geral" };
};

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: Doc<"user_preferences"> | null | undefined;
  availableCategories: string[];
  availableSources: string[];
  onSave: (selectedCategories: string[], selectedSources: string[]) => void;
}

const PreferencesModal = ({ 
  isOpen, 
  onClose, 
  preferences, 
  availableCategories, 
  availableSources, 
  onSave 
}: PreferencesModalProps) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    preferences?.selectedCategories || []
  );
  const [selectedSources, setSelectedSources] = useState<string[]>(
    preferences?.selectedSources || []
  );

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "Hacker News": return "🔶";
      case "Reddit Tech": return "🟠";
      case "Dev.to": return "💎";
      case "Reddit Marketing": return "📈";
      case "Reddit Produtividade": return "⚡";
      case "Reddit Música": return "🎵";
      case "Reddit Negócios": return "💼";
      case "Reddit Design": return "🎨";
      case "Reddit Motivação": return "💪";
      case "Reddit Dicas": return "💡";
      case "Reddit Ciência": return "🔬";
      case "Reddit Fotografia": return "📸";
      case "Reddit Finanças": return "💰";
      case "Reddit Fitness": return "🏋️‍♂️";
      default: return "📰";
    }
  };

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(selectedCategories, selectedSources);
    onClose();
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleSource = (source: string) => {
    setSelectedSources(prev => 
      prev.includes(source) 
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-neutral-800 p-6 rounded-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Preferências</h2>
            <p className="text-sm text-neutral-400 mt-1">
              Personalize sua experiência de aprendizado
            </p>
          </div>
          <Button onClick={onClose} variant="ghost" size="sm">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">{availableCategories.length}</div>
            <div className="text-xs text-blue-300">Categorias disponíveis</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">{availableSources.length}</div>
            <div className="text-xs text-green-300">Fontes ativas</div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-white">Categorias de Interesse</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedCategories(availableCategories)}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Selecionar todas
                </button>
                <span className="text-neutral-600">•</span>
                <button
                  onClick={() => setSelectedCategories([])}
                  className="text-xs text-neutral-400 hover:text-neutral-300 transition-colors"
                >
                  Limpar
                </button>
              </div>
            </div>
            <p className="text-sm text-neutral-400 mb-4">
              Selecione as categorias que mais te interessam para personalizar sua experiência
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableCategories.map(category => {
                const categoryInfo = getCategoryInfo(category);
                return (
                  <label 
                    key={category} 
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all border ${
                      selectedCategories.includes(category)
                        ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
                        : "bg-neutral-700/50 border-neutral-600/50 hover:border-neutral-500 text-neutral-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                      className="hidden"
                    />
                    <span className="text-lg">{categoryInfo.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium">{category}</div>
                      <div className="text-xs opacity-70">{categoryInfo.description}</div>
                    </div>
                    {selectedCategories.includes(category) && (
                      <Check className="h-4 w-4 text-blue-400" />
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-white">Fontes de Notícias</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedSources(availableSources)}
                  className="text-xs text-green-400 hover:text-green-300 transition-colors"
                >
                  Selecionar todas
                </button>
                <span className="text-neutral-600">•</span>
                <button
                  onClick={() => setSelectedSources([])}
                  className="text-xs text-neutral-400 hover:text-neutral-300 transition-colors"
                >
                  Limpar
                </button>
              </div>
            </div>
            <p className="text-sm text-neutral-400 mb-4">
              Escolha suas fontes favoritas para receber conteúdo personalizado
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableSources.map(source => (
                <label 
                  key={source} 
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all border ${
                    selectedSources.includes(source)
                      ? "bg-green-500/20 border-green-500/50 text-green-300"
                      : "bg-neutral-700/50 border-neutral-600/50 hover:border-neutral-500 text-neutral-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedSources.includes(source)}
                    onChange={() => toggleSource(source)}
                    className="hidden"
                  />
                  <span className="text-lg">{getSourceIcon(source)}</span>
                  <div className="flex-1">
                    <div className="font-medium">{source}</div>
                  </div>
                  {selectedSources.includes(source) && (
                    <Check className="h-4 w-4 text-green-400" />
                  )}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-neutral-400">
            {selectedCategories.length > 0 || selectedSources.length > 0 ? (
              <span>
                {selectedCategories.length} {selectedCategories.length === 1 ? 'categoria' : 'categorias'} • {' '}
                {selectedSources.length} {selectedSources.length === 1 ? 'fonte' : 'fontes'} selecionadas
              </span>
            ) : (
              <span>Nenhuma preferência selecionada</span>
            )}
          </div>
          <div className="flex space-x-3">
            <Button onClick={onClose} variant="outline">
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={selectedCategories.length === 0 && selectedSources.length === 0}
            >
              Salvar Preferências
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

type SortOption = "newest" | "oldest" | "score" | "title";

export const KnowledgeRepository = ({
  onSelectDocument,
}: {
  onSelectDocument: (id: Id<"documents">) => void;
}) => {
  const { user } = useAuth();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [minScore, setMinScore] = useState<number>(0);
  const [dateFilter, setDateFilter] = useState<string>("all"); // all, today, week, month
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const allArticles = useQuery(api.knowledge.get, {
    limit: 200
  });

  // Client-side filtering and sorting
  const articles = useMemo(() => {
    if (!allArticles) return undefined;

    let filtered = allArticles;

    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(article => 
        article.category && selectedCategories.includes(article.category)
      );
    }

    // Filter by sources
    if (selectedSources.length > 0) {
      filtered = filtered.filter(article => 
        selectedSources.includes(article.source)
      );
    }

    // Filter by search text
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchLower) ||
        (article.description && article.description.toLowerCase().includes(searchLower))
      );
    }

    // Filter by score
    if (minScore > 0) {
      filtered = filtered.filter(article => 
        (article.score || 0) >= minScore
      );
    }

    // Filter by date
    if (dateFilter !== "all") {
      const now = Date.now();
      const cutoff = (() => {
        switch (dateFilter) {
          case "today": return now - 24 * 60 * 60 * 1000;
          case "week": return now - 7 * 24 * 60 * 60 * 1000;
          case "month": return now - 30 * 24 * 60 * 60 * 1000;
          default: return 0;
        }
      })();
      
      filtered = filtered.filter(article => 
        article.publishedAt && article.publishedAt >= cutoff
      );
    }

    // Sort articles
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (b.publishedAt || b._creationTime) - (a.publishedAt || a._creationTime);
        case "oldest":
          return (a.publishedAt || a._creationTime) - (b.publishedAt || b._creationTime);
        case "score":
          return (b.score || 0) - (a.score || 0);
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [allArticles, selectedCategories, selectedSources, searchText, minScore, dateFilter, sortBy]);
  
  const preferences = useQuery(
    api.knowledge.getUserPreferences, 
    user ? { userId: user._id } : "skip"
  );
  
  const dbCategories = useQuery(api.knowledge.getAvailableCategories) ?? [];
  const dbSources = useQuery(api.knowledge.getAvailableSources) ?? [];

  // Lista predefinida de todas as categorias disponíveis
  const predefinedCategories = [
    "Tecnologia",
    "Programação", 
    "Marketing",
    "Produtividade",
    "Música",
    "Negócios",
    "Design",
    "Estilo de Vida",
    "Ciência",
    "Fotografia",
    "Finanças",
    "Saúde"
  ];

  // Combinar categorias predefinidas com as do banco, removendo duplicatas
  const availableCategories = [...new Set([...predefinedCategories, ...dbCategories])];
  const availableSources = dbSources;
  
  const summarize = useAction(api.summarizer.summarizeArticle);
  const createDoc = useMutation(api.documents.createWithContent);
  const updatePreferences = useMutation(api.knowledge.updateUserPreferences);

  // Temporary editor for Markdown to JSON conversion
  const editor = useCreateBlockNote();

  // Apply user preferences on load
  useEffect(() => {
    if (preferences && preferences.selectedCategories.length > 0) {
      setSelectedCategories(preferences.selectedCategories);
    }
    if (preferences && preferences.selectedSources.length > 0) {
      setSelectedSources(preferences.selectedSources);
    }
  }, [preferences]);

  const handleSummarize = async (article: Doc<"knowledge_articles">) => {
    if (!user) return;
    setSummarizingId(article._id);
    setError(null);
    try {
      const markdown = await summarize({
        url: article.url,
      });

      if (markdown && editor) {
        const blocks = await editor.tryParseMarkdownToBlocks(markdown);
        const newDocumentId = await createDoc({
          title: `Resumo: ${article.title}`,
          content: JSON.stringify(blocks),
          userId: user._id,
        });
        onSelectDocument(newDocumentId);
      } else {
        throw new Error("Resumo retornou conteúdo vazio.");
      }
    } catch (error) {
      console.error("Falha ao resumir e criar documento", error);
      setError("Falha ao resumir o artigo. Tente novamente mais tarde.");
    } finally {
      setSummarizingId(null);
    }
  };

  const handleSavePreferences = async (categories: string[], sources: string[]) => {
    if (!user) return;
    await updatePreferences({
      userId: user._id,
      selectedCategories: categories,
      selectedSources: sources,
    });
    setSelectedCategories(categories);
    setSelectedSources(sources);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "Hacker News": return "🔶";
      case "Reddit Tech": return "🟠";
      case "Dev.to": return "💎";
      case "Reddit Marketing": return "📈";
      case "Reddit Produtividade": return "⚡";
      case "Reddit Música": return "🎵";
      case "Reddit Negócios": return "💼";
      case "Reddit Design": return "🎨";
      case "Reddit Motivação": return "💪";
      case "Reddit Dicas": return "💡";
      case "Reddit Ciência": return "🔬";
      case "Reddit Fotografia": return "📸";
      case "Reddit Finanças": return "💰";
      case "Reddit Fitness": return "🏋️‍♂️";
      default: return "📰";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Tecnologia": return "bg-blue-500/20 text-blue-300 border-blue-500/50";
      case "Programação": return "bg-green-500/20 text-green-300 border-green-500/50";
      case "Marketing": return "bg-pink-500/20 text-pink-300 border-pink-500/50";
      case "Produtividade": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/50";
      case "Música": return "bg-purple-500/20 text-purple-300 border-purple-500/50";
      case "Negócios": return "bg-orange-500/20 text-orange-300 border-orange-500/50";
      case "Design": return "bg-indigo-500/20 text-indigo-300 border-indigo-500/50";
      case "Estilo de Vida": return "bg-teal-500/20 text-teal-300 border-teal-500/50";
      case "Ciência": return "bg-cyan-500/20 text-cyan-300 border-cyan-500/50";
      case "Fotografia": return "bg-rose-500/20 text-rose-300 border-rose-500/50";
      case "Finanças": return "bg-emerald-500/20 text-emerald-300 border-emerald-500/50";
      case "Saúde": return "bg-red-500/20 text-red-300 border-red-500/50";
      default: return "bg-neutral-500/20 text-neutral-300 border-neutral-500/50";
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-neutral-900 to-neutral-800 text-white">
      {/* Header */}
      <div className="p-6 border-b border-neutral-700">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Knowledge Repository
            </h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-neutral-400">
              <span className="flex items-center gap-1">
                <Filter className="h-3 w-3" />
                {availableCategories.length} categorias
              </span>
              <span className="flex items-center gap-1">
                <BookText className="h-3 w-3" />
                {availableSources.length} fontes
              </span>
              {articles && (
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {articles.length} artigos
                </span>
              )}
            </div>
          </div>
          <Button onClick={() => setShowPreferences(true)} variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Preferências
          </Button>
        </div>

        {/* Search and Sort */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center space-x-2 flex-1 min-w-[200px]">
            <Search className="h-4 w-4 text-neutral-400" />
                         <input
               type="text"
               placeholder="Buscar artigos..."
               value={searchText}
               onChange={(e) => setSearchText(e.target.value)}
               className="search-input bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-sm flex-1 placeholder-neutral-400"
             />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-neutral-400">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-sm"
            >
              <option value="newest">Mais recentes</option>
              <option value="oldest">Mais antigos</option>
              <option value="score">Mais populares</option>
              <option value="title">Alfabética</option>
            </select>
          </div>

          <Button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            variant="outline"
            size="sm"
            className={showAdvancedFilters ? "bg-blue-500/20" : ""}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filtros
            <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showAdvancedFilters ? "rotate-180" : ""}`} />
          </Button>
        </div>

        {/* Advanced Filters */}
                 {showAdvancedFilters && (
           <div className="advanced-filters bg-neutral-700/50 rounded-lg p-4 mb-4 space-y-4">
            {/* Categories Filter */}
            <div>
              <h4 className="text-sm font-medium text-white mb-2">Categorias</h4>
              <div className="flex flex-wrap gap-2">
                {availableCategories.map(category => {
                  const isSelected = selectedCategories.includes(category);
                  return (
                    <button
                      key={category}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedCategories(prev => prev.filter(c => c !== category));
                        } else {
                          setSelectedCategories(prev => [...prev, category]);
                        }
                      }}
                                             className={`filter-tag px-3 py-1 rounded-full text-xs border transition-all ${
                         isSelected 
                           ? getCategoryColor(category) + " selected"
                           : "bg-neutral-600/50 text-neutral-300 border-neutral-500/50 hover:border-neutral-400"
                       }`}
                    >
                      {isSelected && <Check className="h-3 w-3 inline mr-1" />}
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sources Filter */}
            <div>
              <h4 className="text-sm font-medium text-white mb-2">Fontes</h4>
              <div className="flex flex-wrap gap-2">
                {availableSources.map(source => {
                  const isSelected = selectedSources.includes(source);
                  return (
                    <button
                      key={source}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedSources(prev => prev.filter(s => s !== source));
                        } else {
                          setSelectedSources(prev => [...prev, source]);
                        }
                      }}
                                             className={`filter-tag px-3 py-1 rounded-full text-xs border transition-all flex items-center gap-1 ${
                         isSelected 
                           ? "bg-blue-500/20 text-blue-300 border-blue-500/50 selected" 
                           : "bg-neutral-600/50 text-neutral-300 border-neutral-500/50 hover:border-neutral-400"
                       }`}
                    >
                      <span>{getSourceIcon(source)}</span>
                      {isSelected && <Check className="h-3 w-3" />}
                      {source}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Score and Date Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Score mínimo</h4>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <div className="flex justify-between text-xs text-neutral-400 mt-1">
                  <span>0</span>
                  <span className="font-medium">{minScore}</span>
                  <span>100+</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-white mb-2">Período</h4>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full bg-neutral-600 border border-neutral-500 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="all">Todos os períodos</option>
                  <option value="today">Hoje</option>
                  <option value="week">Esta semana</option>
                  <option value="month">Este mês</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            {(selectedCategories.length > 0 || selectedSources.length > 0 || searchText || minScore > 0 || dateFilter !== "all") && (
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    setSelectedCategories([]);
                    setSelectedSources([]);
                    setSearchText("");
                    setMinScore(0);
                    setDateFilter("all");
                  }}
                  variant="ghost"
                  size="sm"
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpar todos os filtros
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Active Filters Display */}
        {(selectedCategories.length > 0 || selectedSources.length > 0 || searchText || minScore > 0 || dateFilter !== "all") && (
          <div className="flex flex-wrap gap-2 mb-4">
                         {selectedCategories.map(category => (
               <span
                 key={`cat-${category}`}
                 className={`active-filter px-2 py-1 rounded-full text-xs border ${getCategoryColor(category)} flex items-center gap-1`}
               >
                {category}
                <button
                  onClick={() => setSelectedCategories(prev => prev.filter(c => c !== category))}
                  className="hover:bg-black/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {selectedSources.map(source => (
              <span
                key={`src-${source}`}
                className="px-2 py-1 rounded-full text-xs border bg-blue-500/20 text-blue-300 border-blue-500/50 flex items-center gap-1"
              >
                {getSourceIcon(source)} {source}
                <button
                  onClick={() => setSelectedSources(prev => prev.filter(s => s !== source))}
                  className="hover:bg-black/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {searchText && (
              <span className="px-2 py-1 rounded-full text-xs border bg-green-500/20 text-green-300 border-green-500/50 flex items-center gap-1">
                🔍 "{searchText}"
                <button
                  onClick={() => setSearchText("")}
                  className="hover:bg-black/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
      {error && (
          <div className="bg-red-500/20 text-red-300 p-4 rounded-xl mb-6 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
        </div>
      )}

      {articles === undefined && (
        <div className="space-y-4">
            {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {articles && articles.length === 0 && (
          <div className="text-center text-neutral-400 mt-16">
            <Bookmark className="h-16 w-16 mx-auto mb-4 text-neutral-600" />
            <h2 className="text-2xl font-semibold mb-2">Nenhum artigo encontrado</h2>
            <p className="text-lg mb-4">
              {selectedCategories.length > 0 || selectedSources.length > 0 || searchText || minScore > 0 || dateFilter !== "all"
                ? "Nenhum artigo encontrado com os filtros aplicados. Tente ajustar os filtros."
                : "Seu repositório de conhecimento está vazio. Novos artigos aparecerão aqui automaticamente."
              }
            </p>
            {selectedCategories.length === 0 && selectedSources.length === 0 && availableCategories.length > 0 && (
              <div className="mt-6">
                <p className="text-sm text-neutral-500 mb-3">Categorias disponíveis:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {availableCategories.slice(0, 8).map(category => (
                    <span 
                      key={category}
                      className={`px-3 py-1 rounded-full text-xs border ${getCategoryColor(category)} cursor-pointer hover:opacity-80 transition-opacity`}
                      onClick={() => setSelectedCategories([category])}
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}
        </div>
      )}

        <div className="grid gap-4">
        {articles?.map((article) => (
            <article key={article._id} className="group p-6 bg-gradient-to-r from-neutral-700/50 to-neutral-600/30 rounded-xl border border-neutral-600/50 hover:border-neutral-500 transition-all duration-200 hover:shadow-lg">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getSourceIcon(article.source)}</span>
                    <span className="text-sm text-neutral-400 font-medium">{article.source}</span>
                                         {article.category && (
                       <span className={`px-2 py-1 rounded-full text-xs border ${getCategoryColor(article.category)}`}>
                         {article.category}
                       </span>
                     )}
                  </div>
                  
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                    className="group flex items-start gap-2 mb-3"
              >
                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                {article.title}
                    </h3>
                    <ExternalLink className="h-4 w-4 text-neutral-400 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-1" />
                  </a>

                  {article.description && (
                    <p className="text-neutral-300 text-sm mb-3 line-clamp-2">
                      {article.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-neutral-400">
                    {article.publishedAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(article.publishedAt)}</span>
                      </div>
                    )}
                    {article.score && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        <span>{article.score} pontos</span>
                      </div>
                    )}
              </div>
            </div>

            <Button
                onClick={() => handleSummarize(article)}
                disabled={summarizingId === article._id}
                size="sm"
                className="shrink-0"
            >
                {summarizingId === article._id ? (
                    <>
                        <Spinner />
                      <span className="ml-2">Resumindo...</span>
                    </>
                ) : (
                    <>
                        <BookText className="h-4 w-4 mr-2" />
                      <span>Resumir</span>
                    </>
                )}
            </Button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Preferences Modal */}
      <PreferencesModal
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
        preferences={preferences}
        availableCategories={availableCategories}
        availableSources={availableSources}
        onSave={handleSavePreferences}
      />
    </div>
  );
}; 