export type ScanType = 'Top' | 'Middle' | 'Tip' | 'Build';

export type Category = 'Attack' | 'Stamina' | 'Defense' | 'Balance';

export interface BeyItem {
  id: string;
  name: string;
  type: ScanType;
  category: Category;
  stats: {
    attack: number;
    stamina: number;
    defense: number;
  };
  image: string;
  createdAt: number;
}

export const SCAN_TYPES: { type: ScanType; icon: string; color: string; desc: string }[] = [
  { type: 'Top', icon: '◆', color: '#ef4444', desc: 'Energy Ring / Forge Disk' },
  { type: 'Middle', icon: '◎', color: '#22c55e', desc: 'Fusion Wheel / Layer' },
  { type: 'Tip', icon: '▼', color: '#3b82f6', desc: 'Performance Tip / Driver' },
  { type: 'Build', icon: '⚡', color: '#a855f7', desc: 'Complete Beyblade' }
];

export function determineCategory(attack: number, stamina: number, defense: number): Category {
  const max = Math.max(attack, stamina, defense);
  if (attack === max) return 'Attack';
  if (stamina === max) return 'Stamina';
  if (defense === max) return 'Defense';
  return 'Balance';
}
