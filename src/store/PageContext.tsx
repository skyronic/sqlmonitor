import React, { createContext, useContext, useState } from 'react';

type CollectionPage = {
  type: 'collection';
  collectionId: string;
};

type ConnectionsPage = {
  type: 'connections';
};

type PageState = CollectionPage | ConnectionsPage;

interface PageContextType {
  currentPage: PageState;
  setPage: (page: PageState) => void;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export const PageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<PageState>({ type: 'connections' });

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

export default PageContext;
