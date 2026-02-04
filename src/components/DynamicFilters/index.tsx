import { useState, useMemo } from "react";
import type { Filter } from "../../setting/Types";

interface DynamicFiltersProps {
  filters: Filter[];
  selectedOptions: number[];
  onFilterChange: (optionIds: number[]) => void;
}

// Üslub option-larını tərcümə et
const translateStyleOption = (title: string): string => {
  const translations: Record<string, string> = {
    // Əsas üslublar
    'Standard': 'Standart',
    'Suit': 'Kostyum',
    'Set': 'Dəst',
    'Top': 'Üst geyim',
    'Dress': 'Paltar',
    'Pants': 'Şalvar',
    'Blazer': 'Pencək',
    'Nightgown': 'Gecə köynəyi',
    'Robe': 'Xalat',
    
    // Material/Texture
    'Fleece lined': 'Fleece astarlı',
    'Fleece Lined Style': 'Fleece astarlı stil',
    'No Velvet': 'Velvetsiz',
    'Velvet': 'Velvet',
    'Regular Style': 'Adi stil',
    'Knitted Dense Plaid Shawl': 'Toxunmuş qalın şal',
    
    // Seasons
    'Four Seasons': 'Dörd fəsil',
    'Summer Mesh Hat Style': 'Yay mesh stil',
    
    // Patterns
    'Leopard Print': 'Bəbir naxışlı',
    'Cream tiger pattern': 'Krem pələng naxışı',
    'Amber tiger pattern': 'Kəhrəba pələng naxışı',
    'Sandalwood leopard print': 'Səndəl ağacı bəbir naxışı',
    'Shoulder Flower': 'Çiyin çiçəyi',
    'Line Flower': 'Xətt çiçəyi',
    'Totem': 'Totem',
    
    // Accessories
    'Slip Dress Thong Belt': 'Kəmərli kombi',
    'Slip Dress Thong Belt Robe': 'Xalatlı kəmərli kombi',
    
    // Age/Type
    'Adult': 'Böyüklər üçün',
    
    // Zodiac
    'Aries': 'Qoç',
    'TAURUS': 'Buğa',
    'GEMINI': 'Əkizlər',
    'CANCER': 'Xərçəng',
    'LEO': 'Şir',
    'VIRGO': 'Qız',
    'LIBRA': 'Tərəzi',
    'SCORPIO': 'Əqrəb',
    'SAGITTARIUS': 'Oxatan',
    'CAPRICORN': 'Oğlaq',
    'AQUARIUS': 'Dolça',
    'Pisces': 'Balıqlar',
    
    // Style numbers - məntiqli adlar
    'Style1': 'Stil 1',
    'Style2': 'Stil 2',
    'Style3': 'Stil 3',
    'Style4': 'Stil 4',
    'Style5': 'Stil 5',
    'Style 35': 'Stil 35',
    '1style': 'Stil 1',
    '2style': 'Stil 2',
    '3style': 'Stil 3',
    '4style': 'Stil 4',
    '5style': 'Stil 5',
    '6style': 'Stil 6',
    '1 Style': 'Stil 1',
    '2 Style': 'Stil 2',
    '3 Style': 'Stil 3',
    '4 Style': 'Stil 4',
    '5 Style': 'Stil 5',
  };
  
  // Əgər tərcümə varsa, onu qaytar
  if (translations[title]) {
    return translations[title];
  }
  
  // Product code-larını olduğu kimi saxla (məs: R9988, ZJHYZL01, WTJK01...)
  if (/^[A-Z0-9]+$/.test(title.replace(/\s/g, ''))) {
    return title;
  }
  
  // Ölçü kodlarını saxla (L, M, S, XL, XXL)
  if (/^(XS|S|M|L|XL|XXL|XXXL)$/i.test(title)) {
    return title;
  }
  
  // Digər hallarda orijinalı qaytar
  return title;
};

