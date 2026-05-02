export const BASE_URL = process.env.CTFD_BASE_URL!
export const NGINX_SECRET = process.env.NGINX_INTERNAL_SECRET!
const ADMIN_TOKEN = process.env.CTFD_ADMIN_TOKEN!

/**
 * Headers para peticiones privilegiadas (Admin).
 * Se usa para crear usuarios, listar todos los retos ocultos, etc.
 */
export function getAdminHeaders(): HeadersInit {
  return {
    'Authorization': `Token ${ADMIN_TOKEN}`,
    'Content-Type': 'application/json',
    'x-internal-key': NGINX_SECRET,
  }
}

/**
 * Headers para peticiones en nombre del usuario autenticado.
 * @param sessionCookie La cookie de sesión de CTFd ("session=...")
 * @param csrfToken Requerido para POST/PATCH/DELETE. Opcional para GET.
 */
export function getUserHeaders(sessionCookie: string, csrfToken?: string): HeadersInit {
  const headers: Record<string, string> = {
    'Cookie': sessionCookie,
    'Content-Type': 'application/json',
    'x-internal-key': NGINX_SECRET,
  }

  // Si pasamos el CSRF Token (necesario para mutaciones o compras de hints), lo inyecta
  if (csrfToken) {
    headers['CSRF-Token'] = csrfToken
  }

  return headers
}
