import React, { createContext, useContext, useState, useMemo } from 'react';

type CollectionModalContextType = {
  createCollectionModal: boolean;
  addProductCollection: boolean;
  productId: number | null;
  setCreateCollectionModal: (open: boolean) => void;
  setAddProductCollection: (open: boolean) => void;
  setProductId: (v: number | null) => void;
};

const CollectionModalContext = createContext<CollectionModalContextType | null>(null);

export const CollectionModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [createCollectionModal, setCreateCollectionModal] = useState<boolean>(false);
  const [addProductCollection, setAddProductCollection] = useState<boolean>(false);
  const [productId, setProductId] = useState<number | null>(null);

  // useMemo ile re-render azaldılır
  const value = useMemo(
    () => ({
      createCollectionModal,
      setCreateCollectionModal,
      addProductCollection,
      setAddProductCollection,
      productId,
      setProductId,
    }),
    [createCollectionModal, addProductCollection, productId]
  );

  return (
    <CollectionModalContext.Provider value={value}>
      {children}
    </CollectionModalContext.Provider>
  );
};

export const useCollectionModal = () => {
  const context = useContext(CollectionModalContext);
  if (!context) {
    throw new Error('useCollectionModal must be used within a CollectionModalProvider');
  }
  return context;
};