// Ölçü option-larını sadələşdir və qruplaşdır
const simplifySizeOptions = (options: any[]): any[] => {
  if (!options || options.length === 0) return options;

  // Standart ölçü kateqoriyaları
  const sizeGroups: Record<string, { ids: Set<number>, keywords: string[] }> = {
    'XS': { ids: new Set(), keywords: ['xs', 'extra small', 'xəsməz kiçik'] },
    'S': { ids: new Set(), keywords: ['\\bs\\b', 'small', 'kiçik', '\\s+s\\s+', '^s$'] },
    'M': { ids: new Set(), keywords: ['\\bm\\b', 'medium', 'orta', '\\s+m\\s+', '^m$'] },
    'L': { ids: new Set(), keywords: ['\\bl\\b', 'large', 'böyük', '\\s+l\\s+', '^l$'] },
    'XL': { ids: new Set(), keywords: ['xl', 'extra large', 'xəsməz böyük'] },
    'XXL': { ids: new Set(), keywords: ['xxl', '2xl', '2 xl', 'double extra'] },
    'XXXL': { ids: new Set(), keywords: ['xxxl', '3xl', '3 xl', 'triple extra'] },
    'One Size': { ids: new Set(), keywords: ['one size', 'free size', 'tek ölçü', 'azad ölçü', 'universal'] },
  };

  // Hər option-u uyğun ölçü qrupuna əlavə et
  options.forEach(option => {
    const title = option.title.toLowerCase().trim();
    let matched = false;

    // Sırayla təklik ölçüləri yoxla (XS, S, M, L, XL əvvəl)
    if (/^xs$/i.test(title) || title === 'xs') {
      sizeGroups['XS'].ids.add(option.id);
      matched = true;
    } else if (/^s$/i.test(title) || title === 's') {
      sizeGroups['S'].ids.add(option.id);
      matched = true;
    } else if (/^m$/i.test(title) || title === 'm') {
      sizeGroups['M'].ids.add(option.id);
      matched = true;
    } else if (/^l$/i.test(title) || title === 'l') {
      sizeGroups['L'].ids.add(option.id);
      matched = true;
    } else if (/^xl$|x-l/i.test(title)) {
      sizeGroups['XL'].ids.add(option.id);
      matched = true;
    } else if (/^xxl|2xl|2\s*xl|xx-l/i.test(title)) {
      sizeGroups['XXL'].ids.add(option.id);
      matched = true;
    } else if (/^xxxl|3xl|3\s*xl|xxx-l/i.test(title)) {
      sizeGroups['XXXL'].ids.add(option.id);
      matched = true;
    } else if (/one\s*size|free\s*size|tek\s*ölçü|azad\s*ölçü|universal/i.test(title)) {
      sizeGroups['One Size'].ids.add(option.id);
      matched = true;
    }

    // Rəqəm əsasında ölçü sınıflandırması (məsələn: "42", "43" → ölçü kodu)
    if (!matched && /^\d+$/.test(title)) {
      const num = parseInt(title);
      if (num <= 32) sizeGroups['XS'].ids.add(option.id);
      else if (num <= 34) sizeGroups['S'].ids.add(option.id);
      else if (num <= 36) sizeGroups['M'].ids.add(option.id);
      else if (num <= 38) sizeGroups['L'].ids.add(option.id);
      else if (num <= 40) sizeGroups['XL'].ids.add(option.id);
      else if (num <= 42) sizeGroups['XXL'].ids.add(option.id);
      else sizeGroups['XXXL'].ids.add(option.id);
      matched = true;
    }
  });

  // Sadələşdirilmiş option-ları yarat
  const simplifiedOptions: any[] = [];
  const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'One Size'];
  
  sizeOrder.forEach(sizeName => {
    const group = sizeGroups[sizeName];
    if (group.ids.size > 0) {
      const firstId = Array.from(group.ids)[0];
      simplifiedOptions.push({
        id: firstId,
        title: sizeName,
        _originalIds: Array.from(group.ids),
      });
    }
  });

  return simplifiedOptions;
};

// Rəng option-larını sadələşdir və qruplaşdır
const simplifyColorOptions = (options: any[]): any[] => {
  if (!options || options.length === 0) return options;

  // Əsas rəng kateqoriyaları
  const colorGroups: Record<string, { ids: Set<number>, colorCode: string | null, keywords: string[] }> = {
    'Qara': { ids: new Set(), colorCode: '#000000', keywords: ['black', 'qara', 'dark', 'qaranlıq'] },
    'Ağ': { ids: new Set(), colorCode: '#FFFFFF', keywords: ['white', 'ağ', 'milk', 'süd', 'cream'] },
    'Boz': { ids: new Set(), colorCode: '#808080', keywords: ['gray', 'grey', 'boz', 'silver', 'gümüş'] },
    'Qırmızı': { ids: new Set(), colorCode: '#FF0000', keywords: ['red', 'qırmızı', 'crimson', 'burgundy', 'bordo'] },
    'Narıncı': { ids: new Set(), colorCode: '#FFA500', keywords: ['orange', 'narıncı', 'coral', 'persik'] },
    'Sarı': { ids: new Set(), colorCode: '#FFFF00', keywords: ['yellow', 'sarı', 'gold', 'qızıl'] },
    'Yaşıl': { ids: new Set(), colorCode: '#00FF00', keywords: ['green', 'yaşıl', 'mint', 'olive'] },
    'Göy': { ids: new Set(), colorCode: '#0000FF', keywords: ['blue', 'göy', 'navy', 'denim', 'azure'] },
    'Bənövşəyi': { ids: new Set(), colorCode: '#800080', keywords: ['purple', 'violet', 'bənövşəyi', 'lavanda'] },
    'Çəhrayı': { ids: new Set(), colorCode: '#FFC0CB', keywords: ['pink', 'çəhrayı', 'rose', 'gül'] },
    'Qəhvəyi': { ids: new Set(), colorCode: '#8B4513', keywords: ['brown', 'qəhvəyi', 'coffee', 'kofe', 'bej', 'beige', 'camel'] },
  };

  // Hər option-u uyğun rəng qrupuna əlavə et
  options.forEach(option => {
    const title = option.title.toLowerCase();
    let matched = false;

    for (const [, group] of Object.entries(colorGroups)) {
      if (group.keywords.some(keyword => title.includes(keyword))) {
        group.ids.add(option.id);
        if (!group.colorCode && option.color_code) {
          group.colorCode = option.color_code;
        }
        matched = true;
        break;
      }
    }

    // Əgər heç bir qrupa uyğun gəlmirsə və çox spesifik kod deyilsə
    if (!matched && !/^[A-Z0-9]{6,}$/.test(option.title) && options.length > 50) {
      // Çox spesifik rəngləri filtrləyək
    }
  });

  // Sadələşdirilmiş option-ları yarat
  const simplifiedOptions: any[] = [];
  
  Object.entries(colorGroups).forEach(([groupName, group]) => {
    if (group.ids.size > 0) {
      const firstId = Array.from(group.ids)[0];
      simplifiedOptions.push({
        id: firstId,
        title: groupName,
        color_code: group.colorCode,
        _originalIds: Array.from(group.ids),
      });
    }
  });

  return simplifiedOptions;
};

