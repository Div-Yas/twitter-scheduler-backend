type AiProvider = "openai" | "gemini" | "none";

const getProvider = (): AiProvider => {
  if (process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.OPENAI_API_KEY) return "openai";
  return "none";
};

const fallbackSuggestions = (topic: string): string[] => {
  const base = topic?.trim() ? topic.trim() : "productivity";
  return [
    `Quick tip on ${base}: Break tasks into tiny, winnable steps ✂️`,
    `On ${base}: Consistency beats intensity. 1% better every day. 📈`,
    `${base} myth: You need motivation first. Truth: Action creates motivation. 🔁`
  ];
};

const parseFirstJsonArray = (text: string): string[] | null => {
  try {
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");
    if (start !== -1 && end !== -1 && end > start) {
      const arr = JSON.parse(text.slice(start, end + 1));
      if (Array.isArray(arr) && arr.every(item => typeof item === "string")) {
        return arr;
      }
    }
  } catch {}
  return null;
};

const requestWithTimeout = async (input: RequestInfo, init: RequestInit, timeoutMs = 12000): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
};

const openAiSuggest = async (topic: string): Promise<string[] | null> => {
  const apiKey = process.env.OPENAI_API_KEY!;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const prompt = `Generate 3 concise tweet ideas about "${topic || "productivity"}". Return ONLY a JSON array of 3 strings, no extra text.`;
  const res = await requestWithTimeout("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "You are a helpful assistant that responds with strict JSON arrays when asked." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    })
  });
  if (!res.ok) return null;
  const data = await res.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  if (!content) return null;
  return parseFirstJsonArray(content);
};

const geminiSuggest = async (topic: string): Promise<string[] | null> => {
  const apiKey = process.env.GEMINI_API_KEY!;
  const model = process.env.GEMINI_MODEL || "models/gemini-1.5-flash";
  const prompt = `Generate 3 concise tweet ideas about "${topic || "productivity"}". Return ONLY a JSON array of 3 strings, no extra text.`;
  const url = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${apiKey}`;
  const res = await requestWithTimeout(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] })
  });
  if (!res.ok) return null;
  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;
  return parseFirstJsonArray(text);
};

export const getTweetSuggestions = async (topic: string): Promise<string[]> => {
  const provider = getProvider();
  try {
    if (provider === "openai") {
      const out = await openAiSuggest(topic);
      if (out && out.length >= 3) return out.slice(0, 3);
    } else if (provider === "gemini") {
      const out = await geminiSuggest(topic);
      if (out && out.length >= 3) return out.slice(0, 3);
    }
  } catch {}
  return fallbackSuggestions(topic);
};

export default getTweetSuggestions;

