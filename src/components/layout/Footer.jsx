import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background-color: #121212;
  padding: 1.5rem;
  margin-top: 3rem;
  text-align: center;
  color: #888;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Copyright = styled.p`
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const Disclaimer = styled.p`
  font-size: 0.8rem;
  color: #666;
`;

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <FooterContainer role="contentinfo">
      <FooterContent>
        <Copyright>© {currentYear} <a href="https://coop.starcraftier.com" style={{ color: '#888', textDecoration: 'none' }}>SC2 Co-op Tier List</a></Copyright>
        <Disclaimer>
          StarCraft II and all related characters, locations, and imagery are property of Blizzard Entertainment.
          This is a fan-made project and is not affiliated with or endorsed by Blizzard Entertainment.
        </Disclaimer>
        <div style={{ marginTop: '1rem', fontSize: '0.8rem' }}>
          <a href="https://coop.starcraftier.com" style={{ color: '#888', marginRight: '1rem' }}>Home</a>
          <a href="https://coop.starcraftier.com/contribute" style={{ color: '#888', marginRight: '1rem' }}>Create Tier List</a>
          <a href="https://coop.starcraftier.com/sitemap.xml" style={{ color: '#888' }}>Sitemap</a>
        </div>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;
