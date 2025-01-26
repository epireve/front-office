import { cn } from "@/utils/cn";
import type { Message } from "ai/react";

export function ChatMessageBubble(props: {
  message: Message;
  aiEmoji?: string;
  sources: any[];
}) {
  return (
    <div
      className={cn(
        `rounded-[24px] max-w-[80%] mb-8 flex`,
        props.message.role === "user"
          ? "bg-secondary text-secondary-foreground px-4 py-2"
          : null,
        props.message.role === "user" ? "ml-auto" : "mr-auto",
      )}
    >
      {props.message.role !== "user" && (
        <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 mr-4 -mt-2 border rounded-full bg-background">
          {props.aiEmoji}
        </div>
      )}

      <div className="flex flex-col whitespace-pre-wrap">
        <span>{props.message.content}</span>

        {props.sources && props.sources.length ? (
          <>
            <code className="px-2 py-1 mt-4 mr-auto rounded bg-primary">
              <h2>🔍 Sources:</h2>
            </code>
            <code className="px-2 py-1 mt-1 mr-2 text-xs rounded bg-primary">
              {props.sources?.map((source, i) => (
                <div className="mt-2" key={"source:" + i}>
                  {i + 1}. &quot;{source.pageContent}&quot;
                  {source.metadata?.loc?.lines !== undefined ? (
                    <div>
                      <br />
                      Lines {source.metadata?.loc?.lines?.from} to{" "}
                      {source.metadata?.loc?.lines?.to}
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              ))}
            </code>
          </>
        ) : null}
      </div>
    </div>
  );
}
