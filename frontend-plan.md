# Plan de Mejora UX/UI — Deo Gratias Joyería Fina

## Auditoría Actual del Estado del Sistema

### Métricas Actuales
| Métrica | Valor Actual |
|---------|--------------|
| Total productos | 40 (agrupados) |
| Total imágenes originales | 103 |
| Productos con 1 imagen | 16 (40%) |
| Productos con 2-3 imágenes | 15 (37.5%) |
| Productos con 4+ imágenes | 9 (22.5%) |
| Productos con colección | 0 (0%) |
| Productos con categoría | 0 (0%) |
| Productos con material | 0 (0%) |
| Productos con precio | 0 (0%) |
| Productos por página | 12 |
| Total páginas | 4 |

---

## 1. Evaluación de la Experiencia Actual

### 1.1 Jerarquía Visual

| Elemento | Estado | Evaluación |
|----------|--------|------------|
| Hero "Deo Gratias" | ✅ Implementado | Título grande con destello dorado, buena presencia |
| Brand Story | ✅ Implementado | Texto explicativo del significado de la marca |
| Header | ✅ Correcto | Logo + tagline + acciones (tema, refresh, subir, PDF) |
| Product Cards | ⚠️ Mejorable | Sin metadata, mismo tamaño todas |
| Footer | ✅ Correcto | Limpio, coherente con la marca |

**Problemas detectados:**
- Las cards no muestran precio, colección ni categoría
- No hay distinción visual entre productos destacados y regulares
- El footer contiene "La Coleccion" como link no funcional

### 1.2 Uso de Imágenes y Galerías

| Aspecto | Estado | Evaluación |
|---------|--------|------------|
| Grid de productos | ✅ Paginado | 12 por página, funciona correctamente |
| Agrupación de imágenes | ✅ Implementado | Productos con múltiples fotos agrupados |
| Carrusel en detalle | ✅ Implementado | Thumbnails + navegación con flechas |
| Thumbnails optimizados | ✅ Cloudinary | WebP automático |
| Indicador de cantidad | ✅ Implementado | Badge "X fotos" en cards |

**Problemas detectados:**
- 40% de productos tienen solo 1 imagen (insuficiente para joyería)
- No hay imágenes de lifestyle/contexto
- No hay zoom en imágenes de producto

### 1.3 Navegación y Descubrimiento

| Aspecto | Estado | Evaluación |
|---------|--------|------------|
| Búsqueda por texto | ✅ Funcional | Filtra por nombre, descripción, material |
| Filtros de colección | ✅ Implementado | Pero sin datos = vacío |
| Filtros de categoría | ✅ Implementado | Pero sin datos = vacío |
| Filtros de material | ✅ Implementado | Pero sin datos = vacío |
| Filtros de gema | ✅ Implementado | Pero sin datos = vacío |
| Ordenamiento | ✅ Funcional | Nombre, precio, colección, personalizado |
| Vista grid/lista | ✅ Implementado | Toggle disponible |
| Paginación | ✅ Implementado | 12 por página |
| Breadcrumb | ✅ En detalle | Navegación de regreso |

**Problemas detectados:**
- Los filtros están vacíos porque no hay metadata en los productos
- No hay filtros de precio
- No hay "Productos destacados" o "Nuevos"
- No hay sección de "Visto recientemente"

### 1.4 Claridad de la Propuesta de Valor

| Aspecto | Estado | Evaluación |
|---------|--------|------------|
| Nombre de marca | ✅ "Deo Gratias" | Clara y memorable |
| Tagline | ✅ "Joyeria Fina" | Comunica lujo |
| Brand story | ✅ Implementado | Explica el significado |
| Diferenciación | ⚠️ Débil | No se comunica artesanía, materiales, origen |
| Confianza | ⚠️ Media | No hay testimonios, garantías, certificados |

### 1.5 Flujo de Compra y Conversión

| Aspecto | Estado | Evaluación |
|---------|--------|------------|
| CTA principal | ✅ WhatsApp | Botón verde visible |
| CTA en cards | ✅ Hover | Aparece al pasar el mouse |
| CTA en detalle | ✅ Visible | Botón grande y claro |
| Proceso de compra | ⚠️ Indirecto | WhatsApp → negociación manual |
| Carrito | ❌ No existe | Experiencia de tienda incompleta |
| Checkout | ❌ No existe | No hay flujo de compra online |

