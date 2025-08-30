export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
  SUPPORT = 'SUPPORT',
}

export function hasRole(userRole: string | undefined, roles: Role[]): boolean {
  if (!userRole) return false
  return roles.includes(userRole as Role)
}


