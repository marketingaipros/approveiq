import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function maskPII(value: string | undefined | null, type: 'ssn' | 'ein' | 'email' | 'phone' = 'ssn') {
  if (!value) return "N/A";
  if (type === 'ssn') return `***-**-${value.slice(-4)}`;
  if (type === 'ein') return `**-***${value.slice(-4)}`;
  if (type === 'email') {
    const [part1, part2] = value.split("@");
    return `${part1.slice(0, 1)}***@${part2}`;
  }
  return value;
}

export const SUBSCRIPTION_ENTITLEMENTS: Record<string, string[]> = {
  starter: ['experian'],
  pro: ['experian', 'equifax', 'dnb'],
  enterprise: ['experian', 'equifax', 'dnb', 'sba', 'audit_export', 'team_management', 'advanced_security']
};

export function isEntitled(tier: string | undefined | null, feature: string) {
  const currentTier = tier || 'starter';
  const entitledFeatures = SUBSCRIPTION_ENTITLEMENTS[currentTier] || SUBSCRIPTION_ENTITLEMENTS.starter;
  return entitledFeatures.includes(feature);
}

export function isSubscriptionActive(status: string | undefined | null, updatedAt: string | undefined | null) {
  if (status === 'active') return true;
  if (status === 'past_due' && updatedAt) {
    const gracePeriodDays = 3;
    const lastUpdate = new Date(updatedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastUpdate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= gracePeriodDays;
  }
  return false;
}
