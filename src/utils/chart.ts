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

export function transformData(data: any) {
  const newObjects = data.contents.flatMap((content: any) =>
    content.saleItems.map((saleItem: any) => {
      return {
        title: saleItem.item.title,
        price: saleItem.item.price,
        count: saleItem.number,
        total: saleItem.item.price * saleItem.number,
        createdAt: convertISOStringToCustomFormat(saleItem.item.createdAt),
      };
    }),
  );
  return newObjects;
}
