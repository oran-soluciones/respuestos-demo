import { useMemo, useState } from "react"
import {
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  Wrench,
} from "lucide-react"
import { toast } from "sonner"
import { EstadoServicioBadge } from "@/components/comunes/Indicadores"
import { EncabezadoPagina } from "@/components/layout/Layout"
import { ServicioDetalle, EtiquetaEntrega, EtiquetaTiempo } from "@/components/servicios/ServicioDetalle"
import { ServicioDialog } from "@/components/servicios/ServicioDialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  totalServicio,
} from "@/lib/format"
import { useDatos } from "@/lib/store"
import { ESTADOS_SERVICIO, type EstadoServicio, type Servicio } from "@/lib/types"

export default function Servicios() {
  const { servicios, eliminarServicio } = useDatos()
  const [busqueda, setBusqueda] = useState("")
  const [estado, setEstado] = useState<EstadoServicio | "todos">("todos")
  const [dialogoFormulario, setDialogoFormulario] = useState(false)
  const [servicioEditar, setServicioEditar] = useState<Servicio | null>(null)
  const [servicioDetalle, setServicioDetalle] = useState<Servicio | null>(null)
  const [servicioEliminar, setServicioEliminar] = useState<Servicio | null>(null)

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase("es-AR")
    return servicios.filter((servicio) => {
      const coincideTexto =
        !texto ||
        servicio.patente.toLocaleLowerCase("es-AR").includes(texto) ||
        servicio.cliente.toLocaleLowerCase("es-AR").includes(texto) ||
        servicio.numero.toLocaleLowerCase("es-AR").includes(texto) ||
        servicio.tipo.toLocaleLowerCase("es-AR").includes(texto) ||
        servicio.vehiculo.toLocaleLowerCase("es-AR").includes(texto)
      const coincideEstado = estado === "todos" || servicio.estado === estado
      return coincideTexto && coincideEstado
    })
  }, [servicios, busqueda, estado])

  const activos = servicios.filter(
    (servicio) => servicio.estado !== "Completado" && servicio.estado !== "Entregado",
  )
  const enTaller = servicios.filter((servicio) => servicio.estado === "En curso")
  const esperandoRepuestos = servicios.filter((servicio) => servicio.estado === "Esperando repuestos")
  const entregados = servicios.filter((servicio) => servicio.estado === "Entregado")
  const facturacion = entregados.reduce(
    (total, servicio) => total + totalServicio(servicio.repuestos, servicio.manoDeObra),
    0,
  )

  function abrirNuevo() {
    setServicioEditar(null)
    setDialogoFormulario(true)
  }

  function abrirEdicion(servicio: Servicio) {
    setServicioEditar(servicio)
    setServicioDetalle(null)
    setDialogoFormulario(true)
  }

  return (
    <div className="space-y-5">
      <EncabezadoPagina
        titulo="Gestión de servicios"
        descripcion="Vehículos en taller, patentes, combustible, revisiones y conclusiones"
        acciones={
          <Button onClick={abrirNuevo}>
            <Plus className="size-4" aria-hidden="true" />
            Nuevo servicio
          </Button>
        }
      />

      <section aria-label="Resumen de servicios" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { titulo: "Servicios activos", valor: formatearNumero(activos.length), detalle: "Pendientes de entrega", icono: <Wrench className="size-[18px]" /> },
          { titulo: "En taller", valor: formatearNumero(enTaller.length), detalle: "Trabajo en curso", icono: <Clock3 className="size-[18px]" /> },
          { titulo: "Esperando repuestos", valor: formatearNumero(esperandoRepuestos.length), detalle: "A la espera de stock", icono: <CalendarClock className="size-[18px]" /> },
          { titulo: "Facturación entregada", valor: formatearMoneda(facturacion), detalle: `${entregados.length} servicios entregados`, icono: <CircleDollarSign className="size-[18px]" /> },
        ].map((metrica) => (
          <Card key={metrica.titulo} className="gap-0 rounded-xl border-border/70 p-4 shadow-none">
            <p className="text-xs font-medium text-muted-foreground">{metrica.titulo}</p>
            <p className="tabular mt-1.5 text-xl font-semibold tracking-tight">{metrica.valor}</p>
            <p className="mt-1 truncate text-[11px] text-muted-foreground">{metrica.detalle}</p>
          </Card>
        ))}
      </section>

      <Card className="rounded-xl border-border/70 shadow-none">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="buscar-servicio">Buscar</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                id="buscar-servicio" type="search" value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
                placeholder="Patente, cliente, número o tipo…" className="pl-9" autoComplete="off"
              />
            </div>
          </div>
          <div className="w-full space-y-1.5 sm:w-56">
            <Label htmlFor="filtro-estado-servicio">Estado</Label>
            <Select value={estado} onValueChange={(valor) => setEstado(valor as EstadoServicio | "todos")}>
              <SelectTrigger id="filtro-estado-servicio" name="estado"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {ESTADOS_SERVICIO.map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto [&_[data-slot=table-cell]]:px-3 [&_[data-slot=table-head]]:px-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Patente / Cliente</TableHead>
                <TableHead>Servicio</TableHead>
                <TableHead>Ingreso</TableHead>
                <TableHead>En garage</TableHead>
                <TableHead>Entrega estimada</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-12 text-right"><span className="sr-only">Acciones</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center text-sm text-muted-foreground">
                    No se encontraron servicios con esos filtros.
                  </TableCell>
                </TableRow>
              ) : (
                filtrados.map((servicio) => (
                  <TableRow key={servicio.id}>
                    <TableCell className="tabular whitespace-nowrap text-xs font-medium text-muted-foreground">
                      {servicio.numero}
                    </TableCell>
                    <TableCell className="max-w-[190px]">
                      <p className="tabular truncate text-sm font-semibold">{servicio.patente}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{servicio.cliente}</p>
                    </TableCell>
                    <TableCell className="max-w-[180px]">
                      <p className="truncate text-sm">{servicio.tipo}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{servicio.vehiculo}</p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {formatearFecha(servicio.ingresoEn)}
                    </TableCell>
                    <TableCell><EtiquetaTiempo ingreso={servicio.ingresoEn} entrega={servicio.entregaRealEn} compacto /></TableCell>
                    <TableCell><EtiquetaEntrega fecha={servicio.entregaEstimadaEn} compacto /></TableCell>
                    <TableCell><EstadoServicioBadge estado={servicio.estado} /></TableCell>
                    <TableCell className="tabular whitespace-nowrap text-right text-sm font-semibold">
                      {formatearMoneda(totalServicio(servicio.repuestos, servicio.manoDeObra))}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label={`Acciones de ${servicio.numero}`}>
                            <MoreHorizontal className="size-4" aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onSelect={() => setServicioDetalle(servicio)}>
                            <Wrench className="size-4" aria-hidden="true" />
                            Ver detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => abrirEdicion(servicio)}>
                            <Pencil className="size-4" aria-hidden="true" />
                            Editar servicio
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onSelect={() => setServicioEliminar(servicio)}>
                            <Trash2 className="size-4" aria-hidden="true" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
          Mostrando {filtrados.length} de {servicios.length} servicios
        </div>
      </Card>

      <ServicioDialog
        abierto={dialogoFormulario}
        alCambiar={setDialogoFormulario}
        servicio={servicioEditar}
      />
      <ServicioDetalle
        abierto={servicioDetalle !== null}
        alCambiar={(valor) => { if (!valor) setServicioDetalle(null) }}
        servicio={servicioDetalle}
        alEditar={abrirEdicion}
      />

      <Dialog open={servicioEliminar !== null} onOpenChange={(valor) => { if (!valor) setServicioEliminar(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar servicio</DialogTitle>
            <DialogDescription>
              Se va a eliminar <span className="font-medium text-foreground">{servicioEliminar?.numero}</span> ({servicioEliminar?.patente}) y todas sus notas. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setServicioEliminar(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (servicioEliminar) {
                  eliminarServicio(servicioEliminar.id)
                  toast.success("Servicio eliminado")
                }
                setServicioEliminar(null)
              }}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <CheckCircle2 className="size-3.5" aria-hidden="true" />
        Los cambios se guardan automáticamente en el almacenamiento local del navegador.
      </p>
    </div>
  )
}
