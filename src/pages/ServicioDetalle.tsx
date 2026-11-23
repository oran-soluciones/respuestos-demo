import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  CalendarClock,
  Clock3,
  Fuel,
  MessageSquarePlus,
  Pencil,
  Wrench,
} from "lucide-react"
import { toast } from "sonner"
import { EstadoServicioBadge } from "@/components/comunes/Indicadores"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  formatearFechaHora,
  formatearMoneda,
  formatearNumero,
  tiempoEnGarage,
  totalServicio,
} from "@/lib/format"
import { useDatos } from "@/lib/store"
import { ESTADOS_SERVICIO, type EstadoServicio } from "@/lib/types"

function Campo({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{etiqueta}</p>
      <p className="mt-0.5 truncate text-sm font-medium">{valor || "—"}</p>
    </div>
  )
}

export default function ServicioDetalle() {
  const { id } = useParams()
  const navegar = useNavigate()
  const { servicios, actualizarServicio, agregarNota } = useDatos()
  const servicio = servicios.find((item) => item.id === id)
  const [nuevaNota, setNuevaNota] = useState("")

  useEffect(() => {
    if (!servicio) {
      toast.error("No se encontró el servicio")
      navegar("/servicios", { replace: true })
    }
  }, [servicio, navegar])

  if (!servicio) return null

  const total = totalServicio(servicio.repuestos, servicio.manoDeObra)

  function cambiarEstado(estado: EstadoServicio) {
    if (!servicio) return
    actualizarServicio(servicio.id, {
      estado,
      entregaRealEn:
        estado === "Entregado" || estado === "Completado"
          ? (servicio.entregaRealEn ?? new Date().toISOString())
          : servicio.entregaRealEn,
    })
    toast.success(`Estado actualizado a ${estado}`)
  }

  function guardarNota(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!servicio || !nuevaNota.trim()) return
    agregarNota(servicio.id, nuevaNota.trim())
    setNuevaNota("")
    toast.success("Nota agregada")
  }

  return (
    <div className="space-y-5">
      <Button asChild variant="ghost" size="sm">
        <Link to="/servicios">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver a servicios
        </Link>
      </Button>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="tabular text-xs font-medium text-muted-foreground">{servicio.numero}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h2 className="tabular text-2xl font-semibold tracking-tight">{servicio.patente}</h2>
            <EstadoServicioBadge estado={servicio.estado} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {servicio.tipo} · {servicio.vehiculo || "Vehículo sin especificar"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={servicio.estado} onValueChange={(valor) => cambiarEstado(valor as EstadoServicio)}>
            <SelectTrigger aria-label="Cambiar estado del servicio" className="w-full sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ESTADOS_SERVICIO.map((estado) => <SelectItem key={estado} value={estado}>{estado}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" asChild>
            <Link to={`/servicios/${servicio.id}/editar`}>
              <Pencil className="size-4" aria-hidden="true" />
              Editar servicio
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-xl border-border/70 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Cliente y vehículo</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 rounded-b-xl bg-muted/40 px-5 py-4">
            <Campo etiqueta="Cliente" valor={servicio.cliente} />
            <Campo etiqueta="Teléfono" valor={servicio.telefono} />
            <Campo etiqueta="Vehículo" valor={servicio.vehiculo} />
            <Campo etiqueta="Tipo de servicio" valor={servicio.tipo} />
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border/70 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tiempos</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 rounded-b-xl bg-muted/40 px-5 py-4">
            <Campo etiqueta="Ingreso" valor={formatearFechaHora(servicio.ingresoEn)} />
            <Campo etiqueta="Entrega estimada" valor={formatearFechaHora(servicio.entregaEstimadaEn)} />
            <Campo etiqueta="Entrega real" valor={servicio.entregaRealEn ? formatearFechaHora(servicio.entregaRealEn) : "—"} />
            <Campo etiqueta="Tiempo en garage" valor={tiempoEnGarage(servicio.ingresoEn, servicio.entregaRealEn)} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-xl border-border/70 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Combustible</CardTitle>
            <CardDescription>Estado al ingreso y reposición</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Fuel className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">Nivel al ingreso</span>
                  <span className="tabular font-medium">{servicio.nivelCombustible}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-emerald-600" style={{ width: `${servicio.nivelCombustible}%` }} />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Reposición</span>
              <span className="tabular font-medium">{formatearNumero(servicio.reposicionCombustible)} L</span>
            </div>
            {servicio.observacionesCombustible && (
              <p className="text-xs leading-relaxed text-muted-foreground">{servicio.observacionesCombustible}</p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border/70 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Revisión y conclusión</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Revisiones</p>
              <p className="mt-1 leading-relaxed">{servicio.revision || "Sin revisiones registradas."}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Conclusión</p>
              <p className="mt-1 leading-relaxed">{servicio.conclusion || "Pendiente de conclusión."}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border-border/70 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Repuestos utilizados</CardTitle>
          <CardDescription>Costo del servicio</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {servicio.repuestos.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">Sin repuestos asignados</p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-4 py-2.5 font-medium">Repuesto</th>
                    <th scope="col" className="px-4 py-2.5 text-right font-medium">Cant.</th>
                    <th scope="col" className="px-4 py-2.5 text-right font-medium">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {servicio.repuestos.map((repuesto, indice) => (
                    <tr key={`${repuesto.productoId}-${indice}`} className="border-t border-border">
                      <td className="max-w-[240px] truncate px-4 py-2.5">
                        <Link className="hover:underline" to={`/productos/${repuesto.productoId}`}>{repuesto.nombre}</Link>
                      </td>
                      <td className="tabular px-4 py-2.5 text-right text-muted-foreground">{repuesto.cantidad}</td>
                      <td className="tabular px-4 py-2.5 text-right font-medium">{formatearMoneda(repuesto.cantidad * repuesto.precioUnitario)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3 text-sm">
            <span className="text-muted-foreground">Mano de obra</span>
            <span className="tabular font-medium">{formatearMoneda(servicio.manoDeObra)}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-foreground/20 bg-foreground/5 px-4 py-3 text-sm">
            <span className="font-medium">Total del servicio</span>
            <span className="tabular text-base font-semibold">{formatearMoneda(total)}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border/70 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Notas de seguimiento</CardTitle>
          <CardDescription>{servicio.notas.length} notas registradas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {servicio.notas.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">Todavía no hay notas.</p>
          ) : (
            [...servicio.notas]
              .sort((a, b) => b.fecha.localeCompare(a.fecha))
              .map((nota) => (
                <div key={nota.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="secondary" className="text-[10px]">{nota.autor}</Badge>
                    <span className="text-[11px] text-muted-foreground">{formatearFechaHora(nota.fecha)}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed">{nota.contenido}</p>
                </div>
              ))
          )}
          <form onSubmit={guardarNota} className="space-y-2 pt-1">
            <Textarea aria-label="Nueva nota de seguimiento" rows={2} value={nuevaNota} onChange={(e) => setNuevaNota(e.target.value)} placeholder="Escribí una nota de seguimiento…" />
            <Button type="submit" size="sm" disabled={!nuevaNota.trim()}>
              <MessageSquarePlus className="size-4" aria-hidden="true" />
              Agregar nota
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <Clock3 className="size-3.5" aria-hidden="true" />
        <CalendarClock className="size-3.5" aria-hidden="true" />
        <Wrench className="size-3.5" aria-hidden="true" />
        Los cambios se guardan automáticamente en este navegador.
      </p>
    </div>
  )
}
