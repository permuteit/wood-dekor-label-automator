export interface ProductData {
  id: string;
  product_name: string;
  sku: string;
  category: string;
  wood: string;
  size: string;
  retail_price: number;
  our_price: number;
  gst_percentage?: number;
}

export interface LabelProps {
  product: ProductData;
}

// Columns expected in the Excel file
export const REQUIRED_COLUMNS = [
  'product_name',
  'sku',
  'category',
  'wood',
  'size',
  'retail_price',
  'our_price'
];