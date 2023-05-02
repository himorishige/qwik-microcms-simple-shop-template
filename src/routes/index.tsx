import { component$ } from '@builder.io/qwik';
import { Link, type DocumentHead } from '@builder.io/qwik-city';
import { Calculator } from '~/components/icons/calculator';
import { Gauge } from '~/components/icons/gauge';

export default component$(() => {
  return (
    <div class="min-h-[calc(100dvh-52px-72px)]">
      <div class="grid gap-10 p-10 md:grid-cols-2">
        <div>
          <Link
            href="/dashboard"
            class="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-10 shadow hover:bg-gray-100"
          >
            <div>
              <Gauge width={80} height={80} />
            </div>
            <h5 class="text-2xl font-bold tracking-tight text-gray-800">
              Dashboard
            </h5>
          </Link>
        </div>
        <div>
          <Link
            href="/checkout"
            class="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-10 shadow hover:bg-gray-100"
          >
            <div>
              <Calculator width={80} height={80} />
            </div>
            <h5 class="text-2xl font-bold tracking-tight text-gray-800">
              Checkout
            </h5>
          </Link>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Simple Store Template',
  meta: [
    {
      name: 'description',
      content: 'Welcome to Simple Store Template',
    },
  ],
};
