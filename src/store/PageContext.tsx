import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useListCategories } from './backend';

type CategoryPage = {
  type: 'category';
  categoryId: string;
};

type ConnectionsPage = {
  type: 'connections';
};

type PageState = CategoryPage | ConnectionsPage;

interface PageContextType {
  currentPage: PageState;
  setPage: (page: PageState) => void;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export const PageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<PageState>({ type: 'connections' });
  const { data: categories = [] } = useListCategories();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (categories.length > 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      setCurrentPage({ type: 'category', categoryId: categories[0].id.toString() });
    }
  }, [categories]);

  const setPage = (page: PageState) => {
    setCurrentPage(page);
  };

  return (
    <PageContext.Provider value={{ currentPage, setPage }}>
      {children}
    </PageContext.Provider>
  );
};

export const usePage = () => {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error('usePage must be used within a PageProvider');
  }
  return context;
};

