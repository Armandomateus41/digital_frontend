import type { Response } from 'express'

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'auth'
const AUTH_COOKIE_SECURE = String(process.env.AUTH_COOKIE_SECURE || 'false') === 'true'
const AUTH_COOKIE_SAMESITE = (process.env.AUTH_COOKIE_SAMESITE as 'Lax' | 'Strict' | 'None') || 'Lax'
const AUTH_COOKIE_MAX_AGE = Number(process.env.AUTH_COOKIE_MAX_AGE || 1800)
const AUTH_COOKIE_DOMAIN = process.env.AUTH_COOKIE_DOMAIN

export function setAuthCookie(res: Response, token: string) {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: AUTH_COOKIE_SECURE,
    sameSite: AUTH_COOKIE_SAMESITE,
    maxAge: AUTH_COOKIE_MAX_AGE * 1000,
    domain: AUTH_COOKIE_DOMAIN,
    path: '/',
  })
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(AUTH_COOKIE_NAME, { path: '/' })
  res.clearCookie('role', { path: '/' })
}


