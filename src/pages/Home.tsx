import { NavLink, Outlet } from 'react-router-dom'
import Header from '../components/Header'
import { getUserFromToken } from '../lib/utils'

export default function Home() {
  const user = getUserFromToken()

  const baseTabs = [
    { to: 'onboard-notification', label: 'Onboard Notification' },
    { to: 'credit-limit', label: 'Credit Limit' },
    { to: 'invoice-utr', label: 'Invoice UTR' },
  ]

  const tabs =
    user?.role === 'superAdmin'
      ? [
          // { to: 'input', label: 'Input' },
          ...baseTabs,
          { to: 'users', label: 'Users' },
        ]
      : baseTabs

  return (
    <main className='min-h-screen bg-gray-50 '>
      <Header />
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className=''>
          <div className='flex space-x-4 whitespace-nowrap overflow-auto w-full bg-gray-100 mt-4 p-1'>
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded transition-all ${
                    isActive ? 'bg-blue-600 text-white' : 'text-gray-500'
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
