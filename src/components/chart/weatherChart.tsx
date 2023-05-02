import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import ApexCharts, { type ApexOptions } from 'apexcharts';
import { Image } from 'qwik-image';
import { convertUnixTimestampToLocalTime } from '~/utils/chart';

const openWeatherIconBaseUrl = 'https://openweathermap.org/img/wn';

const createOptions = (data: any) => {
  return {
    chart: {
      type: 'line',
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: 'smooth',
    },
    markers: {
      size: 1,
    },
    dataLabels: {
      enabled: true,
    },
    series: [
      {
        name: '気温',
        data: data.hourly.map((item: any) => Math.round(item.temp)).slice(0, 8),
      },
      {
        name: '湿度',
        data: data.hourly
          .map((item: any) => Math.round(item.humidity))
          .slice(0, 8),
      },
      {
        name: '降水確率',
        data: data.hourly.map((item: any) => item.pop * 100).slice(0, 8),
      },
    ],
    xaxis: {
      categories: data.hourly
        .map((item: any) => convertUnixTimestampToLocalTime(item.dt))
        .slice(0, 12),
      labels: {
        show: false,
      },
    },
    yaxis: [
      {
        labels: {
          show: false,
        },
      },
      {
        opposite: true,
        labels: {
          show: false,
        },
        max: 100,
      },
      {
        labels: {
          show: false,
        },
        min: 0,
        max: 100,
      },
    ],
  } satisfies ApexOptions;
};

type WeatherChartProps = {
  weatherData: any;
  location?: string;
};

export default component$<WeatherChartProps>(
  ({ weatherData, location = '東京' }) => {
    const myChart = useSignal<HTMLDivElement>();

    useVisibleTask$(({ cleanup }) => {
      let chart1: ApexCharts;
      if (myChart?.value) {
        const options = createOptions(weatherData);
        chart1 = new ApexCharts(myChart.value, options);
        chart1.render();
      }
      cleanup(() => {
        chart1.destroy();
      });
    });

    return (
      <div class="grow">
        <p class="mb-4 text-center font-bold">
          {location}付近の天気予報（{new Date().toISOString().slice(0, 10)}）
        </p>
        <div class="relative overflow-x-auto rounded">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                {weatherData.hourly
                  .map((data: any) => {
                    return (
                      <th key={data.dt} class="py-1 text-sm font-normal">
                        {convertUnixTimestampToLocalTime(data.dt)}
                      </th>
                    );
                  })
                  .slice(0, 8)}
              </tr>
            </thead>
            <tbody>
              <tr>
                {weatherData.hourly
                  .map((data: any) => {
                    return (
                      <td key={data.dt} class="py-1">
                        <Image
                          src={`${openWeatherIconBaseUrl}/${data.weather[0].icon}@2x.png`}
                          layout="fullWidth"
                          alt={data.weather[0].description}
                        />
                      </td>
                    );
                  })
                  .slice(0, 8)}
              </tr>
            </tbody>
          </table>
        </div>
        <div ref={myChart} id="myChart"></div>
      </div>
    );
  },
);
