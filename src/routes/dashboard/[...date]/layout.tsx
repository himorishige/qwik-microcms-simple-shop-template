import { Slot, component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { createClient } from 'microcms-js-sdk';
import type { ItemObject, SaleObject } from '~/types/sale';
import { calculateItemStats } from '~/utils/chart';

function convertToISO(dateStr: string): { today: string; nextDay: string } {
  // 指定された日付
  const date = new Date(dateStr);

  // -9時間（9時間は9 * 60 * 60 * 1000ミリ秒）
  const nineHoursAgoDate = new Date(date.getTime() - 9 * 60 * 60 * 1000);
  const nineHoursAgoISO = nineHoursAgoDate.toISOString();

  // -9時間した日付の翌日（24時間は24 * 60 * 60 * 1000ミリ秒）
  const nextDayDate = new Date(
    nineHoursAgoDate.getTime() + 24 * 60 * 60 * 1000,
  );
  const nextDayISO = nextDayDate.toISOString();

  return {
    today: nineHoursAgoISO,
    nextDay: nextDayISO,
  };
}

export const useSalesData = routeLoader$(async (requestEvent) => {
  const pathParams = requestEvent.params;
  const { today, nextDay } = pathParams.date
    ? convertToISO(pathParams.date)
    : convertToISO(new Date().toISOString().slice(0, 10));

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
      filters: `createdAt[greater_than]${today}[and]createdAt[less_than]${nextDay}`,
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
  return (
    <>
      <Slot />
    </>
  );
});