**Problemas detectados:**
- El modelo actual es "catálogo + WhatsApp" no "tienda online"
- No hay precios visibles en la mayoría de productos
- No hay opción de compra directa
- No hay carrito de compras

---

## 2. Identificación de Problemas

### 🔴 ALTO IMPACTO — Críticos

| # | Problema | Impacto | Solución |
|---|----------|---------|----------|
| 1 | **0% de productos con metadata** | El catálogo no tiene información útil | Formulario de edición masiva |
| 2 | **Sin sistema de colecciones** | No se pueden agrupar productos temáticamente | Crear colecciones predefinidas |
| 3 | **Sin precios visibles** | El usuario no puede comparar | Agregar campo de precio a todos |
| 4 | **40% con solo 1 imagen** | Experiencia incompleta para joyería | Solicitar más fotos por producto |
| 5 | **Sin página "Nosotros"** | No genera confianza | Crear página de la marca |

### 🟡 MEDIO IMPACTO — Mejorables

| # | Problema | Impacto | Solución |
|---|----------|---------|----------|
| 6 | **Sin filtros de precio** | No puede filtrar por presupuesto | Agregar filtro de rango |
| 7 | **Sin productos destacados** | No guía al usuario | Sección "Destacados" |
| 8 | **Sin zoom en imágenes** | No puede ver detalles | Implementar zoom |
| 9 | **CTA solo en hover (mobile)** | Difícil de encontrar en móvil | Botón siempre visible |
| 10 | **Sin breadcrumbs consistentes** | Confusión de navegación | Agregar a todas las páginas |

### 🟢 BAJO IMPACTO — Nice to Have

| # | Problema | Impacto | Solución |
|---|----------|---------|----------|
| 11 | **Sin "Visto recientemente"** | No facilita retorno | localStorage + sección |
| 12 | **Sin comparar productos** | Difícil decidir | Vista lado a lado |
| 13 | **Sin wishlist compartible** | No viraliza | Link público de favoritos |
| 14 | **Sin analytics avanzados** | No sabe qué funciona | Google Analytics + eventos |
| 15 | **Footer con links rotos** | Mala impresión | Limpiar o hacer funcionales |

---

## 3. Recomendaciones de Mejora (por Impacto)

### 🔴 ALTO IMPACTO — Implementar Ahora

#### A. Sistema de Metadata Completo

**Acción:** Crear formulario de edición para cada producto

```
Campos requeridos:
├── Nombre (ya existe)
├── Descripción (1-2 oraciones)
├── Precio (o "Consultar")
├── Colección (dropdown: Herencia, Divina, Clásica, etc.)
├── Categoría (dropdown: Anillos, Collares, Pulseras, Broches, etc.)
├── Material (dropdown: Oro 18k, Oro 14k, Plata 925, etc.)
├── Gema (dropdown: Diamante, Zafiro, Rubí, Esmeralda, etc.)
├── Orden (número para ordering manual)
└── Destacado (checkbox)
```

**Wireframe — Formulario de Edición:**
```
┌─────────────────────────────────────────────────┐
│  Editar: Rosario Cristal Blanco Cruces          │
├─────────────────────────────────────────────────┤
│  Nombre:    [Rosario Cristal Blanco con Cruces] │
│  Descripción: [________________________]        │
│  Precio:    [$ 2,500]                           │
│                                                 │
│  Colección: [Divina        ▼]                   │
│  Categoría: [Rosarios      ▼]                   │
│  Material:  [Cristal       ▼]                   │
│  Gema:      [Ninguna       ▼]                   │
│                                                 │
│  ☑ Destacado    Orden: [1]                      │
│                                                 │
│  [Cancelar]                    [Guardar]        │
└─────────────────────────────────────────────────┘
```

#### B. Sistema de Colecciones

**Colecciones predefinidas sugeridas:**

