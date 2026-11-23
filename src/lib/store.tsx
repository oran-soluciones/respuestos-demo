import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { crearDatosIniciales } from "@/lib/seed"
import type {
  DatosApp,
  MovimientoStock,
  NotaServicio,
  Producto,
  Servicio,
} from "@/lib/types"

const CLAVE_ALMACENAMIENTO = "repuestos-demo:datos:v1"

function cargarDatos(): DatosApp {
  try {
    const crudo = localStorage.getItem(CLAVE_ALMACENAMIENTO)
    if (crudo) {
      const datos = JSON.parse(crudo) as DatosApp
      if (
        Array.isArray(datos.productos) &&
        Array.isArray(datos.movimientos) &&
        Array.isArray(datos.servicios)
      ) {
        return datos
      }
    }
  } catch {
    // Datos corruptos: se regenera la demo.
  }
  return crearDatosIniciales()
}

function nuevoId(prefijo: string): string {
  return `${prefijo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

interface ContextoApp {
  productos: Producto[]
  movimientos: MovimientoStock[]
  servicios: Servicio[]
  agregarProducto: (producto: Omit<Producto, "id" | "actualizadoEn">) => void
  actualizarProducto: (id: string, cambios: Partial<Producto>) => void
  eliminarProducto: (id: string) => void
  registrarMovimiento: (movimiento: {
    productoId: string
    tipo: "entrada" | "salida"
    cantidad: number
    motivo: string
    referencia?: string
  }) => boolean
  agregarServicio: (servicio: Omit<Servicio, "id" | "numero">) => void
  actualizarServicio: (id: string, cambios: Partial<Servicio>) => void
  eliminarServicio: (id: string) => void
  agregarNota: (servicioId: string, contenido: string, autor?: string) => void
  reiniciarDemo: () => void
}

const Contexto = createContext<ContextoApp | null>(null)

export function ProveedorDatos({ children }: { children: ReactNode }) {
  const [datos, setDatos] = useState<DatosApp>(cargarDatos)

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(datos))
    } catch {
      // Almacenamiento lleno o no disponible: la demo sigue en memoria.
    }
  }, [datos])

  const agregarProducto = useCallback((producto: Omit<Producto, "id" | "actualizadoEn">) => {
    setDatos((actual) => ({
      ...actual,
      productos: [
        { ...producto, id: nuevoId("prod"), actualizadoEn: new Date().toISOString() },
        ...actual.productos,
      ],
    }))
  }, [])

  const actualizarProducto = useCallback((id: string, cambios: Partial<Producto>) => {
    setDatos((actual) => ({
      ...actual,
      productos: actual.productos.map((producto) =>
        producto.id === id
          ? { ...producto, ...cambios, actualizadoEn: new Date().toISOString() }
          : producto,
      ),
    }))
  }, [])

  const eliminarProducto = useCallback((id: string) => {
    setDatos((actual) => ({
      ...actual,
      productos: actual.productos.filter((producto) => producto.id !== id),
      movimientos: actual.movimientos.filter((movimiento) => movimiento.productoId !== id),
    }))
  }, [])

  const registrarMovimiento = useCallback(
    (movimiento: {
      productoId: string
      tipo: "entrada" | "salida"
      cantidad: number
      motivo: string
      referencia?: string
    }) => {
      const producto = datos.productos.find((item) => item.id === movimiento.productoId)
      if (!producto || movimiento.cantidad <= 0) return false
      if (movimiento.tipo === "salida" && producto.stock < movimiento.cantidad) return false

      setDatos((actual) => {
        const actualizado = actual.productos.find((item) => item.id === movimiento.productoId)
        if (!actualizado) return actual

        const nuevoMovimiento: MovimientoStock = {
          id: nuevoId("mov"),
          productoId: actualizado.id,
          productoNombre: actualizado.nombre,
          tipo: movimiento.tipo,
          cantidad: movimiento.cantidad,
          motivo: movimiento.motivo,
          referencia: movimiento.referencia,
          fecha: new Date().toISOString(),
        }

        return {
          ...actual,
          productos: actual.productos.map((item) =>
            item.id === actualizado.id
              ? {
                  ...item,
                  stock:
                    item.stock +
                    (movimiento.tipo === "entrada" ? movimiento.cantidad : -movimiento.cantidad),
                  actualizadoEn: new Date().toISOString(),
                }
              : item,
          ),
          movimientos: [nuevoMovimiento, ...actual.movimientos],
        }
      })
      return true
    },
    [datos.productos],
  )

  const agregarServicio = useCallback((servicio: Omit<Servicio, "id" | "numero">) => {
    setDatos((actual) => {
      const ultimoNumero = actual.servicios.reduce((maximo, item) => {
        const valor = Number(item.numero.split("-").at(-1))
        return Number.isFinite(valor) ? Math.max(maximo, valor) : maximo
      }, 0)

      return {
        ...actual,
        servicios: [
          {
            ...servicio,
            id: nuevoId("srv"),
            numero: `SRV-${new Date().getFullYear()}-${String(ultimoNumero + 1).padStart(4, "0")}`,
          },
          ...actual.servicios,
        ],
      }
    })
  }, [])

  const actualizarServicio = useCallback((id: string, cambios: Partial<Servicio>) => {
    setDatos((actual) => ({
      ...actual,
      servicios: actual.servicios.map((servicio) =>
        servicio.id === id ? { ...servicio, ...cambios } : servicio,
      ),
    }))
  }, [])

  const eliminarServicio = useCallback((id: string) => {
    setDatos((actual) => ({
      ...actual,
      servicios: actual.servicios.filter((servicio) => servicio.id !== id),
    }))
  }, [])

  const agregarNota = useCallback((servicioId: string, contenido: string, autor = "Taller") => {
    const nota: NotaServicio = {
      id: nuevoId("nota"),
      fecha: new Date().toISOString(),
      autor,
      contenido,
    }
    setDatos((actual) => ({
      ...actual,
      servicios: actual.servicios.map((servicio) =>
        servicio.id === servicioId
          ? { ...servicio, notas: [...servicio.notas, nota] }
          : servicio,
      ),
    }))
  }, [])

  const reiniciarDemo = useCallback(() => {
    setDatos(crearDatosIniciales())
  }, [])

  const valor = useMemo<ContextoApp>(
    () => ({
      ...datos,
      agregarProducto,
      actualizarProducto,
      eliminarProducto,
      registrarMovimiento,
      agregarServicio,
      actualizarServicio,
      eliminarServicio,
      agregarNota,
      reiniciarDemo,
    }),
    [
      datos,
      agregarProducto,
      actualizarProducto,
      eliminarProducto,
      registrarMovimiento,
      agregarServicio,
      actualizarServicio,
      eliminarServicio,
      agregarNota,
      reiniciarDemo,
    ],
  )

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useDatos(): ContextoApp {
  const contexto = useContext(Contexto)
  if (!contexto) throw new Error("useDatos debe usarse dentro de ProveedorDatos")
  return contexto
}
