import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Fuel, MessageSquarePlus, Pencil } from "lucide-react"
import { toast } from "sonner"
import { EstadoServicioBadge } from "@/components/comunes/Indicadores"
import { RepuestosServicio, type FilaRepuesto } from "@/components/servicios/RepuestosServicio"
import { CampoServicio, SeccionServicio } from "@/components/servicios/SeccionServicio"
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
import { formatearFechaHora, formatearNumero, tiempoEnGarage } from "@/lib/format"
import { useDatos } from "@/lib/store"
import { ESTADOS_SERVICIO, type EstadoServicio } from "@/lib/types"

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

  const filas: FilaRepuesto[] = servicio.repuestos.map((repuesto) => ({
    id: repuesto.productoId,
    productoId: repuesto.productoId,
    nombre: repuesto.nombre,
    cantidad: String(repuesto.cantidad),
    precioUnitario: repuesto.precioUnitario,
  }))

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
    <div className="mx-auto max-w-5xl space-y-5">
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

      <SeccionServicio titulo="Vehículo y cliente">
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoServicio etiqueta="Patente" valor={<span className="tabular">{servicio.patente}</span>} />
          <CampoServicio etiqueta="Vehículo" valor={servicio.vehiculo} />
          <CampoServicio etiqueta="Kilometraje" valor={servicio.kilometraje ? `${formatearNumero(servicio.kilometraje)} km` : "—"} />
          <CampoServicio etiqueta="Cliente" valor={servicio.cliente} />
          <CampoServicio etiqueta="Teléfono" valor={servicio.telefono} />
          <CampoServicio etiqueta="Tipo de servicio" valor={servicio.tipo} />
        </div>
      </SeccionServicio>

      <SeccionServicio titulo="Estado y tiempos">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Estado</p>
            <div className="mt-1"><EstadoServicioBadge estado={servicio.estado} /></div>
          </div>
          <CampoServicio etiqueta="Ingreso" valor={formatearFechaHora(servicio.ingresoEn)} />
          <CampoServicio etiqueta="Entrega estimada" valor={formatearFechaHora(servicio.entregaEstimadaEn)} />
          <CampoServicio etiqueta="Entrega real" valor={servicio.entregaRealEn ? formatearFechaHora(servicio.entregaRealEn) : "—"} />
          <CampoServicio etiqueta="Tiempo en garage" valor={tiempoEnGarage(servicio.ingresoEn, servicio.entregaRealEn)} />
        </div>
      </SeccionServicio>

      <SeccionServicio titulo="Combustible" descripcion="Estado al ingreso y reposición">
        <div className="grid gap-3 sm:grid-cols-2">
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
          <CampoServicio etiqueta="Reposición (L)" valor={formatearNumero(servicio.reposicionCombustible)} />
          <div className="sm:col-span-2">
            <CampoServicio etiqueta="Observaciones" valor={servicio.observacionesCombustible} />
          </div>
        </div>
      </SeccionServicio>

      <SeccionServicio titulo="Repuestos utilizados" descripcion="Costo del servicio">
        <RepuestosServicio
          filas={filas}
          productos={[]}
          manoDeObra={String(servicio.manoDeObra)}
        />
      </SeccionServicio>

      <SeccionServicio titulo="Revisión y conclusión">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Revisiones</p>
            <p className="mt-1 text-sm leading-relaxed">{servicio.revision || "Sin revisiones registradas."}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Conclusión</p>
            <p className="mt-1 text-sm leading-relaxed">{servicio.conclusion || "Pendiente de conclusión."}</p>
          </div>
        </div>
      </SeccionServicio>

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
    </div>
  )
}