| Colección | Descripción | Productos |
|-----------|-------------|-----------|
| **Herencia** | Piezas tradicionales y clásicas | Rosarios, cruces |
| **Divina** | Inspiración espiritual | Medallas, rosarios |
| **Elegancia** | Diseños modernos y refinados | Anillos, collares |
| **Colección Nueva** | Últimas incorporaciones | Variable |

**Página de Colección:**
```
┌─────────────────────────────────────────────────┐
│  ← Volver    Colección: Herencia                │
├─────────────────────────────────────────────────┤
│  [Imagen hero de colección]                     │
│  "Piezas que honran la tradición"               │
├─────────────────────────────────────────────────┤
│  [Producto] [Producto] [Producto]               │
│  [Producto] [Producto] [Producto]               │
│                                                 │
│  ─────────────────────────────                  │
│  12 productos en esta colección                 │
└─────────────────────────────────────────────────┘
```

#### C. Página "Nosotros" / "Nuestra Historia"

**Estructura sugerida:**
```
┌─────────────────────────────────────────────────┐
│  DEO GRATIAS                                    │
│  ─────────────                                  │
│  Nuestra Historia                               │
├─────────────────────────────────────────────────┤
│  [Imagen de taller/artesano]                    │
│                                                 │
│  "Deo Gratias significa tomar todo de las       │
│   manos de la Divina Providencia..."            │
│                                                 │
│  Nuestros Valores:                              │
│  ◆ Artesanía - Cada pieza es hecha a mano      │
│  ◆ Calidad - Materiales premium                 │
│  ◆ Fe - Inspiración en lo divino                │
│  ◆ Confianza - Garantía de por vida            │
│                                                 │
│  [Botón: Ver Catálogo]                          │
└─────────────────────────────────────────────────┘
```

#### D. Galería de Imágenes Mejorada

**Mejoras necesarias:**
1. **Zoom al hacer clic** en imagen de producto
2. **Imágenes de lifestyle** (producto en uso)
3. **Vista 360°** para productos de alto valor
4. **Comparación de imágenes** (antes/después, diferentes ángulos)

**Wireframe — Zoom de Imagen:**
```
┌─────────────────────────────────────────────────┐
│  ✕                                              │
│                                                 │
│         [Imagen con zoom 2x]                    │
│              ← →                                │
│                                                 │
│  [Thumb] [Thumb] [Thumb] [Thumb]                │
│                                                 │
│  Rosario Cristal Blanco Cruces                  │
│  $2,500                                         │
│  [WhatsApp Consultar]                           │
└─────────────────────────────────────────────────┘
```

### 🟡 MEDIO IMPACTO — Implementar Próximamente

#### E. Filtros de Precio

**Rangos sugeridos para joyería:**
```
☐ Todos los precios
☐ Menos de ₡50,000
☐ ₡50,000 - ₡150,000
☐ ₡150,000 - ₡500,000
☐ Más de ₡500,000
☐ Consultar precio
```

#### F. Sección de Productos Destacados

**Wireframe — Hero de Destacados:**
```
┌─────────────────────────────────────────────────┐
│  PIEZAS DESTACADAS                              │
│  ─────────────────                              │
│                                                 │
│  [Imagen grande]    [Imagen mediana]            │
│                     [Imagen mediana]            │
│                                                 │
│  "Descubra nuestras creaciones más              │
│   extraordinarias de esta temporada"            │
│                                                 │
│  [Ver Colección →]                              │
└─────────────────────────────────────────────────┘
```

#### G. Zoom de Imagen

**Implementación:**
- Clic en imagen → overlay con zoom 2x
- Scroll para navegar imagen ampliada
- Botón cerrar (X) o tecla Escape
- Flechas para siguiente/anterior

### 🟢 BAJO IMPACTO — Futuras Iteraciones

#### H. "Visto Recientemente"

**Almacenamiento:** localStorage
**Máximo:** 8 productos
**Ubicación:** Debajo del hero, antes del catálogo

#### I. Comparar Productos

**Funcionalidad:**
- Checkbox "Comparar" en cards
- Máximo 3 productos
- Vista lado a lado con especificaciones

#### J. Wishlist Compartible

