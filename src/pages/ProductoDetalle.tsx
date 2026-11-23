import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  Barcode,
  CircleDollarSign,
  MapPin,
  Package,
  Pencil,
  Truck,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as GraficoTooltip,
  XAxis,
  YAxis,
} from "recharts"
import { toast } from "sonner"
import { EstadoStockBadge, TarjetaMetrica } from "@/components/comunes/Indicadores"
import { MovimientoDialog } from "@/components/stock/MovimientoDialog"
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
  formatearFechaHora,
  formatearMoneda,
  formatearNumero,
} from "@/lib/format"
import { useDatos } from "@/lib/store"
import type { MovimientoStock } from "@/lib/types"

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

export default function ProductoDetalle() {
  const { id } = useParams()
  const navegar = useNavigate()
  const { productos, movimientos } = useDatos()
  const producto = productos.find((item) => item.id === id)
  const [dialogoMovimiento, setDialogoMovimiento] = useState(false)
  const [tipoMovimiento, setTipoMovimiento] = useState<"entrada" | "salida">("entrada")

  useEffect(() => {
    if (!producto) {
      toast.error("No se encontró el producto")
      navegar("/stock", { replace: true })
    }
  }, [producto, navegar])

  const movimientosProducto = useMemo(
    () => movimientos.filter((movimiento) => movimiento.productoId === id),
    [movimientos, id],
  )

  const datosGrafico = useMemo(() => {
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
    for (const movimiento of movimientosProducto) {
      const dia = porClave.get(claveLocal(movimiento.fecha))
      if (dia) {
        if (movimiento.tipo === "entrada") dia.entradas += movimiento.cantidad
        else dia.salidas += movimiento.cantidad
      }
    }
    return dias.map(({ etiqueta, entradas, salidas }) => ({ etiqueta, entradas, salidas }))
  }, [movimientosProducto])

  if (!producto) return null

  const entradas = movimientosProducto
    .filter((movimiento) => movimiento.tipo === "entrada")
    .reduce((total, movimiento) => total + movimiento.cantidad, 0)
  const salidas = movimientosProducto
    .filter((movimiento) => movimiento.tipo === "salida")
    .reduce((total, movimiento) => total + movimiento.cantidad, 0)

  function abrirMovimiento(tipo: "entrada" | "salida") {
    setTipoMovimiento(tipo)
    setDialogoMovimiento(true)
  }

  return (
    <div className="space-y-5">
      <Button asChild variant="ghost" size="sm">
        <Link to="/stock">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver al stock
        </Link>
      </Button>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">{producto.nombre}</h2>
            <EstadoStockBadge stock={producto.stock} minimo={producto.stockMinimo} />
          </div>
          <p className="tabular mt-1 text-sm text-muted-foreground">
            {producto.codigo} · Código de barras {producto.codigoBarras || "—"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link to={`/productos/${producto.id}/editar`}>
              <Pencil className="size-4" aria-hidden="true" />
              Editar
            </Link>
          </Button>
          <Button variant="outline" onClick={() => abrirMovimiento("salida")}>
            <ArrowDownRight className="size-4" aria-hidden="true" />
            Registrar salida
          </Button>
          <Button onClick={() => abrirMovimiento("entrada")}>
            <ArrowUpRight className="size-4" aria-hidden="true" />
            Registrar entrada
          </Button>
        </div>
      </div>

      <section aria-label="Datos del producto" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <TarjetaMetrica titulo="Stock actual" valor={formatearNumero(producto.stock)} detalle={`Mínimo: ${producto.stockMinimo} unidades`} icono={<Package className="size-[18px]" />} tono={producto.stock <= producto.stockMinimo ? "alerta" : "primario"} />
        <TarjetaMetrica titulo="Entradas registradas" valor={formatearNumero(entradas)} detalle={`${movimientosProducto.filter((m) => m.tipo === "entrada").length} movimientos`} icono={<ArrowUpRight className="size-[18px]" />} />
        <TarjetaMetrica titulo="Salidas registradas" valor={formatearNumero(salidas)} detalle={`${movimientosProducto.filter((m) => m.tipo === "salida").length} movimientos`} icono={<ArrowDownRight className="size-[18px]" />} tono="info" />
        <TarjetaMetrica titulo="Valor del stock" valor={formatearMoneda(producto.stock * producto.precio)} detalle={`Precio unitario ${formatearMoneda(producto.precio)}`} icono={<CircleDollarSign className="size-[18px]" />} tono="neutro" />
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icono: <Barcode className="size-4" />, etiqueta: "Categoría", valor: producto.categoria },
          { icono: <MapPin className="size-4" />, etiqueta: "Ubicación", valor: producto.ubicacion || "—" },
          { icono: <Truck className="size-4" />, etiqueta: "Proveedor", valor: producto.proveedor || "—" },
        ].map((dato) => (
          <Card key={dato.etiqueta} className="gap-0 rounded-xl border-border/70 p-4 shadow-none">
            <div className="flex items-center gap-2 text-muted-foreground">
              {dato.icono}
              <p className="text-xs font-medium">{dato.etiqueta}</p>
            </div>
            <p className="mt-2 truncate text-sm font-semibold">{dato.valor}</p>
          </Card>
        ))}
      </div>

      <Card className="rounded-xl border-border/70 shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Entradas y salidas</CardTitle>
          <CardDescription>Movimientos de los últimos 14 días</CardDescription>
        </CardHeader>
        <CardContent className="h-[260px] pl-1 pr-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={datosGrafico} margin={{ top: 8, right: 8, left: -22, bottom: 0 }} barGap={2} barCategoryGap="28%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="etiqueta" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={16} />
              <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <GraficoTooltip content={<TooltipMovimientos />} cursor={{ fill: "var(--muted)" }} />
              <Bar dataKey="entradas" name="Entradas" fill="var(--chart-1)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="salidas" name="Salidas" fill="var(--chart-2)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border/70 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Historial de movimientos</CardTitle>
          <CardDescription>{movimientosProducto.length} registros para este producto</CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Referencia</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movimientosProducto.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                    Todavía no hay movimientos registrados.
                  </TableCell>
                </TableRow>
              ) : (
                movimientosProducto.map((movimiento: MovimientoStock) => (
                  <TableRow key={movimiento.id}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {formatearFechaHora(movimiento.fecha)}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${movimiento.tipo === "entrada" ? "text-emerald-600 dark:text-emerald-400" : "text-sky-600 dark:text-sky-400"}`}>
                        {movimiento.tipo === "entrada" ? <ArrowUpRight className="size-3.5" aria-hidden="true" /> : <ArrowDownRight className="size-3.5" aria-hidden="true" />}
                        {movimiento.tipo === "entrada" ? "Entrada" : "Salida"}
                      </span>
                    </TableCell>
                    <TableCell>{movimiento.motivo}</TableCell>
                    <TableCell className="tabular text-xs text-muted-foreground">{movimiento.referencia || "—"}</TableCell>
                    <TableCell className="tabular text-right font-semibold">
                      {movimiento.tipo === "entrada" ? "+" : "−"}{movimiento.cantidad}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <MapPin className="size-3.5" aria-hidden="true" />
        Actualizado el {formatearFecha(producto.actualizadoEn)}
      </p>

      <MovimientoDialog
        abierto={dialogoMovimiento}
        alCambiar={setDialogoMovimiento}
        producto={producto}
        tipo={tipoMovimiento}
      />
    </div>
  )
}
