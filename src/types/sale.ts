import type { MicroCMSListContent } from 'microcms-js-sdk';

export type SaleItemObject = {
  title: string;
  price: number;
} & MicroCMSListContent;

export type SaleItem = {
  fieldId: string;
  item: SaleItemObject;
  number: number;
};

export type SaleObject = {
  saleItems: SaleItem[];
  totalPrice: number;
} & MicroCMSListContent;

export type SaleData = {
  contents: SaleObject[];
  totalCount: number;
  offset: number;
  limit: number;
};

export type ItemObject = {
  title: string;
  price: number;
} & MicroCMSListContent;

export type ChartData = {
  title: string;
  price: number;
  totalCount: number;
  totalPrice: number;
};

export type HistoryItem = {
  title: string;
  price: number;
  count: number;
  total: number;
  createdAt: string;
};