**Funcionalidad:**
- Link público: `deogratias.com/favoritos/abc123`
- Compartir por WhatsApp/email
- Código QR para imprimir

---

## 4. Propuesta de Rediseño

### 4.1 Estructura de la Página Principal

```
┌─────────────────────────────────────────────────┐
│ HEADER: Logo + Navegación + Carrito             │
├─────────────────────────────────────────────────┤
│                                                 │
│ HERO: "Deo Gratias" con destello dorado         │
│ Subtítulo: "Cada pieza, una declaración..."     │
│                                                 │
├─────────────────────────────────────────────────┤
│ BRAND STORY: Significado de Deo Gratias         │
├─────────────────────────────────────────────────┤
│                                                 │
│ PRODUCTOS DESTACADOS (4-6 productos)            │
│ Carrusel horizontal                             │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│ COLECCIONES (grid 2x2)                          │
│ [Herencia] [Divina] [Elegancia] [Nueva]         │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│ CATÁLOGO COMPLETO                               │
│ [Filtros] [Búsqueda] [Ordenar] [Vista]          │
│                                                 │
│ [Card] [Card] [Card] [Card]                     │
│ [Card] [Card] [Card] [Card]                     │
│ [Card] [Card] [Card] [Card]                     │
│                                                 │
│ [1] [2] [3] ... [Siguiente →]                   │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│ NOSOTROS (preview)                              │
│ "Conozca nuestra historia..."                   │
│ [Leer Más →]                                    │
│                                                 │
├─────────────────────────────────────────────────┤
│ FOOTER: Redes + Contacto + Links                │
└─────────────────────────────────────────────────┘
```

### 4.2 Wireframe — Página de Producto

```
┌─────────────────────────────────────────────────┐
│ HEADER                                          │
├─────────────────────────────────────────────────┤
│                                                 │
│ [Breadcrumb: Inicio > Colección > Categoría]    │
│                                                 │
│ ┌───────────────────┐  ┌──────────────────────┐ │
│ │                   │  │ NOMBRE DEL PRODUCTO  │ │
│ │  [Imagen grande]  │  │                      │ │
│ │                   │  │ $2,500               │ │
│ │   ← → (flechas)  │  │ ─────────────────    │ │
│ │                   │  │                      │ │
│ └───────────────────┘  │ Colección: Herencia  │ │
│                        │ Categoría: Rosarios  │ │
│ [Thumb1][Thumb2][Thumb3]│ Material: Cristal   │ │
│                        │ Gema: N/A            │ │
│                        │                      │ │
│                        │ Descripción:         │ │
│                        │ "Rosario artesanal   │ │
│                        │  con cruces..."      │ │
│                        │                      │ │
│                        │ [WhatsApp Consultar] │ │
│                        │ [♡ Favorito]         │ │
│                        └──────────────────────┘ │
│                                                 │
├─────────────────────────────────────────────────┤
│ PRODUCTOS RELACIONADOS                          │
│ [Card] [Card] [Card] [Card]                     │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 4.3 Wireframe — Página de Colección

```
┌─────────────────────────────────────────────────┐
│ HEADER                                          │
├─────────────────────────────────────────────────┤
│                                                 │
│ [← Volver al Catálogo]                          │
│                                                 │
│ COLECCIÓN: HERENCIA                             │
│ ─────────────────────                           │
│ "Piezas que honran la tradición y la fe"        │
│                                                 │
│ [Imagen hero de colección - ancho completo]     │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│ [Filtros por categoría dentro de la colección]   │
│                                                 │
│ [Card] [Card] [Card] [Card]                     │
│ [Card] [Card] [Card] [Card]                     │
│                                                 │
│ ─────────────────────────────                  │
│ 12 productos en Herencia                        │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 5. Priorización de Contenido e Imágenes

### Cantidad Ideal de Imágenes por Producto

