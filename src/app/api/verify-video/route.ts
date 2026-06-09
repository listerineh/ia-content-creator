import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { accessible: false, error: 'URL no proporcionada' },
        { status: 400 }
      );
    }

    // Hacer una petición HEAD para verificar acceso sin descargar el archivo
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
    });

    if (!response.ok) {
      // Intentar con GET si HEAD falla (algunos servidores no soportan HEAD)
      const getResponse = await fetch(url, {
        method: 'GET',
        headers: {
          Range: 'bytes=0-0', // Solo pedir 1 byte para verificar acceso
        },
      });

      if (!getResponse.ok) {
        return NextResponse.json({
          accessible: false,
          error: 'No se puede acceder al video. Verifica que el enlace sea público.',
        });
      }

      const contentType = getResponse.headers.get('content-type');
      const contentLength = getResponse.headers.get('content-length');
      const contentRange = getResponse.headers.get('content-range');

      // Extraer tamaño total del content-range si está disponible
      let totalSize: number | undefined;
      if (contentRange) {
        const match = contentRange.match(/\/(\d+)$/);
        if (match) {
          totalSize = parseInt(match[1], 10);
        }
      }

      return NextResponse.json({
        accessible: true,
        contentType: contentType || undefined,
        contentLength: totalSize || (contentLength ? parseInt(contentLength, 10) : undefined),
      });
    }

    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');

    // Verificar que sea un tipo de video válido
    const validVideoTypes = [
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-matroska',
      'application/octet-stream', // Google Drive a veces devuelve esto
    ];

    const isVideo =
      !contentType || validVideoTypes.some(type => contentType.includes(type.split('/')[0]));

    if (!isVideo && contentType && !contentType.includes('video')) {
      return NextResponse.json({
        accessible: false,
        error: `El archivo no parece ser un video (tipo: ${contentType})`,
      });
    }

    return NextResponse.json({
      accessible: true,
      contentType: contentType || undefined,
      contentLength: contentLength ? parseInt(contentLength, 10) : undefined,
    });
  } catch (error) {
    console.error('Error verifying video:', error);
    return NextResponse.json({
      accessible: false,
      error: 'Error al verificar el video. El enlace puede no ser válido.',
    });
  }
}
