import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { BlockNoteEditor, filterSuggestionItems, PartialBlock } from "@blocknote/core";
import { FormattingToolbar, getDefaultReactSlashMenuItems, SuggestionMenuController, useCreateBlockNote, FormattingToolbarController, getFormattingToolbarItems } from "@blocknote/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useEffect, useRef, useState } from "react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { Smile, ImageIcon } from "lucide-react";
import { Cover } from "./CoverImage";
import { Button } from "./ui/button";
import { useCoverImage } from "../hooks/use-cover-image";
import { pt } from "@blocknote/core/locales";
import { pt as aiPtbr } from "@blocknote/xl-ai/locales";
import {
  AIMenuController,
  AIToolbarButton,
  createAIExtension,
  getAISlashMenuItems,
} from "@blocknote/xl-ai";
import "@blocknote/xl-ai/style.css";
import { google_model } from "../lib/ai";
import { KnowledgeGraph } from "./KnowledgeGraph";
import { useAuth } from "../context/AuthContext";

const Editor = ({
  documentId,
}: {
  documentId: Id<"documents"> | null;
}) => {
  const { user } = useAuth();
  const documentData = useQuery(
    api.documents.getById,
    documentId && user?._id ? { documentId, userId: user._id } : "skip"
  );
  const update = useMutation(api.documents.update);
  const coverImage = useCoverImage();

  const [title, setTitle] = useState(documentData?.title);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitle(documentData?.title);
  }, [documentData?.title]);
  
  // Close picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [pickerRef]);

  const editor = useCreateBlockNote({
    initialContent: documentData?.content
      ? (JSON.parse(documentData.content) as PartialBlock[])
      : undefined,
      dictionary: {
        ...pt,
        ai: aiPtbr, // add default translations for the AI extension
      },
      extensions: [
        createAIExtension({
          model: google_model,
        }),
      ],
  });

  const handleEditorChange = () => {
    if (editor.document && documentId && user) {
      update({
        id: documentId,
        content: JSON.stringify(editor.document, null, 2),
        userId: user._id,
      });
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    if (documentId && user) {
      update({
        id: documentId,
        title: title || "Untitled",
        userId: user._id,
      });
    }
  };

  const onIconSelect = (icon: string) => {
    if (documentId && user) {
      update({
        id: documentId,
        icon: icon,
        userId: user._id,
      });
    }
    setIsPickerOpen(false);
  };

  if (documentData === undefined) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400">
        <img src="/duck.png" alt="DocDuck Logo" className="size-96 aspect-square" />
        <h1 className="text-4xl font-bold">DocDuck</h1>
        <p className="text-lg text-neutral-400">Your all-in-one workspace for notes and ideas.</p>
      </div>
    );
  }

  if (documentData === null) {
    return (
      <div className="w-full h-full flex items-center justify-center text-neutral-400">
        <p>Select a note to get started.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto relative">
      <KnowledgeGraph />
      {documentId && <Cover documentId={documentId} />}
      <div className="md:max-w-3xl lg:max-w-4xl mx-auto p-8 group">
        <div className="group relative flex items-center justify-between">
          {!!documentData.icon && (
             <div className="text-6xl mb-4 group-hover:opacity-75 transition" onClick={() => setIsPickerOpen(true)}>{documentData.icon}</div>
          )}
          {!documentData.icon && (
            <div className="mb-4">
              <button
                onClick={() => setIsPickerOpen(true)}
                className="text-neutral-400 flex items-center gap-x-2 group-hover:text-white transition"
              >
                <Smile className="h-6 w-6" />
                Add icon
              </button>
            </div>
          )}
          {isPickerOpen && (
            <div ref={pickerRef} className="absolute z-50">
              <EmojiPicker
                onEmojiClick={(emoji) => onIconSelect(emoji.emoji)}
                theme={Theme.DARK}
              />
            </div>
          )}
          <div className="flex items-center gap-x-2">
            {!documentData.coverImage && (
                  <Button
                  onClick={() => documentId && coverImage.onOpen(documentId)}
                  className="text-white border-none text-xs opacity-0 group-hover:opacity-100 transition m-5 place-self-end"
                  variant="outline"
                  size="sm"
                  >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Add cover
                  </Button>
              )}
          </div>
        </div>

        <input
          value={title || ""}
          onChange={handleTitleChange}
          onBlur={handleTitleBlur}
          className="w-full bg-transparent text-white text-4xl font-bold outline-none mb-4"
          placeholder="Untitled"
        />
        <BlockNoteView
          editor={editor}
          theme={"dark"}
          onChange={handleEditorChange}
          editable={!!documentId}
        >
          <FormattingToolbarWithAI />
          <SuggestionMenuWithAI editor={editor} />
          <AIMenuController/>
        </BlockNoteView>
      </div>
    </div>
  );
};

function FormattingToolbarWithAI() {
  return (
    <FormattingToolbarController
      formattingToolbar={() => (
        <FormattingToolbar>
          {...getFormattingToolbarItems()}
          {/* Add the AI button */}
          <AIToolbarButton />
        </FormattingToolbar>
      )}
    />
  );
}
 
// Slash menu with the AI option added
function SuggestionMenuWithAI(props: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editor: BlockNoteEditor<any, any, any>;
}) {
  return (
    <SuggestionMenuController
      triggerCharacter="/"
      getItems={async (query) =>
        filterSuggestionItems(
          [
            ...getDefaultReactSlashMenuItems(props.editor),
            // add the default AI slash menu items, or define your own
            ...getAISlashMenuItems(props.editor),
          ],
          query,
        )
      }
    />
  );
}

export default Editor;