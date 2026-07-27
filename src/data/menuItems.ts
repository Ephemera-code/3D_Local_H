export interface OpcionTamano {
  tamano: '500ml' | '1 Litro'
  precio: number
}

export interface MenuItem {
  id: string
  categoria: string
  nombre: string
  descripcion?: string
  precio?: number          // Para productos normales de precio único
  precios?: OpcionTamano[] // Para productos con variantes de tamaño (como las bebidas)
}

export interface Categoria {
  id: string
  nombre: string
}

export const CATEGORIAS: Categoria[] = [
  { id: 'pizzas', nombre: 'Pizzas' },
  { id: 'especiales', nombre: 'Especiales' },
  { id: 'panuzzo', nombre: 'Panuzzo' },
  { id: 'pollo', nombre: 'Pollo Frito' },
  { id: 'papas', nombre: 'Papas Fritas' },
  { id: 'bebidas', nombre: 'Bebidas' }
]

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'pizza-muzarrella',
    categoria: 'pizzas',
    nombre: 'Muzarrella',
    descripcion: 'Mozzarella, aceitunas, oregano y pesto',
    precio: 13000
  },
  {
    id: 'pizza-jamon',
    categoria: 'pizzas',
    nombre: 'Jamon',
    descripcion: 'Mozzarella, jamón, aceitunas, oregano y pesto',
    precio: 11000
  },
  {
    id: 'pizza-napolitana',
    categoria: 'pizzas',
    nombre: 'Napolitana',
    descripcion: 'Mozzarella, Tomate, aceitunas, orégano y pesto',
    precio: 12000
  },
  {
    id: 'pizza-fugazzeta',
    categoria: 'pizzas',
    nombre: 'Fugazzeta',
    descripcion: 'Mozzarella, cebolla, aceitunas, oregano y pesto',
    precio: 3500
  },
  {
    id: 'pizza-jamonymorron',
    categoria: 'pizzas',
    nombre: 'Jamon y morron',
    descripcion: 'Mozzarella, jamon, morrones asados, aceitunas, oregano y pesto',
    precio: 4800
  },
  {
    id: 'pizza-primavera',
    categoria: 'pizzas',
    nombre: 'Primavera',
    descripcion: 'Mozzrella, jamon, tomate, huevo duro, aceitunas oregano y pesto',
    precio: 2000
  },
  {
    id: 'pizza-anchoas',
    categoria: 'pizzas',
    nombre: 'Anchoas',
    descripcion: 'Mozzarella, anchoas, aceitunas, oregano y pesto',
    precio: 1500
  },
  {
    id: 'pizza-quesoazul',
    categoria: 'pizzas',
    nombre: 'Queso azul',
    descripcion: 'Mozzarella, queso azul, aceitunas, oregano y pesto',
    precio: 1500
  },
  {
    id: 'pizza-pepperoni',
    categoria: 'pizzas',
    nombre: 'Pepperoni',
    descripcion: 'Mozzarella, pepperoni, aceitunas, oregano y pesto',
    precio: 1500
  },
  {
    id: 'pizza-cochina',
    categoria: 'pizzas',
    nombre: 'Cochina Clasica',
    descripcion: 'Mozzarella, huevos fritos, papas fritas, aceitunas, oregano y pesto',
    precio: 1500
  },
  {
    id: 'pizza-especial-osubuco',
    categoria: 'especiales',
    nombre: 'Pizza Osobuco',
    descripcion: 'Mozzarella, osubuco desmenuzado, aceitunas, oregano y pesto',
    precio: 1500
  },
  {
    id: 'pizza-especial-cochina',
    categoria: 'especiales',
    nombre: 'Cochina Hambre',
    descripcion: 'Mozzarella, jamon, huevos fritos, papas fritas, aceitunas, oregano y pesto',
    precio: 1500
  },
  {
    id: 'panuzzo-osubuco',
    categoria: 'panuzzo',
    nombre: 'Panuzzo Osobuco',
    descripcion: 'Osobuco desmnuzado, cebolla caramelizada, mozzarella por encima y pesto (opcional)+ papas fritas',
    precio: 1500
  },
  {
    id: 'pollo-frito-individual',
    categoria: 'pollo',
    nombre: 'Pollo frito individual',
    descripcion: '4 piezas de pollo crocante + papas fritas',
    precio: 1500
  },
  {
    id: 'pollo-frito-para-compartir',
    categoria: 'pollo',
    nombre: 'Pollo frito para compartir',
    descripcion: '8 piezas de pollo crocante + papas fritas',
    precio: 1500
  },
  {
    id: 'papas-fritas-chica',
    categoria: 'papas',
    nombre: 'Papas fritas chica',
    descripcion: 'Aderezos a eleccion',
    precio: 1500
  },
  {
    id: 'papas-fritas-grande',
    categoria: 'papas',
    nombre: 'Papas frito para compartir',
    descripcion: 'Aderezos a eleccion',
    precio: 1500
  },
  {
    id: 'papas-fritas-salchipapa-hambre',
    categoria: 'papas',
    nombre: 'Salchipapa Hambre',
    descripcion: 'Papas fritas, salchichas, mozzarella + 2 toppings a eleccion',
    precio: 1500
  },
  {
    id: 'papas-topping',
    categoria: 'papas',
    nombre: 'Toppings',
    descripcion: 'Jamon, Tomate, Morrones asados, Aceitunas, Queso azul, Huevo frito, Cebolla caramelizada, Anchoas',
    precio: 500
  },
  // 🍺 Bebidas agrupadas con selector de 500ml y 1 Litro
  {
    id: 'bebidas-golden',
    categoria: 'bebidas',
    nombre: 'Cerveza artesanal Golden',
    descripcion: '',
    precios: [
      { tamano: '500ml', precio: 3000 },
      { tamano: '1 Litro', precio: 5200 }
    ]
  },
  {
    id: 'bebidas-doble-ipa',
    categoria: 'bebidas',
    nombre: 'Cerveza artesanal doble ipa',
    descripcion: '',
    precios: [
      { tamano: '500ml', precio: 3200 },
      { tamano: '1 Litro', precio: 5500 }
    ]
  },
  {
    id: 'bebidas-ipa-whisky',
    categoria: 'bebidas',
    nombre: 'Cerveza artesanal ipa whisky',
    descripcion: '',
    precios: [
      { tamano: '500ml', precio: 3200 },
      { tamano: '1 Litro', precio: 5500 }
    ]
  },
  {
    id: 'bebidas-ipa-argenta',
    categoria: 'bebidas',
    nombre: 'Cerveza artesanal ipa argenta',
    descripcion: '',
    precios: [
      { tamano: '500ml', precio: 3200 },
      { tamano: '1 Litro', precio: 5500 }
    ]
  },
  {
    id: 'bebidas-honey-maracuya',
    categoria: 'bebidas',
    nombre: 'Cerveza artesanal honey maracuya',
    descripcion: '',
    precios: [
      { tamano: '500ml', precio: 3000 },
      { tamano: '1 Litro', precio: 5200 }
    ]
  },
  {
    id: 'bebidas-frambuesa',
    categoria: 'bebidas',
    nombre: 'Cerveza artesanal frambuesa',
    descripcion: '',
    precios: [
      { tamano: '500ml', precio: 3000 },
      { tamano: '1 Litro', precio: 5200 }
    ]
  },
  {
    id: 'bebidas-imperial-stout',
    categoria: 'bebidas',
    nombre: 'Cerveza artesanal imperial stout',
    descripcion: '',
    precios: [
      { tamano: '500ml', precio: 3000 },
      { tamano: '1 Litro', precio: 5200 }
    ]
  },
  {
    id: 'bebidas-porter-fernet',
    categoria: 'bebidas',
    nombre: 'Cerveza artesanal porter fernet',
    descripcion: '',
    precios: [
      { tamano: '500ml', precio: 3200 },
      { tamano: '1 Litro', precio: 5500 }
    ]
  }
]