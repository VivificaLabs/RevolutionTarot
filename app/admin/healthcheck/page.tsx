// app/admin/healthcheck/page.tsx
// Acesso: /admin/healthcheck (após login em /admin/login)
//
// O server component valida o cookie antes de devolver qualquer HTML.
// O client component não recebe nem conhece o token — chama a API normalmente.
// A API valida o cookie por si mesma.

import { redirect } from 'next/navigation'
import { adminAutenticado } from '@/lib/admin-auth'
import HealthcheckClient from './HealthcheckClient'

export default async function HealthcheckPage() {
  const autenticado = await adminAutenticado()

  if (!autenticado) {
    redirect('/admin/login')
  }

  // Nota: não passamos nenhum token ou segredo ao client component
  return <HealthcheckClient />
}
