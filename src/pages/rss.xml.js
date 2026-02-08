import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'

import sanitizeHtml from 'sanitize-html'
import MarkdownIt from 'markdown-it'

const parser = new MarkdownIt()

export async function GET(context) {
  const blog = await getCollection('blog')

  return rss({
    title: 'maxmntl',
    description: 'Maximilien Monteil\'s written thoughts and ideas.',
    site: context.site,
    trailingSlash: false,
    stylesheet: '/rss/styles.xsl',
    items: blog
      .toSorted((a, b) => b.data.pubDate - a.data.pubDate)
      .map(post => ({
        title: post.data.title,
        pubDate: post.data.pubDate,
        description: post.data.description,
        link: `/blog/${post.id}`,
        author: 'Maximilien Monteil',
        content: sanitizeHtml(parser.render(post.body), {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
        }),
      })),
    customData: '<language>en-us</language>',
  })
}
