export type Category = {
  id: number;
  title: string;
  subCategories: SubCategory[];
  filters: Filter[];
};

type ThirdCategory = {
  id: number;
  title: string;
};

type CatalogSubCategory = {
  id: number;
  title: string;
  third_categories: ThirdCategory[];
};

export type CatalogCategory = {
  id: number;
  image: string;
  title: string;
  subCategories: CatalogSubCategory[];
};

export type SubCategory = {
  id: number;
  title: string;
  third_categories: { id: number; title: string }[];
};

export type Filter = {
  id: number;
  title: string;
  options: Option[];
};

type Option = {
  id: number;
  title: string;
  color_code: string | null;
};

export type HomeHero = {
  id: number;
  title: string;
  description: string;
  image: string;
};

export type Advanteges = {
  id: number;
  title: string;
  icon: string;
};

export type ProductResponse = {
  data: Product[];
  count: number;
  meta: Meta;
};

export type Product = {
  id: number;
  is_new: boolean;
  title: string;
  price: string;
  discount: string | null;
  discounted_price: string;
  discount_ends_at?: string | null;
  unit: string | null;
  category: Category;
  sub_category: SubCategory;
  filters: {
    filter_id: number;
    filter_name: string;
    options: {
      option_id: number;
      name: string;
      is_default: string;
      color_code: string | null;
    }[];
  }[];
  brand: Brand;
  image: string;
  thumbnail?: string;
  sliders: Slider[];
  slug: {
    en: string;
    ru: string;
  };
};

export type Brand = {
  id: number;
  title: string;
  logo: string;
};

type Slider = {
  id: number;
  image: string;
};

type Meta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type RulesType = {
  id: number;
  title: string;
  description: string;
};

export type Translation = {
  [key: string]: string;
};

export type TranslationsKeys = Record<keyof Translation, string>;

export type Store = {
  id: number;
  title: string;
  address: string;
};

export type Tiktok = {
  id: number;
  title: string;
  image: string;
  products: Product[];
};

export type Tiktoks = Tiktok[];

export interface SpecialOffer {
  id: number;
  title: string;
  discount: string;
  description: string;
}

export type HomeCategory = {
  id: number;
  title: string;
  products: Product[];
};

export type User = {
  customer: {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string | null;
  };
  token: string;
};

export type LoginBunner = {
  title: string;
  id: string;
  image: string;
  second_image: string;
};

export type SocialMediaLink = {
  id: number;
  title: string;
  url: string;
  icon: string;
};

export type Holideys = {
  id: number;
  title: string;
  value: string;
  description: string;
  video: string;
};

export type About = {
  id: number;
  title: string;
  description: string;
  image: string;
};

export type FaqCategory = {
  id: number;
  title: string;
};

export type FaqItem = {
  id: number;
  title: string;
  description: string;
};

// Rəng Variantı tipi
export type ColorVariant = {
  id: number;
  slug: {
    en: string;
    ru: string;
  };
  color_name: string;
  color_code: string | null;
  image: string;
  price: string;
  discount: number;
  discounted_price: string;
  is_stock: boolean;
};

