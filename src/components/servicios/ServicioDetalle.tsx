import { useState } from "react"
import { CalendarClock, Clock3, Fuel, MessageSquarePlus, Pencil, Wrench } from "lucide-react"
import { toast } from "sonner"
import { EstadoServicioBadge } from "@/components/comunes/Indicadores"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { formatearFechaHora, formatearMoneda, formatearNumero, tiempoEnGarage, totalServicio } from "@/lib/format"
import { useDatos } from "@/lib/store"
import { ESTADOS_SERVICIO, type EstadoServicio, type Servicio } from "@/lib/types"

const HOY = new Date()

function Campo({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{etiqueta}</p>
      <p className="mt-0.5 truncate text-sm font-medium">{valor || "—"}</p>
    </div>
  )
}

function Apartado({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2.5">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{titulo}</h4>
      {children}
    </section>
  )
}

export function ServicioDetalle({
  abierto,
  alCambiar,
  servicio,
  alEditar,
}: {
  abierto: boolean
  alCambiar: (valor: boolean) => void
  servicio: Servicio | null
  alEditar: (servicio: Servicio) => void
}) {
  const { actualizarServicio, agregarNota } = useDatos()
  const [nuevaNota, setNuevaNota] = useState("")

  if (!servicio) return null

  const total = totalServicio(servicio.repuestos, servicio.manoDeObra)

  function guardarNota(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!servicio || !nuevaNota.trim()) return
    agregarNota(servicio.id, nuevaNota.trim())
    setNuevaNota("")
    toast.success("Nota agregada")
  }

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

  return (
    <Sheet open={abierto} onOpenChange={alCambiar}>
      <SheetContent className="w-full gap-0 overflow-y-auto p-0 sm:max-w-xl">
        <SheetHeader className="border-b border-border p-6 text-left">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="tabular text-xs font-medium text-muted-foreground">{servicio.numero}</p>
              <SheetTitle className="tabular mt-1 text-2xl">{servicio.patente}</SheetTitle>
              <SheetDescription className="mt-1">
                {servicio.tipo} · {servicio.vehiculo || "Vehículo sin especificar"}
              </SheetDescription>
            </div>
            <EstadoServicioBadge estado={servicio.estado} />
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-7 p-6">
          <Apartado titulo="Cliente y vehículo">
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4">
              <Campo etiqueta="Cliente" valor={servicio.cliente} />
              <Campo etiqueta="Teléfono" valor={servicio.telefono} />
              <Campo etiqueta="Vehículo" valor={servicio.vehiculo} />
              <Campo etiqueta="Tipo de servicio" valor={servicio.tipo} />
            </div>
          </Apartado>

          <Apartado titulo="Tiempos">
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4">
              <Campo etiqueta="Ingreso" valor={formatearFechaHora(servicio.ingresoEn)} />
              <Campo etiqueta="Entrega estimada" valor={formatearFechaHora(servicio.entregaEstimadaEn)} />
              <Campo etiqueta="Entrega real" valor={servicio.entregaRealEn ? formatearFechaHora(servicio.entregaRealEn) : "—"} />
              <Campo
                etiqueta="Tiempo en garage"
                valor={tiempoEnGarage(servicio.ingresoEn, servicio.entregaRealEn)}
              />
            </div>
          </Apartado>

          <Apartado titulo="Combustible">
            <div className="space-y-3 rounded-lg bg-muted/50 p-4">
              <div className="flex items-center gap-3">
                <Fuel className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">Nivel al ingreso</span>
                    <span className="tabular font-medium">{servicio.nivelCombustible}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-background">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${servicio.nivelCombustible}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Reposición</span>
                <span className="tabular font-medium">{formatearNumero(servicio.reposicionCombustible)} L</span>
              </div>
              {servicio.observacionesCombustible && (
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {servicio.observacionesCombustible}
                </p>
              )}
            </div>
          </Apartado>

          <Apartado titulo="Repuestos utilizados">
            {servicio.repuestos.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                Sin repuestos asignados
              </p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th scope="col" className="px-3 py-2 font-medium">Repuesto</th>
                      <th scope="col" className="px-3 py-2 text-right font-medium">Cant.</th>
                      <th scope="col" className="px-3 py-2 text-right font-medium">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {servicio.repuestos.map((repuesto, indice) => (
                      <tr key={`${repuesto.productoId}-${indice}`} className="border-t border-border">
                        <td className="max-w-[200px] truncate px-3 py-2">{repuesto.nombre}</td>
                        <td className="tabular px-3 py-2 text-right text-muted-foreground">{repuesto.cantidad}</td>
                        <td className="tabular px-3 py-2 text-right font-medium">
                          {formatearMoneda(repuesto.cantidad * repuesto.precioUnitario)}
                        </td>
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
            <div className="flex items-center justify-between rounded-lg border border-primary/25 bg-primary/5 px-4 py-3 text-sm">
              <span className="font-medium">Total del servicio</span>
              <span className="tabular text-base font-semibold text-primary">{formatearMoneda(total)}</span>
            </div>
          </Apartado>

          <Apartado titulo="Revisión y conclusión">
            <div className="space-y-3 rounded-lg bg-muted/50 p-4 text-sm">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Revisiones</p>
                <p className="mt-1 leading-relaxed">{servicio.revision || "Sin revisiones registradas."}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Conclusión</p>
                <p className="mt-1 leading-relaxed">{servicio.conclusion || "Pendiente de conclusión."}</p>
              </div>
            </div>
          </Apartado>

          <Apartado titulo="Notas de seguimiento">
            <div className="space-y-2">
              {servicio.notas.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  Todavía no hay notas.
                </p>
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
            </div>
            <form onSubmit={guardarNota} className="space-y-2 pt-1">
              <Textarea
                aria-label="Nueva nota de seguimiento"
                rows={2}
                value={nuevaNota}
                onChange={(evento) => setNuevaNota(evento.target.value)}
                placeholder="Escribí una nota de seguimiento…"
              />
              <Button type="submit" size="sm" disabled={!nuevaNota.trim()}>
                <MessageSquarePlus className="size-4" aria-hidden="true" />
                Agregar nota
              </Button>
            </form>
          </Apartado>
        </div>

        <SheetFooter className="flex-col items-stretch gap-3 border-t border-border p-6 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Wrench className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <Select value={servicio.estado} onValueChange={(valor) => cambiarEstado(valor as EstadoServicio)}>
              <SelectTrigger aria-label="Cambiar estado del servicio" className="w-full sm:w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS_SERVICIO.map((estado) => (
                  <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={() => alEditar(servicio)}>
            <Pencil className="size-4" aria-hidden="true" />
            Editar servicio
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export function EtiquetaTiempo({ ingreso, entrega }: { ingreso: string; entrega?: string }) {
  return (
    <span className="tabular inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <Clock3 className="size-3.5" aria-hidden="true" />
      {tiempoEnGarage(ingreso, entrega)}
    </span>
  )
}

export function EtiquetaEntrega({ fecha }: { fecha: string }) {
  const dias = Math.ceil((new Date(fecha).getTime() - HOY.getTime()) / 86_400_000)
  const vencido = dias < 0
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${vencido ? "text-red-400" : "text-muted-foreground"}`}>
      <CalendarClock className="size-3.5" aria-hidden="true" />
      {formatearFechaHora(fecha)}
    </span>
  )
}
