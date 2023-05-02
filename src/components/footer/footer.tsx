import { component$ } from '@builder.io/qwik';
import { useServerTimeLoader } from '~/routes/layout';

export default component$(() => {
  const serverTime = useServerTimeLoader();

  return (
    <footer class="bg-slate-800 py-4">
      <div class="container mx-auto text-center text-sm text-white opacity-50">
        <span>rendered: {serverTime.value.date}</span>
      </div>
    </footer>
  );
});
