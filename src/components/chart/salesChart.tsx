import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import ApexCharts, { type ApexOptions } from 'apexcharts';
import type { ChartData } from '~/types/sale';

type SalesChartProps = {
  title: string;
  salesData: any;
};

const createOptions = (salesData: ChartData[]) => {
  const sortData = salesData.sort((a, b) => a.title.localeCompare(b.title));
  return {
    series: sortData.map((item: any) => item.totalPrice || 0),
    labels: sortData.map((item: any) => item.title),
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

export default component$<SalesChartProps>(({ salesData, title }) => {
  const donutsChart = useSignal<HTMLDivElement>();
  useVisibleTask$(({ cleanup, track }) => {
    track(() => salesData);
    let chart: ApexCharts | undefined;

    if (chart) {
      chart.updateOptions(createOptions(salesData));
    } else if (donutsChart?.value && salesData) {
      const options = createOptions(salesData);
      chart = new ApexCharts(donutsChart.value, options);
      chart.render();
    }
    cleanup(() => {
      if (chart) {
        chart.destroy();
      }
    });
  });
  return (
    <div class="grow">
      <p class="mb-4 text-center font-bold">{title}</p>
      <div ref={donutsChart} id="donutsChart" class="grow"></div>
    </div>
  );
});
