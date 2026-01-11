// pages/Products/types.ts

export interface SubCategoriesThirdCategories {
  id: number;
  title: string | null;
}

export interface SubCategories {
  id: number;
  title: string | null;
  third_categories: SubCategoriesThirdCategories[];
}

export interface NewFilterOptions {
  id: number;
  title: string | null;
  color_code: string | null;
}

export interface NewFilters {
  id: number;
  title: string | null;
  options: NewFilterOptions[];
}

export interface NewFiltersInterface {
  id: number;
  title: string;
  image: string;
  filters: NewFilters[];
  subCategories: SubCategories[];
}

export type Brand = {
  id: number;
  title: string;
  image?: string;
};
