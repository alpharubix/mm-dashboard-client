import { camelCaseToWords } from '@/lib/utils'
import { Badge } from './badge'

type RoleBadgeProps = {
  role: string
}

const CompanyType = ({ role }: RoleBadgeProps) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'text-green-600'
      case 'superAdmin':
        return 'text-red-600'
      case 'viewer':
        return 'text-blue-600'
      default:
        return 'text-blue-600'
    }
  }

  const getCompanyType = (role: string) => {
    switch (role) {
      case 'admin':
        return 'anchor'
      case 'superAdmin':
        return 'meramerchant'
      case 'viewer':
        return 'distributor'
      default:
        return 'none'
    }
  }
  return (
    // <Badge
    //   variant='outline'
    //   className={`${getRoleColor(role)} bg-blue-50 border-blue-200 uppercase`}
    // >
    //   {getCompanyType(role)}
    // </Badge>
    <span className={`${getRoleColor(role)}`}>
      {camelCaseToWords(getCompanyType(role))}
    </span>
  )
}

export default CompanyType
