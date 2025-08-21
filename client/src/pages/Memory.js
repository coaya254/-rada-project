import React, { useState, useCallback, useMemo } from 'react';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import { FaSearch, FaBookmark, FaShare } from 'react-icons/fa';
import { useEnhancedUser } from '../contexts/EnhancedUserContext';
import api from '../utils/api';

const MemoryContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  background: var(--light-bg);
`;

const PageHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  color: white;
  padding: 32px 20px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    opacity: 0.3;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    animation: float 6s ease-in-out infinite;
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(180deg); }
  }
`;

const PageContent = styled.div`
  position: relative;
  z-index: 1;
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 900;
  margin-bottom: 8px;
  text-shadow: 0 4px 8px rgba(0,0,0,0.3);
  position: relative;
  z-index: 2;
`;

const PageSubtitle = styled.p`
  font-size: 16px;
  opacity: 0.95;
  margin-bottom: 20px;
  line-height: 1.5;
  position: relative;
  z-index: 2;
  font-weight: 500;
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 24px;
  align-items: center;
  position: relative;
  z-index: 2;
`;

const StatItem = styled.div`
  text-align: center;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 12px 16px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
  }
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 900;
  margin-bottom: 4px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
`;

const StatLabel = styled.div`
  font-size: 12px;
  opacity: 0.9;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SearchBar = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SearchContainer = styled.div`
  flex: 1;
  position: relative;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  font-size: 14px;
  pointer-events: none;
  z-index: 1;
`;

const SearchResults = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 600;
  white-space: nowrap;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

const ClearSearchButton = styled.button`
  background: rgba(255, 107, 107, 0.1);
  color: var(--rada-orange);
  border: 1px solid rgba(255, 107, 107, 0.2);
  border-radius: 12px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 107, 107, 0.2);
    transform: translateY(-1px);
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: var(--rada-orange);
    box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
    background: rgba(255, 255, 255, 0.95);
    transform: translateY(-1px);
  }
  
  &::placeholder {
    color: var(--text-secondary);
  }
`;

const FilterTabs = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const FilterTab = styled.button`
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid ${props => props.active ? 'rgba(255, 215, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'};
  background: ${props => props.active ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 255, 255, 0.6)'};
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: ${props => props.active ? 'var(--text-primary)' : 'var(--text-secondary)'};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)'};
  }
`;

const FilterSection = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
`;

const FilterTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
`;

const FilterButton = styled.button`
  padding: 6px 12px;
  border-radius: 16px;
  border: 1px solid ${props => props.active ? 'rgba(255, 107, 107, 0.3)' : 'rgba(0, 0, 0, 0.1)'};
  background: ${props => props.active ? 'rgba(255, 107, 107, 0.2)' : 'rgba(255, 255, 255, 0.7)'};
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: ${props => props.active ? 'var(--text-primary)' : 'var(--text-secondary)'};
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:hover {
    background: ${props => props.active ? 'rgba(255, 107, 107, 0.3)' : 'rgba(255, 255, 255, 0.9)'};
    transform: translateY(-1px);
  }
`;

const SortButton = styled.button`
  padding: 6px 12px;
  border-radius: 16px;
  border: 1px solid ${props => props.active ? 'rgba(76, 175, 80, 0.3)' : 'rgba(0, 0, 0, 0.1)'};
  background: ${props => props.active ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.7)'};
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: ${props => props.active ? 'var(--text-primary)' : 'var(--text-secondary)'};
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:hover {
    background: ${props => props.active ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 255, 255, 0.9)'};
    transform: translateY(-1px);
  }
`;

const MemoryList = styled.div`
  padding: 0 20px;
  margin-bottom: 20px;
`;

const ActionButtons = styled.div`
  display: none;
`;

const MemoryCard = styled.div`
  padding: 20px;
  margin: 12px 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    transition: left 0.6s ease;
  }
  
  &:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.9));
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    
    &::before {
      left: 100%;
    }
    
    ${ActionButtons} {
      opacity: 1;
    }
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const MemoryRow = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
`;

const MemoryPhoto = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57);
  background-size: 300% 300%;
  animation: gradientShift 3s ease infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 900;
  color: white;
  flex-shrink: 0;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 50%);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57);
    background-size: 300% 300%;
    animation: gradientShift 3s ease infinite reverse;
    z-index: -1;
    opacity: 0.3;
  }
  
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

const MemoryInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const MemoryName = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 2px;
  line-height: 1.3;
`;

const MemoryDetails = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
  font-weight: 400;
`;

const MemoryTags = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
`;

const MemoryTag = styled.span`
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  color: var(--text-secondary);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 9px;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.3);
`;



const CandleSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  position: relative;
`;

const ActionButton = styled.button`
  background: ${props => props.saved 
    ? 'rgba(76, 175, 80, 0.3)' 
    : 'rgba(33, 150, 243, 0.3)'
  };
  color: ${props => props.saved ? '#4CAF50' : '#2196F3'};
  border: 1px solid ${props => props.saved ? 'rgba(76, 175, 80, 0.4)' : 'rgba(33, 150, 243, 0.4)'};
  border-radius: 6px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
  
  &:hover {
    background: ${props => props.saved 
      ? 'rgba(76, 175, 80, 0.4)' 
      : 'rgba(33, 150, 243, 0.4)'
    };
    transform: translateY(-1px);
  }
`;

const ShareButton = styled.button`
  background: rgba(255, 152, 0, 0.3);
  color: #FF9800;
  border: 1px solid rgba(255, 152, 0, 0.4);
  border-radius: 6px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
  
  &:hover {
    background: rgba(255, 152, 0, 0.4);
    transform: translateY(-1px);
  }
`;

const CandleCount = styled.div`
  text-align: center;
  color: var(--text-secondary);
  position: relative;
`;

const CandleCountNumber = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: var(--rada-orange);
  margin-bottom: 2px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const CandleCountLabel = styled.div`
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
`;

const CandleButton = styled.button`
  background: linear-gradient(135deg, #ff6b6b, #ff8e53, #ff6b6b);
  background-size: 200% 200%;
  animation: pulse 2s ease-in-out infinite;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-weight: 800;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #ff8e53, #ff6b6b, #ff8e53);
    background-size: 200% 200%;
    animation: pulse 1s ease-in-out infinite;
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 10px 30px rgba(255, 107, 107, 0.6);
    
    &::before {
      left: 100%;
    }
  }
  
  &:disabled {
    background: linear-gradient(135deg, #ccc, #999);
    animation: none;
    cursor: not-allowed;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0) scale(0.98);
  }
  
  @keyframes pulse {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
`;

const EmptyState = styled.div`
  padding: 60px 20px;
  text-align: center;
  color: var(--text-secondary);
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
`;

const ProtestCard = styled.div`
  padding: 20px;
  margin: 12px 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    transition: left 0.6s ease;
  }
  
  &:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.9));
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    
    &::before {
      left: 100%;
    }
    
    ${ActionButtons} {
      opacity: 1;
    }
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ProtestHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const ProtestTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.3;
`;

const ProtestDate = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 600;
  background: rgba(76, 175, 80, 0.1);
  padding: 4px 8px;
  border-radius: 12px;
  white-space: nowrap;
`;

const ProtestLocation = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  font-weight: 500;
`;

const ProtestMeta = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
`;

const ProtestStat = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
`;

const ProtestTags = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
`;

const ProtestTag = styled.span`
  background: rgba(255, 107, 107, 0.1);
  color: var(--rada-orange);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  border: 1px solid rgba(255, 107, 107, 0.2);
`;

const ProtestOutcome = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 16px;
  background: ${props => {
    switch (props.outcome) {
      case 'peaceful': return 'rgba(76, 175, 80, 0.1)';
      case 'dispersed': return 'rgba(255, 152, 0, 0.1)';
      case 'arrests': return 'rgba(244, 67, 54, 0.1)';
      case 'ongoing': return 'rgba(33, 150, 243, 0.1)';
      default: return 'rgba(158, 158, 158, 0.1)';
    }
  }};
  color: ${props => {
    switch (props.outcome) {
      case 'peaceful': return '#4caf50';
      case 'dispersed': return '#ff9800';
      case 'arrests': return '#f44336';
      case 'ongoing': return '#2196f3';
      default: return '#9e9e9e';
    }
  }};
  border: 1px solid ${props => {
    switch (props.outcome) {
      case 'peaceful': return 'rgba(76, 175, 80, 0.2)';
      case 'dispersed': return 'rgba(255, 152, 0, 0.2)';
      case 'arrests': return 'rgba(244, 67, 54, 0.2)';
      case 'ongoing': return 'rgba(33, 150, 243, 0.2)';
      default: return 'rgba(158, 158, 158, 0.2)';
    }
  }};
