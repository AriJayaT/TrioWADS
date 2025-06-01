import React from 'react';
import CustomerHeader from '../../common/CustomerHeader';
import CustomerFooter from '../../common/CustomerFooter';
import HelpCenter from './HelpCenter';

const StandaloneHelpCenter = () => {
  return (
    <div className="flex flex-col min-h-screen bg-pink-50">
      {/* Header */}
      <CustomerHeader />

      {/* Main Content */}
      <div className="container mx-auto py-8 px-4 flex-grow">
        <HelpCenter layout="default" />
      </div>

      {/* Footer */}
      <CustomerFooter />
    </div>
  );
};

export default StandaloneHelpCenter; 