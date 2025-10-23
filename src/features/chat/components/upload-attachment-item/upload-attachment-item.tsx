import { Button } from "@/components/ui/button";
import { readFileAsDataURL } from "@/utils/client/file-readers";
import { XIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface UploadAttachmentItemProps {
  file: File;
  onRemove: (filename: string) => void;
}

export const UploadAttachmentItem = ({
  file,
  onRemove,
}: UploadAttachmentItemProps) => {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    readFileAsDataURL(file).then((dataUrl) => {
      setDataUrl(dataUrl);
    });
  }, [file]);

  const handleRemoveAttachment = () => {
    onRemove(file.name);
  };

  return (
    <div>
      <Button variant="ghost" size="icon" onClick={handleRemoveAttachment}>
        <XIcon />
      </Button>
      <Image src={dataUrl || ""} alt={file.name} width={100} height={100} />
    </div>
  );
};
