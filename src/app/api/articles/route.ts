import { NextRequest, NextResponse } from 'next/server';
import { getArticles, getAllArticles, getArticleBySlug, createArticle } from '@/lib/articles';

export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get('slug');
    if (slug) {
      const article = getArticleBySlug(slug);
      if (!article) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }
      return NextResponse.json({ article });
    }
    const admin = request.nextUrl.searchParams.get('admin') === 'true';
    const articles = admin ? getAllArticles() : getArticles();
    return NextResponse.json({ articles });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const article = createArticle(body);
    return NextResponse.json({ article }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}
