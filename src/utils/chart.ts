import type { SaleData } from '~/types/sale';

export function convertUnixTimestampToLocalTime(unixTimestamp: number): string {
  const date = new Date(unixTimestamp * 1000);
  const hours = date.getHours();

  const formattedHours = hours.toString();

  return `${formattedHours}時`;
}

export function convertISOStringToCustomFormat(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}

export function arrayToCSV(data: Array<any>) {
  const replacer = (key: any, value: any) => (value === null ? '' : value);
  const header = Object.keys(data[0]);
  const csv = [
    header.join(','),
    ...data.map((row) =>
      header
        .map((fieldName) => JSON.stringify(row[fieldName], replacer))
        .join(','),
    ),
  ].join('\r\n');

  return csv;
}

export function calculateItemStats(saleData: SaleData, itemTitle: string) {
  let totalCount = 0;
  let totalPrice = 0;

  saleData.contents.forEach((content) => {
    content.saleItems?.forEach((saleItem) => {
      if (saleItem.item.title === itemTitle) {
        totalCount += saleItem.number;
        totalPrice += saleItem.item.price * saleItem.number;
      }
    });
  });

  return { totalCount: totalCount || 0, totalPrice: totalPrice || 0 };
}

type NewObjects = {
  title: string;
  price: number;
  count: number;
  total: number;
  createdAt: string; // 2023/04/30 18:44:58
};

export function transformData(data: any) {
  const newObjects: NewObjects[] = data.contents.flatMap((content: any) =>
    content.saleItems.map((saleItem: any) => {
      return {
        title: saleItem.item.title,
        price: saleItem.item.price,
        count: saleItem.number,
        total: saleItem.item.price * saleItem.number,
        createdAt: convertISOStringToCustomFormat(content.createdAt),
      };
    }),
  );

  newObjects.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return newObjects;
}

export function getTomorrowFromISOString(isoDateString: string): string {
  const date = new Date(isoDateString);
  const tomorrow = new Date(date);

  tomorrow.setDate(tomorrow.getDate() + 1);

  return tomorrow.toISOString().slice(0, 10);
}

export function getYesterdayFromISOString(isoDateString: string): string {
  const date = new Date(isoDateString);
  const yesterday = new Date(date);

  yesterday.setDate(yesterday.getDate() - 1);

  return yesterday.toISOString().slice(0, 10);
}

export function getStartAndEndOfTime(
  yearMonthDay: string,
  timezoneOffset: number,
): [string, string] {
  // Split the input into year, month, and day
  const [year, month, day] = yearMonthDay.split('-').map(Number);

  // Check for invalid year, month, or day (minimal error checking)
  if (year < 0 || month < 1 || month > 12 || day < 1 || day > 31) {
    throw new Error('Invalid year or month or day');
  }

  // Create a Date object for the first day of the month / the start of the day
  const startOfMonthOrDay = new Date(
    Date.UTC(year, month - 1, day || 1, -timezoneOffset),
  );

  // Subtract 1 millisecond
  startOfMonthOrDay.setMilliseconds(startOfMonthOrDay.getMilliseconds() - 1);

  // Create a Date object for the last day of the month / the end of the day
  const endOfMonthOrDay = new Date(
    Date.UTC(
      day ? year : month === 12 ? year + 1 : year,
      day ? month - 1 : month % 12,
      day ? day + 1 : 1,
      -timezoneOffset,
    ),
  );

  // Return the start and end of the month / day in ISO format
  return [startOfMonthOrDay.toISOString(), endOfMonthOrDay.toISOString()];
}

export function getFormattedTimeRange(
  fieldName: string,
  yearMonthDay: string,
  timezoneOffset: number,
): string {
  // Get the start and end of the month / day with timezone adjustment
  const [start, end] = getStartAndEndOfTime(yearMonthDay, timezoneOffset);

  // Return the formatted string
  return `${fieldName}[greater_than]${start}[and]${fieldName}[less_than]${end}`;
}

export function downloadCsv(data: any, date: string) {
  const csvData = transformData(data);
  const csv = arrayToCSV(csvData);
  const filename = `sales_${date}.csv`;

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
}
