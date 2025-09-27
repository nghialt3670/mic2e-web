import Image from "next/image";
import { FC } from "react";

interface AttachmentItemProps {
  name: string;
  size: number;
  type: string;
  url: string;
}

export const AttachmentItem: FC<AttachmentItemProps> = ({
  name,
  size,
  type,
  url,
}) => {
  const renderImage = () => {
    return (
      <Image
        src={url}
        alt={name}
        width={100}
        height={100}
        className="w-10 h-10"
      />
    );
  };

  switch (type) {
    case "image":
      return renderImage();
    default:
      return <div>AttachmentItem</div>;
  }
};
