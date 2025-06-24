import { useAction, useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { Spinner } from "./Spinner";
import { useCreateBlockNote } from "@blocknote/react";
import { Button } from "./ui/button";
import { BookText, AlertTriangle } from "lucide-react";

const SkeletonCard = () => (
  <div className="p-4 bg-neutral-700 rounded-lg flex justify-between items-center animate-pulse">
    <div className="w-3/4">
      <div className="h-6 bg-neutral-600 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-neutral-600 rounded w-1/2"></div>
    </div>
    <div className="h-10 w-24 bg-neutral-600 rounded-lg"></div>
  </div>
);

export const KnowledgeRepository = ({
  onSelectDocument,
}: {
  onSelectDocument: (id: Id<"documents">) => void;
}) => {
  const articles = useQuery(api.knowledge.get);
  const summarize = useAction(api.summarizer.summarizeArticle);
  const createDoc = useMutation(api.documents.createWithContent);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Temporary editor for Markdown to JSON conversion
  const editor = useCreateBlockNote();

  const handleSummarize = async (article: Doc<"knowledge_articles">) => {
    setSummarizingId(article._id);
    setError(null);
    try {
      const markdown = await summarize({
        url: article.url,
      });

      if (markdown && editor) {
        const blocks = await editor.tryParseMarkdownToBlocks(markdown);
        const newDocumentId = await createDoc({
          title: `Summary: ${article.title}`,
          content: JSON.stringify(blocks),
        });
        onSelectDocument(newDocumentId);
      } else {
        throw new Error("Summarization returned no content.");
      }
    } catch (error) {
      console.error("Failed to summarize and create document", error);
      setError("Failed to summarize the article. Please try again later.");
    } finally {
      setSummarizingId(null);
    }
  };

  return (
    <div className="p-4 bg-neutral-800 text-white h-full overflow-y-auto">
      <h1 className="text-2xl font-bold mb-4">Knowledge Repository</h1>

      {error && (
        <div className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4 flex items-center gap-2">
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
        <div className="text-center text-neutral-400 mt-12">
            <h2 className="text-2xl font-semibold">No articles yet</h2>
            <p className="mt-2">Your knowledge repository is empty. New articles from your sources will appear here automatically.</p>
        </div>
      )}

      <ul className="space-y-4">
        {articles?.map((article) => (
          <li key={article._id} className="p-4 bg-neutral-700 rounded-lg flex justify-between items-center transition-colors hover:bg-neutral-600/50">
            <div className="w-full overflow-hidden mr-4">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold text-blue-400 hover:underline truncate block"
                title={article.title}
              >
                {article.title}
              </a>
              <div className="text-sm text-neutral-400 mt-1">
                <span>{article.source}</span>
                {article.score && <span> &middot; {article.score} points</span>}
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
                        <span className="ml-2">Summarizing...</span>
                    </>
                ) : (
                    <>
                        <BookText className="h-4 w-4 mr-2" />
                        <span>Summarize</span>
                    </>
                )}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}; 