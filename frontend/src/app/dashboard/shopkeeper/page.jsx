import { redirect } from 'next/navigation';

export default function ShopkeeperDashboardIndex() {
  redirect('/dashboard/shopkeeper/orders');
}
