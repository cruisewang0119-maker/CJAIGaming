'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { streamCityChat } from '@/lib/chat-client';
import ToolCallIndicator from './ToolCallIndicator';
import { POI, ChatMessage } from '@/lib/types';
import { LocalMessage } from '@/lib/types';

const SUGGESTIONS = [
  "What's happening near Capitol Hill right now?",
  'Find me dinner not near any events',
  "What's going to happen on I-5 after the game tonight?",
  "What's the vibe in Pioneer Square?",
];

function renderContent(content: string, pois: POI[], onPoiClick: (poi: POI) => void) {
  const parts: React.ReactNode[] = [];
  const poiRegex = /<poi id="([^"]+)">([^<]+)<\/poi>/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = poiRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    const [, id, name] = match;
    const poi = pois.find((p) => p.id === id);
    parts.push(
      <button
        key={`poi-${id}-${match.index}`}
        onClick={() => poi && onPoiClick(poi)}
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium mx-0.5 hover:opacity-80 transition-opacity"
        style={{
          backgroundColor: '#3b82f622',
          color: '#93c5fd',
          border: '1px solid #3b82f644',
          cursor: poi ? 'pointer' : 'default',
        }}
        title={poi ? `${poi.address}` : name}
      >
        <span>📍</span>
        <span>{name}</span>
      </button>,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts;
}

interface ChatPanelProps {
  onPoisHighlight: (pois: POI[]) => void;
}

export default function ChatPanel({ onPoisHighlight }: ChatPanelProps) {
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      setInput('');
      setIsStreaming(true);

      const userMsg: LocalMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: trimmed,
        timestamp: new Date().toISOString(),
      };

      const assistantId = crypto.randomUUID();
      const assistantMsg: LocalMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        toolCalls: [],
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);

      // Build the ChatMessage array from current messages for API call
      const apiMessages: ChatMessage[] = [
        ...messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
        })),
        { id: userMsg.id, role: userMsg.role, content: userMsg.content, timestamp: userMsg.timestamp },
      ];

      await streamCityChat(apiMessages, undefined, {
        onToolCall: (tool, label) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, toolCalls: [...(m.toolCalls ?? []), { tool, label, done: false }] }
                : m,
            ),
          );
        },
        onToolDone: (tool) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    toolCalls: (m.toolCalls ?? []).map((tc) =>
                      tc.tool === tool && !tc.done ? { ...tc, done: true } : tc,
                    ),
                  }
                : m,
            ),
          );
        },
        onTextDelta: (delta) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + delta } : m,
            ),
          );
        },
        onDone: (referencedPois) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, referencedPois, isStreaming: false }
                : m,
            ),
          );
          onPoisHighlight(referencedPois);
          setIsStreaming(false);
        },
        onError: (message) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: `Sorry, something went wrong: ${message}`, isStreaming: false }
                : m,
            ),
          );
          setIsStreaming(false);
        },
      });
    },
    [isStreaming, messages, onPoisHighlight],
  );

  const handlePoiClick = useCallback(
    (poi: POI) => {
      onPoisHighlight([poi]);
    },
    [onPoisHighlight],
  );

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e2030] flex-shrink-0">
        <span className="text-xs font-semibold text-[#e8eaf0]">Ask the City</span>
        <span className="text-[10px] text-[#6b7280] font-mono">AI · Seattle</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
        {messages.length === 0 && (
          <div className="space-y-2 pt-2">
            <p className="text-xs text-[#6b7280] text-center">Ask anything about Seattle right now.</p>
            <div className="space-y-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="w-full text-left text-xs px-2.5 py-1.5 rounded-lg border border-[#1e2030] text-[#9ca3af] hover:border-[#3b82f6] hover:text-[#e8eaf0] transition-colors bg-[#12131a]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => {
          if (msg.role === 'user') {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-[85%] px-3 py-2 rounded-lg bg-[#3b82f6] text-white text-xs leading-relaxed">
                  {msg.content}
                </div>
              </div>
            );
          }

          // Assistant message
          const toolsTotal = msg.toolCalls?.length ?? 0;
          const toolsDone = msg.toolCalls?.filter((t) => t.done).length ?? 0;
          const isCollapsed = !msg.isStreaming && toolsTotal > 0 && toolsDone === toolsTotal;

          return (
            <div key={msg.id} className="flex justify-start">
              <div className="max-w-[95%] w-full">
                {/* Tool call indicator */}
                {(msg.toolCalls?.length ?? 0) > 0 && (
                  <ToolCallIndicator
                    steps={msg.toolCalls ?? []}
                    collapsed={isCollapsed}
                  />
                )}

                {/* Content */}
                {(msg.content || msg.isStreaming) && (
                  <div className="px-3 py-2 rounded-lg bg-[#12131a] border border-[#1e2030] text-xs leading-relaxed text-[#e8eaf0]">
                    {msg.content ? (
                      <span>
                        {renderContent(
                          msg.content,
                          msg.referencedPois ?? [],
                          handlePoiClick,
                        )}
                      </span>
                    ) : (
                      <span className="text-[#6b7280] animate-pulse">Thinking…</span>
                    )}
                    {msg.isStreaming && msg.content && (
                      <span className="inline-block w-0.5 h-3 bg-[#3b82f6] animate-pulse ml-0.5 align-text-bottom" />
                    )}
                  </div>
                )}

                {/* POI chips below the response */}
                {!msg.isStreaming && (msg.referencedPois?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5 px-1">
                    {msg.referencedPois!.map((poi) => (
                      <button
                        key={poi.id}
                        onClick={() => handlePoiClick(poi)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border hover:opacity-80 transition-opacity"
                        style={{
                          backgroundColor: '#3b82f611',
                          borderColor: '#3b82f644',
                          color: '#93c5fd',
                        }}
                      >
                        <span>📍</span>
                        <span>{poi.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-3 py-2 border-t border-[#1e2030]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Seattle…"
            disabled={isStreaming}
            className="flex-1 bg-[#12131a] border border-[#1e2030] rounded-lg px-3 py-1.5 text-xs text-[#e8eaf0] placeholder-[#6b7280] focus:outline-none focus:border-[#3b82f6] disabled:opacity-50 transition-colors"
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="px-3 py-1.5 rounded-lg bg-[#3b82f6] text-white text-xs font-medium disabled:opacity-40 hover:bg-[#2563eb] transition-colors"
          >
            {isStreaming ? '…' : '→'}
          </button>
        </form>
      </div>
    </div>
  );
}
