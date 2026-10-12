export interface DeploymentConfig {
  readonly base: string
  readonly hashRouting: boolean
  readonly appUrl: string
}

export function deploymentConfig(env: NodeJS.ProcessEnv = process.env): DeploymentConfig {
  const value = env.BASE_PATH?.trim() ?? ''
  const parts = value.split('/').filter(Boolean)
  if (parts.some(part => !/^[A-Za-z0-9._-]+$/.test(part) || part === '.' || part === '..') || value.startsWith('//')) {
    throw new Error('BASE_PATH must be a site path such as /typing-for-kids/, not a URL or traversal path')
  }
  const base = parts.length ? `/${parts.join('/')}/` : '/'
  const mode = env.VITE_ROUTER_MODE ?? 'history'
  if (mode !== 'history' && mode !== 'hash') throw new Error('VITE_ROUTER_MODE must be history or hash')
  const hashRouting = mode === 'hash'
  return { base, hashRouting, appUrl: `${base}app/${hashRouting ? '#/' : ''}` }
}
