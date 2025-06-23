import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';
import MetaTags from '../components/common/MetaTags';

const NotFoundContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: #00BFFF;
  text-shadow: 0 0 10px rgba(0, 191, 255, 0.3);
`;

const Description = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: #ccc;
  line-height: 1.6;
`;

const StyledLink = styled(Link)`
  display: inline-block;
  background-color: #00BFFF;
  color: #000;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #0099cc;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
`;

const NotFoundPage = () => {
  // Create custom structured data for 404 page
  const notFoundStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Page Not Found",
    "description": "The page you're looking for doesn't exist. Return to the StarCraft 2 Co-op Commander Tier List.",
    "url": "https://coop.starcraftier.com/404",
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://coop.starcraftier.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Page Not Found"
        }
      ]
    }
  };

  return (
    <NotFoundContainer>
      <MetaTags data={notFoundStructuredData} />
      <SEO 
        title="Page Not Found" 
        description="The page you're looking for doesn't exist. Return to the StarCraft 2 Co-op Commander Tier List."
      />
      <Title>404 - Page Not Found</Title>
      <Description>
        The page you're looking for doesn't exist or has been moved.
        Please return to the main tier list page.
      </Description>
      <StyledLink to="/">Return to Tier List</StyledLink>
    </NotFoundContainer>
  );
};

export default NotFoundPage;
