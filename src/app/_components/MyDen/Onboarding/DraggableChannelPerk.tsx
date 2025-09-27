import { useDraggable } from "@dnd-kit/core";
import Image from "next/image";
import React from "react";

interface DraggableChannelPerkProps {
  id: string;
  perk: string;
}

const DraggableChannelPerk = ({ id, perk }: DraggableChannelPerkProps) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    data: {
      perk,
    },
    disabled: true,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="bg-white flex items-center justify-between rounded-sm border border-black shadow-small p-2.5 cursor-grab"
    >
      <div className="text-sm">{perk}</div>
      <Image src="/icons/menu-icon.svg" alt="menu" width={4} height={26} />
    </div>
  );
};

export default DraggableChannelPerk;
