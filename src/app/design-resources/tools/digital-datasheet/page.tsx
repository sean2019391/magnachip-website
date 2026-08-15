import { redirect } from 'next/navigation';

export default function Page() {
  // Redirect plural path to canonical singular path
  redirect('/design-resources/tool/digital-datasheet');
}
