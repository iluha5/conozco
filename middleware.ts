export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    '/',
    '/words/:path*',
    '/training/:path*',
  ]
}

