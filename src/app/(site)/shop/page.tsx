import { redirect } from 'next/navigation';

// EMERGENCY HOTFIX (2026-07-06): the shop went live prematurely. Send all
// shop traffic home until the storefront launch is signed off.
export default function ShopPage() {
  redirect('/');
}
