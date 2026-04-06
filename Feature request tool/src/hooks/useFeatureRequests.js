import { useContext } from 'react';
import { FeatureRequestContext } from '../contexts/FeatureRequestContext';

const useFeatureRequests = () => {
  const context = useContext(FeatureRequestContext);
  
  if (!context) {
    throw new Error('useFeatureRequests must be used within a FeatureRequestProvider');
  }
  
  return context;
};

export default useFeatureRequests;
