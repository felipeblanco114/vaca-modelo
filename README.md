# La Vaca 🐄

Guía interactiva de cortes vacunos argentinos. Tocás un corte de la vaca y ves cómo se llama, cómo se cocina, cuánto tarda, qué platos lleva y cómo se llama en otros países. Incluye una calculadora de asado.

Hecha con **React + Vite + Three.js** (`@react-three/fiber` y `@react-three/drei`). Tiene dos vistas: un **visor 3D** donde cada corte es una pieza que se puede girar, separar, aislar y ocultar, y el **póster 2D** clásico.

## Cómo correrla

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera /dist para publicar
```

## Estructura

```
src/
  App.jsx                    → pantalla principal, pestañas y estado
  styles.css                 → estilos
  data/
    cuts.js                  → info de cada corte (textos, métodos, platos, equivalencias)
    cowGeometry.js           → silueta de la vaca, forma de cada corte y posición de los nombres
  components/
    Cow3D.jsx                → visor 3D: girar, cuero, separar cortes, aislar, ocultar
    CowMap.jsx               → póster 2D (modo "Con cuero" / "Ver carne")
    MeatDefs.jsx             → gradientes y filtros SVG de carne y marmoleado
    CutDetail.jsx            → ficha del corte
    CutPreview.jsx           → vista del corte en la ficha: 3D o imagen
    CutModel3D.jsx           → pieza 3D de la ficha: carga public/models/<id>.glb o usa la pieza generada
    CutIllustration.jsx      → dibujo realista de cada corte (hueso, grasa, fibra, membrana)
    AsadoCalculator.jsx      → calculadora de asado
  three/
    cowBuilder.js            → arma la vaca 3D: perfil del cuerpo, forma y profundidad de cada corte
    materials.js             → materiales de cada corte, compartidos por la vaca y la ficha
    textures.js              → texturas de músculo (con relieve de fibras), carne, tendón y pelaje
public/
  cuts/                      → fotos reales de los cortes (opcional)
```

## Agregar modelos 3D realistas de los cortes

Poné un archivo `.glb` en `public/models/` con el **id** del corte, por ejemplo `public/models/asado.glb`. La ficha lo carga solo y se puede girar. Sin modelo, muestra la pieza 3D generada por código.

Dos formas de conseguirlos:
- **Foto → 3D con IA** (Higgsfield, Meshy, Tripo): una foto del corte sobre fondo blanco.
- **Escaneo real** con el celular (Polycam, Scaniverse): es lo más fiel; se hace en la carnicería dando una vuelta alrededor del corte.

## Agregar fotos reales de los cortes

Poné una foto en `public/cuts/` con el **id** del corte y extensión `.jpg`, por ejemplo:

```
public/cuts/asado.jpg
public/cuts/bife_angosto.jpg
public/cuts/vacio.jpg
```

Si la foto existe, la ficha la muestra. Si no, muestra la ilustración. Los ids están en `src/data/cuts.js`. Tamaño recomendado: 1200×760 px (proporción 300:190).

## Agregar o editar un corte

1. Agregá el corte a `CUTS` (o a `ACHURAS` si es interno) en `src/data/cuts.js`.
2. Si va sobre la vaca, agregá su forma en `CUT_SHAPES` y su nombre en `LABELS` dentro de `src/data/cowGeometry.js`.

## Publicación

El repo publica solo en GitHub Pages con cada push a `main` (ver `.github/workflows/deploy.yml`).
Hay que activarlo una vez: **Settings → Pages → Source: GitHub Actions**.

## Próximos pasos

- **Fotos reales** de cada corte (idealmente sacadas en la carnicería del cliente).
- **Modelo 3D anatómico:** hoy la vaca se genera por código en `src/three/cowBuilder.js`. Para precisión de escuela de carniceros hay que modelarla en Blender (un mesh por corte, nombrado con su id: `asado`, `vacio`, …), exportar `.glb` y cargarlo en lugar de `buildCow()`. El visor, los datos y la ficha no cambian.
- **Versión para carnicerías:** marca propia, precios del día y QR en el mostrador.
- Sumar cerdo, cordero y pollo con la misma estructura de datos.

> Los tiempos de cocción y las equivalencias con otros países son orientativos.
