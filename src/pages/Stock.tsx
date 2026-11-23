import { useMemo, useState } from "react"
import {
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  CircleDollarSign,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  TriangleAlert,
} from "lucide-react"
import { toast } from "sonner"
import { EstadoStockBadge } from "@/components/comunes/Indicadores"
import { EncabezadoPagina } from "@/components/layout/Layout"
import { MovimientoDialog } from "@/components/stock/MovimientoDialog"
import { ProductoDialog } from "@/components/stock/ProductoDialog"
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
import { formatearMoneda, formatearNumero } from "@/lib/format"
import { useDatos } from "@/lib/store"
import { CATEGORIAS, type Categoria, type Producto } from "@/lib/types"

type FiltroEstado = "todos" | "disponible" | "bajo" | "sin-stock"

function estadoDe(producto: Producto): FiltroEstado {
  if (producto.stock === 0) return "sin-stock"
  if (producto.stock <= producto.stockMinimo) return "bajo"
  return "disponible"
}

export default function Stock() {
  const { productos, movimientos, eliminarProducto } = useDatos()
  const [busqueda, setBusqueda] = useState("")
  const [categoria, setCategoria] = useState<Categoria | "todas">("todas")
  const [estado, setEstado] = useState<FiltroEstado>("todos")
  const [dialogoProducto, setDialogoProducto] = useState(false)
  const [productoEditar, setProductoEditar] = useState<Producto | null>(null)
  const [dialogoMovimiento, setDialogoMovimiento] = useState(false)
  const [productoMovimiento, setProductoMovimiento] = useState<Producto | null>(null)
  const [tipoMovimiento, setTipoMovimiento] = useState<"entrada" | "salida">("entrada")
  const [productoEliminar, setProductoEliminar] = useState<Producto | null>(null)

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase("es-AR")
    return productos.filter((producto) => {
      const coincideTexto =
        !texto ||
        producto.nombre.toLocaleLowerCase("es-AR").includes(texto) ||
        producto.codigo.toLocaleLowerCase("es-AR").includes(texto) ||
        producto.codigoBarras.includes(texto) ||
        producto.proveedor.toLocaleLowerCase("es-AR").includes(texto)
      const coincideCategoria = categoria === "todas" || producto.categoria === categoria
      const coincideEstado = estado === "todos" || estadoDe(producto) === estado
      return coincideTexto && coincideCategoria && coincideEstado
    })
  }, [productos, busqueda, categoria, estado])

  const valorTotal = productos.reduce((total, item) => total + item.stock * item.precio, 0)
  const unidadesTotales = productos.reduce((total, item) => total + item.stock, 0)
  const conStockBajo = productos.filter((item) => item.stock <= item.stockMinimo).length
  const movimientosMes = movimientos.filter(
    (movimiento) => new Date(movimiento.fecha).getMonth() === new Date().getMonth(),
  ).length

  function abrirNuevo() {
    setProductoEditar(null)
    setDialogoProducto(true)
  }

  function abrirEdicion(producto: Producto) {
    setProductoEditar(producto)
    setDialogoProducto(true)
  }

  function abrirMovimiento(producto: Producto, tipo: "entrada" | "salida") {
    setProductoMovimiento(producto)
    setTipoMovimiento(tipo)
    setDialogoMovimiento(true)
  }

  const hayFiltros = busqueda !== "" || categoria !== "todas" || estado !== "todos"

  return (
    <div className="space-y-5">
      <EncabezadoPagina
        titulo="Control de stock"
        descripcion="Repuestos, códigos, niveles y movimientos del inventario"
        acciones={
          <Button onClick={abrirNuevo}>
            <Plus className="size-4" aria-hidden="true" />
            Nuevo producto
          </Button>
        }
      />

      <section aria-label="Resumen de inventario" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { titulo: "Referencias", valor: formatearNumero(productos.length), detalle: "Productos cargados", icono: <Boxes className="size-[18px]" /> },
          { titulo: "Unidades", valor: formatearNumero(unidadesTotales), detalle: "Disponibles en depósito", icono: <ArrowUpRight className="size-[18px]" /> },
          { titulo: "Valor total", valor: formatearMoneda(valorTotal), detalle: "Al precio actual", icono: <CircleDollarSign className="size-[18px]" /> },
          { titulo: "Stock bajo", valor: formatearNumero(conStockBajo), detalle: `${movimientosMes} movimientos este mes`, icono: <TriangleAlert className="size-[18px]" /> },
        ].map((metrica) => (
          <Card key={metrica.titulo} className="gap-0 rounded-xl border-border/70 p-4 shadow-none">
            <p className="text-xs font-medium text-muted-foreground">{metrica.titulo}</p>
            <p className="tabular mt-1.5 text-xl font-semibold tracking-tight">{metrica.valor}</p>
            <p className="mt-1 truncate text-[11px] text-muted-foreground">{metrica.detalle}</p>
          </Card>
        ))}
      </section>

      <Card className="rounded-xl border-border/70 shadow-none">
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-end">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="buscar-producto">Buscar</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                id="buscar-producto"
                type="search"
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
                placeholder="Nombre, código, código de barras o proveedor…"
                className="pl-9"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="w-full space-y-1.5 lg:w-48">
            <Label htmlFor="filtro-categoria">Categoría</Label>
            <Select
              value={categoria}
              onValueChange={(valor) => setCategoria(valor as Categoria | "todas")}
            >
              <SelectTrigger id="filtro-categoria" name="categoria">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {CATEGORIAS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full space-y-1.5 lg:w-44">
            <Label htmlFor="filtro-estado">Estado</Label>
            <Select value={estado} onValueChange={(valor) => setEstado(valor as FiltroEstado)}>
              <SelectTrigger id="filtro-estado" name="estado">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="disponible">Disponible</SelectItem>
                <SelectItem value="bajo">Stock bajo</SelectItem>
                <SelectItem value="sin-stock">Sin stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hayFiltros && (
            <Button variant="ghost" onClick={() => { setBusqueda(""); setCategoria("todas"); setEstado("todos") }}>
              Limpiar filtros
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Repuesto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="w-12 text-right"><span className="sr-only">Acciones</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-sm text-muted-foreground">
                    No se encontraron productos con esos filtros.
                  </TableCell>
                </TableRow>
              ) : (
                filtrados.map((producto) => (
                  <TableRow key={producto.id}>
                    <TableCell className="tabular whitespace-nowrap text-xs font-medium text-muted-foreground">
                      {producto.codigo}
                    </TableCell>
                    <TableCell className="max-w-[260px]">
                      <p className="truncate text-sm font-medium">{producto.nombre}</p>
                      <p className="tabular truncate text-[11px] text-muted-foreground">
                        CB: {producto.codigoBarras || "—"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">{producto.categoria}</span>
                    </TableCell>
                    <TableCell className="tabular text-xs text-muted-foreground">{producto.ubicacion || "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="tabular text-sm font-semibold">{formatearNumero(producto.stock)}</span>
                        <EstadoStockBadge stock={producto.stock} minimo={producto.stockMinimo} />
                      </div>
                    </TableCell>
                    <TableCell className="tabular whitespace-nowrap text-right text-sm font-medium">
                      {formatearMoneda(producto.precio)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8" aria-label={`Acciones de ${producto.nombre}`}>
                            <MoreHorizontal className="size-4" aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onSelect={() => abrirEdicion(producto)}>
                            <Pencil className="size-4" aria-hidden="true" />
                            Editar producto
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => abrirMovimiento(producto, "entrada")}>
                            <ArrowUpRight className="size-4 text-emerald-500" aria-hidden="true" />
                            Registrar entrada
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => abrirMovimiento(producto, "salida")}>
                            <ArrowDownRight className="size-4 text-sky-400" aria-hidden="true" />
                            Registrar salida
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => setProductoEliminar(producto)}
                          >
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
          Mostrando {filtrados.length} de {productos.length} productos
        </div>
      </Card>

      <ProductoDialog
        abierto={dialogoProducto}
        alCambiar={setDialogoProducto}
        producto={productoEditar}
      />
      <MovimientoDialog
        abierto={dialogoMovimiento}
        alCambiar={setDialogoMovimiento}
        producto={productoMovimiento}
        tipo={tipoMovimiento}
      />

      <Dialog open={productoEliminar !== null} onOpenChange={(valor) => { if (!valor) setProductoEliminar(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar producto</DialogTitle>
            <DialogDescription>
              Se va a eliminar <span className="font-medium text-foreground">{productoEliminar?.nombre}</span> y su historial de movimientos. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProductoEliminar(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (productoEliminar) {
                  eliminarProducto(productoEliminar.id)
                  toast.success("Producto eliminado")
                }
                setProductoEliminar(null)
              }}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
