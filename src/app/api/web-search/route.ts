
import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(req: NextRequest) {
  try {
    const { query, engine = 'google' } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    let searchUrl = '';
    let searchEngine = '';
    let resultSelector = '';
    let titleSelector = '';
    let linkSelector = '';
    let snippetSelector = '';

    switch (engine.toLowerCase()) {
      case 'bing':
        searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
        searchEngine = 'Bing';
        resultSelector = '.b_algo';
        titleSelector = 'h2';
        linkSelector = 'a';
        snippetSelector = '.b_caption p';
        break;
      case 'duckduckgo':
        searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
        searchEngine = 'DuckDuckGo';
        resultSelector = '.result';
        titleSelector = '.result__title a';
        linkSelector = '.result__url';
        snippetSelector = '.result__snippet';
        break;
      case 'google':
      default:
        searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        searchEngine = 'Google';
        resultSelector = 'div.g';
        titleSelector = 'h3';
        linkSelector = 'a';
        snippetSelector = 'div.VwiC3b';
        break;
    }

    await page.goto(searchUrl, { waitUntil: 'networkidle2' });

    const results = await page.evaluate((resultSelector, titleSelector, linkSelector, snippetSelector) => {
        const items = Array.from(document.querySelectorAll(resultSelector));
        return items.map(item => {
            const title = (item.querySelector(titleSelector) as HTMLElement)?.innerText;
            const link = (item.querySelector(linkSelector) as HTMLAnchorElement)?.href;
            const snippet = (item.querySelector(snippetSelector) as HTMLElement)?.innerText;

            return { title, link, snippet };
        }).filter(item => item.title && item.link);
    }, resultSelector, titleSelector, linkSelector, snippetSelector);

    await browser.close();

    return NextResponse.json({
      message: `Successfully performed search for "${query}" on ${searchEngine}.`,
      results,
    });
  } catch (error) {
    console.error('Error during web search:', error);
    return NextResponse.json({ error: 'Failed to perform web search' }, { status: 500 });
  }
}
