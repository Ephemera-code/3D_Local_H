import type { ItemMenu } from '@/store/cart'

export interface Categoria {
  id: string
  nombre: string
}

export const CATEGORIAS: Categoria[] = [
  { id: 'combos', nombre: 'Combos' },
  { id: 'papas', nombre: 'Papas' },
  { id: 'bebidas', nombre: 'Bebidas' }
]

// 📝 PLACEHOLDER — reemplazá con tus productos reales (nombre, descripción,
// precio, imagen). El campo 'imagen' puede quedar vacío por ahora, se ve un
// placeholder de color en su lugar.
export const MENU_ITEMS: ItemMenu[] = [
  {
    id: 'combo-clasico',
    categoria: 'combos',
    nombre: 'Combo Clásico',
    descripcion: 'Carne 100% smash, cheddar derretido, pickles y salsa de la casa.',
    precio: 8500
  },
  {
    id: 'combo-doble',
    categoria: 'combos',
    nombre: 'Combo Doble Cheddar',
    descripcion: 'Doble carne, doble cheddar, bacon crocante. Directo al hueso.',
    precio: 11000
  },
  {
    id: 'combo-bbq',
    categoria: 'combos',
    nombre: 'Combo Bacon BBQ',
    descripcion: 'BBQ ahumada, cebolla crispy y provolone fundido.',
    precio: 12000
  },
  {
    id: 'papas-clasicas',
    categoria: 'papas',
    nombre: 'Papas Fritas',
    descripcion: 'Papas gruesas, sal gruesa y nuestra salsa secreta.',
    precio: 3500
  },
  {
    id: 'papas-cheddar',
    categoria: 'papas',
    nombre: 'Papas con Cheddar y Bacon',
    descripcion: 'Bañadas en cheddar fundido y bacon crocante.',
    precio: 4800
  },
  {
    id: 'gaseosa',
    categoria: 'bebidas',
    nombre: 'Gaseosa 500ml',
    descripcion: 'Línea Coca-Cola, bien fría.',
    precio: 2000
  },
  {
    id: 'agua',
    categoria: 'bebidas',
    nombre: 'Agua Mineral 500ml',
    descripcion: 'Con o sin gas.',
    precio: 1500
  }
]