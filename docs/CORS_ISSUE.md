# CORS Issue with Live Stats API

## Problem

The LoL Esports live statistics API (`https://feed.lolesports.com/livestats/v1/`) does **NOT** allow CORS requests from browsers. This means:

- ✅ Server-side requests work (Node.js, curl, server components)
- ❌ Client-side requests fail (browser fetch, client components)

## Current Architecture Issue

Our app currently fetches data **client-side**:
```typescript
// src/hooks/useEsports.ts
export function useEsportsLive() {
  useEffect(() => {
    async function fetchLiveMatches() {
      const data = await esportsApi.getCurrentLiveMatches(); // ❌ Runs in browser
      setMatches(data);
    }
    fetchLiveMatches();
  }, []);
}
```

The `esportsApi.getCurrentLiveMatches()` function tries to fetch from:
- ✅ `https://esports-api.lolesports.com/` - Has CORS headers, works in browser
- ❌ `https://feed.lolesports.com/` - NO CORS headers, fails in browser

## Solutions

### Option 1: API Route Proxy (Recommended)

Create a Next.js API route that proxies the livestats requests:

**Create `/app/api/esports/livestats/[...path]/route.ts`:**
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `https://feed.lolesports.com/livestats/v1/${path}${searchParams ? `?${searchParams}` : ''}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch livestats' },
      { status: 500 }
    );
  }
}
```

Then update API calls to use the proxy:
```typescript
// Instead of:
const url = `https://feed.lolesports.com/livestats/v1/window/${gameId}`;

// Use:
const url = `/api/esports/livestats/window/${gameId}`;
```

### Option 2: Server Components

Use Next.js Server Components to fetch data server-side:

**Convert `/app/esports/page.tsx` to a Server Component:**
```typescript
// Remove 'use client'
import { esportsApi } from '@/lib/esports/api';

export default async function EsportsPage() {
  const liveMatches = await esportsApi.getCurrentLiveMatches();
  
  return (
    <EsportsClient initialMatches={liveMatches} />
  );
}
```

Then create a client component for interactivity.

### Option 3: Server Actions (Next.js 14+)

Use server actions for data fetching:

```typescript
'use server';

export async function fetchLiveMatches() {
  return await esportsApi.getCurrentLiveMatches();
}
```

## Why This Happens

CORS (Cross-Origin Resource Sharing) is a browser security feature. The browser blocks requests to `feed.lolesports.com` because that API doesn't send the required CORS headers:

```
Access-Control-Allow-Origin: *
```

Server-side code (Node.js, Next.js API routes) doesn't have this restriction.

## Recommended Implementation

**API Route Proxy** is the best solution because:
1. ✅ Works with client components
2. ✅ Allows client-side polling/refreshing
3. ✅ Can add caching
4. ✅ Minimal code changes
5. ✅ Keeps the current hook-based architecture

## Testing CORS

You can test if CORS is the issue by checking browser console for errors like:

```
Access to fetch at 'https://feed.lolesports.com/livestats/v1/...' 
from origin 'http://localhost:3000' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Next Steps

1. Check browser console for CORS errors
2. Implement API route proxy
3. Update API calls to use proxy endpoints
4. Test with live NACL game
