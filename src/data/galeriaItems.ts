export interface ItemGaleria {
  id: string
  imagen: string
  frase: string
  parrafo: string
  nombre: string
}

export const FOTOS = Array.from({ length: 9 }, (_, index) => `/fotos/foto_${index + 1}.webp`)

export const ITEMS: ItemGaleria[] = [
  {
    id: 'item-1',
    imagen: FOTOS[0],
    frase: 'El clásico que nunca falla',
    parrafo: 'Carne 100% smash, cheddar derretido, pickles y nuestra salsa de la casa. El favorito de siempre.',
    nombre: 'INSTINTO'
  },
  {
    id: 'item-2',
    imagen: FOTOS[1],
    frase: 'Para los que no se guardan nada',
    parrafo: 'Doble carne, doble cheddar, bacon crocante. Una experiencia sin culpa, directo al hueso.',
    nombre: 'VORAZ'
  },
  {
    id: 'item-3',
    imagen: FOTOS[2],
    frase: 'Fuego lento, sabor intenso',
    parrafo: 'BBQ ahumada, cebolla crispy y provolone fundido sobre carne jugosa a la parrilla.',
    nombre: 'SALVAJE'
  },
  {
    id: 'item-4',
    imagen: FOTOS[3],
    frase: 'Simple, honesto, contundente',
    parrafo: 'Papas gruesas, sal gruesa y nuestra salsa secreta. El acompañante perfecto.',
    nombre: 'CRUJIENTE'
  },
  {
    id: 'item-5',
    imagen: FOTOS[4],
    frase: 'Simple, honesto, contundente',
    parrafo: 'Papas gruesas, sal gruesa y nuestra salsa secreta. El acompañante perfecto.',
    nombre: 'BRUTAL'
  },
  {
    id: 'item-6',
    imagen: FOTOS[5],
    frase: 'Ícono en cada mordida',
    parrafo: 'Un formato potente, visual y sabroso, pensado para exhibir lo que más gusta del local.',
    nombre: 'SACIALO'
  },
  {
    id: 'item-7',
    imagen: FOTOS[6],
    frase: 'Textura y color que invitan',
    parrafo: 'La composición se siente tan bien como se ve, con ese estilo que hace crecer la expectativa.',
    nombre: 'MÁXIMO'
  },
  {
    id: 'item-8',
    imagen: FOTOS[7],
    frase: 'Detalles que marcan la diferencia',
    parrafo: 'Sabor, presentación y presencia. Todo en una sola capa visual.',
    nombre: 'NO RULES'
  },
  {
    id: 'item-9',
    imagen: FOTOS[8],
    frase: 'La energía del local en una sola foto',
    parrafo: 'Cada escena está pensada para reforzar la identidad de la marca y hacerla memorable.',
    nombre: 'TENDENCIA'
  }
]