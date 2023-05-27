import { $, Slot, component$, useOnDocument } from '@builder.io/qwik';
import { routeLoader$, type RequestHandler } from '@builder.io/qwik-city';
import { createClient } from 'microcms-js-sdk';
import { useImageProvider, type ImageTransformerProps } from 'qwik-image';
import Footer from '~/components/footer/footer';
import Header from '~/components/header/header';
import type { ConfigObject } from '~/types/config';

export const onGet: RequestHandler = async (requestEvent) => {
  requestEvent.headers.set('X-My-Custom-Header', 'Simple Store Template');
  return requestEvent.next();
};

export const useServerTimeLoader = routeLoader$(() => {
  return {
    date: new Date().toISOString(),
  };
});

export const useConfigDataLoader = routeLoader$(async (requestEvent) => {
  try {
    const MICROCMS_SERVICE_DOMAIN =
      requestEvent.env.get('MICROCMS_SERVICE_DOMAIN') || '';
    const MICROCMS_API_KEY = requestEvent.env.get('MICROCMS_API_KEY') || '';
    const client = createClient({
      serviceDomain: MICROCMS_SERVICE_DOMAIN,
      apiKey: MICROCMS_API_KEY,
    });

    const response = await client.getObject<ConfigObject>({
      endpoint: 'config',
    });

    const config = {
      shopName: response.shopName,
    };

    return {
      config,
    };
  } catch (error) {
    console.error(error);
    return { config: null };
  }
});

export default component$(() => {
  const imageTransformer$ = $(
    ({ src, width, height }: ImageTransformerProps): string => {
      return `${src}?w=${width}&h=${height}&format=webp`;
    },
  );

  // Provide your default options
  useImageProvider({
    // you can set this property to overwrite default values [640, 960, 1280, 1920, 3840]
    resolutions: [640],
    // you we can define the source from which to load our image
    imageTransformer$,
  });

  useOnDocument(
    'load',
    $(() => {
      const toastElement = document.createElement('wc-toast');
      document.getElementById('wc-toast')!.appendChild(toastElement);
    }),
  );

  const configData = useConfigDataLoader();

  return (
    <>
      <Header shopName={configData.value.config?.shopName} />
      <main class="container mx-auto">
        <Slot />
      </main>
      <Footer />
      <div id="wc-toast"></div>
    </>
  );
});
