import Anthropic from '@anthropic-ai/sdk';
import { MessageParam, ToolResultBlockParam } from '@anthropic-ai/sdk/resources/messages';
import { NextRequest } from 'next/server';
import { CITY_TOOLS, TOOL_LABELS, executeTool } from '@/lib/city-tools';
import { SEATTLE_POIS } from '@/lib/mock-data';
import { ChatMessage, POI } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function getSystemPrompt(): string {
  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return `You are PulseCity's AI city guide for Seattle. You have live access to the city's event feed, POI database, and prediction engine through your tools. ALWAYS use tools to answer — never guess about current events or places.

Current time: ${timeStr} on ${dayName}.

Tool usage rules:
- Any question about what's happening → call search_events first.
- Any question about places, restaurants, bars, venues, parks → call query_poi. ALWAYS call query_poi for food/dining/place recommendations.
- Any question about "not near events", "away from chaos", "safe area" → call query_poi with exclude_near_events: true.
- Any question about predictions or future events → call get_predictions.
- Any neighborhood question → call get_area_status.

Personality rules:
- Have opinions. Lead with the most important thing first.
- Give ONE specific recommendation, not a list.
- Use natural distance language ("3 blocks north", "just past the light").
- Keep responses under 100 words.
- End with one "→" action suggestion when relevant.
- IMPORTANT: When mentioning any specific place from query_poi results, you MUST wrap it as <poi id="POI_ID">Name</poi> using the exact id from the tool result.
- For predictions, phrase as "I'm tracking..." or "Based on the patterns I'm seeing..."`;
}

function extractReferencedPois(text: string): POI[] {
  const poiRegex = /<poi id="([^"]+)">([^<]+)<\/poi>/g;
  const seenIds: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = poiRegex.exec(text)) !== null) {
    const id = match[1];
    if (!seenIds.includes(id)) seenIds.push(id);
  }
  return seenIds
    .map((id) => SEATTLE_POIS.find((p) => p.id === id))
    .filter((p): p is POI => p !== undefined);
}

function extractPoisFromToolResult(toolName: string, resultJson: string): POI[] {
  if (toolName !== 'query_poi') return [];
  try {
    const parsed = JSON.parse(resultJson) as { pois?: { id: string }[] };
    if (!parsed.pois) return [];
    return parsed.pois
      .map((r) => SEATTLE_POIS.find((p) => p.id === r.id))
      .filter((p): p is POI => p !== undefined);
  } catch {
    return [];
  }
}

function encode(obj: Record<string, unknown>): string {
  return `data: ${JSON.stringify(obj)}\n\n`;
}

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(obj: Record<string, unknown>) {
        controller.enqueue(encoder.encode(encode(obj)));
      }

      try {
        const body = await req.json() as { messages: ChatMessage[]; location?: { lat: number; lng: number } };
        const { messages } = body;

        const apiMessages: MessageParam[] = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        let iteration = 0;
        const MAX_ITERATIONS = 5;
        let fullText = '';
        const toolResultPois: POI[] = [];

        while (iteration < MAX_ITERATIONS) {
          iteration++;

          const response = await client.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 600,
            system: getSystemPrompt(),
            tools: CITY_TOOLS,
            messages: apiMessages,
          });

          if (response.stop_reason === 'tool_use') {
            const toolUseBlocks = response.content.filter((b) => b.type === 'tool_use');
            const toolResults: ToolResultBlockParam[] = [];

            for (const block of toolUseBlocks) {
              if (block.type !== 'tool_use') continue;
              const { id, name, input } = block;

              send({ type: 'tool_call', tool: name, label: TOOL_LABELS[name] ?? name });

              const result = await executeTool(name, input as Record<string, unknown>);

              // Collect POIs from query_poi tool results for the done event
              const pois = extractPoisFromToolResult(name, result);
              for (const poi of pois) {
                if (!toolResultPois.find((p) => p.id === poi.id)) {
                  toolResultPois.push(poi);
                }
              }

              send({ type: 'tool_done', tool: name });

              toolResults.push({
                type: 'tool_result',
                tool_use_id: id,
                content: result,
              });
            }

            apiMessages.push({ role: 'assistant', content: response.content });
            apiMessages.push({ role: 'user', content: toolResults });
            continue;
          }

          // Final text response — emit as chunked text_delta events
          const textBlock = response.content.find((b) => b.type === 'text');
          if (textBlock && textBlock.type === 'text') {
            const text = textBlock.text;
            fullText = text;
            const chunkSize = 8;
            for (let i = 0; i < text.length; i += chunkSize) {
              send({ type: 'text_delta', text: text.slice(i, i + chunkSize) });
            }
          }

          break;
        }

        // Merge <poi> tagged POIs with those returned by query_poi tool calls
        const taggedPois = extractReferencedPois(fullText);
        const mergedPois = [...taggedPois];
        for (const poi of toolResultPois) {
          if (!mergedPois.find((p) => p.id === poi.id)) {
            mergedPois.push(poi);
          }
        }

        send({ type: 'done', referencedPois: mergedPois });
      } catch (err) {
        send({ type: 'error', message: err instanceof Error ? err.message : String(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
