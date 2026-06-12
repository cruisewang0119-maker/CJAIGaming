import { RedditPost } from './types';

let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.log('[reddit-client] REDDIT_CLIENT_ID not set — mock-only mode');
    return null;
  }

  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  try {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const res = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'PulseCity/1.0 (city intelligence demo)',
      },
      body: 'grant_type=client_credentials',
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { access_token: string; expires_in: number };
    cachedToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return cachedToken;
  } catch {
    return null;
  }
}

async function fetchWithBackoff(url: string, options: RequestInit, maxRetries = 3): Promise<Response | null> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.status === 429) {
        await new Promise((r) => setTimeout(r, Math.pow(2, attempt + 1) * 1000));
        continue;
      }
      return res;
    } catch {
      if (attempt < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, Math.pow(2, attempt + 1) * 1000));
      }
    }
  }
  return null;
}

export async function fetchLocalPosts(subreddits: string[], limit = 25): Promise<RedditPost[]> {
  const token = await getAccessToken();
  if (!token) return [];

  const posts: RedditPost[] = [];
  for (const subreddit of subreddits) {
    try {
      const res = await fetchWithBackoff(
        `https://oauth.reddit.com/r/${subreddit}/hot?limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'User-Agent': 'PulseCity/1.0 (city intelligence demo)',
          },
        },
      );
      if (!res || !res.ok) continue;
      const data = (await res.json()) as { data: { children: Array<{ data: RedditPost }> } };
      posts.push(...data.data.children.map((c) => c.data));
    } catch {
      // Silent failure — demo must never break
    }
  }
  return posts;
}
