import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import ApexCharts, { type ApexOptions } from 'apexcharts';

type SalesChartProps = {
  salesData: any;
};

const createOptions = (salesData: any) => {
  return {
    series: salesData.value.item.map((item: any) => item.totalPrice || 0),
    labels: salesData.value.item.map((item: any) => item.title),
    tooltip: {},
    chart: {
      type: 'donut',
    },
    legend: {
      position: 'bottom',
    },
    plotOptions: {
      pie: {
        donut: {
          size: '50%',
          labels: {
            show: true,
            total: {
              showAlways: true,
              show: true,
              label: '合計',
              formatter(w) {
                return `${w.globals.seriesTotals
                  .reduce((accumulator: number, currentValue: number) => {
                    return accumulator + currentValue;
                  }, 0)
                  .toLocaleString()}円`;
              },
            },
          },
        },
      },
    },
  } satisfies ApexOptions;
};

export default component$<SalesChartProps>(({ salesData }) => {
  const donutsChart = useSignal<HTMLDivElement>();
  useVisibleTask$(({ cleanup, track }) => {
    track(() => salesData.value.item);
    let chart: ApexCharts;
    if (donutsChart?.value && salesData.value.data && salesData.value.item) {
      const options = createOptions(salesData);
      chart = new ApexCharts(donutsChart.value, options);
      chart.render();
    }
    cleanup(() => {
      chart.destroy();
    });
  });
  return (
    <div class="grow">
      <p class="mb-4 text-center font-bold">商品別の販売区分</p>
      <div ref={donutsChart} id="donutsChart" class="grow"></div>
    </div>
  );
});
