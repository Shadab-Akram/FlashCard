import * as React from "react"

const MOBILE_BREAKPOINT = 768

// General media query hook
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    
    // Initial check
    setMatches(mediaQuery.matches)
    
    // Watch for changes
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }
    
    mediaQuery.addEventListener("change", listener)
    return () => mediaQuery.removeEventListener("change", listener)
  }, [query])

  return matches
}

// Mobile-specific hook for convenience
export function useIsMobile() {
  const isMobile = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
  return isMobile
}
