import rss, { pagesGlobToRssItems } from '@astrojs/rss';

export async function GET(context) {
  return rss({
    title: 'maxmntl | Blog',
    description: 'Maximilien Monteil\'s written thoughts and ideas.',
    site: context.site,
    items: (await pagesGlobToRssItems(import.meta.glob('./blog/*.md')))
      .toSorted((a, b) => new Date(b.pubDate) - new Date(a.pubDate)),
    customData: `<language>en-us</language>`,
  });
}
