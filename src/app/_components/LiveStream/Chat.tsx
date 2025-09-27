import { useChat, useRemoteParticipants } from "@livekit/components-react";
import { useCallback, useRef, useState } from "react";
import useAddress from "~/app/_hooks/useAddress";
import { Input } from "~/components/ui/input";

// interface ChatProps {
//   isDashboard: boolean;
//   channelPfp: string | null;
//   channelHandle: string;
//   streamId: string;
//   streamerAddress: string;
// }

const Chat = () => {
  const { address } = useAddress();
  const participants = useRemoteParticipants();
  const { chatMessages, send, isSending } = useChat();
  const viewerCount = participants.length;

  const handleSend = useCallback(
    (message: string) => {
      send(message, {
        attributes: {
          label: "chat",
        },
      });
    },
    [send],
  );

  return (
    <div className="bg-white text-black flex flex-col gap-4 flex-1 p-4 min-h-[400px]">
      <div className="flex items-center justify-between">
        <div className="text-black font-cream-medium text-lg">Live Chat</div>
        <div className="text-black text-sm">
          {viewerCount} Viewer{viewerCount === 1 ? "" : "s"}
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
        {chatMessages.map((msg) => {
          if (msg.attributes?.label === "tip") {
            return (
              <div key={msg.timestamp} className="text-primary font-bold">
                {msg.message}
              </div>
            );
          }

          return (
            <div key={msg.timestamp}>
              <span
                style={{
                  color: JSON.parse(msg.from?.metadata ?? "{}").color ?? "#000",
                }}
              >
                {msg.from?.identity}:{" "}
              </span>
              {msg.message}
            </div>
          );
        })}
      </div>
      <ChatInput
        isSending={isSending}
        handleSend={handleSend}
        disabled={!address}
      />
    </div>
  );
};

export default Chat;

const ChatInput = ({
  isSending,
  handleSend,
  disabled,
}: {
  isSending: boolean;
  handleSend: (message: string) => void;
  disabled: boolean;
}) => {
  const chatInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");

  if (disabled) {
    return (
      <Input
        disabled={true}
        placeholder="You need to be logged in to send a message"
      />
    );
  }

  return (
    <Input
      ref={chatInputRef}
      disabled={isSending}
      placeholder="Write your message here"
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && message.trim() !== "") {
          e.preventDefault();
          handleSend(message);
          setMessage("");
        }
      }}
    />
  );
};
