import React from 'react';
import BaseLayout from '@/components/layout/BaseLayout';
import SpatialSearch from '@/components/search/SpatialSearch';

const SpatialSearchPage: React.FC = () => {
  return (
    <BaseLayout>
      <SpatialSearch />
    </BaseLayout>
  );
};

export default SpatialSearchPage;