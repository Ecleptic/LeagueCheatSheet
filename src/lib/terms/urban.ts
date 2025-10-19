export interface UrbanDefinition {
  definition: string;
  permalink: string;
  thumbs_up: number;
  thumbs_down: number;
  author: string;
  word: string;
  example?: string;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000;

export async function fetchUrbanDefinitions(term: string): Promise<UrbanDefinition[]> {
  const cacheKey = `urban:${term.toLowerCase()}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    const now = Date.now();
    if (cached) {
      const parsed = JSON.parse(cached);
      if (now - parsed.timestamp < CACHE_DURATION) {
        return parsed.data as UrbanDefinition[];
      }
    }
  } catch (err) {
    // ignore cache errors
  }

  try {
    const url = `https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(term)}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const defs: UrbanDefinition[] = (data.list || []).map((d: any) => ({
      definition: d.definition,
      permalink: d.permalink,
      thumbs_up: d.thumbs_up,
      thumbs_down: d.thumbs_down,
      author: d.author,
      word: d.word,
      example: d.example
    }));

    try {
      localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: defs }));
    } catch (err) {
      // ignore write errors
    }

    return defs;
  } catch (err) {
    console.warn('Urban fetch failed:', err);
    return [];
  }
}