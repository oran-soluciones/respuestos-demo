import { useEffect, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { formatearMoneda } from "@/lib/format"
import { useDatos } from "@/lib/store"
import { ESTADOS_SERVICIO, type EstadoServicio, type Servicio } from "@/lib/types"

type RepuestoFormulario = { productoId: string; cantidad: string }

type Formulario = {
  patente: string
  vehiculo: string
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
  repuestos: RepuestoFormulario[]
}

const formularioVacio: Formulario = {
  patente: "",
  vehiculo: "",
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

function ahoraInput(): string {
  return aInputFecha(new Date().toISOString())
}

export function ServicioDialog({
  abierto,
  alCambiar,
  servicio,
}: {
  abierto: boolean
  alCambiar: (valor: boolean) => void
  servicio?: Servicio | null
}) {
  const { productos, agregarServicio, actualizarServicio } = useDatos()
  const [formulario, setFormulario] = useState<Formulario>(formularioVacio)

  useEffect(() => {
    if (!abierto) return
    setFormulario(
      servicio
        ? {
            patente: servicio.patente,
            vehiculo: servicio.vehiculo,
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
              productoId: repuesto.productoId,
              cantidad: String(repuesto.cantidad),
            })),
          }
        : { ...formularioVacio, ingresoEn: ahoraInput() },
    )
  }, [abierto, servicio])

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

    const repuestos = formulario.repuestos
      .filter((item) => item.productoId && Number(item.cantidad) > 0)
      .map((item) => {
        const producto = productos.find((producto) => producto.id === item.productoId)!
        return {
          productoId: producto.id,
          nombre: producto.nombre,
          cantidad: Number(item.cantidad),
          precioUnitario: producto.precio,
        }
      })

    const datos = {
      patente: formulario.patente.trim().toUpperCase(),
      vehiculo: formulario.vehiculo.trim(),
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
      repuestos,
      notas: servicio?.notas ?? [],
    }

    if (servicio) {
      actualizarServicio(servicio.id, datos)
      toast.success("Servicio actualizado")
    } else {
      agregarServicio(datos)
      toast.success("Servicio creado")
    }
    alCambiar(false)
  }

  const costoRepuestos = formulario.repuestos.reduce((total, item) => {
    const producto = productos.find((producto) => producto.id === item.productoId)
    return total + (producto?.precio ?? 0) * (Number(item.cantidad) || 0)
  }, 0)

  return (
    <Dialog open={abierto} onOpenChange={alCambiar}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{servicio ? `Editar ${servicio.numero}` : "Nuevo servicio"}</DialogTitle>
          <DialogDescription>
            Datos del vehículo, tiempos, combustible, repuestos y conclusiones del trabajo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={guardar} className="space-y-5" noValidate>
          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vehículo y cliente</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="srv-patente">Patente</Label>
                <Input
                  id="srv-patente" name="patente" value={formulario.patente}
                  onChange={(evento) => actualizar("patente", evento.target.value)}
                  placeholder="AB 123 CD" autoComplete="off" spellCheck={false} required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="srv-vehiculo">Vehículo</Label>
                <Input
                  id="srv-vehiculo" name="vehiculo" value={formulario.vehiculo}
                  onChange={(evento) => actualizar("vehiculo", evento.target.value)}
                  placeholder="Toyota Corolla 2020" autoComplete="off"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="srv-cliente">Cliente</Label>
                <Input
                  id="srv-cliente" name="cliente" value={formulario.cliente}
                  onChange={(evento) => actualizar("cliente", evento.target.value)}
                  placeholder="Nombre y apellido" autoComplete="off" required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="srv-telefono">Teléfono</Label>
                <Input
                  id="srv-telefono" name="telefono" type="tel" inputMode="tel"
                  value={formulario.telefono}
                  onChange={(evento) => actualizar("telefono", evento.target.value)}
                  placeholder="11 1234 5678" autoComplete="tel"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="srv-tipo">Tipo de servicio</Label>
                <Input
                  id="srv-tipo" name="tipo" value={formulario.tipo}
                  onChange={(evento) => actualizar("tipo", evento.target.value)}
                  placeholder="Cambio de aceite, revisión general…" autoComplete="off" required
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado y tiempos</legend>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <Label htmlFor="srv-estado">Estado</Label>
                <Select value={formulario.estado} onValueChange={(valor) => actualizar("estado", valor as EstadoServicio)}>
                  <SelectTrigger id="srv-estado" name="estado"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ESTADOS_SERVICIO.map((estado) => (
                      <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="srv-ingreso">Ingreso</Label>
                <Input
                  id="srv-ingreso" name="ingresoEn" type="datetime-local"
                  className="tabular" value={formulario.ingresoEn}
                  onChange={(evento) => actualizar("ingresoEn", evento.target.value)} required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="srv-entrega-estimada">Entrega estimada</Label>
                <Input
                  id="srv-entrega-estimada" name="entregaEstimadaEn" type="datetime-local"
                  className="tabular" value={formulario.entregaEstimadaEn}
                  onChange={(evento) => actualizar("entregaEstimadaEn", evento.target.value)} required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="srv-entrega-real">Entrega real</Label>
                <Input
                  id="srv-entrega-real" name="entregaRealEn" type="datetime-local"
                  className="tabular" value={formulario.entregaRealEn}
                  onChange={(evento) => actualizar("entregaRealEn", evento.target.value)}
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Combustible</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="srv-combustible">Nivel al ingreso (%)</Label>
                <Input
                  id="srv-combustible" name="nivelCombustible" type="number" min={0} max={100}
                  inputMode="numeric" className="tabular" value={formulario.nivelCombustible}
                  onChange={(evento) => actualizar("nivelCombustible", evento.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="srv-reposicion">Reposición (L)</Label>
                <Input
                  id="srv-reposicion" name="reposicionCombustible" type="number" min={0}
                  inputMode="numeric" className="tabular" value={formulario.reposicionCombustible}
                  onChange={(evento) => actualizar("reposicionCombustible", evento.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="srv-mano-obra">Mano de obra ($)</Label>
                <Input
                  id="srv-mano-obra" name="manoDeObra" type="number" min={0}
                  inputMode="numeric" className="tabular" value={formulario.manoDeObra}
                  onChange={(evento) => actualizar("manoDeObra", evento.target.value)}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-3">
                <Label htmlFor="srv-obs-combustible">Observaciones de combustible</Label>
                <Textarea
                  id="srv-obs-combustible" name="observacionesCombustible" rows={2}
                  value={formulario.observacionesCombustible}
                  onChange={(evento) => actualizar("observacionesCombustible", evento.target.value)}
                  placeholder="Estado al ingreso, carga realizada…"
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Repuestos utilizados</legend>
            {formulario.repuestos.map((repuesto, indice) => (
              <div key={indice} className="flex items-end gap-2">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Label htmlFor={`repuesto-${indice}`}>Repuesto</Label>
                  <Select
                    value={repuesto.productoId}
                    onValueChange={(valor) =>
                      setFormulario((anterior) => ({
                        ...anterior,
                        repuestos: anterior.repuestos.map((item, i) => i === indice ? { ...item, productoId: valor } : item),
                      }))
                    }
                  >
                    <SelectTrigger id={`repuesto-${indice}`}><SelectValue placeholder="Elegir repuesto" /></SelectTrigger>
                    <SelectContent>
                      {productos.map((producto) => (
                        <SelectItem key={producto.id} value={producto.id}>
                          {producto.nombre} · {formatearMoneda(producto.precio)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24 space-y-1.5">
                  <Label htmlFor={`cantidad-${indice}`}>Cant.</Label>
                  <Input
                    id={`cantidad-${indice}`} type="number" min={1} inputMode="numeric" className="tabular"
                    value={repuesto.cantidad}
                    onChange={(evento) =>
                      setFormulario((anterior) => ({
                        ...anterior,
                        repuestos: anterior.repuestos.map((item, i) => i === indice ? { ...item, cantidad: evento.target.value } : item),
                      }))
                    }
                  />
                </div>
                <Button
                  type="button" variant="ghost" size="icon"
                  aria-label={`Quitar repuesto ${indice + 1}`}
                  onClick={() =>
                    setFormulario((anterior) => ({
                      ...anterior,
                      repuestos: anterior.repuestos.filter((_, i) => i !== indice),
                    }))
                  }
                >
                  <Trash2 className="size-4 text-muted-foreground" aria-hidden="true" />
                </Button>
              </div>
            ))}
            <Button
              type="button" variant="outline" size="sm"
              onClick={() =>
                setFormulario((anterior) => ({
                  ...anterior,
                  repuestos: [...anterior.repuestos, { productoId: "", cantidad: "1" }],
                }))
              }
            >
              <Plus className="size-4" aria-hidden="true" />
              Agregar repuesto
            </Button>
            <p className="tabular text-xs text-muted-foreground">
              Costo estimado de repuestos: {formatearMoneda(costoRepuestos)}
            </p>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Revisión y conclusión</legend>
            <div className="space-y-1.5">
              <Label htmlFor="srv-revision">Revisiones</Label>
              <Textarea
                id="srv-revision" name="revision" rows={2} value={formulario.revision}
                onChange={(evento) => actualizar("revision", evento.target.value)}
                placeholder="Chequeos realizados, hallazgos…"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="srv-conclusion">Conclusión</Label>
              <Textarea
                id="srv-conclusion" name="conclusion" rows={2} value={formulario.conclusion}
                onChange={(evento) => actualizar("conclusion", evento.target.value)}
                placeholder="Trabajo realizado y recomendaciones…"
              />
            </div>
          </fieldset>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => alCambiar(false)}>Cancelar</Button>
            <Button type="submit">{servicio ? "Guardar cambios" : "Crear servicio"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
