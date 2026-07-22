import { EscenaProvider } from './context/EscenaContext'
import { Experiencia3D } from './components/scene/Experiencia3D'
import AnimatedRoutes from './AnimatedRoutes'

function App() {
  return (
    <EscenaProvider>
      {/* El Canvas 3D persiste siempre montado, fuera de las rutas */}
      <Experiencia3D />
      {/* Las páginas 2D se deslizan por encima */}
      <AnimatedRoutes />
    </EscenaProvider>
  )
}

export default App