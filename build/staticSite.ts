import type { Plugin } from 'vite'

export const SITE_TITLE = 'Typing for Kids — Free Typing Practice for Kids'
export const SITE_DESCRIPTION = 'Free typing practice for kids with animal themes, easy words, keyboard lessons, and instant feedback. No account or subscription needed.'


function configuredOrigin(value: string | undefined, source: string, production: boolean): string | undefined {
  if (value === undefined || value.trim() === '') return undefined

  let parsed: URL
  try {
    parsed = new URL(value.trim())
  } catch {
    throw new Error(`Invalid ${source}: expected an absolute http(s) origin (for example, https://example.com/)`)
  }

  const localHttp = parsed.protocol === 'http:' && (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1' || parsed.hostname === '[::1]')
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`Invalid ${source}: protocol must be http or https`)
  }
  if (parsed.username || parsed.password) {
    throw new Error(`Invalid ${source}: credentials are not allowed`)
  }
  if (parsed.pathname !== '/') {
    throw new Error(`Invalid ${source}: path must be / (origins cannot include a path)`)
  }
  if (parsed.search || parsed.hash) {
    throw new Error(`Invalid ${source}: query strings and fragments are not allowed`)
  }
  if (production && parsed.protocol !== 'https:' && !localHttp) {
    throw new Error(`Invalid ${source}: production origins must use https`)
  }

  return parsed.origin
}

function getOrigin(env: NodeJS.ProcessEnv): string | undefined {
  const context = env.CONTEXT
  const siteUrl = env.SITE_URL?.trim()
  const value = siteUrl || env.URL
  return configuredOrigin(value, siteUrl ? 'SITE_URL' : 'URL', context === 'production')
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!)
}

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[character]!)
}

function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/[<>&\u2028\u2029]/g, (character) => ({ '<': '\\u003C', '>': '\\u003E', '&': '\\u0026', '\u2028': '\\u2028', '\u2029': '\\u2029' })[character]!)
}

function headMarkup(origin: string | undefined, preview: boolean): string {
  const canonical = origin ? `${origin}/` : undefined
  const appUrl = origin ? `${origin}/app/` : undefined
  const tags = [
    '<meta name="theme-color" content="#f3f8f5">',
    '<link rel="icon" href="/favicon.svg" type="image/svg+xml">',
    preview ? '<meta name="robots" content="noindex,nofollow">' : '<meta name="robots" content="index,follow">',
  ]

  if (canonical) {
    const title = escapeHtml(SITE_TITLE)
    const description = escapeHtml(SITE_DESCRIPTION)
    const image = `${origin}/social-card.png`
    tags.push(
      `<link rel="canonical" href="${escapeHtml(canonical)}">`,
      `<meta property="og:title" content="${title}">`,
      `<meta property="og:description" content="${description}">`,
      '<meta property="og:type" content="website">',
      `<meta property="og:url" content="${escapeHtml(canonical)}">`,
      `<meta property="og:image" content="${escapeHtml(image)}">`,
      '<meta property="og:image:width" content="1200">',
      '<meta property="og:image:height" content="630">',
      '<meta property="og:image:alt" content="Typing for Kids with a colorful keyboard">',
      `<meta name="twitter:title" content="${title}">`,
      `<meta name="twitter:description" content="${description}">`,
      '<meta name="twitter:card" content="summary_large_image">',
      `<meta name="twitter:image" content="${escapeHtml(image)}">`,
      `<script type="application/ld+json">${safeJson({
        '@context': 'https://schema.org',
        '@graph': [
          { '@type': 'WebSite', name: SITE_TITLE, url: canonical },
          { '@type': 'WebApplication', name: SITE_TITLE, url: appUrl, applicationCategory: 'EducationalApplication', operatingSystem: 'Web', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
        ],
      })}</script>`,
    )
  }

  return tags.join('\n    ')
}

export function staticSite(): Plugin {
  const env = process.env
  const context = env.CONTEXT
  const origin = getOrigin(env)
  const preview = context === 'deploy-preview' || context === 'branch-deploy'

  return {
    name: 'static-site-seo',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (ctx.path !== '/' && ctx.path !== '/index.html') return html
        const injection = headMarkup(origin, preview)
        return html.replace('</head>', `    ${injection}\n  </head>`)
      },
    },
    generateBundle() {
      const robots = preview
        ? 'User-agent: *\nDisallow: /\n'
        : `User-agent: *\nAllow: /\n${origin ? `Sitemap: ${origin}/sitemap.xml\n` : ''}`
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots })

      if (origin) {
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escapeXml(`${origin}/`)}</loc></url></urlset>\n`,
        })
      }
    },
  }
}
