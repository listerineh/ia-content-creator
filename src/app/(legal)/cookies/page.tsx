import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Política de Cookies | OpenStage',
  description: 'Información sobre el uso de cookies en OpenStage.',
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        <article className="prose prose-invert prose-zinc max-w-none">
          <h1 className="text-3xl font-bold text-white">Política de Cookies</h1>
          <p className="text-zinc-400">Última actualización: 12 de junio de 2026</p>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-white">1. ¿Qué son las Cookies?</h2>
            <p className="text-zinc-300">
              Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando
              visitas un sitio web. Se utilizan ampliamente para hacer que los sitios web funcionen
              de manera más eficiente y proporcionar información a los propietarios del sitio.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-white">2. Tipos de Cookies que Utilizamos</h2>

            <h3 className="text-lg font-medium text-zinc-200">2.1 Cookies Esenciales</h3>
            <p className="text-zinc-300">
              Estas cookies son necesarias para el funcionamiento básico de la plataforma. Sin
              ellas, no podrías navegar por el sitio ni usar funciones esenciales como el inicio de
              sesión.
            </p>
            <div className="mt-2 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="px-4 py-2 text-left text-zinc-400">Cookie</th>
                    <th className="px-4 py-2 text-left text-zinc-400">Propósito</th>
                    <th className="px-4 py-2 text-left text-zinc-400">Duración</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-300">
                  <tr className="border-b border-zinc-800/50">
                    <td className="px-4 py-2 font-mono text-xs">sb-*-auth-token</td>
                    <td className="px-4 py-2">Autenticación de usuario (Supabase)</td>
                    <td className="px-4 py-2">Sesión</td>
                  </tr>
                  <tr className="border-b border-zinc-800/50">
                    <td className="px-4 py-2 font-mono text-xs">cookie-consent</td>
                    <td className="px-4 py-2">Recordar tus preferencias de cookies</td>
                    <td className="px-4 py-2">1 año</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="mt-6 text-lg font-medium text-zinc-200">2.2 Cookies de Funcionalidad</h3>
            <p className="text-zinc-300">
              Estas cookies permiten recordar tus preferencias y personalizar tu experiencia en la
              plataforma.
            </p>
            <div className="mt-2 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="px-4 py-2 text-left text-zinc-400">Cookie</th>
                    <th className="px-4 py-2 text-left text-zinc-400">Propósito</th>
                    <th className="px-4 py-2 text-left text-zinc-400">Duración</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-300">
                  <tr className="border-b border-zinc-800/50">
                    <td className="px-4 py-2 font-mono text-xs">theme</td>
                    <td className="px-4 py-2">Preferencia de tema (oscuro/claro)</td>
                    <td className="px-4 py-2">1 año</td>
                  </tr>
                  <tr className="border-b border-zinc-800/50">
                    <td className="px-4 py-2 font-mono text-xs">wizard-state</td>
                    <td className="px-4 py-2">Estado del generador de clips</td>
                    <td className="px-4 py-2">7 días</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="mt-6 text-lg font-medium text-zinc-200">2.3 Cookies de Análisis</h3>
            <p className="text-zinc-300">
              Utilizamos cookies de análisis para entender cómo los usuarios interactúan con nuestra
              plataforma y mejorar nuestros servicios.
            </p>
            <div className="mt-2 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="px-4 py-2 text-left text-zinc-400">Cookie</th>
                    <th className="px-4 py-2 text-left text-zinc-400">Propósito</th>
                    <th className="px-4 py-2 text-left text-zinc-400">Duración</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-300">
                  <tr className="border-b border-zinc-800/50">
                    <td className="px-4 py-2 font-mono text-xs">_vercel_insights</td>
                    <td className="px-4 py-2">Análisis de rendimiento (Vercel Analytics)</td>
                    <td className="px-4 py-2">Sesión</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-white">3. Cookies de Terceros</h2>
            <p className="text-zinc-300">
              Algunos servicios de terceros que utilizamos pueden establecer sus propias cookies:
            </p>
            <ul className="list-disc pl-6 text-zinc-300">
              <li>
                <strong>Google:</strong> Para la autenticación con Google y la integración con
                Google Drive. Consulta la{' '}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 hover:text-violet-300"
                >
                  Política de Privacidad de Google
                </a>
              </li>
              <li>
                <strong>Supabase:</strong> Para la gestión de autenticación y base de datos.
                Consulta la{' '}
                <a
                  href="https://supabase.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 hover:text-violet-300"
                >
                  Política de Privacidad de Supabase
                </a>
              </li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-white">
              4. Gestionar tus Preferencias de Cookies
            </h2>
            <p className="text-zinc-300">
              Puedes gestionar tus preferencias de cookies de las siguientes maneras:
            </p>

            <h3 className="mt-4 text-lg font-medium text-zinc-200">4.1 Banner de Consentimiento</h3>
            <p className="text-zinc-300">
              Cuando visitas nuestra plataforma por primera vez, te mostramos un banner donde puedes
              aceptar, rechazar o configurar las cookies. Puedes cambiar tus preferencias en
              cualquier momento desde la configuración de tu cuenta.
            </p>

            <h3 className="mt-4 text-lg font-medium text-zinc-200">
              4.2 Configuración del Navegador
            </h3>
            <p className="text-zinc-300">
              La mayoría de los navegadores te permiten controlar las cookies a través de su
              configuración. Puedes configurar tu navegador para:
            </p>
            <ul className="list-disc pl-6 text-zinc-300">
              <li>Bloquear todas las cookies</li>
              <li>Aceptar solo cookies de sitios que visitas</li>
              <li>Eliminar cookies cuando cierras el navegador</li>
              <li>Navegar en modo privado/incógnito</li>
            </ul>
            <p className="mt-2 text-zinc-400 text-sm">
              Ten en cuenta que bloquear todas las cookies puede afectar el funcionamiento de la
              plataforma.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-white">5. Cambios a esta Política</h2>
            <p className="text-zinc-300">
              Podemos actualizar esta política de cookies ocasionalmente para reflejar cambios en
              las cookies que utilizamos o por otras razones operativas, legales o regulatorias.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-white">6. Más Información</h2>
            <p className="text-zinc-300">
              Para más información sobre cómo protegemos tu privacidad, consulta nuestra{' '}
              <Link href="/privacy" className="text-violet-400 hover:text-violet-300">
                Política de Privacidad
              </Link>
              .
            </p>
            <p className="mt-4 text-zinc-300">
              Si tienes preguntas sobre nuestra política de cookies, contáctanos en{' '}
              <a
                href="mailto:privacy@openstage.app"
                className="text-violet-400 hover:text-violet-300"
              >
                privacy@openstage.app
              </a>
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
