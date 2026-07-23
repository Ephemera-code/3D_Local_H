import { create } from 'zustand'

export interface ItemMenu {
  id: string
  nombre: string
  precio: number
  imagen?: string
  descripcion?: string
  categoria?: string
}

export interface ItemCarrito extends ItemMenu {
  cantidad: number
}

interface CartState {
  items: ItemCarrito[]
  agregarItem: (item: ItemMenu) => void
  quitarItem: (id: string) => void
  cambiarCantidad: (id: string, cantidad: number) => void
  vaciarCarrito: () => void
  total: () => number
  cantidadTotal: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  agregarItem: (item) => {
    set((state) => {
      const existente = state.items.find((i) => i.id === item.id)

      if (existente) {
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, cantidad: i.cantidad + 1 } : i
          )
        }
      }

      return { items: [...state.items, { ...item, cantidad: 1 }] }
    })
  },

  quitarItem: (id) => {
    set((state) => ({
      items: state.items.filter((i) => i.id !== id)
    }))
  },

  cambiarCantidad: (id, cantidad) => {
    if (cantidad <= 0) {
      get().quitarItem(id)
      return
    }
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, cantidad } : i))
    }))
  },

  vaciarCarrito: () => set({ items: [] }),

  total: () => {
    return get().items.reduce((acc, item) => acc + item.precio * item.cantidad, 0)
  },

  cantidadTotal: () => {
    return get().items.reduce((acc, item) => acc + item.cantidad, 0)
  }
}))