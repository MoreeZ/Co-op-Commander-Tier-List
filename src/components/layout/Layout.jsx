import React from 'react';
import styled from 'styled-components';
import Header from './Header';
import Footer from './Footer';
import MetaTags from '../common/MetaTags';
import { generateWebsiteData } from '../../utils/structuredData';

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #1a1a1a;
  color: #f0f0f0;
  width: 100%;
  flex: 1;
`;

const Main = styled.main`
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const Layout = ({ children }) => {
  // Generate website structured data for SEO
  const websiteData = generateWebsiteData();
  
  return (
    <LayoutContainer>
      <MetaTags data={websiteData} />
      <Header />
      <Main>{children}</Main>
      <Footer />
    </LayoutContainer>
  );
};

export default Layout;
