import { NextResponse, type NextRequest } from 'next/server'

// O subdomínio aponta para este mesmo projeto na Vercel:
// revoleituras.revolutiontarot.com/ serve o conteúdo de app/revoleituras
export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? ''
  if (!host.startsWith('revoleituras.')) return NextResponse.next()

  const url = request.nextUrl.clone()
  url.pathname = `/revoleituras${url.pathname === '/' ? '' : url.pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  // Ignora API, assets do Next/Vercel e arquivos estáticos (imagens, fontes, favicon...)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
