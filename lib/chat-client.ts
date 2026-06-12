'use client';

import { ChatMessage, POI } from './types';

export interface ChatStreamCallbacks {
  onToolCall?: (tool: string, label: string) => void;
  onToolDone?: (tool: string) => void;
  onTextDelta?: (text: string) => void;
  onDone?: (referencedPois: POI[]) => void;
  onError?: (message: string) => void;
}

export async function streamCityChat(
  messages: ChatMessage[],
  location: { lat: number; lng: number } | undefined,
  callbacks: ChatStreamCallbacks,
): Promise<void> {
  let response: Response;
  try {
    response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, location }),
    });
  } catch (err) {
    callbacks.onError?.(err instanceof Error ? err.message : String(err));
    return;
  }

  if (!response.ok || !response.body) {
    callbacks.onError?.(`HTTP ${response.status}`);
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const jsonStr = line.slice(6).trim();
        if (!jsonStr) continue;

        let event: Record<string, unknown>;
        try {
          event = JSON.parse(jsonStr) as Record<string, unknown>;
        } catch {
          continue;
        }

        const type = event.type as string;

        switch (type) {
          case 'tool_call':
            callbacks.onToolCall?.(event.tool as string, event.label as string);
            break;
          case 'tool_done':
            callbacks.onToolDone?.(event.tool as string);
            break;
          case 'text_delta':
            callbacks.onTextDelta?.(event.text as string);
            break;
          case 'done':
            callbacks.onDone?.((event.referencedPois as POI[]) ?? []);
            break;
          case 'error':
            callbacks.onError?.(event.message as string);
            break;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
