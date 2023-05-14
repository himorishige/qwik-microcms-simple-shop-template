export type ConfigObject = {
  shopName: string;
  location: {
    location?: string;
  };
  shopPosition: {
    latitude?: number;
    longitude?: number;
  };
};

export type ConfigType = {
  shopName: string;
  location: string | undefined;
  shopPosition: {
    lat: number | undefined;
    lon: number | undefined;
  };
} | null;
