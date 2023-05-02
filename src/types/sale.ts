import type { MicroCMSListContent } from "microcms-js-sdk";

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
