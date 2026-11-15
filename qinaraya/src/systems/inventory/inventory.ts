import { getItemDef } from "../../data/items.ts";

export interface ItemStack {
  itemId: string;
  quantity: number;
}

export interface InventoryState {
  slots: number;
  stacks: readonly ItemStack[];
}

export interface ItemGrantLike {
  itemId: string;
  quantity: number;
}

export function createInventory(slots: number): InventoryState {
  return { slots, stacks: [] };
}

export function countItem(inv: InventoryState, itemId: string): number {
  let total = 0;
  for (const s of inv.stacks) if (s.itemId === itemId) total += s.quantity;
  return total;
}

export function hasItem(inv: InventoryState, itemId: string, quantity = 1): boolean {
  return countItem(inv, itemId) >= quantity;
}

/** Berapa banyak item yang masih muat (bisa lebih kecil dari yang diminta). */
export function freeSpaceFor(inv: InventoryState, itemId: string): number {
  const def = getItemDef(itemId);
  if (!def) return 0;
  let space = 0;
  for (const s of inv.stacks) if (s.itemId === itemId) space += def.maxStack - s.quantity;
  space += (inv.slots - inv.stacks.length) * def.maxStack;
  return space;
}

export function canAdd(inv: InventoryState, itemId: string, quantity: number): boolean {
  return quantity > 0 && freeSpaceFor(inv, itemId) >= quantity;
}

/** Menambah sebanyak yang muat. `added` bisa lebih kecil dari `quantity` bila tas penuh. */
export function addItem(inv: InventoryState, itemId: string, quantity: number): { inventory: InventoryState; added: number } {
  const def = getItemDef(itemId);
  const want = Math.floor(quantity);
  if (!def || want <= 0) return { inventory: inv, added: 0 };

  const stacks: ItemStack[] = inv.stacks.map((s) => ({ ...s }));
  let remaining = want;

  for (const s of stacks) {
    if (remaining === 0) break;
    if (s.itemId !== itemId || s.quantity >= def.maxStack) continue;
    const put = Math.min(def.maxStack - s.quantity, remaining);
    s.quantity += put;
    remaining -= put;
  }
  while (remaining > 0 && stacks.length < inv.slots) {
    const put = Math.min(def.maxStack, remaining);
    stacks.push({ itemId, quantity: put });
    remaining -= put;
  }
  return { inventory: { slots: inv.slots, stacks }, added: want - remaining };
}

/** Mengembalikan null bila jumlahnya tidak cukup. Tidak mengubah inventory asal. */
export function removeItem(inv: InventoryState, itemId: string, quantity: number): InventoryState | null {
  const need = Math.floor(quantity);
  if (need <= 0 || countItem(inv, itemId) < need) return null;

  const stacks: ItemStack[] = inv.stacks.map((s) => ({ ...s }));
  let remaining = need;
  for (let i = stacks.length - 1; i >= 0 && remaining > 0; i--) {
    const s = stacks[i]!;
    if (s.itemId !== itemId) continue;
    const take = Math.min(s.quantity, remaining);
    s.quantity -= take;
    remaining -= take;
  }
  return { slots: inv.slots, stacks: stacks.filter((s) => s.quantity > 0) };
}

/** Apakah semua item muat sekaligus (diuji berurutan pada salinan). */
export function canAddAll(inv: InventoryState, grants: readonly ItemGrantLike[]): boolean {
  let current = inv;
  for (const g of grants) {
    const result = addItem(current, g.itemId, g.quantity);
    if (result.added < g.quantity) return false;
    current = result.inventory;
  }
  return true;
}

export function addAll(inv: InventoryState, grants: readonly ItemGrantLike[]): InventoryState {
  let current = inv;
  for (const g of grants) current = addItem(current, g.itemId, g.quantity).inventory;
  return current;
}
