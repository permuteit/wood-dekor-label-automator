import React, { useState } from 'react';
import { UploadArea } from './components/UploadArea';
import { Label } from './components/Label';
import { ProductData } from './types';
import { Printer, RefreshCcw, LayoutGrid, CheckCircle, Sparkles, Loader2 } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

const App: React.FC = () => {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to clear all data?')) {
      setProducts([]);
    }
  };

  const handleAIAutoFill = async () => {
    if (!process.env.API_KEY) {
      alert("API Key is missing from environment variables.");
      return;
    }

    if (!window.confirm("This will use AI to generate details (Price, SKU, Wood, Size) for all products based on their names. Existing details may be overwritten. Continue?")) {
      return;
    }

    setIsGenerating(true);
    const total = products.length;
    setProgress({ current: 0, total });

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const updatedProducts = [...products];
    const chunkSize = 3; // Process in small batches to avoid rate limits

    try {
      for (let i = 0; i < products.length; i += chunkSize) {
        const chunkEnd = Math.min(i + chunkSize, products.length);
        const chunkIndices = Array.from({ length: chunkEnd - i }, (_, k) => i + k);

        const promises = chunkIndices.map(async (index) => {
          const product = updatedProducts[index];
          
          try {
            const response = await ai.models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: `Generate realistic retail furniture specifications for a product named: "${product.product_name}". 
              The brand is "Wood Dekor" (Premium Indian Furniture).
              
              Return a JSON object with:
              - sku: A realistic SKU (e.g. WD-BED-001)
              - category: The product category (Bed, Sofa, Dining Table, etc.)
              - wood: The wood material (Sheesham, Mango, Teak, Acacia, or Engineered Wood)
              - size: Typical dimensions for this product type (e.g. "78 x 72 inches" for a King Bed)
              - retail_price: A realistic high market price in Indian Rupees (Number only)
              - our_price: A realistic discounted showroom price in Indian Rupees (Number only, lower than retail)
              `,
              config: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    sku: { type: Type.STRING },
                    category: { type: Type.STRING },
                    wood: { type: Type.STRING },
                    size: { type: Type.STRING },
                    retail_price: { type: Type.NUMBER },
                    our_price: { type: Type.NUMBER },
                  }
                }
              }
            });

            if (response.text) {
              const data = JSON.parse(response.text);
              updatedProducts[index] = {
                ...product,
                sku: data.sku || product.sku,
                category: data.category || product.category,
                wood: data.wood || product.wood,
                size: data.size || product.size,
                retail_price: data.retail_price || product.retail_price,
                our_price: data.our_price || product.our_price,
              };
            }
          } catch (err) {
            console.error(`Error generating for ${product.product_name}:`, err);
          }
        });

        await Promise.all(promises);
        
        // Update progress and state incrementally so user sees it happening
        setProgress({ current: chunkEnd, total });
        setProducts([...updatedProducts]);
      }
    } catch (error) {
      console.error("Batch generation failed", error);
      alert("Something went wrong during AI generation. Check console.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      
      {/* Header - No Print */}
      <header className="bg-white shadow-sm no-print sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-wood-900 text-white flex items-center justify-center font-serif font-bold text-xl rounded-md">
              <img src="./images/favicon.png" alt="icon" width="30" className="logoIcon" />
             </div>
             <div>
               <h1 className="text-xl font-bold font-serif text-wood-900">Label Automator</h1>
               <p className="text-xs text-gray-500">Wood Dekor Internal Tools</p>
             </div>
          </div>
          
          {products.length > 0 && (
            <div className="flex items-center gap-3">
              {isGenerating ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">
                    AI Generating... {progress.current}/{progress.total}
                  </span>
                </div>
              ) : (
                <button 
                  onClick={handleAIAutoFill}
                  className="flex items-center px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-md transition-colors"
                  title="Auto-fill missing details using AI based on product name"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Auto-Fill Details
                </button>
              )}
              
              <button 
                onClick={handleReset}
                disabled={isGenerating}
                className="flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Reset
              </button>
              <button 
                onClick={handlePrint}
                disabled={isGenerating}
                className="flex items-center px-6 py-2 text-sm font-medium text-white bg-wood-900 hover:bg-wood-800 rounded-md shadow-md transition-colors disabled:opacity-50"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Labels ({products.length})
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
             <div className="text-center mb-8">
               <h2 className="text-3xl font-serif font-bold text-gray-900 mb-3">Bulk Label Generator</h2>
               <p className="text-gray-600 max-w-lg mx-auto mb-6">
                 Upload your inventory Excel sheet. <br/>
                 <span className="text-sm text-purple-600 font-semibold bg-purple-50 px-2 py-1 rounded mt-2 inline-block">
                   <Sparkles className="w-3 h-3 inline mr-1"/>
                   Supports AI Auto-Fill if only Product Names are provided!
                 </span>
               </p>
             </div>
             <div className="w-full">
               <UploadArea onDataLoaded={setProducts} />
             </div>
          </div>
        ) : (
          <div>
            {/* Toolbar - No Print */}
            <div className="flex justify-between items-center mb-6 no-print">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Generated <strong>{products.length}</strong> labels.</span>
              </div>
              <div className="flex bg-white rounded-lg shadow-sm p-1 border border-gray-200">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 ${viewMode === 'grid' ? 'bg-wood-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <LayoutGrid className="w-4 h-4" /> Grid View
                </button>
              </div>
            </div>

            {/* Print Area */}
            <div className={`
              ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'flex flex-col items-center gap-8'} 
              print:block print:w-full
            `}>
              {products.map((product) => (
                <div key={product.id} className="print:inline-block print:mx-4 print:my-4 print:align-top">
                  <Label product={product} />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer - No Print */}
      <footer className="no-print mt-12 py-6 border-t border-gray-200 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Wood Dekor. Internal System.</p>
      </footer>

    </div>
  );
};

export default App;