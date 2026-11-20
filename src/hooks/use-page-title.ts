import { useEffect } from 'react'

const SITE_NAME = 'KONYHA'

/** Sets the browser tab title to "<title> | KONYHA", or just the site name while there is no title. */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME
    return () => {
      document.title = SITE_NAME
    }
  }, [title])
}
