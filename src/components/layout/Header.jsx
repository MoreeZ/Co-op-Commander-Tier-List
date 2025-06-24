import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background-color: #121212;
  padding: 1rem 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
`;

const Logo = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  color: #00BFFF;
  text-shadow: 0 0 10px rgba(0, 191, 255, 0.5);
  
  span {
    color: #FF4500;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
`;

const NavLink = styled(Link)`
  color: ${props => props.active ? '#00BFFF' : '#ccc'};
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    color: #00BFFF;
    background-color: rgba(0, 191, 255, 0.1);
  }
`;

const Header = () => {
  const location = useLocation();
  
  return (
    <HeaderContainer role="banner">
      <Nav>
        <Logo>
          <Link to="/" aria-label="Home page">
            <h1 style={{ fontSize: 'inherit', margin: 0 }}>SC2 <span>Co-op</span> Tier List</h1>
          </Link>
        </Logo>
        <NavLinks role="navigation" aria-label="Main navigation">
          <NavLink to="/" active={location.pathname === '/' ? 1 : 0} aria-current={location.pathname === '/' ? 'page' : undefined}>
            Tier List
          </NavLink>
          <NavLink to="/contribute" active={location.pathname === '/contribute' ? 1 : 0} aria-current={location.pathname === '/contribute' ? 'page' : undefined}>
            Contribute
          </NavLink>
        </NavLinks>
      </Nav>
    </HeaderContainer>
  );
};

export default Header;