// Üslub option-larını qruplaşdır və sadələşdir
const simplifyStyleOptions = (options: any[]): any[] => {
  // Üslub filtri deyilsə, heç nə etmə
  if (!options || options.length === 0) return options;

  // Əsas kateqoriyalar
  const mainCategories: Record<string, Set<number>> = {
    'Standart': new Set(),
    'Kostyum': new Set(),
    'Dəst': new Set(),
    'Paltar': new Set(),
    'Şalvar': new Set(),
    'Üst geyim': new Set(),
    'Digər': new Set(),
  };

  // Hər option-u müvafiq kateqoriyaya əlavə et
  options.forEach(option => {
    const title = option.title.toLowerCase();
    
    // Standart və sadə üslublar
    if (title.includes('standard') || title.includes('standart') || 
        title.includes('regular') || title.includes('adi') ||
        title.includes('style1') || title.includes('1style') || 
        title === 'style 1' || /^stil\s*[1-3]$/i.test(translateStyleOption(option.title))) {
      mainCategories['Standart'].add(option.id);
    }
    // Kostyumlar
    else if (title.includes('suit') || title.includes('kostyum') || 
             title.includes('set') || title.includes('dəst') ||
             title.includes('two piece') || title.includes('three piece')) {
      mainCategories['Kostyum'].add(option.id);
    }
    // Paltarlar
    else if (title.includes('dress') || title.includes('paltar') ||
             title.includes('gown') || title.includes('slip dress')) {
      mainCategories['Paltar'].add(option.id);
    }
    // Şalvarlar
    else if (title.includes('pants') || title.includes('şalvar') ||
             title.includes('trousers') || title.includes('jeans')) {
      mainCategories['Şalvar'].add(option.id);
    }
    // Üst geyim
    else if (title.includes('top') || title.includes('shirt') || 
             title.includes('blouse') || title.includes('blazer') ||
             title.includes('jacket') || title.includes('coat') ||
             title.includes('pencək') || title.includes('üst')) {
      mainCategories['Üst geyim'].add(option.id);
    }
    // Digər spesifik stil kodları və pattern-lər
    else if (/^[A-Z0-9]{4,}$/i.test(option.title) || // Product codes
             /style\s*\d+/i.test(option.title) ||
             /\d+style/i.test(option.title) ||
             title.includes('pattern') || title.includes('print')) {
      // Product code və çox spesifik stil kodlarını "Digər"ə əlavə et, amma limitlə
      if (mainCategories['Digər'].size < 10) {
        mainCategories['Digər'].add(option.id);
      }
    }
    // Qalan hər şey
    else {
      mainCategories['Digər'].add(option.id);
    }
  });

  // Kateqoriya üçün yeni "virtual" option-lar yarat
  const simplifiedOptions: any[] = [];

  Object.entries(mainCategories).forEach(([categoryName, optionIds]) => {
    if (optionIds.size > 0) {
      // İlk option-u götür və onun strukturunu istifadə et
      const firstOptionId = Array.from(optionIds)[0];
      const firstOption = options.find(opt => opt.id === firstOptionId);
      
      if (firstOption) {
        simplifiedOptions.push({
          id: firstOptionId, // Orijinal ID-ni saxla
          title: categoryName,
          color_code: firstOption.color_code || null,
          _originalIds: Array.from(optionIds), // Backend-ə göndərmək üçün saxla
        });
      }
    }
  });

  return simplifiedOptions;
};

