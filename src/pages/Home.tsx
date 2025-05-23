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
    user?.role === 'admin'
      ? [
          // { to: 'input', label: 'Input' },
          ...baseTabs,
          { to: 'users', label: 'Users' },
        ]
      : baseTabs

  return (
    <>
      <Header />
      <div className='p-10'>
        <div className='flex space-x-4 pb-2 whitespace-nowrap overflow-auto'>
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                isActive ? 'border-b-2 border-blue-500' : 'text-gray-500'
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
        <div className='pt-6'>
          <Outlet />
        </div>
      </div>
    </>
  )
}
