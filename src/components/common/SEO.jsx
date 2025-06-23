import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { updateSEO, createDefaultStructuredData } from '../../utils/seo';

/**
 * SEO component for managing document head metadata
 * @param {Object} props - Component props
 * @param {string} props.title - Page title
 * @param {string} props.description - Page description
 * @param {Object} props.structuredData - Structured data for the page (JSON-LD)
 */
const SEO = ({ 
  title, 
  description, 
  structuredData = createDefaultStructuredData()
}) => {
  const location = useLocation();
  const baseUrl = 'https://coop.starcraftier.com';
  const canonicalUrl = `${baseUrl}${location.pathname}`;
  
  useEffect(() => {
    updateSEO({
      title,
      description,
      canonicalUrl,
      structuredData
    });
  }, [title, description, canonicalUrl, structuredData]);
  
  return null; // This component doesn't render anything
};

export default SEO;
