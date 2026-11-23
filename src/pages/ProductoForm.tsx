import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDatos } from "@/lib/store"
import { CATEGORIAS, type Categoria, type Producto } from "@/lib/types"

type Formulario = {
  codigo: string
  nombre: string
  codigoBarras: string
  categoria: Categoria
  stock: string
  stockMinimo: string
  precio: string
  ubicacion: string
  proveedor: string
}

const formularioVacio: Formulario = {
  codigo: "",
  nombre: "",
  codigoBarras: "",
  categoria: "Frenos",
  stock: "0",
  stockMinimo: "5",
  precio: "0",
  ubicacion: "",
  proveedor: "",
}

function desdeProducto(producto: Producto): Formulario {
  return {
    codigo: producto.codigo,
    nombre: producto.nombre,
    codigoBarras: producto.codigoBarras,
    categoria: producto.categoria,
    stock: String(producto.stock),
    stockMinimo: String(producto.stockMinimo),
    precio: String(producto.precio),
    ubicacion: producto.ubicacion,
    proveedor: producto.proveedor,
  }
}

export default function ProductoForm() {
  const { id } = useParams()
  const navegar = useNavigate()
  const { productos, agregarProducto, actualizarProducto } = useDatos()
  const producto = id ? productos.find((item) => item.id === id) : undefined
  const [formulario, setFormulario] = useState<Formulario>(() =>
    producto ? desdeProducto(producto) : formularioVacio,
  )

  useEffect(() => {
    if (id && !producto) {
      toast.error("No se encontró el producto")
      navegar("/stock", { replace: true })
    }
  }, [id, producto, navegar])

  function actualizar(campo: keyof Formulario, valor: string) {
    setFormulario((anterior) => ({ ...anterior, [campo]: valor }))
  }

  function guardar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const datos = {
      codigo: formulario.codigo.trim(),
      nombre: formulario.nombre.trim(),
      codigoBarras: formulario.codigoBarras.trim(),
      categoria: formulario.categoria,
      stock: Number(formulario.stock),
      stockMinimo: Number(formulario.stockMinimo),
      precio: Number(formulario.precio),
      ubicacion: formulario.ubicacion.trim(),
      proveedor: formulario.proveedor.trim(),
    }
    if (!datos.codigo || !datos.nombre) {
      toast.error("Completá el código y el nombre del producto")
      return
    }
    if (
      !Number.isFinite(datos.stock) ||
      !Number.isFinite(datos.stockMinimo) ||
      !Number.isFinite(datos.precio) ||
      datos.stock < 0 ||
      datos.stockMinimo < 0 ||
      datos.precio < 0
    ) {
      toast.error("Revisá los valores numéricos del formulario")
      return
    }

    if (producto) {
      actualizarProducto(producto.id, datos)
      toast.success("Producto actualizado")
      navegar(`/productos/${producto.id}`)
    } else {
      const nuevoId = agregarProducto(datos)
      toast.success("Producto agregado al inventario")
      navegar(`/productos/${nuevoId}`)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Button asChild variant="ghost" size="sm">
        <Link to={producto ? `/productos/${producto.id}` : "/stock"}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver
        </Link>
      </Button>

      <Card className="rounded-xl border-border/70 shadow-none">
        <CardHeader>
          <CardTitle className="text-xl">{producto ? "Editar producto" : "Nuevo producto"}</CardTitle>
          <CardDescription>
            {producto
              ? `Modificando ${producto.codigo} · ${producto.nombre}`
              : "Completá los datos para agregar un repuesto al inventario."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={guardar} className="space-y-5" noValidate>
            <fieldset className="space-y-3">
              <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Identificación</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="prod-codigo">Código interno</Label>
                  <Input
                    id="prod-codigo" name="codigo" value={formulario.codigo}
                    onChange={(evento) => actualizar("codigo", evento.target.value)}
                    placeholder="REP-0019…" autoComplete="off" spellCheck={false} required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prod-codigo-barras">Código de barras</Label>
                  <Input
                    id="prod-codigo-barras" name="codigoBarras" value={formulario.codigoBarras}
                    onChange={(evento) => actualizar("codigoBarras", evento.target.value)}
                    placeholder="7791234567808…" inputMode="numeric" autoComplete="off" spellCheck={false}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prod-nombre">Nombre del repuesto</Label>
                <Input
                  id="prod-nombre" name="nombre" value={formulario.nombre}
                  onChange={(evento) => actualizar("nombre", evento.target.value)}
                  placeholder="Filtro de aceite…" required
                />
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Clasificación</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="prod-categoria">Categoría</Label>
                  <Select
                    value={formulario.categoria}
                    onValueChange={(valor) => actualizar("categoria", valor as Categoria)}
                  >
                    <SelectTrigger id="prod-categoria" name="categoria"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS.map((categoria) => (
                        <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prod-ubicacion">Ubicación en depósito</Label>
                  <Input
                    id="prod-ubicacion" name="ubicacion" value={formulario.ubicacion}
                    onChange={(evento) => actualizar("ubicacion", evento.target.value)}
                    placeholder="A-12" autoComplete="off" spellCheck={false}
                  />
                </div>
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Inventario y precios</legend>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="prod-stock">Stock actual</Label>
                  <Input
                    id="prod-stock" name="stock" type="number" min={0} step={1} inputMode="numeric"
                    className="tabular" value={formulario.stock}
                    onChange={(evento) => actualizar("stock", evento.target.value)} required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prod-minimo">Stock mínimo</Label>
                  <Input
                    id="prod-minimo" name="stockMinimo" type="number" min={0} step={1} inputMode="numeric"
                    className="tabular" value={formulario.stockMinimo}
                    onChange={(evento) => actualizar("stockMinimo", evento.target.value)} required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prod-precio">Precio ($)</Label>
                  <Input
                    id="prod-precio" name="precio" type="number" min={0} step={100} inputMode="numeric"
                    className="tabular" value={formulario.precio}
                    onChange={(evento) => actualizar("precio", evento.target.value)} required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prod-proveedor">Proveedor</Label>
                <Input
                  id="prod-proveedor" name="proveedor" value={formulario.proveedor}
                  onChange={(evento) => actualizar("proveedor", evento.target.value)}
                  placeholder="Nombre del proveedor…" autoComplete="off"
                />
              </div>
            </fieldset>

            <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" asChild>
                <Link to={producto ? `/productos/${producto.id}` : "/stock"}>Cancelar</Link>
              </Button>
              <Button type="submit">
                <Save className="size-4" aria-hidden="true" />
                {producto ? "Guardar cambios" : "Crear producto"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
