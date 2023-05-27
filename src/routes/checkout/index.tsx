import { component$, useStore, useTask$ } from '@builder.io/qwik';
import {
  Form,
  routeAction$,
  routeLoader$,
  z,
  zod$,
  type DocumentHead,
} from '@builder.io/qwik-city';
import { isServer } from '@builder.io/qwik/build';
import { createClient } from 'microcms-js-sdk';
import { toast } from 'wc-toast';
import Clock from '~/components/checkout/clock';
import { Loading } from '~/components/icons/loading';
import type { SaleItemObject } from '~/types/sale';

type OriginalObject = {
  [key: string]: string;
};

type SaleItem = {
  fieldId: string;
  item: string;
  number: number;
};

type TransformedObject = {
  content: {
    saleItems: SaleItem[];
    totalPrice: number;
  };
};

function transformData(obj: OriginalObject): TransformedObject {
  const transformedSaleItems: SaleItem[] = Object.entries(obj)
    .filter(([key]) => key !== 'totalPrice')
    .map(([key, value]) => ({
      fieldId: 'items',
      item: key,
      number: parseInt(value),
    }))
    .filter((item) => !!(item.number && !Number.isNaN(item.number))); // valueが0のデータを削除

  return {
    content: {
      saleItems: transformedSaleItems,
      totalPrice: parseInt(obj.totalPrice),
    },
  };
}

export const useAddSales = routeAction$(async (data, requestEvent) => {
  try {
    const MICROCMS_SERVICE_DOMAIN =
      requestEvent.env.get('MICROCMS_SERVICE_DOMAIN') || '';
    const MICROCMS_API_KEY = requestEvent.env.get('MICROCMS_API_KEY') || '';

    const client = createClient({
      serviceDomain: MICROCMS_SERVICE_DOMAIN,
      apiKey: MICROCMS_API_KEY,
    });

    const response = await client.create({
      endpoint: 'sale',
      ...transformData(data),
    });

    return {
      success: Boolean(response.id),
      date: new Date().toISOString(),
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      date: new Date().toISOString(),
    };
  }
}, zod$(z.record(z.string(), z.string())));

export const useItemData = routeLoader$(async (requestEvent) => {
  try {
    const MICROCMS_SERVICE_DOMAIN =
      requestEvent.env.get('MICROCMS_SERVICE_DOMAIN') || '';
    const MICROCMS_API_KEY = requestEvent.env.get('MICROCMS_API_KEY') || '';

    const client = createClient({
      serviceDomain: MICROCMS_SERVICE_DOMAIN,
      apiKey: MICROCMS_API_KEY,
    });

    const items = await client.getList<SaleItemObject>({
      endpoint: 'items',
      queries: {
        limit: 9999,
      },
    });

    return {
      items,
    };
  } catch (error) {
    console.error(error);
    return {
      items: {
        contents: [],
      },
    };
  }
});

type ValueObject = {
  [key: string]: number;
};

function sumValues(obj: ValueObject): number {
  return Object.values(obj).reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0,
  );
}

export default component$(() => {
  const action = useAddSales();
  const itemData = useItemData();
  const cart = useStore({
    data: {},
  });

  useTask$(({ track }) => {
    track(() => action.value);
    if (isServer) {
      return;
    }

    if (action.value?.success === true) {
      toast.success('データを追加しました');
    }

    if (action.value?.success === false) {
      toast.error('データの追加に失敗しました');
    }
  });

  return (
    <div class="min-h-[calc(100dvh-52px-72px)] bg-white">
      <div class="container mx-auto px-4 md:px-0">
        <Clock />
        <Form action={action}>
          <div class="mb-8 mt-2 w-full rounded-lg border p-4 shadow-sm">
            <div class="space-y-2 text-center">
              <div class="text-sm">合計金額</div>
              <div class="text-4xl font-bold">
                {sumValues(cart.data).toLocaleString()} 円
              </div>
              <div class="text-xs text-gray-500">消費税込みの価格</div>
            </div>
          </div>
          <div class="relative overflow-x-auto rounded">
            <table class="w-full text-left">
              <thead class="bg-gray-100 text-xs md:text-sm">
                <tr>
                  <th class="p-2 md:p-3"></th>
                  <th class="p-2 md:p-3">商品名</th>
                  <th class="p-2 md:p-3">価格</th>
                  <th class="p-2 md:p-3">個数</th>
                </tr>
              </thead>
              <tbody>
                {itemData.value?.items.contents.map((item, index) => {
                  return (
                    <tr
                      class={`border-b ${index % 2 && 'bg-gray-50'}`}
                      key={item.id}
                    >
                      <th scope="row" class="w-1/12 p-2 md:p-3">
                        {(index + 1).toString()}
                      </th>
                      <td class="w-6/12 p-2 md:p-3">{item.title}</td>
                      <td class="w-3/12 p-2 md:p-3">
                        {item.price.toLocaleString()}
                      </td>
                      <td class="w-2/12 p-2 md:p-3">
                        <input
                          type="number"
                          class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 focus:border-blue-500 focus:ring-blue-500"
                          inputMode="numeric"
                          name={item.id}
                          max={99}
                          aria-label={`${item.title}の個数`}
                          onChange$={(event) => {
                            cart.data = {
                              ...cart.data,
                              [item.id]:
                                item.price * Number(event.target?.value),
                            };
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {action.value?.success ? (
            <div class="my-8">
              <button
                type="button"
                class="w-full rounded-lg bg-sky-500 px-5 py-3 text-xl font-bold text-white hover:cursor-pointer hover:bg-sky-600 focus:ring-4 focus:ring-blue-300"
                onClick$={() => {
                  window.location.reload();
                }}
              >
                新規会計をする
              </button>
            </div>
          ) : (
            <div class="my-8 grid grid-cols-3 gap-4 md:gap-8">
              <button
                type="submit"
                class="col-span-2 flex w-full items-center justify-center rounded-lg bg-orange-500 p-3 font-bold text-white hover:cursor-pointer hover:bg-orange-600 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 md:px-5 md:text-xl"
                disabled={
                  action.isRunning ||
                  action.value?.success ||
                  !sumValues(cart.data)
                }
              >
                {action.isRunning && <Loading />}
                {action.value?.success ? '送信済み' : '会計'}
              </button>
              <button
                type="reset"
                class="w-full rounded-lg bg-sky-700 p-3 font-bold text-white hover:cursor-pointer hover:bg-sky-800 focus:ring-4 focus:ring-blue-300 md:px-5 md:text-xl"
                onClick$={() => {
                  cart.data = {};
                  toast.success('リセットしました');
                }}
              >
                リセット
              </button>
            </div>
          )}
          <input type="hidden" value={sumValues(cart.data)} name="totalPrice" />
        </Form>
      </div>
    </div>
  );
});

export const head: DocumentHead = () => {
  return {
    title: `Checkout`,
    meta: [
      {
        name: 'description',
        content: `Store Checkout`,
      },
    ],
  };
};
