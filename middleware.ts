import { NextRequest, NextResponse } from 'next/server'
import { SITE_LOCALE, SITE_LOCALE_PREFIX } from '@/lib/locale'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next()
  }

  if (pathname === SITE_LOCALE_PREFIX || pathname.startsWith(`${SITE_LOCALE_PREFIX}/`)) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.slice(SITE_LOCALE_PREFIX.length) || '/'
    return NextResponse.rewrite(url)
  }

  const url = request.nextUrl.clone()
  url.pathname = pathname === '/' ? SITE_LOCALE_PREFIX : `${SITE_LOCALE_PREFIX}${pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
