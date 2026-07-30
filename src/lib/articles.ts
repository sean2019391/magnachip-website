import fs from 'fs'
import path from 'path'
import type { Article } from '@/types/article'

const DATA_DIR = path.join(process.cwd(), 'data')
const DATA_FILE = path.join(DATA_DIR, 'articles.json')

function ensureDataFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]', 'utf-8')
  }
}

function readData(): Article[] {
  ensureDataFile()
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8')
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function writeData(articles: Article[]): void {
  ensureDataFile()
  fs.writeFileSync(DATA_FILE, JSON.stringify(articles, null, 2), 'utf-8')
}

export function getArticles(): Article[] {
  const articles = readData()
  return articles
    .filter((a) => a.published !== false)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getAllArticles(): Article[] {
  const articles = readData()
  return articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getArticle(id: string): Article | null {
  const articles = readData()
  return articles.find((a) => a.id === id) ?? null
}

export function getArticleBySlug(slug: string): Article | null {
  const articles = readData()
  return articles.find((a) => a.slug === slug && a.published !== false) ?? null
}

export function createArticle(
  data: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>
): Article {
  const articles = readData()
  const now = new Date().toISOString()
  const article: Article = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  }
  articles.push(article)
  writeData(articles)
  return article
}

export function updateArticle(
  id: string,
  data: Partial<Omit<Article, 'id' | 'createdAt'>>
): Article | null {
  const articles = readData()
  const index = articles.findIndex((a) => a.id === id)
  if (index === -1) return null
  articles[index] = {
    ...articles[index],
    ...data,
    updatedAt: new Date().toISOString(),
  }
  writeData(articles)
  return articles[index]
}

export function deleteArticle(id: string): boolean {
  const articles = readData()
  const index = articles.findIndex((a) => a.id === id)
  if (index === -1) return false
  articles.splice(index, 1)
  writeData(articles)
  return true
}