| Tipo de Producto | Imágenes Recomendadas | Contenido |
|------------------|----------------------|-----------|
| **Anillo** | 4-6 | Frente, perfil, detalle gema, en mano, caja |
| **Collar** | 3-5 | Completo, detalle cierre, en modelo, primer plano |
| **Pulsera** | 3-4 | Completo, detalle cierre, en muñeca |
| **Broche** | 2-3 | Completo, detalle, en prenda |
| **Rosario** | 4-6 | Completo, detalle cruz, detalle cuentas, enrollado |
| **Medalla** | 3-4 | Frente, reverso, detalle, en cadena |

### Contenido por Página

| Sección | Cantidad | Propósito |
|---------|----------|-----------|
| **Hero** | 1 imagen | Impacto visual inicial |
| **Destacados** | 4-6 productos | Guiar al usuario |
| **Colecciones** | 4 colecciones | Navegación temática |
| **Catálogo** | 12 por página | Exploración |
| **Footer** | 1 imagen | Cierre elegante |

---

## 6. Estrategias para Mejorar Atención y Engagement

### 6.1 Elementos de Engagement

| Elemento | Implementación | Impacto |
|----------|----------------|---------|
| **Newsletter** | Popup después de 30s | Capturar emails |
| **WhatsApp flotante** | Botón siempre visible | Contacto directo |
| **Instagram feed** | Widget de últimas fotos | Social proof |
| **Testimonios** | Sección en homepage | Confianza |
| **Blog** | Artículos sobre joyería | SEO + autoridad |

### 6.2 Gamificación

| Elemento | Descripción |
|----------|-------------|
| **Favoritos** | ✅ Ya implementado |
| **Coleccionista** | Badge por ver X productos |
| **Compartir** | Puntos por compartir en redes |
| **Primera compra** | Descuento para nuevos clientes |

### 6.3 Personalización

| Elemento | Descripción |
|----------|-------------|
| **Visto recientemente** | Basado en localStorage |
| **Recomendados** | Basado en favoritos |
| **Historial** | Guardar productos vistos |

---

## 7. Optimización del Proceso de Compra

### 7.1 Flujo Actual (WhatsApp)

```
Descubrir producto → Clic en WhatsApp → Enviar mensaje → Esperar respuesta → Negociar → Comprar
```

**Problemas:**
- Fricción alta (cambiar de plataforma)
- Tiempo de respuesta variable
- No hay carrito ni checkout

### 7.2 Flujo Mejorado (Híbrido)

```
Descubrir producto → Agregar al carrito → Continuar comprando → Checkout → Pago
```

**Mejoras:**
- Carrito de compras persistentes
- Checkout simplificado
- Múltiples métodos de pago
- Confirmación por email/WhatsApp

### 7.3 Checkout Simplificado

```
┌─────────────────────────────────────────────────┐
│  CHECKOUT                                        │
├─────────────────────────────────────────────────┤
│  1. Datos Personales                            │
│     Nombre: [____________]                      │
│     Email:  [____________]                      │
│     Tel:    [____________]                      │
│                                                 │
│  2. Dirección de Envío                          │
│     Dirección: [____________]                   │
│     Ciudad:    [____________]                   │
│     Provincia: [____________]                   │
│                                                 │
│  3. Método de Pago                              │
│     ○ Transferencia bancaria                    │
│     ○ Sinpe Móvil                               │
│     ○ Tarjeta de crédito/débito                 │
│                                                 │
│  Resumen:                                       │
│  ┌─────────────────────────────────────────┐   │
│  │ Rosario Cristal    x1    ₡25,000       │   │
│  │ Aro Dorado         x1    ₡45,000       │   │
│  │ ─────────────────────────────────       │   │
│  │ Subtotal                 ₡70,000       │   │
│  │ Envío                    ₡5,000        │   │
│  │ Total                    ₡75,000       │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  [Finalizar Compra]                             │
└─────────────────────────────────────────────────┘
```

---

## 8. Buenas Prácticas UX para Maximizar Conversión

### 8.1 Principios de Diseño para Joyería de Lujo

| Principio | Aplicación |
|-----------|------------|
| **Espacio en blanco** | Genera elegancia y lujo |
| **Tipografía serif** | Cormorant Garamond ya implementada |
| **Paleta oscura** | Negro + dorado = lujo |
| **Minimalismo** | Poca información, mucha imagen |
| **Microinteracciones** | Hover effects, transiciones suaves |