`;

const tabs = [
  { key: 'honor-wall', label: '🏛️ Honor Wall' },
  { key: 'protests', label: '📸 Protest Archive' }
];

const heroFilterOptions = [
  { key: 'all', label: 'All Heroes', icon: '🌟' },
  { key: 'freedom-fighters', label: 'Freedom Fighters', icon: '⚔️' },
  { key: 'women-leaders', label: 'Women Leaders', icon: '👩‍⚖️' },
  { key: 'modern-martyrs', label: 'Modern Martyrs', icon: '🕊️' },
  { key: 'champions', label: 'Champions', icon: '🏆' }
];

const protestFilterOptions = [
  { key: 'all', label: 'All Protests', icon: '📢' },
  { key: 'climate-justice', label: 'Climate Justice', icon: '🌱' },
  { key: 'political-reform', label: 'Political Reform', icon: '🗳️' },
  { key: 'gbv', label: 'Gender Rights', icon: '👩‍⚖️' },
  { key: 'student-rights', label: 'Student Rights', icon: '👨‍🎓' },
  { key: 'land-rights', label: 'Land Rights', icon: '🏘️' },
  { key: 'economic-justice', label: 'Economic Justice', icon: '💰' }
];

const heroSortOptions = [
  { key: 'name', label: 'Name A-Z', icon: '📝' },
  { key: 'candles', label: 'Most Candles', icon: '🕯️' },
  { key: 'era', label: 'By Era', icon: '📅' },
  { key: 'county', label: 'By County', icon: '🗺️' }
];

const protestSortOptions = [
  { key: 'date', label: 'Most Recent', icon: '📅' },
  { key: 'turnout', label: 'Largest Turnout', icon: '👥' },
  { key: 'title', label: 'Title A-Z', icon: '📝' },
  { key: 'location', label: 'By Location', icon: '🗺️' }
];

const FeaturedHero = styled.div`
  background: linear-gradient(135deg, #9d4edd, #667eea);
  border-radius: 16px;
  margin: 16px 20px;
  padding: 20px;
  color: white;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 60%);
    z-index: 1;
  }
`;

const FeaturedContent = styled.div`
  position: relative;
  z-index: 2;
`;

const FeaturedBadge = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: white;
  font-size: 12px;
  padding: 6px 16px;
  border-radius: 20px;
  font-weight: 700;
  z-index: 3;
`;

const FeaturedName = styled.h3`
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
`;

const FeaturedDescription = styled.p`
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 12px;
  line-height: 1.4;
`;

const FeaturedStats = styled.div`
  display: flex;
  gap: 16px;
  font-size: 12px;
  opacity: 0.9;
`;

const RandomHeroButton = styled.button`
  background: linear-gradient(135deg, #ff6b6b, #ff8e53);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  margin: 16px 20px;
  width: calc(100% - 40px);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(255, 107, 107, 0.3);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9));
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 24px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.1);
    color: var(--text-primary);
  }
`;

const DetailPhoto = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: ${props => props.imageUrl ? 'none' : 'linear-gradient(135deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57)'};
  background-size: 300% 300%;
  animation: ${props => props.imageUrl ? 'none' : 'gradientShift 3s ease infinite'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.imageUrl ? '0' : '36px'};
  font-weight: 900;
  color: white;
  margin: 0 auto 20px;
  border: 4px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  
  ${props => props.imageUrl && `
    background-image: url(${props.imageUrl});
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  `}
`;

const DetailInfo = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

const DetailName = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
`;

const DetailMeta = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 16px;
`;

const DetailDescription = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-primary);
  margin-bottom: 20px;
  text-align: left;
`;

const DetailTags = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 20px;
`;

const DetailTag = styled.span`
  background: rgba(255, 107, 107, 0.1);
  color: var(--rada-orange);
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid rgba(255, 107, 107, 0.2);
`;

const DetailStats = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
`;

const DetailStat = styled.div`
  text-align: center;
`;

const DetailStatValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: var(--rada-orange);
  margin-bottom: 4px;
`;

const DetailStatLabel = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ReadMoreButton = styled.button`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 10px 20px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  margin: 16px 0;
  width: 100%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
  }
`;

const FullArticle = styled.div`
  margin-top: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const ArticleSection = styled.div`
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ArticleTitle = styled.h4`
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ArticleContent = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin-bottom: 12px;
`;

const ArticleQuote = styled.blockquote`
  font-style: italic;
  padding: 12px 16px;
  background: rgba(255, 107, 107, 0.1);
  border-left: 4px solid var(--rada-orange);
  border-radius: 8px;
  margin: 16px 0;
  font-size: 14px;
  color: var(--text-primary);
`;

const ArticleList = styled.ul`
  margin: 12px 0;
  padding-left: 20px;
`;

const ArticleListItem = styled.li`
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin-bottom: 6px;
`;

const ArticleImage = styled.div`
  width: 100%;
  max-width: 400px;
  height: 250px;
  border-radius: 12px;
  margin: 16px auto;
  background: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'linear-gradient(135deg, #f0f0f0, #e0e0e0)'};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.1);
  
  ${props => !props.imageUrl && `
    &::after {
      content: '📷';
      font-size: 48px;
      color: #ccc;
    }
  `}
`;

const ImageUploadContainer = styled.div`
  width: 100%;
`;

const ImageUploadArea = styled.div`
  border: 2px dashed var(--light-border);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.05);
  }
  
  label {
    cursor: pointer;
    display: block;
  }
`;

const UploadIcon = styled.div`
  font-size: 32px;
  margin-bottom: 8px;
`;

const UploadText = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const UploadHint = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
`;

const ImagePreview = styled.div`
  position: relative;
  width: 100%;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--light-border);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.9);
  }
`;



const SearchSubmitButton = styled.button`
  background: linear-gradient(135deg, rgba(255, 64, 129, 0.95), rgba(156, 39, 176, 0.95));
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 12px 20px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 8px 32px rgba(255, 64, 129, 0.4);
  white-space: nowrap;
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(255, 64, 129, 0.6);
    background: linear-gradient(135deg, rgba(255, 64, 129, 1), rgba(156, 39, 176, 1));
    border-color: rgba(255, 255, 255, 0.5);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 16px rgba(255, 64, 129, 0.4);
  }
`;

const SubmitModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const SubmitModalContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 32px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
`;

const SubmitModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const SubmitModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
`;

const SubmitCloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--light-bg);
    color: var(--text-primary);
  }
`;

const SubmitForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FormLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
`;

const FormInput = styled.input`
  padding: 12px 16px;
  border: 2px solid var(--light-border);
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const FormTextarea = styled.textarea`
  padding: 12px 16px;
  border: 2px solid var(--light-border);
  border-radius: 12px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const FormSelect = styled.select`
  padding: 12px 16px;
  border: 2px solid var(--light-border);
  border-radius: 12px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 16px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SubmitInfo = styled.div`
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
`;

const SubmitInfoTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SubmitInfoText = styled.p`
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
`;

const SubmitModalTabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  border-bottom: 2px solid var(--light-border);
  padding-bottom: 16px;
`;

const SubmitModalTab = styled.button`
  background: ${props => props.active ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent'};
  color: ${props => props.active ? 'white' : 'var(--text-secondary)'};
  border: 2px solid ${props => props.active ? 'transparent' : 'var(--light-border)'};
  border-radius: 12px;
  padding: 12px 20px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.active ? '0 4px 12px rgba(102, 126, 234, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)'};
  }
`;

