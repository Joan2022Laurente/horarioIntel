import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password, token } = body;

    // 1. Si el usuario ingresa Usuario/Código y Contraseña oficial de UTP
    if (username && password && typeof username === 'string' && typeof password === 'string') {
      const cleanUsername = username.trim().toLowerCase();
      
      const formParams = new URLSearchParams({
        client_id: 'pao-web',
        grant_type: 'password',
        username: cleanUsername,
        password: password.trim(),
        scope: 'openid roles-client-pao-web profile email roles-realm-xpedition',
      });

      const ssoRes = await fetch('https://sso.utp.edu.pe/auth/realms/Xpedition/protocol/openid-connect/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
        },
        body: formParams.toString(),
      });

      if (!ssoRes.ok) {
        const errorJson = await ssoRes.json().catch(() => ({}));
        const description = errorJson.error_description || '';
        
        let userMessage = 'Error al autenticar con el portal UTP.';
        if (errorJson.error === 'invalid_grant' || description.toLowerCase().includes('invalid user credentials')) {
          userMessage = 'Código de alumno o contraseña incorrectos en UTP.';
        } else if (errorJson.error === 'invalid_client') {
          userMessage = 'Cliente UTP temporalmente no disponible.';
        }

        return NextResponse.json(
          { success: false, error: userMessage, details: errorJson },
          { status: 401 }
        );
      }

      const tokenData = await ssoRes.json();
      const accessToken = tokenData.access_token;
      let studentName = cleanUsername.toUpperCase();
      let studentUserId = '4e535263-79a0-5890-ae33-72a7aa0629ab';
      let studentEmail = `${cleanUsername}@utp.edu.pe`;
      let studentCode = cleanUsername.toUpperCase();

      // Decodificar payload del JWT de Keycloak con roles completos
      if (accessToken && accessToken.includes('.')) {
        try {
          const parts = accessToken.split('.');
          if (parts.length === 3) {
            const payloadJson = Buffer.from(parts[1], 'base64').toString('utf-8');
            const payload = JSON.parse(payloadJson);
            if (payload.name) studentName = payload.name;
            if (payload.email) studentEmail = payload.email;
            if (payload.preferred_username) studentCode = payload.preferred_username.toUpperCase();
            
            // Si el token trae un claim de PAO userId específico
            if (payload.userId || payload.user_id || payload.paoUserId) {
              studentUserId = payload.userId || payload.user_id || payload.paoUserId;
            } else if (payload.sub && payload.sub !== '709837bc-ab2b-4c98-abb6-d1e9c49a5a8d') {
              // Si es otro usuario diferente al predeterminado
              studentUserId = payload.sub;
            }
          }
        } catch (jwtErr) {
          console.warn('Fallo decodificando JWT de Keycloak:', jwtErr);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Autenticación oficial UTP exitosa',
        user: {
          name: studentName,
          username: studentCode,
          email: studentEmail,
          userId: studentUserId,
          tenantId: 'a5f469d2-3c0e-5c68-8d32-5265923a8e40',
          role: 'STUDENT',
          token: accessToken,
          refreshToken: tokenData.refresh_token,
          expiresIn: tokenData.expires_in,
        },
      });
    }

    // 2. Si el usuario pasa un Bearer token manual
    if (token && typeof token === 'string' && token.includes('.')) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payloadJson = Buffer.from(parts[1], 'base64').toString('utf-8');
          const payload = JSON.parse(payloadJson);

          return NextResponse.json({
            success: true,
            user: {
              name: payload.name || payload.given_name || 'Estudiante UTP',
              username: (payload.preferred_username || username || 'uEstudiante').toUpperCase(),
              email: payload.email || `${username || 'alumno'}@utp.edu.pe`,
              userId: payload.sub || '4e535263-79a0-5890-ae33-72a7aa0629ab',
              tenantId: 'a5f469d2-3c0e-5c68-8d32-5265923a8e40',
              role: 'STUDENT',
              token: token.trim(),
            },
          });
        }
      } catch (e: unknown) {
        console.warn('Error decodificando JWT manual:', e);
      }
    }

    // 3. Fallback / Modo prueba
    return NextResponse.json({
      success: true,
      message: 'Sesión predeterminada configurada',
      user: {
        name: body.name || 'Joan Joaquin Callañaupa Laurente',
        username: (username || 'u23307609').toUpperCase(),
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

