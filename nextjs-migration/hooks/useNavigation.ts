import { useRouter } from 'next/router'
import { useCallback } from 'react'

export interface NavigationOptions {
  replace?: boolean
  scroll?: boolean
  shallow?: boolean
}

export interface NavigationHook {
  navigate: (path: string, options?: NavigationOptions) => Promise<boolean>
  back: () => void
  forward: () => void
  refresh: () => void
  push: (path: string, as?: string, options?: NavigationOptions) => Promise<boolean>
  replace: (path: string, as?: string, options?: NavigationOptions) => Promise<boolean>
  pathname: string
  query: Record<string, string | string[] | undefined>
  asPath: string
  isReady: boolean
}

export function useNavigation(): NavigationHook {
  const router = useRouter()

  const navigate = useCallback(
    async (path: string, options: NavigationOptions = {}): Promise<boolean> => {
      if (options.replace) {
        return router.replace(path, undefined, options)
      } else {
        return router.push(path, undefined, options)
      }
    },
    [router]
  )

  const back = useCallback(() => {
    router.back()
  }, [router])

  const forward = useCallback(() => {
    router.forward ? router.forward() : window.history.forward()
  }, [router])

  const refresh = useCallback(() => {
    router.reload()
  }, [router])

  const push = useCallback(
    async (path: string, as?: string, options: NavigationOptions = {}): Promise<boolean> => {
      return router.push(path, as, options)
    },
    [router]
  )

  const replace = useCallback(
    async (path: string, as?: string, options: NavigationOptions = {}): Promise<boolean> => {
      return router.replace(path, as, options)
    },
    [router]
  )

  return {
    navigate,
    back,
    forward,
    refresh,
    push,
    replace,
    pathname: router.pathname,
    query: router.query,
    asPath: router.asPath,
    isReady: router.isReady,
  }
}