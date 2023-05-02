import { $, component$ } from '@builder.io/qwik';
import {
  Link,
  routeLoader$,
  useLocation,
  type DocumentHead,
} from '@builder.io/qwik-city';
import { createClient } from 'microcms-js-sdk';
import SalesChart from '~/components/chart/salesChart';
import WeatherChart from '~/components/chart/weatherChart';
import { Download } from '~/components/icons/download';
import { useConfigDataLoader } from '~/routes/layout';
import type { ItemObject, SaleObject } from '~/types/sale';
import {
  arrayToCSV,
  calculateItemStats,
  getTomorrowFromISOString,
  getYesterdayFromISOString,
  transformData,
} from '~/utils/chart';

export const useWeatherDataLoader = routeLoader$(async (requestEvent) => {
  try {
    const { config } = await requestEvent.resolveValue(useConfigDataLoader);

    if (!config) {
      throw new Error('Config is not found');
    }

    // 緯度経度のデフォルト値は東京
    const lat = config.shopPosition?.lat || '35.6894';
    const lon = config.shopPosition?.lon || '139.6917';
    const location = config.location || '東京';

    const OPENWEATHER_API_KEY = requestEvent.env.get('OPENWEATHER_API_KEY');
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=ja&exclude=alerts,minutely,daily`,
    );
    const data = await weatherResponse.json();

    return {
      data,
      location,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
});

export const useSalesData = routeLoader$(async (requestEvent) => {
  const pathParams = requestEvent.params;
  const targetDate = pathParams.date || new Date().toISOString().slice(0, 10);

  const MICROCMS_SERVICE_DOMAIN =
    requestEvent.env.get('MICROCMS_SERVICE_DOMAIN') || '';
  const MICROCMS_API_KEY = requestEvent.env.get('MICROCMS_API_KEY') || '';
  const client = createClient({
    serviceDomain: MICROCMS_SERVICE_DOMAIN,
    apiKey: MICROCMS_API_KEY,
  });

  const data = await client.getList<SaleObject>({
    endpoint: 'sale',
    queries: {
      limit: 9999,
      filters: `createdAt[begins_with]${targetDate}`,
    },
  });

  const item = await client.getList<ItemObject>({
    endpoint: 'items',
    queries: {
      orders: '-price',
    },
  });

  const itemReport = item.contents.map((item) => {
    const calc = calculateItemStats(data, item.title);
    return {
      title: item.title,
      price: item.price,
      ...calc,
    };
  });

  return {
    data,
    item: itemReport,
  };
});

export default component$(() => {
  const location = useLocation();
  const weatherData = useWeatherDataLoader();
  const salesData = useSalesData();

  const downloadHandler = $(() => {
    const csvData = transformData(salesData.value.data);
    const csv = arrayToCSV(csvData);
    const filename = `sales_${
      location.params.date || new Date().toISOString().slice(0, 10)
    }.csv`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  });

  return (
    <div class="container mx-auto min-h-[calc(100dvh-52px-72px)] px-4 md:px-0">
      <div class="mt-4 border-b-2 px-2 pb-4 md:flex md:items-center md:justify-between">
        <h1 class="text-center text-xl font-bold md:text-left md:text-2xl">
          {location.params.date || new Date().toISOString().slice(0, 10)}{' '}
          の売上データ
        </h1>
        <ul class="mt-2 flex items-center justify-center gap-3 md:mt-0 md:justify-end">
          <li class="">
            <Link
              href={`/dashboard/${getYesterdayFromISOString(
                location.params.date || new Date().toISOString().slice(0, 10),
              )}`}
              class="hover:underline"
            >
              前日
            </Link>
          </li>
          <li class="">
            <Link
              href={`/dashboard/${new Date().toISOString().slice(0, 10)}`}
              class="hover:underline"
            >
              今日
            </Link>
          </li>
          <li class="">
            <Link
              href={`/dashboard/${getTomorrowFromISOString(
                location.params.date || new Date().toISOString().slice(0, 10),
              )}`}
              class="hover:underline"
            >
              翌日
            </Link>
          </li>
          <li class="">
            <Link class="hover:underline" reload>
              更新
            </Link>
          </li>
        </ul>
      </div>
      <div class="flex flex-col gap-6 py-6 md:grid md:grid-cols-2 md:py-12">
        <div class="order-1 flex h-full w-full justify-center md:order-none">
          <SalesChart salesData={salesData} />
        </div>
        <div class="order-3 mt-4 flex h-full w-full justify-center md:order-none md:mt-0">
          <WeatherChart
            location={weatherData.value?.location}
            weatherData={weatherData.value?.data}
          />
        </div>
        <div class="order-2 mt-8 md:order-none md:col-span-2 md:mt-0">
          <div class="mb-2 flex items-center p-2">
            <h3 class="text-xl font-bold">販売データ</h3>
            <div class="ml-2">
              <button type="button" onClick$={downloadHandler}>
                <Download width={32} height={32} />
              </button>
            </div>
          </div>
          <div class="relative overflow-x-auto rounded">
            <table class="w-full text-left">
              <thead class="bg-gray-100 text-xs md:text-sm">
                <tr>
                  <th class="p-2 md:p-3"></th>
                  <th class="p-2 md:p-3">商品</th>
                  <th class="p-2 md:p-3">単価</th>
                  <th class="p-2 md:p-3">売上</th>
                  <th class="p-2 md:p-3">販売数</th>
                </tr>
              </thead>
              <tbody class="text-sm md:text-base">
                {salesData.value.item
                  .sort((a, b) => b.totalPrice - a.totalPrice)
                  .map((item, index) => {
                    return (
                      <tr
                        class={`border-b ${index % 2 && 'bg-gray-50'}`}
                        key={index}
                      >
                        <th scope="row" class="w-1/12 p-2 md:p-3">
                          {(index + 1).toString()}
                        </th>
                        <td class="w-5/12 p-2 md:p-3">{item.title}</td>
                        <td class="w-2/12 p-2 md:p-3">
                          {item.price.toLocaleString()}円
                        </td>
                        <td class="w-2/12 p-2 md:p-3">
                          {item.totalPrice.toLocaleString()}円
                        </td>
                        <td class="w-2/12 p-2 md:p-3">
                          {item.totalCount.toString()}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = ({ params }) => {
  const date = params.date || new Date().toISOString().slice(0, 10);

  return {
    title: `Dashboard - ${date}`,
    meta: [
      {
        name: 'description',
        content: `Store Dashboard - ${date}`,
      },
    ],
  };
};
