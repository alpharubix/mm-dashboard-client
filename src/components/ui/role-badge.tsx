import { camelCaseToWords } from '@/lib/utils'

type RoleBadgeProps = {
  role: string
}

const RoleBadge = ({ role }: RoleBadgeProps) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'text-red-600'
      case 'superAdmin':
        return 'text-purple-600 font-semibold'
      case 'viewer':
      default:
        return 'text-gray-700'
    }
  }

  return (
    <span className={`${getRoleColor(role)}`}>{camelCaseToWords(role)}</span>
  )
}

export default RoleBadge
