import { EscenaProvider } from './context/EscenaContext'
import { Experiencia3D } from './components/scene/Experiencia3D'
import { Home } from './pages/Home'
import { GaleriaPanel } from './components/GaleriaPanel'
import { MenuPanel } from './components/MenuPanel'

function App() {
  return (
    <EscenaProvider>
      <Experiencia3D />
      <Home />
      {/* Se abre solo cuando seccion === 'ventana' (justo al terminar el
          viaje de cámara al mostrador) */}
      <MenuPanel />
      <GaleriaPanel />
    </EscenaProvider>
  )
}

export default App