export interface ProductDetail {
  id: number;
  sub_category_id: number;
  category_id: number;
  title: string;
  is_return: boolean;
  short_title: string;
  is_new: boolean;
  is_stock: boolean;
  is_season: boolean;
  discount_ends_at?: string | null;
  code: string;
  product_code?: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  img_alt: string;
  img_title: string;
  description: string;
  size_image: string;
  slug: {
    en: string;
    ru: string;
  };
  price: string;
  discount: string | null;
  discounted_price: string;
  comments_count: number | null;
  avg_star: number;
  unit: string;
  category: {
    id: number;
    title: string;
    subCategories: {
      id: number;
      title: string;
    }[];
    filters: {
      id: number;
      title: string;
      options: {
        id: number;
        title: string;
        color_code: string | null;
      }[];
    }[];
  };
  sub_category: {
    id: number;
    title: string;
  };
  brand: {
    id: number;
    title: string;
    logo: string;
  };
  image: string;
  thumbnail?: string;
  sliders: {
    id: number;
    image: string;
  }[];
  video?: string | null;
  comments: {
    id: number;
    comment: string;
    star: number;
    date: string;
    customer: {
      id: number;
      customer: string | null;
      email: string;
      phone: string;
      address: {
        id: number;
        address: string;
        additional_info: string;
      };
    };
  }[];
  filters: {
    filter_id: number;
    filter_name: string;
    options: {
      option_id: number;
      name: string;
      is_default: string;
      color_code: string | null;
      is_stock: boolean;
    }[];
  }[];
  rating_summary: string[];
  current_color?: {
    name: string;
    code: string | null;
  } | null;
  color_variants?: ColorVariant[];
  has_variants?: boolean;
  variants?: Array<{
    variantKey?: string;
    color?: string;
    size?: string;
    image?: string;
    price?: number;
    cost?: number;
    weight?: number;
    sku?: string;
    cj_vid?: string;
  }>;
}

export type ConmtactItem = {
  id: number;
  title: string;
  value: string;
  icon: string;
};

export type AuthResponse = {
  token: string;
  customer: {
    id: number;
    name: string;
    email: string;
    phone: string;
    gender: string;
  };
};

type BasketItem = {
  id: number;
  quantity: number;
  status: string;
  price: string;
  options: {
    filter: string;
    option: string;
  }[];
  product: {
    id: number;
    sub_category_id: number;
    category_id: number;
    title: string;
    short_title: string;
    is_new: boolean;
    is_stock: boolean;
    is_season: boolean;
    code: string;
    description: string;
    slug: {
      en: string;
      ru: string;
    };
    price: string;
    discount: number | null;
    discounted_price: string;
    comments_count: number | null;
    avg_star: number;
    unit: string | null;
    category: {
      id: number;
      title: string;
      subCategories: {
        id: number;
        title: string;
      }[];
      filters: {
        id: number;
        title: string;
        options: {
          id: number;
          title: string;
          color_code: string | null;
        }[];
      }[];
    };
    sub_category: {
      id: number;
      title: string;
    };
    brand: {
      id: number;
      title: string;
      logo: string;
    };
    image: string;
    thumbnail?: string;
    sliders: {
      id: number;
      image: string;
    }[];
    video?: string | null;  // ← BU SƏTRİ ƏLAVƏ ET
    comments: {
      id: number;
      comment: string | null;
      star: number;
      date: string;
      customer: {
        id: number;
        name: string;
        email: string;
        phone: string;
      };
    }[];
    options: {
      id: number;
      is_default: number;
      title: string;
      color_code: string | null;
    }[];
    rating_summary: string[];
  };
};

export type Basket = {
  basket_items: BasketItem[];
  total_price: number;
  discount: number;
  delivered_price: number;
  final_price: number;
};

export type Order = {
  order_items_count: number;
  id: number;
  order_number: string;
  status: string;
  is_deliver: 0 | 1;
  shop: string;
  payment_type: string;
  total_price: string;
  discount: string;
  delivered_price: string;
  final_price: string;
  order_date: string;
  order_items: BasketItem[];
  address: string;
};

export type Reasons = {
  title: string;
  id: number;
};

export type TopLine = {
  data: {
    id: number;
    title: string;
  } | null;
  top_line: boolean;
};

export type Favorite = {
  id: number;
  product: Product;
};

export type Seo = {
  id: number;
  type: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
};

export type Notification = {
  id: number;
  title: string;
  body: string;
  is_read: boolean;
};

type FilterConditions = {
  category_id?: string;
  brand_id?: string;
  max_price?: string;
  min_price?: string;
  is_popular?: number;
  is_season?: number;
  is_discount?: number;
  sub_category_id?: string;
  third_category_id?: string;
};

type Item = {
  id: number;
  title: string;
  description: string;
  image: string;
  filter_conditions: FilterConditions;
};

export type ItemList = Item[];