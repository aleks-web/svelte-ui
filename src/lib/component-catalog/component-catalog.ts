export type ComponentCatalogScope = "package" | "application";

export type ComponentCatalogEntry = {
  name: string;
  group: string;
  path: string;
  props: readonly string[];
  description: string;
  usage: string;
  importCode: string;
};

export type ComponentCatalogGroup = {
  value: string;
  label: string;
  badge?: string | number;
};
