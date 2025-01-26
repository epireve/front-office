import { type Message } from "ai";
import ReactMarkdown from "react-markdown";
import { cn } from "@/utils/cn";

function ChatMessageContent({ content }: { content: string }) {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}

export function ChatMessageBubble(props: {
  message: Message;
  aiEmoji?: string;
  sources?: any[];
}) {
  const { message, aiEmoji, sources } = props;
  const isAiMessage = message.role === "assistant";

  return (
    <div className="flex items-start w-full gap-4 py-4">
      <div className="flex items-center justify-center w-8 h-8 p-1 text-center border rounded-md bg-primary-foreground shrink-0">
        {isAiMessage ? (aiEmoji ? aiEmoji : "🤖") : "👤"}
      </div>
      <div className="flex-1 max-w-3xl">
        <div
          className={cn(
            "flex flex-col space-y-2",
            isAiMessage ? "rounded-lg" : "",
            // isAiMessage ? "bg-muted/50 px-4 py-2 rounded-lg" : "",
          )}
        >
          <ChatMessageContent content={message.content} />

          {sources && sources.length > 0 && (
            <div className="pt-2 mt-2 border-t">
              <p className="text-sm font-medium text-muted-foreground">
                Sources:
              </p>
              {sources.map((source, i) => (
                <div key={i} className="text-sm text-muted-foreground">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {source.title || source.url}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
