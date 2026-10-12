import { afterEach, describe, expect, it } from 'vitest'
import { staticSite } from './staticSite'

const originalEnv = { ...process.env }

afterEach(() => {
  process.env = { ...originalEnv }
})

function transformRoot(): string {
  const plugin = staticSite()
  const transform = plugin.transformIndexHtml
  if (!transform || typeof transform !== 'object' || !('handler' in transform)) throw new Error('unexpected transform hook shape')
  return transform.handler('<html><head></head><body></body></html>', { path: '/index.html', filename: '/project/index.html' } as never) as string
}

describe('staticSite', () => {
  it('rejects unsafe configured origins', () => {
    process.env.SITE_URL = 'https://example.com/landing?x=1'
    expect(() => staticSite()).toThrow(/path must be \/|query strings/)
  })

  it('omits URL-bearing metadata without a local origin', () => {
    delete process.env.SITE_URL
    delete process.env.URL
    delete process.env.CONTEXT
    const html = transformRoot()
    expect(html).toContain('name="robots" content="index,follow"')
    expect(html).not.toContain('rel="canonical"')
    expect(html).not.toContain('og:url')
    expect(html).not.toContain('application/ld+json')
  })

  it('prefers SITE_URL over Netlify URL and emits production metadata', () => {
    process.env.CONTEXT = 'production'
    process.env.SITE_URL = 'https://typing.example'
    process.env.URL = 'https://netlify.example'
    const html = transformRoot()
    expect(html).toContain('href="https://typing.example/"')
    expect(html).not.toContain('netlify.example')
    expect(html).toContain('https://typing.example/social-card.png')
    expect(html).toContain('application/ld+json')
  })

  it('marks deploy previews noindex and disallows crawling', () => {
    process.env.CONTEXT = 'deploy-preview'
    process.env.URL = 'https://preview.example'
    const html = transformRoot()
    expect(html).toContain('name="robots" content="noindex,nofollow"')

    const bundle = { emitFile: (file: { source?: string; fileName: string }) => {
      if (file.fileName === 'robots.txt') expect(file.source).toBe('User-agent: *\nDisallow: /\n')
    } }
    const hook = staticSite().generateBundle
    if (typeof hook !== 'function') throw new Error('unexpected generateBundle hook shape')
    hook.call(bundle as never, {} as never, {}, false)
  })

  it('emits parseable JSON-LD inside a script-safe HTML document', () => {
    process.env.SITE_URL = 'https://safe.example'
    const html = transformRoot()
    const json = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1]
    const data = JSON.parse(json!)
    expect(data['@graph']).toContainEqual(expect.objectContaining({
      '@type': 'WebApplication',
      url: 'https://safe.example/app/',
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    }))
  })
})
