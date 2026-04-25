export function useSmoothScroll() {
  const scrollTo = (event: MouseEvent) => {
    const anchor = event.currentTarget as HTMLAnchorElement | null
    const href = anchor?.getAttribute('href') ?? ''
    if (!href.startsWith('#')) return

    const id = href.slice(1)
    if (!id) return

    const el = document.getElementById(id)
    if (!el) return

    event.preventDefault()
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return { scrollTo }
}
