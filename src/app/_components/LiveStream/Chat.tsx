import { useCallback, useRef, useState } from "react";
import useAddress from "~/app/_hooks/useAddress";
import { Input } from "~/components/ui/input";

interface ChatMessage {
  id: string;
  message: string;
  from: string;
  timestamp: number;
  isTip?: boolean;
}

const Chat = () => {
  const { address } = useAddress();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [viewerCount] = useState(42); // Mock viewer count

  const handleSend = useCallback(
    (message: string) => {
      if (!message.trim()) return;
      
      setIsSending(true);
      
      // Simulate sending message
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        message: message.trim(),
        from: address ? `User_${address.slice(-4)}` : "Anonymous",
        timestamp: Date.now(),
      };
      
      setChatMessages(prev => [...prev, newMessage]);
      setIsSending(false);
    },
    [address],
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
          if (msg.isTip) {
            return (
              <div key={msg.id} className="text-primary font-bold">
                {msg.message}
              </div>
            );
          }

          return (
            <div key={msg.id} className="flex gap-2">
              <span className="font-medium text-blue-600">
                {msg.from}:
              </span>
              <span>{msg.message}</span>
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
