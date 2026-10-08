import React from 'react';
import { ProductData } from '../types';

interface LabelProps {
  product: ProductData;
}

export const Label: React.FC<LabelProps> = ({ product }) => {
  const {
    product_name,
    sku,
    wood,
    size,
    retail_price,
    our_price,
    gst_percentage = 18 // Default to 18% as per prompt rule
  } = product;

  const savings = retail_price - our_price;
  const discountPercent = Math.round((savings / retail_price) * 100);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="label-container w-[320px] h-[480px] bg-white border border-gray-300 shadow-sm print:shadow-none print:border-gray-800 relative flex flex-col p-4 mx-auto mb-8 print:mb-0 print:mx-0">
      
      {/* Decorative Outer Border */}
      <div className="absolute inset-2 border-2 border-wood-900 pointer-events-none z-10"></div>
      
      {/* Header / Brand Section */}
      <div className="relative z-20 text-center border-b-2 border-wood-900 pb-2 mb-4 pt-2">
        <div className="flex justify-center mb-1">
             {/* Logo Placeholder - Simulating the 'W' from image */}
             <div className="text-4xl font-serif font-bold text-wood-900">
              <img src="./images/wood-logo.png" alt="icon" width="250" />
             </div>
        </div>
        {/* <h1 className="text-2xl font-serif tracking-widest text-wood-900 font-bold uppercase">
          WOOD DEKOR
        </h1> */}
        <p className="font-script text-gray-600 text-lg -mt-1">
          "Transforming houses into homes"
        </p>
      </div>

      {/* Product Name */}
      <div className="relative z-20 flex-grow flex items-center justify-center text-center px-2 mb-4">
        <h2 className="text-xl font-bold text-gray-900 font-sans leading-tight">
          {product_name}
        </h2>
      </div>

      {/* Details Section */}
      <div className="relative z-20 space-y-1 text-center mb-6 font-sans text-sm font-medium text-gray-800">
        <p><span className="font-bold text-gray-900">SKU :</span> {sku}</p>
        <p><span className="font-bold text-gray-900">Wood :</span> {wood}</p>
        <p><span className="font-bold text-gray-900">Size :</span> {size}</p>
      </div>

      {/* Pricing Section */}
      <div className="relative z-20 bg-gray-50 p-3 text-center mb-4">
        <div className="space-y-1">
          <p className="text-gray-500 text-sm">
            Retail Price <span className="line-through decoration-red-500">{formatCurrency(retail_price)}</span>
          </p>
          <p className="text-xl font-bold text-gray-900">
            Our Price {formatCurrency(our_price)}
          </p>
          {savings > 0 && (
            <p className="text-wood-900 font-bold text-sm mt-1">
              You Save {formatCurrency(savings)} ({discountPercent}%)
            </p>
          )}
        </div>
      </div>

      {/* Footer / GST */}
      <div className="relative z-20 mt-auto text-center">
        <p className="text-red-600 font-bold text-xs uppercase tracking-wide">
          Prices are Inclusive of GST @{gst_percentage}%
        </p>
      </div>

    </div>
  );
};