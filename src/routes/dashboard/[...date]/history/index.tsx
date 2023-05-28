import { component$ } from '@builder.io/qwik';
import { useLocation, type DocumentHead } from '@builder.io/qwik-city';
import { convertTimestampToOffsetDate, transformData } from '~/utils/chart';

import { useSalesData } from '../layout';

export default component$(() => {
  const location = useLocation();
  const salesData = useSalesData();
  const historyData = transformData(salesData.value.data, 9);

  return (
    <div class="container mx-auto min-h-[calc(100dvh-52px-72px)] p-4 md:px-0">
      <h1 class="mb-4 text-center text-xl font-bold md:text-left md:text-2xl">
        {location.params.date || convertTimestampToOffsetDate(9, 'YYYY-MM-DD')}{' '}
        の販売履歴
      </h1>
      <div class="relative overflow-x-auto rounded">
        <table class="w-full text-left">
          <thead class="bg-gray-100 text-sm">
            <tr>
              <th class="p-2"></th>
              <th class="p-2">商品</th>
              <th class="p-2">単価</th>
              <th class="p-2">販売数</th>
              <th class="p-2">販売価格</th>
              <th class="p-2">販売日時</th>
            </tr>
          </thead>
          <tbody class="text-sm">
            {historyData.map((item, index) => {
              return (
                <tr class={`border-b ${index % 2 && 'bg-gray-50'}`} key={index}>
                  <th scope="row" class="w-1/12 p-2">
                    {(index + 1).toString()}
                  </th>
                  <td class="w-5/12 p-2">{item.title}</td>
                  <td class="w-2/12 p-2">{item.price.toLocaleString()}円</td>
                  <td class="w-2/12 p-2">{item.count}</td>
                  <td class="w-2/12 p-2">{item.total.toLocaleString()}円</td>
                  <td class="w-2/12 p-2">{item.createdAt}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export const head: DocumentHead = ({ params }) => {
  const date = params.date || convertTimestampToOffsetDate(9, 'YYYY-MM-DD');

  return {
    title: `History - ${date}`,
    meta: [
      {
        name: 'description',
        content: `Store History - ${date}`,
      },
    ],
  };
};
