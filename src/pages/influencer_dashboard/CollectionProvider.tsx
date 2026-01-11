import { createContext, useContext, useState } from 'react';

const CollectionContext = createContext<any>(null);

export const CollectionProvider = ({ children }: any) => {
  const [collections, setCollections] = useState([]);

  // API çağırışı silindi - istifadə olunmur

  return (
    <CollectionContext.Provider value={{ collections, setCollections }}>
      {children}
    </CollectionContext.Provider>
  );
};

export const useCollections = () => useContext(CollectionContext);