// Badge information helper function
const getBadgeInfo = (badgeKey) => {
  const badges = {
    'memory_explorer': { name: 'Memory Explorer', icon: '🏛️', description: 'Explored 10 heroes in the Memory Archive' },
    'candle_lighter': { name: 'Candle Lighter', icon: '🕯️', description: 'Lit 5 candles for heroes' },
    'protest_historian': { name: 'Protest Historian', icon: '📢', description: 'Read 5 protest stories' },
    'civic_reader': { name: 'Civic Reader', icon: '📖', description: 'Read 10 full articles' },
    'discovery_master': { name: 'Discovery Master', icon: '🎲', description: 'Used random discovery 10 times' },
    'memory_guardian': { name: 'Memory Guardian', icon: '🛡️', description: 'Lit candles for 20 different heroes' },
    'story_collector': { name: 'Story Collector', icon: '📚', description: 'Read full stories for 15 heroes/protests' },
    'civic_enthusiast': { name: 'Civic Enthusiast', icon: '🌟', description: 'Earned 100 XP in Memory Archive' }
  };
  return badges[badgeKey] || { name: 'Unknown Badge', icon: '🏆', description: 'A special achievement' };
};

const Memory = () => {
  const { user, awardXP  } = useEnhancedUser();
  const [activeTab, setActiveTab] = useState('honor-wall');
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeSort, setActiveSort] = useState('candles');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHero, setSelectedHero] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFullArticle, setShowFullArticle] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitModalTab, setSubmitModalTab] = useState('hero');
  const [savedItems, setSavedItems] = useState([]);
  const [submitForm, setSubmitForm] = useState({
    name: '',
    title: '',
    description: '',
    category: '',
    county: '',
    year: '',
    source: '',
    contact: '',
    image_url: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: memoryData, isLoading: memoryLoading, refetch: memoryRefetch } = useQuery(
    ['memory-archive', 'honor-wall'],
    () => api.get('/memory'),
    {
      select: (response) => response.data,
      enabled: activeTab === 'honor-wall'
    }
  );

  const { data: protestData, isLoading: protestLoading, refetch: protestRefetch } = useQuery(
    ['protest-archive', 'protests'],
    () => api.get('/protests'),
    {
      select: (response) => response.data,
      enabled: activeTab === 'protests'
    }
  );

  // Load user's saved items
  const { data: savedItemsData } = useQuery(
    ['saved-items', user?.uuid],
    () => api.get(`/saved-items/${user?.uuid}`),
    {
      select: (response) => response.data,
      enabled: !!user?.uuid,
      onSuccess: (data) => {
        setSavedItems(data.map(item => ({ id: item.item_id, type: item.item_type })));
      }
    }
  );

  // Reset submit form when tab changes
  React.useEffect(() => {
    setSubmitForm({
      name: '',
      title: '',
      description: '',
      category: '',
      county: '',
      year: '',
      source: '',
      contact: '',
      image_url: ''
    });
  }, [activeTab]);

  // Reset submit form when modal tab changes
  React.useEffect(() => {
    setSubmitForm({
      name: '',
      title: '',
      description: '',
      category: '',
      county: '',
      year: '',
      source: '',
      contact: '',
      image_url: ''
    });
  }, [submitModalTab]);

  // Keyboard shortcuts for search
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]');
        if (searchInput) {
          searchInput.focus();
        }
      }
      // Escape to clear search
      if (e.key === 'Escape' && searchQuery) {
        setSearchQuery('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery]);

  const handleSaveItem = async (item, type) => {
    if (!user) {
      toast.error('Please complete setup to save items');
      return;
    }

    try {
      const response = await api.post('/saved-items', {
        uuid: user.uuid,
        item_id: item.id,
        item_type: type, // 'hero' or 'protest'
        title: type === 'hero' ? item.name : item.title,
        description: type === 'hero' ? item.cause : item.description
      });

      // Award XP for saving
      const xpResult = await awardXP('save_item', 2, item.id, type);
      
      if (xpResult && xpResult.badgesEarned.length > 0) {
        const badgeNames = xpResult.badgesEarned.map(badge => getBadgeInfo(badge).name).join(', ');
        toast.success(`Bookmarked (+2 XP) 📚\nNew badge earned: ${badgeNames}! 🏆`);
      } else {
        toast.success('Bookmarked (+2 XP) 📚');
      }

      // Update local state
      setSavedItems(prev => [...prev, { id: item.id, type }]);
      
    } catch (error) {
      console.error('Error saving item:', error);
      if (error.response?.status === 400) {
        toast.error('This item is already bookmarked');
      } else {
        toast.error('Failed to bookmark item');
      }
    }
  };

  const handleShareItem = async (item, type) => {
    const title = type === 'hero' ? item.name : item.title;
    const description = type === 'hero' ? item.cause : item.description;
    const url = `${window.location.origin}/memory#${type}-${item.id}`;
    
    const shareText = `Check out this ${type === 'hero' ? 'hero' : 'protest'} from Kenya's Civic Memory Archive: ${title} - ${description}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title} - Civic Memory Archive`,
          text: shareText,
          url: url
        });
        toast.success('Shared successfully! 📤');
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareText}\n\n${url}`);
        toast.success('Link copied to clipboard! 📋');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        toast.error('Failed to share');
      }
    }
  };

  const handleRemoveSaved = async (itemId, type) => {
    if (!user) return;

    try {
      await api.delete(`/saved-items/${itemId}`, {
        data: { uuid: user.uuid, item_type: type }
      });

      // Update local state
      setSavedItems(prev => prev.filter(item => !(item.id === itemId && item.type === type)));
      toast.success('Removed from collection');
      
    } catch (error) {
      console.error('Error removing saved item:', error);
      toast.error('Failed to remove item');
    }
  };

  const isItemSaved = (itemId, type) => {
    return savedItems.some(item => item.id === itemId && item.type === type);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please complete setup to submit requests');
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData = {
        uuid: user.uuid,
        type: submitModalTab,
        ...submitForm,
        submitted_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
        user_email: user.email || 'anonymous@rada.ke',
        user_nickname: user.nickname || 'Anonymous User'
      };

      // Send to backend API
      await api.post('/submit-request', requestData);

      // Send email notification to editorial team
      await api.post('/send-submission-email', {
        to: 'rada.editorial@gmail.com',
        subject: `New ${submitModalTab === 'hero' ? 'Hero' : 'Protest'} Submission - ${submitForm.name}`,
                  content: `
            New submission received:
            
            Type: ${submitModalTab === 'hero' ? 'Hero' : 'Protest'}
            Name/Title: ${submitForm.name}
            Description: ${submitForm.description}
            Category: ${submitForm.category || 'Not specified'}
            County: ${submitForm.county || 'Not specified'}
            Year: ${submitForm.year || 'Not specified'}
            Source: ${submitForm.source || 'Not specified'}
            Contact: ${submitForm.contact || 'Not provided'}
            Image URL: ${submitForm.image_url || 'Not provided'}
            
            Submitted by: ${user.nickname || 'Anonymous'} (${user.email || 'No email'})
            Submitted at: ${new Date().toLocaleString()}
            
            Review at: ${window.location.origin}/admin
          `
      });

      // Award XP for submitting
      const xpResult = await awardXP('submit_request', 15, 'memory_archive', 'submit');
      
      if (xpResult && xpResult.badgesEarned.length > 0) {
        const badgeNames = xpResult.badgesEarned.map(badge => getBadgeInfo(badge).name).join(', ');
        toast.success(`Request submitted successfully! (+15 XP) ✨\nNew badge earned: ${badgeNames}! 🏆\nOur editorial team will review your submission.`);
      } else {
        toast.success('Request submitted successfully! (+15 XP) ✨\nOur editorial team will review your submission.');
      }

      // Reset form and close modal
      setSubmitForm({
        name: '',
        title: '',
        description: '',
        category: '',
        county: '',
        year: '',
        source: '',
        contact: '',
        image_url: ''
      });
      setShowSubmitModal(false);
      
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormChange = (field, value) => {
    setSubmitForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setSubmitForm(prev => ({ ...prev, image_url: response.data.imageUrl }));
        toast.success('Image uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    }
  };

  const handleLightCandle = async (memoryId) => {
    if (!user) {
      toast.error('Please complete setup to light candles');
      return;
    }

    // Find the memory to check if it's a modern martyr
    const memory = memoryData?.find(m => m.id === memoryId);
    if (!memory) {
      toast.error('Hero not found');
      return;
    }

    // Check if this hero is a modern martyr
    const isModernMartyr = memory.tags && memory.tags.includes('modern-martyrs');
    if (!isModernMartyr) {
      toast.error('Candles can only be lit for modern martyrs who sacrificed for justice');
      return;
    }

    try {
      const response = await api.post(`/memory/${memoryId}/candle`, {
        uuid: user.uuid
      });

      // Award XP and show enhanced feedback
      const xpResult = await awardXP('light_candle', 5, memoryId, 'memory');
      
      if (xpResult && xpResult.badgesEarned.length > 0) {
        const badgeNames = xpResult.badgesEarned.map(badge => getBadgeInfo(badge).name).join(', ');
        toast.success(`Candle lit for a modern martyr (+5 XP) 🕯️\nNew badge earned: ${badgeNames}! 🏆`);
      } else {
        toast.success('Candle lit for a modern martyr (+5 XP) 🕯️');
      }
      
      // Refetch to update counts
      memoryRefetch();
    } catch (error) {
      console.error('Error lighting candle:', error);
      if (error.response?.status === 400) {
        toast.error('You have already lit a candle for this martyr today');
      } else {
        toast.error('Failed to light candle');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date unknown';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTotalCandles = () => {
    if (!memoryData) return 0;
    return memoryData.reduce((total, memory) => total + (memory.candles_lit || 0), 0);
  };

  const getFilteredAndSortedHeroes = useMemo(() => {
    if (!memoryData) return [];
    
    let filtered = memoryData;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(hero => 
        hero.name.toLowerCase().includes(query) ||
        (hero.cause && hero.cause.toLowerCase().includes(query)) ||
        (hero.county && hero.county.toLowerCase().includes(query)) ||
        (hero.context && hero.context.toLowerCase().includes(query)) ||
        (hero.tags && hero.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    // Apply category filters
    if (activeFilter !== 'all') {
      filtered = filtered.filter(hero => {
        const tags = hero.tags || [];
        return tags.includes(activeFilter);
      });
    }
    
    // Apply sort
    switch (activeSort) {
      case 'name':
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      case 'candles':
        return filtered.sort((a, b) => (b.candles_lit || 0) - (a.candles_lit || 0));
      case 'era':
        return filtered.sort((a, b) => new Date(a.date_of_death || 0) - new Date(b.date_of_death || 0));
      case 'county':
        return filtered.sort((a, b) => (a.county || '').localeCompare(b.county || ''));
      default:
        return filtered;
    }
  }, [memoryData, searchQuery, activeFilter, activeSort]);

  const getFilteredAndSortedProtests = useMemo(() => {
    if (!protestData) return [];
    
    let filtered = protestData;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(protest => 
        protest.title.toLowerCase().includes(query) ||
        (protest.location && protest.location.toLowerCase().includes(query)) ||
        (protest.county && protest.county.toLowerCase().includes(query)) ||
        (protest.description && protest.description.toLowerCase().includes(query)) ||
        (protest.purpose_tags && protest.purpose_tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    // Apply filters
    if (activeFilter !== 'all') {
      filtered = filtered.filter(protest => 
        protest.purpose_tags && protest.purpose_tags.includes(activeFilter)
      );
    }
    
    // Apply sort
    switch (activeSort) {
      case 'date':
        return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
      case 'turnout':
        return filtered.sort((a, b) => (b.turnout_estimate || 0) - (a.turnout_estimate || 0));
      case 'title':
        return filtered.sort((a, b) => a.title.localeCompare(b.title));
      case 'location':
        return filtered.sort((a, b) => (a.location || '').localeCompare(b.location || ''));
      default:
        return filtered;
    }
  }, [protestData, searchQuery, activeFilter, activeSort]);

  const getFeaturedHero = () => {
    if (!memoryData) return null;
    return memoryData.find(hero => hero.featured) || memoryData[0];
  };

  const getRandomHero = useCallback(() => {
    if (!memoryData || memoryData.length === 0) return null;
    const filteredHeroes = getFilteredAndSortedHeroes;
    if (filteredHeroes.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * filteredHeroes.length);
    return filteredHeroes[randomIndex];
  }, [memoryData, getFilteredAndSortedHeroes]);

  const getRandomProtest = useCallback(() => {
    if (!protestData || protestData.length === 0) return null;
    const filteredProtests = getFilteredAndSortedProtests;
    if (filteredProtests.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * filteredProtests.length);
    return filteredProtests[randomIndex];
  }, [protestData, getFilteredAndSortedProtests]);

  const handleRandomHero = async () => {
    if (activeTab === 'honor-wall') {
      // Already on honor wall, discover random hero
      const randomHero = getRandomHero();
      if (randomHero) {
        setSelectedHero(randomHero);
        setShowDetailModal(true);
        setShowFullArticle(false);
        
        // Award XP with enhanced feedback
        const xpResult = await awardXP('discover_hero', 2, randomHero.id, 'memory');
        
        if (xpResult && xpResult.badgesEarned.length > 0) {
          const badgeNames = xpResult.badgesEarned.map(badge => getBadgeInfo(badge).name).join(', ');
          toast.success(`Discovered ${randomHero.name}! (+2 XP) 🌟\nNew badge earned: ${badgeNames}! 🏆`);
        } else {
          toast.success(`Discovered ${randomHero.name}! (+2 XP) 🌟`);
        }
      }
    } else {
      // Switch to protests tab and discover random protest
      setActiveTab('protests');
      const randomProtest = getRandomProtest();
      if (randomProtest) {
        setSelectedHero(randomProtest);
        setShowDetailModal(true);
        setShowFullArticle(false);
        
        // Award XP with enhanced feedback
        const xpResult = await awardXP('discover_protest', 2, randomProtest.id, 'memory');
        
        if (xpResult && xpResult.badgesEarned.length > 0) {
          const badgeNames = xpResult.badgesEarned.map(badge => getBadgeInfo(badge).name).join(', ');
          toast.success(`Discovered ${randomProtest.title}! (+2 XP) 📢\nNew badge earned: ${badgeNames}! 🏆`);
        } else {
          toast.success(`Discovered ${randomProtest.title}! (+2 XP) 📢`);
        }
      }
    }
  };

  const handleCardClick = (item) => {
    setSelectedHero(item);
    setShowDetailModal(true);
    setShowFullArticle(false);
  };

  const handleFeaturedHeroClick = () => {
    const featuredHero = getFeaturedHero();
    if (featuredHero) {
      setSelectedHero(featuredHero);
      setShowDetailModal(true);
      setShowFullArticle(false);
    }
  };

  const getHeroFullArticle = (hero) => {
    const articles = {
      'Dedan Kimathi': {
        earlyLife: {
          title: '🌱 Early Life & Background',
          content: 'Dedan Kimathi Waciuri was born in 1920 in Thegenge village, Nyeri County. Growing up in a time of colonial oppression, he witnessed firsthand the injustices faced by his people. His early experiences with British colonial rule shaped his revolutionary spirit and commitment to Kenya\'s independence.'
        },
        struggle: {
          title: '⚔️ The Mau Mau Struggle',
          content: 'Kimathi emerged as a key leader of the Mau Mau uprising, organizing guerrilla warfare against British colonial forces. He became the supreme commander of the Kenya Land and Freedom Army, leading thousands of fighters in the forests of Mount Kenya and the Aberdare ranges.',
          quote: '"It is better to die on our feet than to live on our knees."'
        },
        legacy: {
          title: '🏛️ Legacy & Impact',
          content: 'Kimathi\'s leadership and sacrifice inspired generations of Kenyans. His execution in 1957 marked a turning point in Kenya\'s independence struggle. Today, he is remembered as a national hero whose courage and determination paved the way for Kenya\'s independence in 1963.',
          achievements: [
            'Led the Mau Mau resistance movement',
            'Organized guerrilla warfare strategies',
            'Inspired national independence movement',
            'Became a symbol of resistance and freedom'
          ]
        }
      },
      'Wangari Maathai': {
        earlyLife: {
          title: '🌱 Early Life & Education',
          content: 'Wangari Muta Maathai was born in 1940 in Ihithe village, Nyeri County. She became the first woman in East and Central Africa to earn a doctorate degree, studying in the United States before returning to Kenya to pursue her passion for environmental conservation and social justice.'
        },
        movement: {
          title: '🌳 The Green Belt Movement',
          content: 'In 1977, Maathai founded the Green Belt Movement, which has planted over 51 million trees across Kenya. The movement empowered women through environmental conservation, providing them with income and restoring degraded lands.',
          quote: '"We cannot tire or give up. We owe it to the present and future generations of all species to rise up and walk!"'
        },
        achievements: {
          title: '🏆 Nobel Peace Prize & Recognition',
          content: 'In 2004, Maathai became the first African woman to receive the Nobel Peace Prize for her contribution to sustainable development, democracy, and peace. Her work demonstrated the connection between environmental conservation and social justice.',
          achievements: [
            'Founded the Green Belt Movement',
            'Planted over 51 million trees',
            'Won the 2004 Nobel Peace Prize',
            'Served as Member of Parliament',
            'Advocated for democracy and human rights'
          ]
        }
      },
      'Tom Mboya': {
        earlyLife: {
          title: '🌱 Early Life & Education',
          content: 'Thomas Joseph Mboya was born in 1930 in Kilima Mbogo, near Thika. Despite humble beginnings, he excelled academically and became a prominent trade unionist and politician. His charisma and leadership skills made him a key figure in Kenya\'s independence movement.'
        },
        leadership: {
          title: '🗣️ Trade Union Leadership',
          content: 'Mboya became the general secretary of the Kenya Federation of Labour at just 25 years old. He organized workers and fought for better working conditions, using the trade union movement as a platform for political mobilization against colonial rule.',
          quote: '"The future belongs to those who believe in the beauty of their dreams."'
        },
        impact: {
          title: '🌟 Political Impact & Vision',
          content: 'Mboya played a crucial role in Kenya\'s independence negotiations and was instrumental in establishing the country\'s first independent government. His vision for a united, prosperous Kenya continues to inspire leaders today.',
          achievements: [
            'Led the Kenya Federation of Labour',
            'Negotiated independence terms',
            'Established airlift program for students',
            'Served as Minister of Economic Planning',
            'Promoted Pan-African unity'
          ]
        }
      }
    };

    return articles[hero.name] || {
      earlyLife: {
        title: '🌱 Early Life & Background',
        content: `${hero.name} was born and raised in ${hero.county || 'Kenya'}, growing up during a time of significant change in the country. From an early age, they showed remarkable courage and determination in the face of adversity.`
      },
      struggle: {
        title: '⚔️ The Struggle for Justice',
        content: `${hero.name} dedicated their life to fighting for justice, equality, and the rights of their people. Their courageous actions inspired countless others to join the movement for a better Kenya.`,
        quote: `"The legacy of ${hero.name} continues to inspire us to fight for what is right."`
      },
      legacy: {
        title: '🏛️ Enduring Legacy',
        content: `Today, ${hero.name} is remembered as a true hero whose sacrifice and dedication helped shape the Kenya we know today. Their story serves as a reminder of the power of courage and determination in the face of oppression.`,
        achievements: [
          'Fought for justice and equality',
          'Inspired future generations',
          'Contributed to Kenya\'s independence',
          'Demonstrated extraordinary courage'
        ]
      }
    };
  };

  const getProtestFullArticle = (protest) => {
    const articles = {
      'Climate Justice March': {
        context: {
          title: '🌍 Climate Crisis Context',
          content: 'The Climate Justice March of 2024 was organized in response to growing concerns about climate change impacts in Kenya. With increasing droughts, floods, and environmental degradation affecting communities across the country, youth activists took to the streets to demand urgent action.'
        },
        impact: {
          title: '📢 March & Mobilization',
          content: 'Over 3,500 participants marched from Nairobi CBD to Parliament Road, carrying banners and chanting slogans demanding climate justice. The peaceful demonstration highlighted the intersection of environmental issues with social and economic justice.',
          quote: '"Climate justice is not just about the environment - it\'s about justice for all Kenyans affected by climate change."'
        },
        legacy: {
          title: '🌱 Lasting Impact',
          content: 'The march successfully raised awareness about climate justice issues and influenced policy discussions. It demonstrated the power of youth-led environmental activism and inspired similar movements across East Africa.',
          achievements: [
            'Raised awareness about climate justice',
            'Influenced environmental policy discussions',
            'Inspired youth environmental activism',
            'Demonstrated peaceful civic engagement'
          ]
        }
      },
      'Finance Bill Protests': {
        context: {
          title: '💰 Economic Justice Context',
          content: 'The Finance Bill 2024 protests were triggered by proposed tax increases that would disproportionately affect ordinary Kenyans. With rising living costs and economic hardship, citizens organized massive demonstrations across the country.'
        },
        impact: {
          title: '👥 Mass Mobilization',
          content: 'The protests saw unprecedented turnout with over 15,000 participants in Nairobi alone. Youth-led demonstrations spread across major cities, demonstrating widespread public opposition to the proposed economic policies.',
          quote: '"We cannot afford to be silent when our economic future is at stake."'
        },
        legacy: {
          title: '⚖️ Policy Impact',
          content: 'The massive protests led to significant policy revisions and demonstrated the power of collective civic action. The movement showed how organized citizen resistance can influence government decisions.',
          achievements: [
            'Led to policy revisions',
            'Demonstrated civic power',
            'Inspired nationwide mobilization',
            'Highlighted economic justice issues'
          ]
        }
      },
      'Student Rights March': {
        context: {
          title: '🎓 Education Rights Context',
          content: 'The Student Rights March was organized by university students to advocate for better education policies and improved student welfare. Students faced challenges with funding, accommodation, and academic support systems.'
        },
        impact: {
          title: '📚 Student Mobilization',
          content: 'Over 800 students from various universities participated in the peaceful march, presenting their demands for better education policies and student welfare reforms. The demonstration was well-organized and focused on constructive dialogue.',
          quote: '"Education is a right, not a privilege - we demand better for all students."'
        },
        legacy: {
          title: '🎯 Policy Reforms',
          content: 'The march led to improved dialogue between student representatives and education policymakers. It demonstrated the importance of student voices in shaping education policy and inspired similar movements at other institutions.',
          achievements: [
            'Improved student-government dialogue',
            'Influenced education policy discussions',
            'Demonstrated peaceful student activism',
            'Inspired similar movements'
          ]
        }
      }
    };

    return articles[protest.title] || {
      context: {
        title: '📋 Protest Context',
        content: `${protest.title} was organized in response to important social, economic, or political issues affecting the people of ${protest.county || 'Kenya'}. The demonstration brought together citizens from diverse backgrounds united by common concerns.`
      },
      impact: {
        title: '📢 Mobilization & Action',
        content: `The protest successfully mobilized ${protest.turnout_estimate?.toLocaleString() || 'hundreds of'} participants who peacefully demonstrated their commitment to civic engagement and democratic participation.`,
        quote: `"The power of collective action was demonstrated through ${protest.title}."`
      },
      legacy: {
        title: '🏛️ Democratic Legacy',
        content: `This protest contributed to Kenya's democratic journey by demonstrating the importance of civic engagement and peaceful assembly. It showed how citizens can actively participate in shaping their country's future.`,
        achievements: [
          'Demonstrated civic engagement',
          'Promoted peaceful assembly',
          'Contributed to democratic dialogue',
          'Inspired future civic action'
        ]
      }
    };
  };

  const isLoading = memoryLoading || protestLoading;

  if (isLoading) {
    return (
      <MemoryContainer>
        <PageHeader>
          <PageContent>
          <PageTitle>🏛️ Civic Memory Archive</PageTitle>
          <PageSubtitle>Honoring Kenya's civic heroes and documenting our democratic journey</PageSubtitle>
          </PageContent>
        </PageHeader>
        
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div className="loading-spinner" style={{ margin: '0 auto' }} />
        </div>
      </MemoryContainer>
    );
  }

  return (
    <MemoryContainer>
      <PageHeader>
        <PageContent>
        <PageTitle>🏛️ Civic Memory Archive</PageTitle>
        <PageSubtitle>Honoring Kenya's civic heroes and documenting our democratic journey through protests and movements</PageSubtitle>
        
                 <StatsContainer>
           <StatItem>
             <StatValue>{memoryData?.length || 0}</StatValue>
             <StatLabel>Heroes Remembered</StatLabel>
           </StatItem>
           <StatItem>
             <StatValue>{protestData?.length || 0}</StatValue>
             <StatLabel>Protests Documented</StatLabel>
           </StatItem>
           <StatItem>
             <StatValue>{getTotalCandles()}</StatValue>
             <StatLabel>Candles Lit</StatLabel>
           </StatItem>
           <StatItem>
             <StatValue>47</StatValue>
             <StatLabel>Counties</StatLabel>
           </StatItem>
         </StatsContainer>
        </PageContent>
      </PageHeader>

      <SearchBar>
        <SearchContainer>
          <SearchIcon>
            <FaSearch />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder={activeTab === 'honor-wall' ? 
              "Search heroes by name, cause, or county... (Ctrl+K)" : 
              "Search protests by title, location, or county... (Ctrl+K)"
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}

          />
        </SearchContainer>
        
        <SearchSubmitButton onClick={() => setShowSubmitModal(true)}>
          ✨ Submit Request
        </SearchSubmitButton>
        
               {(user?.badges?.includes('editorial') || user?.uuid === 'test' || true) && (
         <SearchSubmitButton 
           onClick={() => window.location.href = '/editorial'}
           style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
         >
           📝 Editorial Panel
         </SearchSubmitButton>
       )}
        
        {searchQuery && (
          <>
            <SearchResults>
              {activeTab === 'honor-wall' 
                ? `${getFilteredAndSortedHeroes.length} heroes found`
                : `${getFilteredAndSortedProtests.length} protests found`
              }
            </SearchResults>
            <ClearSearchButton onClick={() => setSearchQuery('')}>
              Clear
            </ClearSearchButton>
          </>
        )}
      </SearchBar>

      <FilterTabs>
        {tabs.map((tab) => (
          <FilterTab
            key={tab.key}
            active={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </FilterTab>
        ))}
      </FilterTabs>

      {/* Featured Hero Section */}
      {getFeaturedHero() && (
        <FeaturedHero onClick={handleFeaturedHeroClick}>
          <FeaturedBadge>⭐ Featured Hero</FeaturedBadge>
          <FeaturedContent>
            <FeaturedName>{getFeaturedHero().name}</FeaturedName>
            <FeaturedDescription>{getFeaturedHero().achievement}</FeaturedDescription>
            <FeaturedStats>
              <span>🕯️ {getFeaturedHero().candles_lit || 0} candles</span>
              <span>📍 {getFeaturedHero().county}</span>
            </FeaturedStats>
          </FeaturedContent>
        </FeaturedHero>
      )}

                    {/* Random Discover Button */}
       <RandomHeroButton onClick={handleRandomHero}>
         {activeTab === 'honor-wall' ? '🎲 Discover Random Hero' : '📢 Discover Random Protest'}
       </RandomHeroButton>

                    {/* Honor Wall */}
      {activeTab === 'honor-wall' && (
        <>
           <FilterSection>
              <FilterTitle>
                <span>🔍</span>
                Filter by Category
              </FilterTitle>
              <FilterRow>
                {heroFilterOptions.map((filter) => (
                  <FilterButton
                    key={filter.key}
                    active={activeFilter === filter.key}
                    onClick={() => setActiveFilter(filter.key)}
                  >
                    <span>{filter.icon}</span>
                    {filter.label}
                  </FilterButton>
                ))}
              </FilterRow>
            </FilterSection>

            <FilterSection>
              <FilterTitle>
                <span>📊</span>
                Sort by
              </FilterTitle>
              <FilterRow>
                {heroSortOptions.map((sort) => (
                  <SortButton
                    key={sort.key}
                    active={activeSort === sort.key}
                    onClick={() => setActiveSort(sort.key)}
                  >
                    <span>{sort.icon}</span>
                    {sort.label}
                  </SortButton>
                ))}
              </FilterRow>
            </FilterSection>

                         {getFilteredAndSortedHeroes.length > 0 ? (
                               <MemoryList>
                  {getFilteredAndSortedHeroes.map((memory, index) => (
                                   <MemoryCard key={memory.id} onClick={() => handleCardClick(memory)}>
                  <MemoryRow>
                    <MemoryPhoto>
                      {memory.image_url ? (
                        <img 
                          src={memory.image_url} 
                          alt={memory.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                        />
                      ) : (
                        (memory.name || '').split(' ').map(n => n[0]).join('').slice(0, 2)
                      )}
                    </MemoryPhoto>

                    <MemoryInfo>
                      <MemoryName>{memory.name || 'Unknown Hero'}</MemoryName>
                      <MemoryDetails>
                        {memory.age && `Age ${memory.age} • `}
                        {formatDate(memory.date_of_death)}
                        {memory.county && ` • ${memory.county}`}
                      </MemoryDetails>
                      {memory.tags && memory.tags.length > 0 && (
                        <MemoryTags>
                          {memory.tags.slice(0, 3).map((tag) => (
                            <MemoryTag key={tag}>
                              #{tag}
                            </MemoryTag>
                          ))}
                          {memory.tags.length > 3 && (
                            <MemoryTag>
                              +{memory.tags.length - 3}
                            </MemoryTag>
                          )}
                        </MemoryTags>
                      )}
                    </MemoryInfo>

                    {memory.tags && memory.tags.includes('modern-martyrs') && (
                      <CandleSection>
                        <CandleCount>
                          <CandleCountNumber>{memory.candles_lit || 0}</CandleCountNumber>
                          <CandleCountLabel>Candles</CandleCountLabel>
                        </CandleCount>
                        <CandleButton
                          onClick={() => handleLightCandle(memory.id)}
                        >
                          🕯️ Light
                        </CandleButton>
                      </CandleSection>
                    )}
                  </MemoryRow>
                </MemoryCard>
                ))}
              </MemoryList>
            ) : (
            <EmptyState>
              <EmptyIcon>🕯️</EmptyIcon>
                <h3>No heroes found</h3>
                <p>Try adjusting your filters or check back later for more entries</p>
            </EmptyState>
          )}
        </>
      )}

       {/* Protest Archive */}
      {activeTab === 'protests' && (
         <>
           <FilterSection>
             <FilterTitle>
               <span>🔍</span>
               Filter by Purpose
             </FilterTitle>
             <FilterRow>
               {protestFilterOptions.map((filter) => (
                 <FilterButton
                   key={filter.key}
                   active={activeFilter === filter.key}
                   onClick={() => setActiveFilter(filter.key)}
                 >
                   <span>{filter.icon}</span>
                   {filter.label}
                 </FilterButton>
               ))}
             </FilterRow>
           </FilterSection>

           <FilterSection>
             <FilterTitle>
               <span>📊</span>
               Sort by
             </FilterTitle>
             <FilterRow>
               {protestSortOptions.map((sort) => (
                 <SortButton
                   key={sort.key}
                   active={activeSort === sort.key}
                   onClick={() => setActiveSort(sort.key)}
                 >
                   <span>{sort.icon}</span>
                   {sort.label}
                 </SortButton>
               ))}
             </FilterRow>
           </FilterSection>

                       {getFilteredAndSortedProtests.length > 0 ? (
                           <MemoryList>
                {getFilteredAndSortedProtests.map((protest, index) => (
                 <ProtestCard key={protest.id} onClick={() => handleCardClick(protest)}>
                   <ProtestHeader>
                     <ProtestTitle>{protest.title}</ProtestTitle>
                     <ProtestDate>{formatDate(protest.date)}</ProtestDate>
                   </ProtestHeader>
                   
                   <ProtestLocation>📍 {protest.location}</ProtestLocation>
                   
                   <ProtestMeta>
                     <ProtestStat>
                       <span>👥</span>
                       {protest.turnout_estimate?.toLocaleString() || 'Unknown'} participants
                     </ProtestStat>
                     <ProtestStat>
                       <span>🗺️</span>
                       {protest.county}
                     </ProtestStat>
                   </ProtestMeta>
                   
                   {protest.purpose_tags && protest.purpose_tags.length > 0 && (
                     <ProtestTags>
                       {protest.purpose_tags.map((tag) => (
                         <ProtestTag key={tag}>
                           #{tag}
                         </ProtestTag>
                       ))}
                     </ProtestTags>
                   )}
                   
                   <ProtestOutcome outcome={protest.outcome}>
                     <span>
                       {protest.outcome === 'peaceful' && '🕊️'}
                       {protest.outcome === 'dispersed' && '🚨'}
                       {protest.outcome === 'arrests' && '⚖️'}
                       {protest.outcome === 'ongoing' && '🔄'}
                     </span>
                     {protest.outcome?.charAt(0).toUpperCase() + protest.outcome?.slice(1) || 'Unknown'}
                   </ProtestOutcome>
                 </ProtestCard>
               ))}
             </MemoryList>
           ) : (
        <EmptyState>
          <EmptyIcon>📸</EmptyIcon>
               <h3>No protests found</h3>
               <p>Try adjusting your filters or check back later for more entries</p>
        </EmptyState>
      )}
         </>
       )}

       {/* Detail Modal */}
       {showDetailModal && selectedHero && (
         <ModalOverlay onClick={() => setShowDetailModal(false)}>
           <ModalContent onClick={(e) => e.stopPropagation()}>
             <ModalHeader>
               <ModalTitle>
                 {activeTab === 'honor-wall' ? '🏛️ Hero Details' : '📸 Protest Details'}
               </ModalTitle>
               <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                 <ActionButton
                   onClick={() => {
                     if (isItemSaved(selectedHero.id, activeTab === 'honor-wall' ? 'hero' : 'protest')) {
                       handleRemoveSaved(selectedHero.id, activeTab === 'honor-wall' ? 'hero' : 'protest');
                     } else {
                       handleSaveItem(selectedHero, activeTab === 'honor-wall' ? 'hero' : 'protest');
                     }
                   }}
                   saved={isItemSaved(selectedHero.id, activeTab === 'honor-wall' ? 'hero' : 'protest')}
                   title={isItemSaved(selectedHero.id, activeTab === 'honor-wall' ? 'hero' : 'protest') ? 'Remove bookmark' : 'Bookmark'}
                 >
                   <FaBookmark />
                 </ActionButton>
                 <ShareButton
                   onClick={() => handleShareItem(selectedHero, activeTab === 'honor-wall' ? 'hero' : 'protest')}
                   title="Share"
                 >
                   <FaShare />
                 </ShareButton>
                 <CloseButton onClick={() => setShowDetailModal(false)}>×</CloseButton>
               </div>
             </ModalHeader>
             
             <DetailPhoto imageUrl={selectedHero.image_url}>
               {!selectedHero.image_url && (
                 activeTab === 'honor-wall' 
                   ? (selectedHero.name || '').split(' ').map(n => n[0]).join('').slice(0, 2)
                   : (selectedHero.title || '').split(' ').map(n => n[0]).join('').slice(0, 2)
               )}
             </DetailPhoto>
             
             <DetailInfo>
               <DetailName>
                 {activeTab === 'honor-wall' ? (selectedHero.name || 'Unknown Hero') : (selectedHero.title || 'Unknown Protest')}
               </DetailName>
               <DetailMeta>
                 {activeTab === 'honor-wall' ? (
                   <>
                     {selectedHero.age && `Age ${selectedHero.age} • `}
                     {formatDate(selectedHero.date_of_death)}
                     {selectedHero.county && ` • ${selectedHero.county}`}
                   </>
                 ) : (
                   <>
                     {formatDate(selectedHero.date)}
                     {selectedHero.location && ` • ${selectedHero.location}`}
                     {selectedHero.county && ` • ${selectedHero.county}`}
                   </>
                 )}
               </DetailMeta>
               

             </DetailInfo>
             
                           {activeTab === 'honor-wall' ? (
                <>
                  {!showFullArticle ? (
                    <>
                      <DetailDescription>
                        {selectedHero.achievement ? 
                          selectedHero.achievement.length > 150 ? 
                            selectedHero.achievement.substring(0, 150) + '...' : 
                            selectedHero.achievement
                          : 
                          `${selectedHero.name} was a remarkable figure who made significant contributions to Kenya's history and development.`
                        }
                      </DetailDescription>
                      
                      {selectedHero.tags && selectedHero.tags.length > 0 && (
                        <DetailTags>
                          {selectedHero.tags.map((tag) => (
                            <DetailTag key={tag}>#{tag}</DetailTag>
                          ))}
                        </DetailTags>
                      )}
                      
                      <DetailStats>
                        <DetailStat>
                          <DetailStatValue>{selectedHero.candles_lit || 0}</DetailStatValue>
                          <DetailStatLabel>Candles Lit</DetailStatLabel>
                        </DetailStat>
                        <DetailStat>
                          <DetailStatValue>{selectedHero.county || 'Unknown'}</DetailStatValue>
                          <DetailStatLabel>County</DetailStatLabel>
                        </DetailStat>
                      </DetailStats>
                      
                                             <ReadMoreButton onClick={() => setShowFullArticle(true)}>
                         📖 Read Full Story
                       </ReadMoreButton>
                    </>
                  ) : (
                   <FullArticle>
                     {(() => {
                       const article = getHeroFullArticle(selectedHero);
                       return (
                         <>
                           {selectedHero.image_url && (
                             <ArticleImage imageUrl={selectedHero.image_url} />
                           )}
                           
                           <ArticleSection>
                             <ArticleTitle>{article.earlyLife.title}</ArticleTitle>
                             <ArticleContent>{article.earlyLife.content}</ArticleContent>
                           </ArticleSection>
                           
                           <ArticleSection>
                             <ArticleTitle>{article.struggle?.title || article.movement?.title || article.leadership?.title}</ArticleTitle>
                             <ArticleContent>{article.struggle?.content || article.movement?.content || article.leadership?.content}</ArticleContent>
                             {(article.struggle?.quote || article.movement?.quote || article.leadership?.quote) && (
                               <ArticleQuote>{article.struggle?.quote || article.movement?.quote || article.leadership?.quote}</ArticleQuote>
                             )}
                           </ArticleSection>
                           
                           <ArticleSection>
                             <ArticleTitle>{article.legacy?.title || article.achievements?.title}</ArticleTitle>
                             <ArticleContent>{article.legacy?.content || article.achievements?.content}</ArticleContent>
                             {(article.legacy?.achievements || article.achievements?.achievements) && (
                               <ArticleList>
                                 {(article.legacy?.achievements || article.achievements?.achievements).map((achievement, index) => (
                                   <ArticleListItem key={index}>{achievement}</ArticleListItem>
                                 ))}
                               </ArticleList>
                             )}
                           </ArticleSection>
                           
                           <ReadMoreButton onClick={() => setShowFullArticle(false)}>
                             📄 Show Less
                           </ReadMoreButton>
                         </>
                       );
                     })()}
                   </FullArticle>
                 )}
                 
                                   <CandleButton
                    onClick={async () => {
                      await handleLightCandle(selectedHero.id);
                      setShowDetailModal(false);
                    }}
                    style={{ width: '100%', marginTop: '16px' }}
                  >
                    🕯️ Light Candle (+5 XP)
                  </CandleButton>
               </>
                           ) : (
                <>
                  {!showFullArticle ? (
                    <>
                      <DetailDescription>
                        {selectedHero.description ? 
                          selectedHero.description.length > 150 ? 
                            selectedHero.description.substring(0, 150) + '...' : 
                            selectedHero.description
                          : 
                          `${selectedHero.title} was a significant protest that took place in ${selectedHero.county || 'Kenya'}, demonstrating the power of collective action and civic engagement.`
                        }
                      </DetailDescription>
                      
                      {selectedHero.purpose_tags && selectedHero.purpose_tags.length > 0 && (
                        <DetailTags>
                          {selectedHero.purpose_tags.map((tag) => (
                            <DetailTag key={tag}>#{tag}</DetailTag>
                          ))}
                        </DetailTags>
                      )}
                      
                      <DetailStats>
                        <DetailStat>
                          <DetailStatValue>{selectedHero.turnout_estimate?.toLocaleString() || 'Unknown'}</DetailStatValue>
                          <DetailStatLabel>Participants</DetailStatLabel>
                        </DetailStat>
                        <DetailStat>
                          <DetailStatValue>{selectedHero.outcome?.charAt(0).toUpperCase() + selectedHero.outcome?.slice(1) || 'Unknown'}</DetailStatValue>
                          <DetailStatLabel>Outcome</DetailStatLabel>
                        </DetailStat>
                      </DetailStats>
                      
                      <ReadMoreButton onClick={async () => {
                        setShowFullArticle(true);
                        // Award XP for reading full article
                        const xpResult = await awardXP('read_full_article', 3, selectedHero.id, 'memory');
                        if (xpResult && xpResult.badgesEarned.length > 0) {
                          const badgeNames = xpResult.badgesEarned.map(badge => getBadgeInfo(badge).name).join(', ');
                          toast.success(`Article read! (+3 XP) 📖\nNew badge earned: ${badgeNames}! 🏆`);
                        }
                      }}>
                        📖 Read Full Story (+3 XP)
                      </ReadMoreButton>
                    </>
                  ) : (
                    <FullArticle>
                      {(() => {
                        const article = getProtestFullArticle(selectedHero);
                        return (
                          <>
                            {selectedHero.image_url && (
                              <ArticleImage imageUrl={selectedHero.image_url} />
                            )}
                            
                            <ArticleSection>
                              <ArticleTitle>{article.context.title}</ArticleTitle>
                              <ArticleContent>{article.context.content}</ArticleContent>
                            </ArticleSection>
                            
                            <ArticleSection>
                              <ArticleTitle>{article.impact.title}</ArticleTitle>
                              <ArticleContent>{article.impact.content}</ArticleContent>
                              {article.impact.quote && (
                                <ArticleQuote>{article.impact.quote}</ArticleQuote>
                              )}
                            </ArticleSection>
                            
                            <ArticleSection>
                              <ArticleTitle>{article.legacy.title}</ArticleTitle>
                              <ArticleContent>{article.legacy.content}</ArticleContent>
                              {article.legacy.achievements && (
                                <ArticleList>
                                  {article.legacy.achievements.map((achievement, index) => (
                                    <ArticleListItem key={index}>{achievement}</ArticleListItem>
                                  ))}
                                </ArticleList>
                              )}
                            </ArticleSection>
                            
                            <ReadMoreButton onClick={() => setShowFullArticle(false)}>
                              📄 Show Less
                            </ReadMoreButton>
                          </>
                        );
                      })()}
                    </FullArticle>
                  )}
                </>
              )}
           </ModalContent>
         </ModalOverlay>
       )}

       {/* Submit Request Modal */}
       {showSubmitModal && (
         <SubmitModal onClick={() => setShowSubmitModal(false)}>
           <SubmitModalContent onClick={(e) => e.stopPropagation()}>
             <SubmitModalHeader>
               <SubmitModalTitle>
                 ✨ Submit New Request
               </SubmitModalTitle>
               <SubmitCloseButton onClick={() => setShowSubmitModal(false)}>
                 ×
               </SubmitCloseButton>
             </SubmitModalHeader>

             <SubmitModalTabs>
               <SubmitModalTab 
                 active={submitModalTab === 'hero'} 
                 onClick={() => setSubmitModalTab('hero')}
               >
                 🦸‍♂️ Hero
               </SubmitModalTab>
               <SubmitModalTab 
                 active={submitModalTab === 'protest'} 
                 onClick={() => setSubmitModalTab('protest')}
               >
                 📢 Protest
               </SubmitModalTab>
             </SubmitModalTabs>

             <SubmitInfo>
               <SubmitInfoTitle>📝 Submission Guidelines</SubmitInfoTitle>
               <SubmitInfoText>
                 Help us expand the Civic Memory Archive! Submit information about {submitModalTab === 'hero' ? 'heroes who have made significant contributions to Kenya' : 'important protests and movements that shaped our nation'}. Our editorial team will review and verify all submissions.
               </SubmitInfoText>
             </SubmitInfo>

             <SubmitForm onSubmit={handleSubmitRequest}>
               <FormGroup>
                 <FormLabel>{submitModalTab === 'hero' ? 'Hero Name' : 'Protest Title'} *</FormLabel>
                 <FormInput
                   type="text"
                   value={submitForm.name}
                   onChange={(e) => handleFormChange('name', e.target.value)}
                   placeholder={submitModalTab === 'hero' ? 'Enter the hero\'s full name' : 'Enter the protest title'}
                   required
                 />
               </FormGroup>

               <FormGroup>
                 <FormLabel>Description *</FormLabel>
                 <FormTextarea
                   value={submitForm.description}
                   onChange={(e) => handleFormChange('description', e.target.value)}
                   placeholder={`Describe what ${submitModalTab === 'hero' ? 'this hero accomplished' : 'this protest achieved'} and why it's important to Kenya's history...`}
                   required
                 />
               </FormGroup>

               <FormGroup>
                 <FormLabel>Category</FormLabel>
                 <FormSelect
                   value={submitForm.category}
                   onChange={(e) => handleFormChange('category', e.target.value)}
                 >
                   <option value="">Select a category</option>
                   {submitModalTab === 'hero' ? (
                     <>
                       <option value="independence">Independence Movement</option>
                       <option value="democracy">Democracy & Governance</option>
                       <option value="human-rights">Human Rights</option>
                       <option value="education">Education</option>
                       <option value="health">Healthcare</option>
                       <option value="environment">Environment</option>
                       <option value="youth">Youth Leadership</option>
                       <option value="women">Women's Rights</option>
                       <option value="modern-martyrs">Modern Martyrs</option>
                     </>
                   ) : (
                     <>
                       <option value="democracy">Democracy & Elections</option>
                       <option value="human-rights">Human Rights</option>
                       <option value="corruption">Anti-Corruption</option>
                       <option value="land">Land Rights</option>
                       <option value="education">Education</option>
                       <option value="health">Healthcare</option>
                       <option value="environment">Environment</option>
                       <option value="youth">Youth Issues</option>
                       <option value="women">Women's Rights</option>
                     </>
                   )}
                 </FormSelect>
               </FormGroup>

               <FormGroup>
                 <FormLabel>County</FormLabel>
                 <FormInput
                   type="text"
                   value={submitForm.county}
                   onChange={(e) => handleFormChange('county', e.target.value)}
                   placeholder="Which county is this from?"
                 />
               </FormGroup>

               <FormGroup>
                 <FormLabel>Year</FormLabel>
                 <FormInput
                   type="number"
                   value={submitForm.year}
                   onChange={(e) => handleFormChange('year', e.target.value)}
                   placeholder="When did this happen? (e.g., 2020)"
                   min="1900"
                   max={new Date().getFullYear()}
                 />
               </FormGroup>

               <FormGroup>
                 <FormLabel>Source/Reference</FormLabel>
                 <FormInput
                   type="text"
                   value={submitForm.source}
                   onChange={(e) => handleFormChange('source', e.target.value)}
                   placeholder="Where did you learn about this? (news, book, etc.)"
                 />
               </FormGroup>

               <FormGroup>
                 <FormLabel>Image (Optional)</FormLabel>
                 <ImageUploadContainer>
                   {submitForm.image_url ? (
                     <ImagePreview>
                       <img src={submitForm.image_url} alt="Preview" />
                       <RemoveButton onClick={() => handleFormChange('image_url', '')}>
                         ×
                       </RemoveButton>
                     </ImagePreview>
                   ) : (
                     <ImageUploadArea>
                       <input
                         type="file"
                         id="submit-image-upload"
                         accept="image/*"
                         onChange={handleImageUpload}
                         style={{ display: 'none' }}
                       />
                       <label htmlFor="submit-image-upload">
                         <UploadIcon>📷</UploadIcon>
                         <UploadText>Click to upload image</UploadText>
                         <UploadHint>JPG, PNG, GIF up to 5MB</UploadHint>
                       </label>
                     </ImageUploadArea>
                   )}
                 </ImageUploadContainer>
               </FormGroup>

               <FormGroup>
                 <FormLabel>Your Contact (Optional)</FormLabel>
                 <FormInput
                   type="text"
                   value={submitForm.contact}
                   onChange={(e) => handleFormChange('contact', e.target.value)}
                   placeholder="Email or phone for follow-up questions"
                 />
               </FormGroup>

               <SubmitButton type="submit" disabled={isSubmitting}>
                 {isSubmitting ? 'Submitting...' : `Submit ${submitModalTab === 'hero' ? 'Hero' : 'Protest'} Request (+15 XP)`}
               </SubmitButton>
             </SubmitForm>
           </SubmitModalContent>
         </SubmitModal>
                )}



    </MemoryContainer>
  );
};

export default Memory;