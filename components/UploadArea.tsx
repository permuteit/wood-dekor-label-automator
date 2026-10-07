import React, { useCallback } from 'react';
import { Upload, FileSpreadsheet, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { ProductData, REQUIRED_COLUMNS } from '../types';

interface UploadAreaProps {
  onDataLoaded: (data: ProductData[]) => void;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onDataLoaded }) => {
  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (data) {
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        
        // Map to our internal structure
        const mappedData: ProductData[] = jsonData.map((row: any, index: number) => ({
          id: `row-${index}`,
          product_name: row['product_name'] || row['Product Name'] || 'Unknown Product',
          sku: row['sku'] || row['SKU'] || 'N/A',
          category: row['category'] || row['Category'] || 'General',
          wood: row['wood'] || row['Wood'] || 'N/A',
          size: row['size'] || row['Size'] || 'Standard',
          retail_price: Number(row['retail_price'] || row['Retail Price'] || 0),
          our_price: Number(row['our_price'] || row['Our Price'] || 0),
          gst_percentage: Number(row['gst_percentage'] || row['GST'] || 18),
        }));

        onDataLoaded(mappedData);
      }
    };
    reader.readAsBinaryString(file);
  }, [onDataLoaded]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      {
        product_name: "Example King Bed",
        sku: "BD-KNG-001",
        category: "Beds",
        wood: "Sheesham",
        size: "78x72 Inch",
        retail_price: 65000,
        our_price: 45000,
        gst_percentage: 18
      }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "WoodDekor_Label_Template.xlsx");
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
      <div 
        className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-wood-800 transition-colors cursor-pointer bg-gray-50"
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        <input 
          type="file" 
          id="fileInput" 
          className="hidden" 
          accept=".xlsx, .xls, .csv" 
          onChange={onInputChange}
        />
        <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-serif font-bold text-gray-800 mb-2">Upload Inventory Sheet</h3>
        <p className="text-gray-500 mb-6">Drag and drop your Excel file here, or click to browse</p>
        <div className="flex justify-center gap-2">
           <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
             <FileSpreadsheet className="w-3 h-3 mr-1" /> .xlsx supported
           </span>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <button 
          onClick={downloadTemplate}
          className="flex items-center text-sm text-wood-900 hover:underline"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Excel Template
        </button>
      </div>
    </div>
  );
};