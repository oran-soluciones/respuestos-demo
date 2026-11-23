# AutoRepuestos · Demo

Demo de **control de stock** y **gestión de servicios** para un comercio de repuestos de autos / taller mecánico.

- **React + Vite + TypeScript**
- **Tailwind CSS v4 + shadcn/ui** (Radix)
- **Recharts** para los gráficos del dashboard
- **localStorage** como única persistencia: no hay backend ni base de datos
- Tema **claro en blanco y negro por defecto**, con opción de tema oscuro (botones e inputs monocromáticos; gráficos y badges con colores sólidos y texto blanco)
- Interfaz en **español (es-AR)**

## Pantallas

### Resumen
Pantalla inicial. KPIs de inventario, gráfico de movimientos de los últimos 14 días, distribución del valor del stock por categoría, próximas entregas, alertas de stock bajo y últimos movimientos.

### Stock
- Alta, edición y eliminación de repuestos en páginas propias (`/productos/nuevo`, `/productos/:id/editar`).
- Al hacer clic en una fila se abre `/productos/:id`: ficha del repuesto, estadísticas de entradas/salidas, gráfico de barras e historial, con botones para registrar entradas y salidas.
- Campos: código interno, nombre, **código de barras**, categoría, ubicación, stock actual, stock mínimo, precio y proveedor.
- Registro de **entradas y salidas** con motivo y referencia; el stock se actualiza y queda historial.
- Búsqueda por nombre, código, código de barras o proveedor; filtros por categoría y estado.

### Servicios
- Alta, edición y eliminación de servicios en páginas propias (`/servicios/nuevo`, `/servicios/:id/editar`).
- Al hacer clic en una fila se abre `/servicios/:id`: ficha completa con patente, tiempos, combustible, repuestos, total, revisión, conclusión y notas (se pueden agregar notas y cambiar el estado).
- Campos: **patente**, vehículo, cliente, teléfono, tipo de trabajo, estado, fecha de ingreso, entrega estimada y real.
- **Combustible**: nivel al ingreso, reposición en litros y observaciones.
- **Tiempo en garage** calculado automáticamente.
- **Notas de seguimiento**, **revisiones** y **conclusión**.
- **Repuestos utilizados** con costo y total del servicio (repuestos + mano de obra).
- Cambio rápido de estado desde el detalle.

## Datos de ejemplo

La primera vez se cargan productos, movimientos y servicios de ejemplo con fechas relativas al día actual. El botón **Restaurar datos de ejemplo** (barra lateral) vuelve a ese estado. Todo se guarda bajo la clave `repuestos-demo:datos:v1` en `localStorage`.

> Al ser una demo, los datos son **por navegador**: no se sincronizan entre dispositivos ni usuarios.

## Desarrollo

```bash
npm install
npm run dev
```

Verificación de tipos y build:

```bash
npm run build
```

## Producción con Docker / Dokploy

El `Dockerfile` compila la app y sirve el `dist` con nginx (multi-stage). El `docker-compose.prod.yml` expone el puerto `3000` por defecto; se puede cambiar con la variable `PORT`.

```bash
docker compose -f docker-compose.prod.yml up -d --build
# http://localhost:3000
```

En Dokploy: crear una nueva aplicación de tipo **Docker Compose**, apuntar al repositorio y al archivo `docker-compose.prod.yml`. No requiere variables de entorno obligatorias. El contenedor expone `/health` para el healthcheck.

## Estructura

```
src/
  components/
    comunes/       Indicadores y badges reutilizables
    layout/        Shell, sidebar, header y encabezados
    stock/         Diálogo de movimientos de stock
    servicios/     Etiquetas reutilizables de servicios
    ui/            Componentes shadcn/ui
  lib/
    format.ts      Formateo con Intl (moneda, fechas, tiempos)
    seed.ts        Datos de ejemplo
    store.tsx      Contexto + persistencia en localStorage
    types.ts       Modelo de datos
  pages/           Dashboard, Stock, Servicios y sus páginas de formulario/detalle
design-system/     Design system generado con ui-ux-pro-max
```
