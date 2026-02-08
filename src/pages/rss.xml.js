import rss from '@astrojs/rss'
import sanitizeHtml from 'sanitize-html'

export async function GET(context) {
  const postImportResult = import.meta.glob('./blog/*.md', { eager: true });
  const posts = Object.values(postImportResult)

  return rss({
    title: 'maxmntl',
    description: 'Maximilien Monteil\'s written thoughts and ideas.',
    site: context.site,
    trailingSlash: false,
    stylesheet: '/rss/styles.xsl',
    items: await Promise.all(posts
      .toSorted((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
      .map(async (post) => ({
        link: post.url,
        author: 'Maximilien Monteil',
        content: sanitizeHtml((await post.compiledContent())),
        ...post.frontmatter,
      })),
    ),
    customData: `<language>en-us</language>`,
  })
}
