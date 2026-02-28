import { NavLink, Outlet } from 'react-router-dom'
import Header from '../components/Header'
import HolidayBanner from '../components/HolidayBanner'
import { usePermissions } from '../hooks/use-permissions'
import { getUserFromToken } from '../lib/utils'

export default function Home() {
  const { hasRouteAccess } = usePermissions()

  const allTabs = [
    { to: 'onboard-customer', label: 'Onboard Customer' },
    { to: 'credit-limit', label: 'Credit Limit' },
    { to: 'invoice-utr', label: 'Invoice UTR' },
    { to: 'disbursement', label: 'Disbursement' },
    { to: 'email', label: 'Email' },
    { to: 'users', label: 'Users' },
    { to: 'viewer', label: 'Viewer' },
  ]

  // Filter tabs based on permissions
  const visibleTabs = allTabs.filter((tab) => hasRouteAccess(tab.to))

  return (
    <main className='min-h-screen bg-gray-50'>
      <Header />
      <HolidayBanner />

      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className=''>
          <div className='flex space-x-2 whitespace-nowrap overflow-auto w-full mt-4 p-1'>
            {getUserFromToken()?.role !== 'viewer' &&
              visibleTabs.map((tab) => (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  className={({ isActive }) =>
                    `px-4 py-1 rounded-none border-b-2 transition-all ${
                      isActive
                        ? 'border-blue-500 bg-blue-100 text-blue-700'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`
                  }
                >
                  {tab.label}
                </NavLink>
              ))}
          </div>
          <div className='pt-4'>
            <Outlet />
          </div>
        </div>
      </div>
    </main>
  )
}
