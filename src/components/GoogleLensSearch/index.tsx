import { useState, useRef, useCallback } from 'react';
import { FiCamera, FiX, FiUpload, FiSearch } from 'react-icons/fi';
import axios from 'axios';
import ProductCard from '../ProductCArd';
import { Product } from '../../setting/Types';

const API_URL = 'https://admin.brendoo.com';

interface LensLabel {
  name: string;
  score: number;
  type: string;
}

interface GoogleLensSearchProps {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
}

export default function GoogleLensSearch({ isOpen, onClose, lang }: GoogleLensSearchProps) {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [labels, setLabels] = useState<LensLabel[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const resetSearch = useCallback(() => {
    setImage(null);
    setLabels([]);
    setProducts([]);
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    resetSearch();
    onClose();
  }, [onClose, resetSearch]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('Fayl 10MB-dan böyük olmamalıdır');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImage(base64);
      searchByImage(base64);
    };
    reader.readAsDataURL(file);
  }, []);

  const searchByImage = async (base64Image: string) => {
    setLoading(true);
    setError(null);
    setLabels([]);
    setProducts([]);

    try {
      const response = await axios.post(
        `${API_URL}/api/vision-search`,
        { image: base64Image },
        { headers: { 'Accept-Language': lang } }
      );

      if (response.data.success) {
        setLabels(response.data.labels || []);
        setProducts(response.data.products || []);
        
        if (response.data.products?.length === 0) {
          setError('Oxşar məhsul tapılmadı');
        }
      } else {
        setError(response.data.message || 'Axtarış uğursuz oldu');
      }
    } catch (err: any) {
      console.error('Vision search error:', err);
      setError(err.response?.data?.message || 'Xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <FiCamera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Şəkil ilə Axtarış</h2>
              <p className="text-sm text-white/70">Google Lens</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition"
          >
            <FiX className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {!image ? (
            /* Upload Section */
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
                <FiCamera className="w-16 h-16 text-blue-600" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Məhsul şəklini yükləyin
              </h3>
              <p className="text-gray-500 text-center mb-8 max-w-md">
                Axtarmaq istədiyiniz məhsulun şəklini yükləyin və biz oxşar məhsulları tapaq
              </p>

              <div className="flex gap-4">
                {/* Upload Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg"
                >
                  <FiUpload className="w-5 h-5" />
                  <span>Şəkil Yüklə</span>
                </button>

                {/* Camera Button */}
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center gap-3 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition shadow-lg"
                >
                  <FiCamera className="w-5 h-5" />
                  <span>Kamera</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />

              <p className="text-xs text-gray-400 mt-6">
                Dəstəklənən formatlar: JPG, PNG, WebP (Max: 10MB)
              </p>
            </div>
          ) : (
            /* Results Section */
            <div>
              {/* Image Preview & Labels */}
              <div className="flex flex-col md:flex-row gap-6 mb-8">
                {/* Image */}
                <div className="md:w-1/3">
                  <div className="relative">
                    <img
                      src={image}
                      alt="Yüklənən şəkil"
                      className="w-full aspect-square object-cover rounded-xl shadow-lg"
                    />
                    <button
                      onClick={resetSearch}
                      className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition"
                    >
                      <FiX className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>

                {/* Labels */}
                <div className="md:w-2/3">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Aşkar edilən obyektlər:</h4>
                  
                  {loading ? (
                    <div className="flex items-center gap-3 text-blue-600">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span>Analiz edilir...</span>
                    </div>
                  ) : labels.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {labels.map((label, idx) => (
                        <span
                          key={idx}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                            label.type === 'web'
                              ? 'bg-purple-100 text-purple-700'
                              : label.type === 'object'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {label.name}
                          <span className="ml-1 text-xs opacity-70">{label.score}%</span>
                        </span>
                      ))}
                    </div>
                  ) : error ? (
                    <p className="text-red-500">{error}</p>
                  ) : null}
                </div>
              </div>

              {/* Products */}
              {!loading && products.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <FiSearch className="w-5 h-5 text-gray-400" />
                    <h4 className="text-lg font-semibold text-gray-800">
                      Oxşar məhsullar ({products.length})
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {products.map((product) => (
                      <div key={product.id} onClick={handleClose}>
                        <ProductCard data={product} bg="white" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {!loading && products.length === 0 && labels.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Bu şəklə uyğun məhsul tapılmadı</p>
                  <button
                    onClick={resetSearch}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                  >
                    Yeni şəkil yüklə
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}