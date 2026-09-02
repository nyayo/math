import type { AISession, ChatMessage } from '@/types/learning';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const mockResponses: Record<string, string> = {
  quadratic: `Great question! Let's break down **quadratic equations** step by step.

A quadratic equation has the form:

\`\`\`
ax² + bx + c = 0
\`\`\`

## Methods to Solve

1. **Factoring** — if the expression can be factored
2. **Quadratic formula** — works for all quadratics
3. **Completing the square** — a useful algebraic technique

## The Quadratic Formula

\`\`\`
x = (-b ± √(b² - 4ac)) / 2a
\`\`\`

The discriminant **b² - 4ac** tells you:
- Positive → two real solutions
- Zero → one real solution
- Negative → two complex solutions

## Example

Solve **x² - 5x + 6 = 0**:
- Factoring: (x-2)(x-3) = 0
- Solutions: x = 2 or x = 3

Would you like to try a practice problem?`,
  pythagorean: `The **Pythagorean Theorem** is one of the most important results in mathematics.

## The Theorem

In a right triangle with legs **a** and **b**, and hypotenuse **c**:

\`\`\`
a² + b² = c²
\`\`\`

## Example

If a = 3 and b = 4:
\`\`\`
c = √(9 + 16) = √25 = 5
\`\`\`

## Key Points

- Only works for **right triangles**
- The hypotenuse is always the **longest side**
- Used in navigation, construction, and physics

Would you like to see more examples?`,
  derivative: `Let's explore **derivatives** — the heart of calculus!

## What is a Derivative?

A derivative measures the **instantaneous rate of change** of a function.

## The Power Rule

\`\`\`
d/dx [xⁿ] = n · xⁿ⁻¹
\`\`\`

## Examples

- d/dx [x²] = 2x
- d/dx [x³] = 3x²
- d/dx [5x] = 5
- d/dx [7] = 0

## What It Means

The derivative gives you the **slope of the tangent line** at any point on the curve. This is incredibly useful for:
- Finding maximum and minimum values
- Calculating velocity from position
- Analyzing rates of change

Shall we practice with some examples?`,
  default: `I'm here to help with any math question! Here's what I can assist with:

- **Algebra** — equations, inequalities, factoring
- **Geometry** — angles, triangles, circles
- **Calculus** — limits, derivatives, integrals
- **Statistics** — probability, distributions
- **Trigonometry** — sine, cosine, tangent

Try asking me something like:
1. "Explain quadratic equations"
2. "Help me solve 2x + 5 = 13"
3. "What's the Pythagorean theorem?"

What would you like to explore?`,
};

function getMockResponse(question: string): string {
  const q = question.toLowerCase();
  if (q.includes('quadratic') || q.includes('parabola')) return mockResponses.quadratic;
  if (q.includes('pythagorean') || q.includes('triangle')) return mockResponses.pythagorean;
  if (q.includes('derivative') || q.includes('calculus') || q.includes('differentiat')) return mockResponses.derivative;
  if (q.includes('solve') && q.includes('2x')) return `Let's solve **2x + 5 = 13** step by step.

## Step 1: Isolate the variable term

Subtract 5 from both sides:
\`\`\`
2x + 5 - 5 = 13 - 5
2x = 8
\`\`\`

## Step 2: Solve for x

Divide both sides by 2:
\`\`\`
x = 8 / 2 = 4
\`\`\`

## Verification

Check: 2(4) + 5 = 8 + 5 = 13 ✓

The answer is **x = 4**. Would you like to try another problem?`;
  return mockResponses.default;
}

export async function askAI(params: { session_id?: string; topic: string; question: string; level?: string; context?: string }): Promise<{ session_id: string; response: string }> {
  if (USE_MOCKS) {
    await delay(800);
    return { session_id: params.session_id ?? `session-${Date.now()}`, response: getMockResponse(params.question) };
  }
  const res = await fetch(`${API_BASE}/api/ai/tutor/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('AI request failed');
  return res.json();
}

export async function askAIStream(
  params: { session_id?: string; topic: string; question: string; level?: string; context?: string },
  onToken: (token: string) => void,
  onDone: (fullText: string, sessionId: string) => void,
  onError: (error: Error) => void
): Promise<void> {
  if (USE_MOCKS) {
    try {
      const fullResponse = getMockResponse(params.question);
      const sessionId = params.session_id ?? `session-${Date.now()}`;
      const tokens = fullResponse.match(/\S+\s*/g) ?? [fullResponse];
      for (const token of tokens) {
        await delay(20 + Math.random() * 40);
        onToken(token);
      }
      onDone(fullResponse, sessionId);
    } catch (err) {
      onError(err instanceof Error ? err : new Error('Stream failed'));
    }
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/ai/tutor/stream/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok || !res.body) throw new Error('Stream request failed');

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';
    let sessionId = params.session_id ?? '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.token) {
              fullText += data.token;
              onToken(data.token);
            }
            if (data.session_id) sessionId = data.session_id;
            if (data.done) onDone(fullText, sessionId);
          } catch {
            // skip malformed chunks
          }
        }
      }
    }
    if (fullText) onDone(fullText, sessionId);
  } catch (err) {
    onError(err instanceof Error ? err : new Error('Stream failed'));
  }
}

export async function getSessions(): Promise<AISession[]> {
  if (USE_MOCKS) {
    await delay(200);
    return [
      { id: 'session-1', topic: 'Quadratic Equations', preview: 'How do I solve x² - 5x + 6?', message_count: 4, created_at: '2026-08-28T14:00:00Z' },
      { id: 'session-2', topic: 'Calculus', preview: 'What is a derivative?', message_count: 6, created_at: '2026-08-27T10:00:00Z' },
      { id: 'session-3', topic: 'Trigonometry', preview: 'Explain the unit circle', message_count: 3, created_at: '2026-08-25T16:00:00Z' },
    ];
  }
  const res = await fetch(`${API_BASE}/api/ai/sessions/`);
  if (!res.ok) throw new Error('Failed to load sessions');
  return res.json();
}

export async function getSession(id: string): Promise<{ session: AISession; messages: ChatMessage[] }> {
  if (USE_MOCKS) {
    await delay(200);
    return {
      session: { id, topic: 'Quadratic Equations', preview: 'How do I solve x² - 5x + 6?', message_count: 4, created_at: '2026-08-28T14:00:00Z' },
      messages: [
        { id: 'm1', session_id: id, role: 'user', content: 'How do I solve x² - 5x + 6?', created_at: '2026-08-28T14:00:00Z' },
        { id: 'm2', session_id: id, role: 'assistant', content: mockResponses.quadratic, created_at: '2026-08-28T14:01:00Z' },
      ],
    };
  }
  const res = await fetch(`${API_BASE}/api/ai/sessions/${id}/`);
  if (!res.ok) throw new Error('Failed to load session');
  return res.json();
}