### 8.2 Optimización de Conversión

| Elemento | Mejora |
|----------|--------|
| **CTA WhatsApp** | Cambiar a "Consultar Disponibilidad" |
| **Precios** | Mostrar precio o "Desde ₡XX,XXX" |
| **Urgencia** | "Última pieza disponible" |
| **Prueba social** | "50+ clientes satisfechos" |
| **Garantía** | "Garantía de por vida" |

### 8.3 SEO y Accesibilidad

| Elemento | Implementación |
|----------|----------------|
| **Meta titles** | "Producto - Colección - Deo Gratias" |
| **Meta descriptions** | Descripción única por producto |
| **Alt text** | Descripción de cada imagen |
| **Schema markup** | Producto estructurado para Google |
| **Sitemap** | Generar automáticamente |

---

## 9. Hoja de Ruta de Implementación

### Fase 1: Fundamentos (1-2 semanas)

| Tarea | Esfuerzo | Prioridad |
|-------|----------|-----------|
| Crear formulario de edición de metadata | 2 días | 🔴 Alta |
| Agregar colecciones predefinidas | 1 día | 🔴 Alta |
| Editar metadata de 40 productos | 2 días | 🔴 Alta |
| Página "Nosotros" | 1 día | 🔴 Alta |

### Fase 2: Experiencia (2-3 semanas)

| Tarea | Esfuerzo | Prioridad |
|-------|----------|-----------|
| Zoom de imagen | 1 día | 🟡 Media |
| Filtros de precio | 1 día | 🟡 Media |
| Productos destacados | 2 días | 🟡 Media |
| Página de colección | 2 días | 🟡 Media |
| "Visto recientemente" | 1 día | 🟢 Baja |

### Fase 3: Conversión (3-4 semanas)

| Tarea | Esfuerzo | Prioridad |
|-------|----------|-----------|
| Carrito de compras | 3 días | 🟡 Media |
| Checkout simplificado | 4 días | 🟡 Media |
| Pagos online | 5 días | 🟡 Media |
| Newsletter | 1 día | 🟢 Baja |

---

## 10. Métricas a Monitorear

### Métricas de Engagement

| Métrica | Actual (estimado) | Meta (3 meses) |
|---------|-------------------|----------------|
| Tiempo en página | ~1 min | >3 min |
| Páginas por sesión | ~2 | >4 |
| Tasa de rebote | ~60% | <40% |
| Productos vistos/sesión | ~5 | >10 |

### Métricas de Conversión

| Métrica | Actual (estimado) | Meta (3 meses) |
|---------|-------------------|----------------|
| Clicks en WhatsApp | ~5% | >15% |
| Favoritos agregados | ~10% | >25% |
| Consultas recibidas | ~2/día | >10/día |
| Ventas cerradas | ~1/sem | >5/sem |

### Métricas de Contenido

| Métrica | Actual | Meta |
|---------|--------|------|
| Productos con metadata | 0% | 100% |
| Productos con 3+ fotos | 37.5% | >80% |
| Productos con precio | 0% | 100% |
| Colecciones activas | 0 | 4+ |

---

## 11. Resumen Ejecutivo

### Estado Actual
- **Catálogo funcional** con paginación y agrupamiento de imágenes
- **Sin metadata** en productos (0% con colección, categoría, material o precio)
- **Modelo WhatsApp** (no tienda online completa)
- **40 productos** agrupados de 103 imágenes originales

### Prioridades Inmediatas
1. **Metadata completa** — Formulario de edición + actualizar todos los productos
2. **Sistema de colecciones** — Crear 4-6 colecciones temáticas
3. **Precios visibles** — Agregar precio a todos los productos
4. **Más imágenes** — Solicitar 3-6 fotos por producto
5. **Página "Nosotros"** — Generar confianza y connection emocional

### Impacto Esperado
- **Engagement:** +50% tiempo en página
- **Conversión:** +100% consultas por WhatsApp
- **SEO:** +200% tráfico orgánico
- **Ventas:** +150% en 3 meses

---

*Documento generado el: 2026-08-07*
*Última actualización: 2026-08-07*
