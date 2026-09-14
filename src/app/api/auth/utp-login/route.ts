import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, username } = body;

    // Si el usuario pasa un Bearer token directo
    if (token && typeof token === 'string') {
      try {
        // Parsear JWT payload básico sin verificar firma externa
        const parts = token.split('.');
        if (parts.length === 3) {
          const payloadJson = Buffer.from(parts[1], 'base64').toString('utf-8');
          const payload = JSON.parse(payloadJson);

          return NextResponse.json({
            success: true,
            user: {
              name: payload.name || payload.given_name || 'Estudiante UTP',
              username: payload.preferred_username || username || 'uEstudiante',
              email: payload.email || `${username}@utp.edu.pe`,
              userId: payload.sub || '4e535263-79a0-5890-ae33-72a7aa0629ab',
              tenantId: 'a5f469d2-3c0e-5c68-8d32-5265923a8e40',
              role: 'STUDENT',
              token: token.trim(),
            },
          });
        }
      } catch (e: unknown) {
        console.warn('Error decodificando JWT:', e);
      }
    }

    // Modo simulación / Login con credenciales UTP
    return NextResponse.json({
      success: true,
      message: 'Sesión configurada correctamente',
      user: {
        name: body.name || 'Joan Joaquin Callañaupa Laurente',
        username: username || 'u23307609',
        email: body.email || `${username || 'u23307609'}@utp.edu.pe`,
        userId: '4e535263-79a0-5890-ae33-72a7aa0629ab',
        tenantId: 'a5f469d2-3c0e-5c68-8d32-5265923a8e40',
        role: 'STUDENT',
        token: token || undefined,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error en autenticación';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
