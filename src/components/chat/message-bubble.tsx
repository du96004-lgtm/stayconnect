import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";

export default function MessageBubble({ message, isOwnMessage, showSenderName }: { message: ChatMessage, isOwnMessage: boolean, showSenderName?: boolean }) {
    return (
        <div className={cn("flex flex-col gap-1 w-full", isOwnMessage ? "items-end" : "items-start")}>
             {showSenderName && !isOwnMessage && (
                <p className="text-xs text-muted-foreground ml-2">{message.senderName}</p>
            )}
            <div
                className={cn(
                    "max-w-[80%] md:max-w-[60%] rounded-2xl px-4 py-2 shadow-md",
                    isOwnMessage
                        ? "bg-primary text-primary-foreground rounded-br-lg"
                        : "bg-card text-card-foreground rounded-bl-lg border"
                )}
            >
                <p className="text-sm break-words">{message.text}</p>
            </div>
            <p className="text-xs text-muted-foreground px-2">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
        </div>
    );
}
