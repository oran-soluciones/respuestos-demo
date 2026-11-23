import { Navigate, Route, Routes } from "react-router-dom"
import { Layout } from "@/components/layout/Layout"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ProveedorDatos } from "@/lib/store"
import Dashboard from "@/pages/Dashboard"
import ProductoDetalle from "@/pages/ProductoDetalle"
import ProductoForm from "@/pages/ProductoForm"
import ServicioDetalle from "@/pages/ServicioDetalle"
import ServicioForm from "@/pages/ServicioForm"
import Servicios from "@/pages/Servicios"
import Stock from "@/pages/Stock"

export default function App() {
  return (
    <ProveedorDatos>
      <TooltipProvider delayDuration={250}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="stock" element={<Stock />} />
            <Route path="productos/nuevo" element={<ProductoForm />} />
            <Route path="productos/:id/editar" element={<ProductoForm />} />
            <Route path="productos/:id" element={<ProductoDetalle />} />
            <Route path="servicios" element={<Servicios />} />
            <Route path="servicios/nuevo" element={<ServicioForm />} />
            <Route path="servicios/:id/editar" element={<ServicioForm />} />
            <Route path="servicios/:id" element={<ServicioDetalle />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        <Toaster position="bottom-right" richColors closeButton />
      </TooltipProvider>
    </ProveedorDatos>
  )
}
