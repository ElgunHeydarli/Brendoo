import React, { useState } from 'react';
import { TranslationsKeys } from '../../setting/Types';
import GETRequest from '../../setting/Request';
import { useParams } from 'react-router-dom';

const SearchableSelect = ({
  regionData,
  onChange,
  value,
}: {
  regionData: any;
  onChange: any;
  value?: any;
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [, setSelectedRegion] = useState<any>(null);

  const filteredRegions = regionData.filter((district: any) =>
    district.regionName.toLowerCase().includes(searchTerm?.toLowerCase()),
  );

  const handleSelect = (region: any) => {
    setSelectedRegion(region);
    onChange(region.regionId);
    setSearchTerm(region.regionName);
    setShowDropdown(false);
  };

  const { lang = 'az' } = useParams<{ lang: string }>();

  const { data: translation } = GETRequest<TranslationsKeys>(
    `/translates`,
    'translates',
    [lang],
  );

  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const outsideClickDropdown = (e: MouseEvent) => {
    if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
      setShowDropdown(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener('mousedown', outsideClickDropdown);
    return () => document.removeEventListener('mousedown', outsideClickDropdown);
  }, []);

  React.useEffect(() => {
    if (value && regionData.length > 0) {
      const selected = regionData.find(
        (r: any) => r.regionId === value || r.id === value,
      );
      if (selected) {
        setSearchTerm(selected.regionName);
      } else {
        setSearchTerm('');
      }
    } else {
      setSearchTerm('');
    }
  }, [value, regionData]);

  return (
    <div ref={wrapperRef} className="relative w-full mt-3">
      <input
        type="text"
        className="w-full px-5 py-3 border border-black border-opacity-10 rounded-[200px]"
        placeholder={translation?.rayon_viberite ?? ''}
        value={searchTerm}
        onChange={e => {
          setSearchTerm(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
      />

      {showDropdown && (
        <ul className="absolute z-10 w-full bg-white border border-gray-200 max-h-60 overflow-auto rounded-lg mt-1 shadow">
          {filteredRegions.length > 0 ? (
            filteredRegions.map((region: any) => (
              <li
                key={region.regionId}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelect(region)}
              >
                {region.regionName}
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-gray-500">
              {translation?.nothing_found ||
                translation?.nothingFound ||
                (lang === 'en' ? 'Nothing found' : 'Heç nə tapılmadı')}
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default SearchableSelect;
