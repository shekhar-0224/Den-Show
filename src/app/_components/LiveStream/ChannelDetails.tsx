import React from "react";
import { formatDate } from "~/lib/utils";

interface ChannelDetailsProps {
  channel: {
    name: string;
    profileUrl: string | null;
    handle: string;
    bio: string | null;
    id: string;
    createdAt: Date;
  };
}

const ChannelDetails = ({ channel }: ChannelDetailsProps) => {
  return (
    <div className="mt-4 border-t border-white pt-4 border-dotted">
      <div className="font-cream-medium text-sm">About Channel</div>
      <div className="mt-2 flex flex-col md:flex-row items-start md:items-center gap-2">
        <div className="text-xs md:text-sm flex-1">{channel.bio}</div>
        <div className="text-xs md:text-sm flex flex-col">
          <div>Joined on {formatDate(channel.createdAt)}</div>
        </div>
      </div>
    </div>
  );
};

export default ChannelDetails;
