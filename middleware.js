import { NextResponse } from 'next/server';

export function middleware(request) {
  // Verificar si la ruta es /home
  if (request.nextUrl.pathname === '/home') {
    // Verificar si hay token en las cookies
    const token = request.cookies.get('token');
    
    // Si no hay token, redirigir a la página principal
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

// Configurar las rutas que deben pasar por el middleware
export const config = {
  matcher: ['/home']
}; 