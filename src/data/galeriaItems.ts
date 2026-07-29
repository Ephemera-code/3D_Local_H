export interface ItemGaleria {
  id: string
  imagen: string
  frase: string
  titulo: string
  nombre: string
}

export const FOTOS = Array.from({ length: 9 }, (_, index) => `/fotos/foto_${index + 1}.webp`)

export const ITEMS: ItemGaleria[] = [
  {
    id: 'item-1',
    imagen: FOTOS[0],
    frase: 'El clásico que nunca falla',
    titulo: 'jamon y morron / Peperoni',
    nombre: 'INSTINTO'
  },
  {
    id: 'item-2',
    imagen: FOTOS[1],
    frase: 'Para los que no se guardan nada',
    titulo: 'Cochina Hambre',
    nombre: 'VORAZ'
  },
  {
    id: 'item-3',
    imagen: FOTOS[2],
    frase: 'Fuego lento, sabor intenso',
    titulo: 'Panuzzo de osobuco',
    nombre: 'SALVAJE'
  },
  {
    id: 'item-4',
    imagen: FOTOS[3],
    frase: 'Simple, honesto, contundente',
    titulo: 'Salchipapa Hambre',
    nombre: 'CRUJIENTE'
  },
  {
    id: 'item-5',
    imagen: FOTOS[4],
    frase: 'Simple, honesto, contundente',
    titulo: 'Jamon y morron / napolitana',
    nombre: 'BRUTAL'
  },
  {
    id: 'item-6',
    imagen: FOTOS[5],
    frase: 'Ícono en cada mordida',
    titulo: 'Jamon y morron / osobuco',
    nombre: 'SACIALO'
  },
  {
    id: 'item-7',
    imagen: FOTOS[6],
    frase: 'Textura y color que invitan',
    titulo: 'Primavera',
    nombre: 'MÁXIMO'
  },
  {
    id: 'item-8',
    imagen: FOTOS[7],
    frase: 'Detalles que marcan la diferencia',
    titulo: 'Pollo frito',
    nombre: 'NO RULES'
  },
  {
    id: 'item-9',
    imagen: FOTOS[8],
    frase: 'La energía del local en una sola foto',
    titulo: 'Cochina clasica',
    nombre: 'TENDENCIA'
  }
]