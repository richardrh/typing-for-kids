import { describe, expect, it } from 'vitest'
import { deploymentConfig } from './deployment'

describe('static hosting paths', () => {
  it('uses root history routes for the existing Netlify deployment', () => {
    expect(deploymentConfig({})).toEqual({ base: '/', hashRouting: false, appUrl: '/app/' })
  })

  it('normalizes project-site paths and puts lesson routes inside the fragment', () => {
    const deployment = deploymentConfig({ BASE_PATH: '/typing-for-kids', VITE_ROUTER_MODE: 'hash' })
    const lesson = new URL(`${deployment.appUrl}lessons/easy-animal-words?theme=tiger`, 'https://reader.github.io')
    expect(deployment.base).toBe('/typing-for-kids/')
    expect(lesson.pathname).toBe('/typing-for-kids/app/')
    expect(lesson.hash).toBe('#/lessons/easy-animal-words?theme=tiger')
    expect(lesson.search).toBe('')
  })

  it('supports user sites and custom-domain root deployments with hash routes', () => {
    expect(deploymentConfig({ BASE_PATH: '', VITE_ROUTER_MODE: 'hash' }).appUrl).toBe('/app/#/')
  })

  it.each(['https://wrong.example/', '//wrong.example/', '/../app/', '/repo/../app/', '/repo?redirect=x/', '/bad<script>/'])('rejects a non-site base path: %s', base => {
    expect(() => deploymentConfig({ BASE_PATH: base })).toThrow(/BASE_PATH/)
  })

  it('rejects unknown routing modes instead of shipping broken links', () => {
    expect(() => deploymentConfig({ VITE_ROUTER_MODE: 'invalid' })).toThrow(/VITE_ROUTER_MODE/)
  })
})
