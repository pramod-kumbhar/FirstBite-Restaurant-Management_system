export const RBAC_ROLES = ['customer', 'owner', 'manager', 'chef', 'waiter', 'cashier'] as const;
export type Role = (typeof RBAC_ROLES)[number];

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  customer: ['orders:view', 'orders:create', 'reservations:view', 'reservations:create', 'reviews:create'],
  owner: ['*'],
  manager: ['*'],
  chef: ['orders:view', 'orders:update', 'orders:items:update'],
  waiter: ['orders:view', 'orders:create', 'orders:update', 'tables:view', 'tables:update', 'reservations:view'],
  cashier: ['orders:view', 'orders:update', 'payments:create'],
};

export function hasPermission(role: Role | string | null | undefined, permission: string) {
  const normalizedRole = String(role || '').toLowerCase() as Role;
  if (!RBAC_ROLES.includes(normalizedRole as Role)) {
    return false;
  }
  return ROLE_PERMISSIONS[normalizedRole].includes('*') || ROLE_PERMISSIONS[normalizedRole].includes(permission);
}

export function canAccessRoute(role: Role | string | null | undefined, route: string) {
  const normalizedRole = String(role || '').toLowerCase();
  if (normalizedRole === 'manager' || normalizedRole === 'owner') return true;
  if (normalizedRole === 'customer') {
    return ['customer', 'orders', 'reservations', 'reviews'].some((segment) => route.includes(segment));
  }
  if (normalizedRole === 'chef') {
    return route.includes('kitchen') || route.includes('orders') || route.includes('chef');
  }
  if (normalizedRole === 'waiter') {
    return route.includes('tables') || route.includes('orders') || route.includes('waiter');
  }
  if (normalizedRole === 'cashier') {
    return route.includes('payments') || route.includes('orders') || route.includes('cashier');
  }
  return false;
}
