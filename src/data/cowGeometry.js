// Geometría de la vaca (vista lateral, mirando a la izquierda). viewBox: "60 82 730 380"
// Los cortes del cuerpo son polígonos que se recortan con la silueta (BODY),
// así las divisiones pueden ser simples y el borde siempre queda prolijo.

export const VIEWBOX = '60 82 730 380'

export const BODY =
  'M205 150 C240 128 280 112 320 110 C380 108 450 114 520 112 C560 110 590 102 620 104 ' +
  'C660 106 690 112 708 124 C722 140 726 175 722 210 C718 250 708 285 690 312 ' +
  'C670 325 640 330 615 326 C580 336 540 352 480 356 C420 360 360 356 318 344 ' +
  'C290 336 262 330 240 322 C215 314 196 300 188 280 C180 258 178 232 186 210 ' +
  'C192 196 196 182 192 170 C196 162 200 155 205 150 Z'

// Mancha blanca de pecho/papada (Hereford)
export const BRISKET_WHITE = 'M170 232 C196 246 222 276 238 330 L170 365 Z'

export const HEAD =
  'M205 146 C190 132 168 128 150 134 C132 140 120 156 108 178 C98 196 88 212 82 226 ' +
  'C78 236 82 248 94 252 C108 256 122 254 134 248 C150 240 166 232 180 226 ' +
  'C196 218 208 200 210 180 C212 166 210 154 205 146 Z'

export const EAR = 'M178 140 C196 128 222 126 238 133 C226 143 204 151 186 153 Z'
export const EAR_INNER = 'M188 141 C202 135 218 134 228 136 C218 142 204 147 192 148 Z'
export const MUZZLE = 'M80 232 C80 222 90 214 102 216 C112 218 118 230 116 242 C114 252 100 256 90 252 C83 249 80 242 80 232 Z'
export const MOUTH = 'M94 251 C102 252 112 250 120 246'

export const LEG_FRONT =
  'M240 290 L314 296 C314 330 306 360 300 382 C298 392 298 400 300 410 L298 432 ' +
  'C298 438 300 442 302 446 L304 452 L272 452 L276 444 C278 436 276 428 274 418 ' +
  'L272 404 C268 394 266 384 264 372 C258 350 250 320 240 290 Z'

export const LEG_HIND =
  'M610 290 L700 290 C708 320 700 345 690 362 C686 372 690 384 688 394 L682 430 ' +
  'C682 438 684 444 686 452 L656 452 L658 442 C660 432 658 420 656 408 ' +
  'C652 390 646 370 640 352 C632 336 618 312 610 290 Z'

export const HOOF_FRONT = 'M270 443 L306 443 L309 456 L267 456 Z'
export const HOOF_HIND = 'M654 443 L688 443 L691 456 L651 456 Z'

// Desplazamiento de las patas del otro lado (más atrás y en sombra)
export const FAR_FRONT = 'translate(38,-5)'
export const FAR_HIND = 'translate(-46,-5)'

export const TAIL =
  'M708 126 C728 140 736 190 734 250 C733 290 731 320 733 345 L740 345 ' +
  'C740 320 743 290 743 250 C745 188 735 136 714 120 Z'
export const TAIL_SWITCH = 'M729 336 C720 360 725 384 737 398 C750 384 754 360 744 336 Z'

export const TONGUE = 'M98 250 C92 258 94 270 104 271 C114 272 121 263 118 253 Z'

// Formas de cada corte. type: poly (recortado por BODY) | legFront | legHind | path
export const CUT_SHAPES = {
  aguja:        { type: 'poly', points: '170,88 282,88 286,176 205,190 170,190' },
  bife_ancho:   { type: 'poly', points: '282,88 392,88 392,185 300,185 286,176' },
  bife_angosto: { type: 'poly', points: '392,88 512,88 512,180 410,184 392,185' },
  cuadril:      { type: 'poly', points: '512,88 627,88 632,175 560,185 512,180' },
  nalga:        { type: 'poly', points: '627,88 735,88 735,182 632,175' },
  paleta:       { type: 'poly', points: '170,190 205,190 286,176 300,185 305,228 308,268 230,276 170,272' },
  pecho:        { type: 'poly', points: '170,272 230,276 308,268 312,300 315,365 170,365' },
  tapa_asado:   { type: 'poly', points: '300,185 410,184 410,222 305,228' },
  lomo:         { type: 'poly', points: '410,184 512,180 560,185 555,215 470,220 410,222' },
  colita:       { type: 'poly', points: '560,185 632,175 640,240 600,236 555,215' },
  peceto:       { type: 'poly', points: '632,175 735,182 735,247 640,240' },
  cuadrada:     { type: 'poly', points: '640,240 735,247 735,320 682,322 652,300' },
  bola_lomo:    { type: 'poly', points: '600,236 640,240 652,300 682,322 682,365 590,365 580,300' },
  asado:        { type: 'poly', points: '305,228 410,222 470,220 470,295 312,300 308,268' },
  vacio:        { type: 'poly', points: '470,220 555,215 600,236 580,300 470,295' },
  falda:        { type: 'poly', points: '312,300 420,297 420,365 315,365' },
  matambre:     { type: 'poly', points: '420,297 470,295 580,300 590,365 420,365' },
  osobuco:      { type: 'legFront', rect: [225, 324, 100, 70] },
  tortuguita:   { type: 'legHind', rect: [600, 320, 110, 72] },
  rabo:         { type: 'path', d: TAIL },
  lengua:       { type: 'path', d: TONGUE },
}

// Posición de cada nombre: [x, y, texto opcional con \n, tamaño de letra opcional]
export const LABELS = {
  aguja: [248, 150],
  bife_ancho: [338, 134, 'Bife\nancho'],
  bife_angosto: [452, 134, 'Bife\nangosto'],
  cuadril: [570, 140],
  nalga: [674, 142],
  paleta: [250, 232],
  pecho: [236, 298, null, 11.5],
  tapa_asado: [356, 201, 'Tapa de\nasado', 11.5],
  lomo: [484, 206],
  colita: [598, 203, 'Colita de\ncuadril', 11],
  peceto: [682, 214],
  cuadrada: [690, 280, null, 11.5],
  bola_lomo: [618, 268, 'Bola de\nlomo', 11.5],
  asado: [390, 264],
  vacio: [528, 260],
  falda: [368, 326],
  matambre: [505, 326],
  osobuco: [288, 368, null, 11],
  tortuguita: [667, 362, null, 10.5],
  lengua: [104, 290, null, 11],
  rabo: [764, 250, null, 11],
}
