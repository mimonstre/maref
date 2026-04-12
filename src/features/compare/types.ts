export type CompareFamily = {
  key: string;
  label: string;
};

export type CompareGroup = CompareFamily & {
  offerIds: string[];
  updatedAt: string;
};
