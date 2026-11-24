import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"
import { RepuestosServicio, type FilaRepuesto } from "@/components/servicios/RepuestosServicio"
import { SeccionServicio } from "@/components/servicios/SeccionServicio"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useDatos } from "@/lib/store"
import { ESTADOS_SERVICIO, type EstadoServicio, type Servicio } from "@/lib/types"

type Formulario = {
  patente: string
  vehiculo: string
  kilometraje: string
  cliente: string
  telefono: string
  tipo: string
  estado: EstadoServicio
  ingresoEn: string
  entregaEstimadaEn: string
  entregaRealEn: string
  nivelCombustible: string
  observacionesCombustible: string
  reposicionCombustible: string
  manoDeObra: string
  revision: string
  conclusion: string
  repuestos: FilaRepuesto[]
}

const formularioVacio: Formulario = {
  patente: "",
  vehiculo: "",
  kilometraje: "0",
  cliente: "",
  telefono: "",
  tipo: "",
  estado: "Pendiente",
  ingresoEn: "",
  entregaEstimadaEn: "",
  entregaRealEn: "",
  nivelCombustible: "50",
  observacionesCombustible: "",
  reposicionCombustible: "0",
  manoDeObra: "0",
  revision: "",
  conclusion: "",
  repuestos: [],
}

function aInputFecha(iso?: string): string {
  if (!iso) return ""
  const fecha = new Date(iso)
  return new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}

function deInputFecha(valor: string): string | undefined {
  if (!valor) return undefined
  const fecha = new Date(valor)
  return Number.isNaN(fecha.getTime()) ? undefined : fecha.toISOString()
}

function desdeServicio(servicio: Servicio): Formulario {
  return {
    patente: servicio.patente,
    vehiculo: servicio.vehiculo,
    kilometraje: String(servicio.kilometraje ?? 0),
    cliente: servicio.cliente,
    telefono: servicio.telefono,
    tipo: servicio.tipo,
    estado: servicio.estado,
    ingresoEn: aInputFecha(servicio.ingresoEn),
    entregaEstimadaEn: aInputFecha(servicio.entregaEstimadaEn),
    entregaRealEn: aInputFecha(servicio.entregaRealEn),
    nivelCombustible: String(servicio.nivelCombustible),
    observacionesCombustible: servicio.observacionesCombustible,
    reposicionCombustible: String(servicio.reposicionCombustible),
    manoDeObra: String(servicio.manoDeObra),
    revision: servicio.revision,
    conclusion: servicio.conclusion,
    repuestos: servicio.repuestos.map((repuesto) => ({
      id: repuesto.productoId,
      productoId: repuesto.productoId,
      nombre: repuesto.nombre,
      cantidad: String(repuesto.cantidad),
      precioUnitario: repuesto.precioUnitario,
    })),
  }
}

