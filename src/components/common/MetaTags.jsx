import React from 'react';

/**
 * Component for adding schema.org structured data to the page
 * @param {Object} props - Component props
 * @param {Object} props.data - Structured data object
 */
const MetaTags = ({ data }) => {
  // Convert the data object to a JSON string
  const structuredDataString = JSON.stringify(data);
  
  return (
    <script 
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: structuredDataString }}
    />
  );
};

export default MetaTags;
