import { useDroppable } from "@dnd-kit/core";
import React from "react";

interface ChannelPerksDroppableProps {
  id: string;
  children: React.ReactNode;
}

const ChannelPerksDroppable = ({
  id,
  children,
}: ChannelPerksDroppableProps) => {
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <div ref={setNodeRef} className="flex-1 flex flex-col gap-2 mt-10 min-h-44">
      {children}
    </div>
  );
};

export default ChannelPerksDroppable;
