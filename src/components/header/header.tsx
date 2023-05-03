import { component$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';

import { Calculator } from '../icons/calculator';
import { Gauge } from '../icons/gauge';
import { Store } from '../icons/store';

type HeaderProps = {
  shopName?: string;
};

export default component$<HeaderProps>(({ shopName }) => {
  return (
    <header class="bg-slate-700">
      <div class="container mx-auto flex items-center justify-between p-4 text-white md:px-0">
        <div class="">
          <Link
            href="/"
            class="flex items-center text-2xl font-bold hover:opacity-80"
          >
            <Store />
            <span class="ml-2">{shopName || 'Simple Store'}</span>
          </Link>
        </div>
        <div class="ml-auto flex items-center space-x-4">
          <Link
            href="/dashboard"
            class="hover:opacity-80"
            aria-label="Dashboard"
          >
            <Gauge />
          </Link>
          <Link href="/checkout" class="hover:opacity-80" aria-label="Checkout">
            <Calculator />
          </Link>
        </div>
      </div>
    </header>
  );
});
