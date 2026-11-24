export const CATEGORIAS = [
  "Frenos",
  "Motor",
  "Filtros",
  "Eléctrico",
  "Suspensión",
  "Lubricantes",
  "Carrocería",
] as const

export type Categoria = (typeof CATEGORIAS)[number]

export interface Producto {
  id: string
  codigo: string
  nombre: string
  codigoBarras: string
  categoria: Categoria
  stock: number
  stockMinimo: number
  precio: number
  ubicacion: string
  proveedor: string
  actualizadoEn: string
}

export interface MovimientoStock {
  id: string
  productoId: string
  productoNombre: string
  tipo: "entrada" | "salida"
  cantidad: number
  motivo: string
  referencia?: string
  fecha: string
}

export const ESTADOS_SERVICIO = [
  "Pendiente",
  "En curso",
  "Esperando repuestos",
  "Completado",
  "Entregado",
] as const

export type EstadoServicio = (typeof ESTADOS_SERVICIO)[number]

export interface NotaServicio {
  id: string
  fecha: string
  autor: string
  contenido: string
}

export interface RepuestoUsado {
  productoId: string
  nombre: string
  cantidad: number
  precioUnitario: number
}

export interface Servicio {
  id: string
  numero: string
  patente: string
  vehiculo: string
  kilometraje: number
  cliente: string
  telefono: string
  tipo: string
  estado: EstadoServicio
  ingresoEn: string
  entregaEstimadaEn: string
  entregaRealEn?: string
  nivelCombustible: number
  observacionesCombustible: string
  reposicionCombustible: number
  notas: NotaServicio[]
  revision: string
  conclusion: string
  repuestos: RepuestoUsado[]
  manoDeObra: number
}

export interface DatosApp {
  productos: Producto[]
  movimientos: MovimientoStock[]
  servicios: Servicio[]
}
