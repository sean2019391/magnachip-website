import { NextResponse } from 'next/server';
import { getAllArticles, createArticle } from '@/lib/articles';

export async function GET() {
  try {
    const articles = getAllArticles();
    return NextResponse.json({ articles });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to load articles' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const article = createArticle(body as any);
    return NextResponse.json({ article }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}
