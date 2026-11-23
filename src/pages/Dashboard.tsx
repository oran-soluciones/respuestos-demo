import { useMemo } from "react"
import { Link } from "react-router-dom"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as GraficoTooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  CalendarClock,
  CircleDollarSign,
  ClipboardList,
  Package,
  TrendingUp,
  Wrench,
} from "lucide-react"
import { EstadoServicioBadge, EstadoStockBadge, TarjetaMetrica } from "@/components/comunes/Indicadores"
import { EncabezadoPagina } from "@/components/layout/Layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  formatearFecha,
  formatearMoneda,
  formatearNumero,
  textoVencimiento,
} from "@/lib/format"
import { useDatos } from "@/lib/store"
import { CATEGORIAS, type Categoria } from "@/lib/types"

const HOY_TEXTO = new Intl.DateTimeFormat("es-AR", { dateStyle: "long" }).format(new Date())

const COLORES_GRAFICO = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
]


function claveLocal(iso: string): string {
  const fecha = new Date(iso)
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`
}

function TooltipMovimientos({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { name?: string; value?: number; color?: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="mb-1.5 font-semibold text-popover-foreground">{label}</p>
      {payload.map((entrada) => (
        <p key={entrada.name} className="flex items-center gap-2 text-muted-foreground">
          <span className="size-2 rounded-full" style={{ backgroundColor: entrada.color }} />
          {entrada.name}: <span className="tabular font-medium text-foreground">{formatearNumero(entrada.value ?? 0)}</span>
        </p>
      ))}
    </div>
  )
}

function TooltipCategoria({
  active,
  payload,
}: {
  active?: boolean
  payload?: { name?: string; value?: number; payload?: { nombre?: string; valor?: number } }[]
}) {
  if (!active || !payload?.length) return null
  const dato = payload[0]?.payload
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-popover-foreground">{dato?.nombre ?? payload[0]?.name}</p>
      <p className="tabular mt-1 text-muted-foreground">
        {formatearMoneda(dato?.valor ?? payload[0]?.value ?? 0)}
      </p>
    </div>
  )
}

export default function Dashboard() {
  const { productos, movimientos, servicios } = useDatos()

  const datosMovimientos = useMemo(() => {
    const dias = Array.from({ length: 14 }, (_, indice) => {
      const fecha = new Date()
      fecha.setDate(fecha.getDate() - (13 - indice))
      return {
        clave: claveLocal(fecha.toISOString()),
        etiqueta: new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short" }).format(fecha),
        entradas: 0,
        salidas: 0,
      }
    })
    const porClave = new Map(dias.map((dia) => [dia.clave, dia]))

    for (const movimiento of movimientos) {
      const dia = porClave.get(claveLocal(movimiento.fecha))
      if (dia) {
        if (movimiento.tipo === "entrada") dia.entradas += movimiento.cantidad
        else dia.salidas += movimiento.cantidad
      }
    }
    return dias.map(({ etiqueta, entradas, salidas }) => ({ etiqueta, entradas, salidas }))
  }, [movimientos])

  const datosCategorias = useMemo(() => {
    const agrupado = new Map<Categoria, number>()
    for (const producto of productos) {
      agrupado.set(
        producto.categoria,
        (agrupado.get(producto.categoria) ?? 0) + producto.stock * producto.precio,
      )
    }
    return CATEGORIAS.map((categoria) => ({
      nombre: categoria,
      valor: agrupado.get(categoria) ?? 0,
    }))
      .filter((item) => item.valor > 0)
      .sort((a, b) => b.valor - a.valor)
  }, [productos])

  const valorInventario = productos.reduce((total, item) => total + item.stock * item.precio, 0)
  const unidades = productos.reduce((total, item) => total + item.stock, 0)
  const productosBajos = productos
    .filter((item) => item.stock <= item.stockMinimo)
    .sort((a, b) => a.stock / Math.max(a.stockMinimo, 1) - b.stock / Math.max(b.stockMinimo, 1))
  const serviciosActivos = servicios.filter(
    (servicio) => servicio.estado !== "Completado" && servicio.estado !== "Entregado",
  )
  const proximosServicios = [...serviciosActivos]
    .sort((a, b) => a.entregaEstimadaEn.localeCompare(b.entregaEstimadaEn))
    .slice(0, 5)
  const movimientosRecientes = movimientos.slice(0, 6)

  return (
    <div className="space-y-6">
      <EncabezadoPagina
        titulo="Resumen general"
        descripcion={`Vista actualizada al ${HOY_TEXTO}`}
        acciones={
          <>
            <Button asChild variant="outline">
              <Link to="/stock">
                <Package className="size-4" aria-hidden="true" />
                Ver stock
              </Link>
            </Button>
            <Button asChild>
              <Link to="/servicios">
                <Wrench className="size-4" aria-hidden="true" />
                Ir a servicios
              </Link>
            </Button>
          </>
        }
      />

      <section aria-label="Indicadores principales" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <TarjetaMetrica
          titulo="Valor del inventario"
          valor={formatearMoneda(valorInventario)}
          detalle={`${formatearNumero(productos.length)} referencias · ${formatearNumero(unidades)} unidades`}
          icono={<CircleDollarSign className="size-[18px]" />}
        />
        <TarjetaMetrica
          titulo="Productos con stock bajo"
          valor={formatearNumero(productosBajos.length)}
          detalle="Requieren reposición próxima"
          icono={<AlertTriangle className="size-[18px]" />}
          tono="alerta"
        />
        <TarjetaMetrica
          titulo="Servicios activos"
          valor={formatearNumero(serviciosActivos.length)}
          detalle="En taller o esperando repuestos"
          icono={<ClipboardList className="size-[18px]" />}
          tono="info"
        />
        <TarjetaMetrica
          titulo="Movimientos (14 días)"
          valor={formatearNumero(movimientos.length)}
          detalle="Entradas y salidas registradas"
          icono={<TrendingUp className="size-[18px]" />}
          tono="neutro"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <Card className="rounded-xl border-border/70 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Movimientos de stock</CardTitle>
            <CardDescription>Entradas y salidas de los últimos 14 días</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px] pl-1 pr-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={datosMovimientos}
                margin={{ top: 8, right: 8, left: -22, bottom: 0 }}
                barGap={2}
                barCategoryGap="28%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="etiqueta"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                  minTickGap={16}
                />
                <YAxis
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <GraficoTooltip content={<TooltipMovimientos />} cursor={{ fill: "var(--muted)" }} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  height={28}
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }}
                />
                <Bar
                  dataKey="entradas"
                  name="Entradas"
                  fill="var(--chart-1)"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={false}
                />
                <Bar
                  dataKey="salidas"
                  name="Salidas"
                  fill="var(--chart-2)"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border/70 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Inventario por categoría</CardTitle>
            <CardDescription>Valor en pesos argentinos</CardDescription>
          </CardHeader>
          <CardContent className="flex h-[280px] flex-col items-center">
            <div className="h-[190px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={datosCategorias}
                    dataKey="valor"
                    nameKey="nombre"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={2}
                    stroke="none"
                    isAnimationActive={false}
                  >
                    {datosCategorias.map((entrada, indice) => (
                      <Cell key={entrada.nombre} fill={COLORES_GRAFICO[indice % COLORES_GRAFICO.length]} />
                    ))}
                  </Pie>
                  <GraficoTooltip content={<TooltipCategoria />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-1 grid w-full grid-cols-2 gap-x-4 gap-y-1.5 px-2">
              {datosCategorias.map((entrada, indice) => (
                <li key={entrada.nombre} className="flex min-w-0 items-center gap-2 text-[11px]">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: COLORES_GRAFICO[indice % COLORES_GRAFICO.length] }}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1 truncate text-muted-foreground">{entrada.nombre}</span>
                  <span className="tabular font-medium">{Math.round((entrada.valor / valorInventario) * 100)}%</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-xl border-border/70 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Próximos servicios</CardTitle>
              <CardDescription>Entregas programadas más cercanas</CardDescription>
            </div>
            <CalendarClock className="size-[18px] text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent className="space-y-1.5">
            {proximosServicios.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No hay servicios pendientes.</p>
            ) : (
              proximosServicios.map((servicio) => (
                <Link
                  key={servicio.id}
                  to={`/servicios/${servicio.id}`}
                  className="flex items-center gap-3 rounded-lg border border-transparent px-2 py-2.5 transition-colors duration-150 hover:border-border hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Wrench className="size-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="tabular truncate text-sm font-semibold">{servicio.patente}</p>
                      <EstadoServicioBadge estado={servicio.estado} />
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {servicio.tipo} · {servicio.cliente}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-medium">{textoVencimiento(servicio.entregaEstimadaEn)}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatearFecha(servicio.entregaEstimadaEn)}
                    </p>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border/70 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Repuestos con stock bajo</CardTitle>
              <CardDescription>Por debajo del mínimo configurado</CardDescription>
            </div>
            <Boxes className="size-[18px] text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent className="space-y-1.5">
            {productosBajos.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Todos los niveles están correctos.</p>
            ) : (
              productosBajos.slice(0, 5).map((producto) => (
                <Link
                  key={producto.id}
                  to={`/productos/${producto.id}`}
                  className="flex items-center gap-3 rounded-lg border border-transparent px-2 py-2.5 transition-colors duration-150 hover:border-border hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-amber-600 text-white">
                    <AlertTriangle className="size-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{producto.nombre}</p>
                    <p className="tabular truncate text-xs text-muted-foreground">
                      {producto.codigo} · Ubicación {producto.ubicacion}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="tabular text-sm font-semibold text-amber-600 dark:text-amber-400">
                      {producto.stock} <span className="text-xs font-normal text-muted-foreground">/ {producto.stockMinimo}</span>
                    </p>
                    <EstadoStockBadge stock={producto.stock} minimo={producto.stockMinimo} />
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-xl border-border/70 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base">Últimos movimientos</CardTitle>
            <CardDescription>Registro más reciente del inventario</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/stock">
              Ver todo
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="px-0 pb-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movimientosRecientes.map((movimiento) => (
                <TableRow key={movimiento.id}>
                  <TableCell className="tabular whitespace-nowrap text-muted-foreground">
                    {formatearFecha(movimiento.fecha)}
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate font-medium">{movimiento.productoNombre}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">
                    {movimiento.motivo}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        movimiento.tipo === "entrada"
                          ? "border-emerald-700 bg-emerald-600 text-white"
                          : "border-sky-700 bg-sky-600 text-white"
                      }
                    >
                      {movimiento.tipo === "entrada" ? (
                        <ArrowUpRight className="size-3" aria-hidden="true" />
                      ) : (
                        <ArrowDownRight className="size-3" aria-hidden="true" />
                      )}
                      {movimiento.tipo === "entrada" ? "Entrada" : "Salida"}
                    </Badge>
                  </TableCell>
                  <TableCell className="tabular text-right font-medium">
                    {movimiento.tipo === "entrada" ? "+" : "−"}
                    {movimiento.cantidad}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
