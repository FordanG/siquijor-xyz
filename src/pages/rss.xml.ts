import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '@/utils/constants';

export async function GET(context: { site: URL }) {
  const articles = await getCollection('articles', ({ data }) => !data.draft);

  const sortedArticles = articles.sort(
    (a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime()
  );

  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site,
    items: sortedArticles.map((article) => ({
      title: article.data.title,
      pubDate: article.data.publishDate,
      description: article.data.description,
      link: `/articles/${article.slug}/`,
      categories: [article.data.category, ...article.data.tags],
      author: article.data.author?.name || 'Siquijor.xyz Editorial Team',
    })),
    customData: `<language>en-us</language>`,
  });
}
