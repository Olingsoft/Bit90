export const SITE_LOCALE = 'en-ke'
export const SITE_LOCALE_PREFIX = `/${SITE_LOCALE}`

export function withLocale(path = '/') {
  if (!path.startsWith('/')) {
    path = `/${path}`
  }

  const [pathnameWithQuery, hash] = path.split('#')
  const [pathname, search] = pathnameWithQuery.split('?')

  if (
    pathname === SITE_LOCALE_PREFIX ||
    pathname.startsWith(`${SITE_LOCALE_PREFIX}/`) ||
    pathname.startsWith('/admin')
  ) {
    return path
  }

  const localized = pathname === '/' ? SITE_LOCALE_PREFIX : `${SITE_LOCALE_PREFIX}${pathname}`
  const withQuery = search ? `${localized}?${search}` : localized
  return hash ? `${withQuery}#${hash}` : withQuery
}
