import { AnimatePresence, motion } from 'framer-motion'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Home } from './components/pages/Home'
import { Galeria } from './components/pages/Galeria'

// 🎬 Estas rutas ahora solo manejan la UI 2D (Home ya no tiene Canvas propio,
// ese vive persistente en Experiencia3D, montado aparte en App.tsx).
const variantesSlide = {
  inicial: { x: '100%' },
  animar: { x: 0 },
  salir: { x: '-100%' }
}

const transicion = {
  duration: 0.6,
  ease: [0.65, 0, 0.35, 1] as const
}

export default function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <motion.div
              variants={variantesSlide}
              initial="inicial"
              animate="animar"
              exit="salir"
              transition={transicion}
              className="fixed inset-0"
            >
              <Home />
            </motion.div>
          }
        />
        <Route
          path="/galeria"
          element={
            <motion.div
              variants={variantesSlide}
              initial="inicial"
              animate="animar"
              exit="salir"
              transition={transicion}
              className="fixed inset-0"
            >
              <Galeria />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  )
}