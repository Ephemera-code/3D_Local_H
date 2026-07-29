import { useEffect, useState } from 'react'
import { siInstagram, siWhatsapp } from 'simple-icons'

// 🖼️ Los assets dentro de /public NO se importan como módulo de JS (Vite no
// lo permite) — se sirven directo desde la raíz del sitio como string.
const LOGO_URL = '/logoH.png'

interface HomeOverlayProps {
  visible: boolean
}

export function HomeOverlay({ visible }: HomeOverlayProps) {
  // 🟢🔴 Estado real de abierto/cerrado, controlado por vos desde el bot de
  // Telegram. null = todavía no llegó la respuesta (mostramos algo neutro
  // mientras carga, para no afirmar "abierto" antes de saberlo con certeza).
  const [abierto, setAbierto] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelado = false

    fetch('/api/estado')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelado) setAbierto(data.abierto)
      })
      .catch(() => {
        // Si falla la consulta (sin internet, función caída, etc.), no
        // dejamos el badge colgado — asumimos "abierto" como fallback
        // seguro para no espantar clientes por un problema técnico nuestro.
        if (!cancelado) setAbierto(true)
      })

    return () => {
      cancelado = true
    }
  }, [])

  if (!visible) return null

  return (
    <>
      {/* Wordmark: chico, centrado arriba, no interfiere con el drag de la escena */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none select-none">
        <h1 className="text-[clamp(2.50rem,3vw,3rem)] fontGaleriaSemiBold uppercase flex items-center text-white m-0 leading-none">
          HAMBR
          
          {/* Contenedor relativo SOLO para la E y el ícono */}
          <span className="relative font-especial mb-0.5 inline-block">
            {/* La E invertida */}
            <span className="inline-block ml-0.5 -scale-x-100">E</span>
            
            {/* El ícono */}
            <img
              src={LOGO_URL}
              alt="Fuego"
              className="absolute -top-[50%] -right-[60%] w-[0.8em] h-[0.8em] rotate-45 object-contain"
            />
          </span>
        </h1>
      </div>

      {/* Ticket de mostrador: horario + redes..
          Envuelto en un wrapper con gradiente para simular un borde "iluminado"
          (padding trick: el gradiente vive en el fondo del wrapper, y la
          tarjeta interna con el fondo oscuro real deja ver solo 1px de ese
          gradiente como borde). Sumamos un glow cálido y una insignia de
          estado para que se sienta "vivo", no plano. */}
      <div
        className="absolute bottom-[20dvh] left-2 z-40  select-none pointer-events-auto"
        aria-label="Horario y redes"
      >
        <div
          className="w-72 rounded-xl p-[1px] shadow-[0_8px_32px_-8px_rgba(255,69,0,0.35)]"
          style={{
            background: 'linear-gradient(135deg, rgba(255,69,0,0.6), rgba(245,158,11,0.15) 40%, rgba(39,39,42,0.4) 70%)'
          }}
        >
          <div className="w-full h-full rounded-[11px] bg-zinc-950/95  p-2 flex flex-col gap-2">

            {/* Insignia de estado — ahora conectada al estado real */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  {abierto && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      abierto === null ? 'bg-zinc-600' : abierto ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                  ></span>
                </span>
                <span
                  className={`text-[10px] font-mono uppercase tracking-widest ${
                    abierto === null ? 'text-zinc-500' : abierto ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {abierto === null ? 'Cargando...' : abierto ? 'Abierto ahora' : 'Cerrado ahora'}
                </span>
              </div>
              <img src={LOGO_URL} alt="" className="w-4 h-4 object-contain opacity-80" />
            </div>

            {/* Cabecera / Horarios */}
            <div className="flex flex-col gap-1.5 pb-2.5 relative">
              {/* Línea divisoria con degradado en vez de gris plano */}
              <div
                className="absolute -bottom-0 left-0 right-0 h-px"
                style={{
                  background: 'linear-gradient(to right, rgba(255,69,0,0.5), rgba(39,39,42,0.2))'
                }}
              />
              <div className="flex items-center gap-2 text-white text-xs font-mono font-semibold">
                <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Lun a Dom: 20:00 - 00:00 hs</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-300 text-xs font-mono">
                <svg className="w-3.5 h-3.5 text-[#ff4500] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Benavidez, Buenos Aires</span>
              </div>
              <span className='ml-5 text-zinc-300 text-xs font-mono'> A.Perna 1630 Benavidez</span>
            </div>

            {/* Redes Sociales y Acciones */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                Seguinos / Pedidos
              </span>

              <div className="flex items-center gap-2">
                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-zinc-800 text-white hover:bg-[#E4405F] hover:text-white transition-colors shadow-sm"
                  aria-label="Instagram"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d={siInstagram.path} />
                  </svg>
                </a>

                {/* WhatsApp */}
                <a
                  href="https://whatsapp.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-zinc-800 text-white hover:bg-[#25D366] hover:text-white transition-colors shadow-sm"
                  aria-label="WhatsApp"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d={siWhatsapp.path} />
                  </svg>
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}