import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { ImageIcon, X } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { useCoverImage } from "../hooks/use-cover-image";

const CoverImageWithUrl = ({
  documentId,
  preview,
  url,
}: {
  documentId: Id<"documents">;
  preview?: boolean;
  url: string | null;
}) => {
  const coverImage = useCoverImage();
  const removeCoverImage = useMutation(api.documents.removeCoverImage);

  const onRemove = () => {
    removeCoverImage({ id: documentId });
  };

  return (
    <div
      className={cn(
        "relative w-full h-[35vh] group",
        !url && "h-[12vh]",
        url && "bg-neutral-700"
      )}
    >
      {!!url && <img src={url} alt="Cover" className="object-cover w-full h-full" />}
      {url && !preview && (
        <div className="opacity-0 group-hover:opacity-100 absolute bottom-5 right-5 flex items-center gap-x-2">
          <Button
            onClick={() => coverImage.onOpen(documentId)}
            className="text-neutral-300 text-xs"
            variant="outline"
            size="sm"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Change cover
          </Button>
          <Button
            onClick={onRemove}
            className="text-neutral-300 text-xs"
            variant="outline"
            size="sm"
          >
            <X className="h-4 w-4 mr-2" />
            Remove
          </Button>
        </div>
      )}
    </div>
  );
};

export const Cover = ({
  documentId,
  preview,
}: {
  documentId: Id<"documents">;
  preview?: boolean;
}) => {
  const document = useQuery(api.documents.getById, { documentId });
  const url = useQuery(
    api.files.getUrl,
    document?.coverImage
      ? { storageId: document.coverImage as Id<"_storage"> }
      : "skip"
  );

  if (document === undefined) {
    return (
      <div className="relative w-full h-[35vh] group bg-neutral-700 animate-pulse" />
    );
  }

  return (
    <CoverImageWithUrl documentId={documentId} preview={preview} url={url || null} />
  );
}; 