export default function ServicioForm() {
  const { id } = useParams()
  const navegar = useNavigate()
  const { productos, servicios, agregarServicio, actualizarServicio } = useDatos()
  const servicio = id ? servicios.find((item) => item.id === id) : undefined
  const [formulario, setFormulario] = useState<Formulario>(() =>
    servicio
      ? desdeServicio(servicio)
      : {
          ...formularioVacio,
          ingresoEn: aInputFecha(new Date().toISOString()),
          entregaEstimadaEn: aInputFecha(new Date(Date.now() + 3 * 86_400_000).toISOString()),
        },
  )

  useEffect(() => {
    if (id && !servicio) {
      toast.error("No se encontró el servicio")
      navegar("/servicios", { replace: true })
    }
  }, [id, servicio, navegar])

  function actualizar(campo: keyof Formulario, valor: string) {
    setFormulario((anterior) => ({ ...anterior, [campo]: valor }))
  }

  function guardar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const ingreso = deInputFecha(formulario.ingresoEn)
    const estimada = deInputFecha(formulario.entregaEstimadaEn)
    if (!formulario.patente.trim() || !formulario.cliente.trim() || !formulario.tipo.trim() || !ingreso || !estimada) {
      toast.error("Completá patente, cliente, tipo, ingreso y entrega estimada")
      return
    }

    const datos = {
      patente: formulario.patente.trim().toUpperCase(),
      vehiculo: formulario.vehiculo.trim(),
      kilometraje: Number(formulario.kilometraje) || 0,
      cliente: formulario.cliente.trim(),
      telefono: formulario.telefono.trim(),
      tipo: formulario.tipo.trim(),
      estado: formulario.estado,
      ingresoEn: ingreso,
      entregaEstimadaEn: estimada,
      entregaRealEn: deInputFecha(formulario.entregaRealEn),
      nivelCombustible: Math.min(100, Math.max(0, Number(formulario.nivelCombustible) || 0)),
      observacionesCombustible: formulario.observacionesCombustible.trim(),
      reposicionCombustible: Number(formulario.reposicionCombustible) || 0,
      manoDeObra: Number(formulario.manoDeObra) || 0,
      revision: formulario.revision.trim(),
      conclusion: formulario.conclusion.trim(),
      repuestos: formulario.repuestos
        .filter((fila) => fila.productoId && Number(fila.cantidad) > 0)
        .map((fila) => ({
          productoId: fila.productoId,
          nombre: fila.nombre,
          cantidad: Number(fila.cantidad),
          precioUnitario: fila.precioUnitario,
        })),
      notas: servicio?.notas ?? [],
    }

    if (servicio) {
      actualizarServicio(servicio.id, datos)
      toast.success("Servicio actualizado")
      navegar(`/servicios/${servicio.id}`)
    } else {
      const nuevoId = agregarServicio(datos)
      toast.success("Servicio creado")
      navegar(`/servicios/${nuevoId}`)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Button asChild variant="ghost" size="sm">
        <Link to={servicio ? `/servicios/${servicio.id}` : "/servicios"}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver
        </Link>
      </Button>

      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          {servicio ? `Editar ${servicio.numero}` : "Nuevo servicio"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Datos del vehículo, tiempos, combustible, repuestos y conclusiones del trabajo.
        </p>

        <form onSubmit={guardar} className="mt-4 space-y-4" noValidate>
            <SeccionServicio titulo="Vehículo y cliente">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="srv-patente">Patente</Label>
                  <Input id="srv-patente" name="patente" value={formulario.patente} onChange={(e) => actualizar("patente", e.target.value)} placeholder="AB 123 CD" autoComplete="off" spellCheck={false} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="srv-vehiculo">Vehículo</Label>
                  <Input id="srv-vehiculo" name="vehiculo" value={formulario.vehiculo} onChange={(e) => actualizar("vehiculo", e.target.value)} placeholder="Toyota Corolla 2020" autoComplete="off" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="srv-kilometraje">Kilometraje (km)</Label>
                  <Input id="srv-kilometraje" name="kilometraje" type="number" min={0} step={1} inputMode="numeric" className="tabular" value={formulario.kilometraje} onChange={(e) => actualizar("kilometraje", e.target.value)} placeholder="84500" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="srv-cliente">Cliente</Label>
                  <Input id="srv-cliente" name="cliente" value={formulario.cliente} onChange={(e) => actualizar("cliente", e.target.value)} placeholder="Nombre y apellido" autoComplete="off" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="srv-telefono">Teléfono</Label>
                  <Input id="srv-telefono" name="telefono" type="tel" inputMode="tel" value={formulario.telefono} onChange={(e) => actualizar("telefono", e.target.value)} placeholder="11 1234 5678" autoComplete="tel" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="srv-tipo">Tipo de servicio</Label>
                  <Input id="srv-tipo" name="tipo" value={formulario.tipo} onChange={(e) => actualizar("tipo", e.target.value)} placeholder="Cambio de aceite, revisión general…" autoComplete="off" required />
                </div>
              </div>
            </SeccionServicio>

            <SeccionServicio titulo="Estado y tiempos">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1.5">
                  <Label htmlFor="srv-estado">Estado</Label>
                  <Select value={formulario.estado} onValueChange={(valor) => actualizar("estado", valor as EstadoServicio)}>
                    <SelectTrigger id="srv-estado" name="estado"><SelectValue /></SelectTrigger>
                    <SelectContent>{ESTADOS_SERVICIO.map((estado) => <SelectItem key={estado} value={estado}>{estado}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="srv-ingreso">Ingreso</Label>
                  <Input id="srv-ingreso" name="ingresoEn" type="datetime-local" className="tabular" value={formulario.ingresoEn} onChange={(e) => actualizar("ingresoEn", e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="srv-entrega-estimada">Entrega estimada</Label>
                  <Input id="srv-entrega-estimada" name="entregaEstimadaEn" type="datetime-local" className="tabular" value={formulario.entregaEstimadaEn} onChange={(e) => actualizar("entregaEstimadaEn", e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="srv-entrega-real">Entrega real</Label>
                  <Input id="srv-entrega-real" name="entregaRealEn" type="datetime-local" className="tabular" value={formulario.entregaRealEn} onChange={(e) => actualizar("entregaRealEn", e.target.value)} />
                </div>
              </div>
            </SeccionServicio>

            <SeccionServicio titulo="Combustible" descripcion="Estado al ingreso y reposición">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="srv-combustible">Nivel al ingreso (%)</Label>
                  <Input id="srv-combustible" name="nivelCombustible" type="number" min={0} max={100} inputMode="numeric" className="tabular" value={formulario.nivelCombustible} onChange={(e) => actualizar("nivelCombustible", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="srv-reposicion">Reposición (L)</Label>
                  <Input id="srv-reposicion" name="reposicionCombustible" type="number" min={0} inputMode="numeric" className="tabular" value={formulario.reposicionCombustible} onChange={(e) => actualizar("reposicionCombustible", e.target.value)} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="srv-obs-combustible">Observaciones de combustible</Label>
                  <Textarea id="srv-obs-combustible" name="observacionesCombustible" rows={2} value={formulario.observacionesCombustible} onChange={(e) => actualizar("observacionesCombustible", e.target.value)} placeholder="Estado al ingreso, carga realizada…" />
                </div>
              </div>
            </SeccionServicio>

            <SeccionServicio titulo="Repuestos utilizados" descripcion="Costo del servicio">
              <RepuestosServicio
                filas={formulario.repuestos}
                productos={productos}
                editable
                alCambiarFilas={(filas) => setFormulario((anterior) => ({ ...anterior, repuestos: filas }))}
                manoDeObra={formulario.manoDeObra}
                alCambiarManoDeObra={(valor) => actualizar("manoDeObra", valor)}
              />
            </SeccionServicio>

            <SeccionServicio titulo="Revisión y conclusión">
              <div className="space-y-1.5">
                <Label htmlFor="srv-revision">Revisiones</Label>
                <Textarea id="srv-revision" name="revision" rows={2} value={formulario.revision} onChange={(e) => actualizar("revision", e.target.value)} placeholder="Chequeos realizados, hallazgos…" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="srv-conclusion">Conclusión</Label>
                <Textarea id="srv-conclusion" name="conclusion" rows={2} value={formulario.conclusion} onChange={(e) => actualizar("conclusion", e.target.value)} placeholder="Trabajo realizado y recomendaciones…" />
              </div>
            </SeccionServicio>

            <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" asChild>
                <Link to={servicio ? `/servicios/${servicio.id}` : "/servicios"}>Cancelar</Link>
              </Button>
              <Button type="submit">
                <Save className="size-4" aria-hidden="true" />
                {servicio ? "Guardar cambios" : "Crear servicio"}
              </Button>
            </div>
        </form>
      </div>
    </div>
  )
}
