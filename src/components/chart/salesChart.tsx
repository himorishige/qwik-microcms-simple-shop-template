import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import ApexCharts, { type ApexOptions } from 'apexcharts';

type SalesChartProps = {
  salesData: any;
};

export default component$<SalesChartProps>(({ salesData }) => {
  const loc = useLocation();
  const donutsChart = useSignal<HTMLDivElement>();
  useVisibleTask$(({ cleanup, track }) => {
    track(() => [loc.params.date, salesData.value.item]);
    let chart2: ApexCharts;
    if (donutsChart?.value && salesData.value.data && salesData.value.item) {
      const options = {
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
      chart2 = new ApexCharts(donutsChart.value, options);
      chart2.render();
    }
    cleanup(() => {
      chart2.destroy();
    });
  });
  return (
    <div class="grow">
      <p class="mb-4 text-center font-bold">商品別の販売区分</p>
      <div ref={donutsChart} id="donutsChart" class="grow"></div>
    </div>
  );
});
