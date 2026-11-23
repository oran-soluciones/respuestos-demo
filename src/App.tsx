import { Navigate, Route, Routes } from "react-router-dom"
import { Layout } from "@/components/layout/Layout"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ProveedorDatos } from "@/lib/store"
import Dashboard from "@/pages/Dashboard"
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
            <Route path="servicios" element={<Servicios />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        <Toaster position="bottom-right" richColors closeButton />
      </TooltipProvider>
    </ProveedorDatos>
  )
}
