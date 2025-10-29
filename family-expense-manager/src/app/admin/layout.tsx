import { ReactNode } from "react"
import { getAdminSession } from "@/lib/admin-auth"
import { redirect } from "next/navigation"

interface AdminLayoutProps {
  children: ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getAdminSession()

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={session.user} />
      <AdminSidebar />
      <main className="lg:pl-64">
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}

function AdminHeader({ user }: { user: any }) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 lg:fixed lg:top-0 lg:left-64 lg:right-0 lg:z-10">
      <div className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              Welcome, {user.name || user.email}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              user.adminRole === 'SUPER_ADMIN'
                ? 'bg-purple-100 text-purple-800'
                : user.adminRole === 'ADMIN'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {user.adminRole.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

function AdminSidebar() {
  const menuItems = [
    {
      name: "Analytics Overview",
      href: "/admin",
      icon: "📊",
    },
    {
      name: "User Management",
      href: "/admin/users",
      icon: "👥",
    },
    {
      name: "Financial Reports",
      href: "/admin/financial",
      icon: "💰",
    },
    {
      name: "System Monitoring",
      href: "/admin/monitoring",
      icon: "🔍",
    },
  ]

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-sm border-r border-gray-200 lg:block">
      <div className="flex flex-col h-full">
        <div className="flex items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.name}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  )
}