// Bütün cinslər option-larını əlavə et
const ensureAllGenderOptions = (options: any[]): any[] => {
  // Bütün mövcud cinslər (hər kateqoriyada bütün cinslər olmalıdır)
  const allGenderOptions = [
    { id: 215, title: 'Kişi', color_code: 'Man' },
    { id: 216, title: 'Qadın', color_code: 'Woman' },
    { id: 217, title: 'Uşaq', color_code: 'Child' },
    { id: 274, title: 'UNISEX', color_code: '1' },
  ];

  // Mövcud option ID-lərini yoxla
  const existingIds = new Set(options.map(opt => opt.id));

  // Eksik option-ları əlavə et
  const missingOptions = allGenderOptions.filter(
    genderOpt => !existingIds.has(genderOpt.id)
  );

  return [...options, ...missingOptions];
};

export default function DynamicFilters({
  filters,
  selectedOptions,
  onFilterChange,
}: DynamicFiltersProps) {
  // Yalnız sadələşdirmə - parent tərəfdən artıq qruplandırılıb
  const processedFilters = useMemo(() => {
    return filters.map((filter) => {
      let processedOptions = filter.options;

      // Əgər Cinsi (Gender) filtri (id:5) isə, bütün seçimləri əlavə et
      if (filter.id === 5 || filter.title.toLowerCase().includes('cinsi') || 
          filter.title.toLowerCase().includes('gender')) {
        processedOptions = ensureAllGenderOptions(processedOptions);
      }
      // Əgər Üslub filtri (id:8) isə, sadələşdir
      else if (filter.id === 8 || filter.title.toLowerCase().includes('üslub') || 
          filter.title.toLowerCase().includes('style')) {
        processedOptions = simplifyStyleOptions(processedOptions);
      }
      // Əgər Ölçü filtri (id:1) isə, sadələşdir
      else if (filter.id === 1 || filter.title.toLowerCase().includes('ölçü') || 
               filter.title.toLowerCase().includes('size')) {
        processedOptions = simplifySizeOptions(processedOptions);
      }
      // Əgər Rəng filtri (id:2) isə, sadələşdir
      else if (filter.id === 2 || filter.title.toLowerCase().includes('rəng') || 
               filter.title.toLowerCase().includes('color')) {
        // Yalnız çox sayda option varsa qruplaşdır
        if (processedOptions.length > 30) {
          processedOptions = simplifyColorOptions(processedOptions);
        }
      }
      
      return {
        id: filter.id,
        title: filter.title,
        options: processedOptions as any[]
      };
    });
  }, [filters]);

  const [expandedFilters, setExpandedFilters] = useState<Set<number>>(
    new Set([processedFilters[0]?.id])
  );

  const toggleFilter = (filterId: number) => {
    const newExpanded = new Set(expandedFilters);
    if (newExpanded.has(filterId)) {
      newExpanded.delete(filterId);
    } else {
      newExpanded.add(filterId);
    }
    setExpandedFilters(newExpanded);
  };

  const handleOptionChange = (optionId: number, checked: boolean) => {
    let newOptions = [...selectedOptions];
    if (checked) {
      newOptions.push(optionId);
    } else {
      newOptions = newOptions.filter((id) => id !== optionId);
    }
    onFilterChange(newOptions);
  };

  if (!processedFilters || processedFilters.length === 0) {
    return <div className="p-4 text-gray-500">Filtrlər mövcud deyil</div>;
  }

  return (
    <div className="space-y-4">
      {processedFilters.map((filter) => (
        <div key={filter.id} className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Filter Header */}
          <button
            onClick={() => toggleFilter(filter.id)}
            className="w-full px-4 py-3 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition"
          >
            <span className="font-medium text-gray-800">{filter.title}</span>
            <svg
              className={`w-5 h-5 transition-transform ${
                expandedFilters.has(filter.id) ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>

          {/* Filter Options */}
          {expandedFilters.has(filter.id) && (
            <div className="px-4 py-3 space-y-2 bg-white border-t border-gray-200">
              {filter.options.map((option) => {
                // Üslub filtri üçün tərcümə et
                const displayTitle = filter.id === 8 || filter.title.toLowerCase().includes('style') || filter.title.toLowerCase().includes('üslub')
                  ? translateStyleOption(option.title)
                  : option.title;
                
                return (
                  <label
                    key={option.id}
                    className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition"
                  >
                    <input
                      type="checkbox"
                      checked={selectedOptions.includes(option.id)}
                      onChange={(e) => handleOptionChange(option.id, e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                    />
                    <span className="ml-3 text-gray-700">{displayTitle}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
