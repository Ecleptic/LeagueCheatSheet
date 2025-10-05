import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge'; // Optional: use edge runtime for better performance

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const pathString = path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `https://feed.lolesports.com/livestats/v1/${pathString}${searchParams ? `?${searchParams}` : ''}`;
  
  console.log(`[Livestats Proxy] Fetching: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LOLCheatSheet/1.0)',
      },
    });
    
    if (!response.ok) {
      console.error(`[Livestats Proxy] Error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `Livestats API error: ${response.status}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('[Livestats Proxy] Failed to fetch:', error);
    return NextResponse.json(
      { error: 'Failed to fetch livestats data' },
      { status: 500 }
    );
  }
}
