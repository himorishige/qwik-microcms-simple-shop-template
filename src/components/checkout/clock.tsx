import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';

export default component$(() => {
  const clockState = useSignal('');
  useVisibleTask$(({ cleanup }) => {
    const clock = setInterval(() => {
      clockState.value = new Date().toLocaleString();
    }, 1000);
    cleanup(() => {
      clearInterval(clock);
    });
  });
  return <div class="pt-2 text-right text-sm">{clockState.value || '...'}</div>;
});
