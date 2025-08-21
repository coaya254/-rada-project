import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import { useEnhancedUser } from '../contexts/EnhancedUserContext';
import api from '../utils/api';
import PromiseEvidenceModal from '../components/PromiseEvidenceModal';

const PromisesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  background: var(--light-bg);
`;

const PageHeader = styled.div`
  background: linear-gradient(135deg, #3f51b5, #2196f3);
  color: white;
  padding: 24px 20px;
  text-align: center;
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 8px;
`;

const PageSubtitle = styled.p`
  opacity: 0.9;
  font-size: 16px;
  margin-bottom: 20px;
`;

const FilterSection = styled.div`
  background: white;
  padding: 16px 20px;
  border-bottom: 1px solid var(--light-border);
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
`;

const FilterTab = styled.button`
  padding: 8px 16px;
  border-radius: 20px;
  border: 2px solid ${props => props.active ? 'var(--rada-blue)' : 'var(--light-border)'};
  background: ${props => props.active ? 'var(--rada-blue)' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--text-secondary)'};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const PromiseCard = styled(motion.div)`
  background: white;
  margin: 16px 20px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-light);
  border: 1px solid var(--light-border);
`;

const PromiseHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid var(--light-border);
`;

const PromiseTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
  line-height: 1.4;
`;

const PromiseDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const PromiseAuthor = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
`;

const PromiseDate = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    switch (props.status) {
      case 'fulfilled': return '#e8f5e8';
      case 'in-progress': return '#fff3cd';
      case 'broken': return '#f8d7da';
      default: return '#e9ecef';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'fulfilled': return '#155724';
      case 'in-progress': return '#856404';
      case 'broken': return '#721c24';
      default: return '#495057';
    }
  }};
`;

const PromiseContent = styled.div`
  padding: 0 20px 20px;
`;

const PromiseDescription = styled.p`
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
`;

const Tag = styled.span`
  background: rgba(63, 81, 181, 0.1);
  color: #3f51b5;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
`;

const PromiseStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: var(--light-bg);
`;

const StatItem = styled.div`
  text-align: center;
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: var(--rada-blue);
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: var(--text-secondary);
  text-transform: uppercase;
  font-weight: 600;
`;

const TrackButton = styled(motion.button)`
  background: var(--rada-blue);
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
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

const filterTabs = [
  { key: 'all', label: 'All Promises' },
  { key: 'fulfilled', label: 'Fulfilled' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'broken', label: 'Broken' }
];

const Promises = () => {
  const { user, awardXP  } = useEnhancedUser();
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedPromise, setSelectedPromise] = useState(null);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);

  const { data: promisesData, isLoading, refetch } = useQuery(
    ['promises', activeFilter],
    () => api.get('/promises', {
      params: activeFilter !== 'all' ? { status: activeFilter } : {}
    }),
    {
      select: (response) => response.data || [],
      onError: () => {
        // Fallback to sample data if API fails
        return [];
      }
    }
  );

  // Sample promise data for demonstration
  const samplePromises = [
    {
      id: 1,
      title: "Build 10,000 Affordable Housing Units",
      description: "Promise to construct affordable housing units across major cities to address the housing crisis.",
      author: "President William Ruto",
      date_made: "2024-01-15",
      status: "in-progress",
      tags: ["housing", "infrastructure", "affordable"],
      tracking_count: 1247,
      evidence: [],
      county: "National"
    },
    {
      id: 2,
      title: "Complete Thika Superhighway Expansion",
      description: "Expand the Thika Superhighway to 8 lanes and add modern interchanges for better traffic flow.",
      author: "Transport CS Kipchumba Murkomen",
      date_made: "2024-02-20",
      status: "fulfilled",
      tags: ["transport", "infrastructure", "Nairobi"],
      tracking_count: 892,
      evidence: [
        { type: "photo", description: "Completed highway expansion", confidence: "high" }
      ],
      county: "Nairobi"
    },
    {
      id: 3,
      title: "Provide Free Primary Education",
      description: "Ensure all children have access to free primary education with quality learning materials.",
      author: "Education CS Ezekiel Machogu",
      date_made: "2024-03-10",
      status: "in-progress",
      tags: ["education", "children", "free"],
      tracking_count: 2156,
      evidence: [
        { type: "document", description: "Education policy document", confidence: "medium" }
      ],
      county: "National"
    },
    {
      id: 4,
      title: "Improve Healthcare in Rural Areas",
      description: "Build and equip 50 new health centers in rural counties to improve healthcare access.",
      author: "Health CS Susan Nakhumicha",
      date_made: "2024-01-30",
      status: "pending",
      tags: ["healthcare", "rural", "infrastructure"],
      tracking_count: 567,
      evidence: [],
      county: "Multiple Counties"
    },
    {
      id: 5,
      title: "Create 1 Million Jobs for Youth",
      description: "Launch programs to create employment opportunities for young people across various sectors.",
      author: "Youth Affairs CS Florence Bore",
      date_made: "2024-02-15",
      status: "in-progress",
      tags: ["youth", "employment", "jobs"],
      tracking_count: 1890,
      evidence: [
        { type: "news", description: "Youth employment program launch", confidence: "medium" }
      ],
      county: "National"
    }
  ];

  // Use sample data if API doesn't return results
  const allPromises = promisesData && promisesData.length > 0 ? promisesData : samplePromises;
  
  // Filter promises based on active filter
  const displayPromises = activeFilter === 'all' 
    ? allPromises 
    : allPromises.filter(promise => promise.status === activeFilter);

  const handleTrackPromise = async (promiseId) => {
    if (!user) {
      toast.error('Please complete setup to track promises');
      return;
    }

    try {
      await api.post(`/promises/${promiseId}/track`, {
        uuid: user.uuid
      });

      await awardXP('track_promise', 15, promiseId, 'promise');
      toast.success('Promise tracked! (+15 XP) 📊');
      
      refetch();
    } catch (error) {
      console.error('Error tracking promise:', error);
      if (error.response?.status === 400) {
        toast.error('You are already tracking this promise');
      } else {
        toast.error('Failed to track promise');
      }
    }
  };

  const handleSubmitEvidence = (promise) => {
    setSelectedPromise(promise);
    setShowEvidenceModal(true);
  };

  const handleEvidenceSubmitted = () => {
    refetch();
    setShowEvidenceModal(false);
    setSelectedPromise(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date unknown';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <PromisesContainer>
        <PageHeader>
          <PageTitle>📊 Promise Tracker</PageTitle>
          <PageSubtitle>Hold leaders accountable. Track what matters.</PageSubtitle>
        </PageHeader>
        
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
      </PromisesContainer>
    );
  }

  return (
    <PromisesContainer>
      <PageHeader>
        <PageTitle>📊 Promise Tracker</PageTitle>
        <PageSubtitle>Hold leaders accountable. Track what matters.</PageSubtitle>
      </PageHeader>

      <FilterSection>
        <FilterTabs>
          {filterTabs.map((tab) => (
            <FilterTab
              key={tab.key}
              active={activeFilter === tab.key}
              onClick={() => setActiveFilter(tab.key)}
            >
              {tab.label}
            </FilterTab>
          ))}
        </FilterTabs>
      </FilterSection>

      {displayPromises && displayPromises.length > 0 ? (
        displayPromises.map((promise) => (
          <PromiseCard
            key={promise.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
          >
            <PromiseHeader>
              <PromiseDetails>
                <PromiseAuthor>{promise.author || 'Government Official'}</PromiseAuthor>
                <PromiseDate>{formatDate(promise.date_made)}</PromiseDate>
              </PromiseDetails>
              
              <PromiseTitle>{promise.title}</PromiseTitle>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <StatusBadge status={promise.status}>
                  {promise.status || 'pending'}
                </StatusBadge>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <TrackButton
                    onClick={() => handleTrackPromise(promise.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Track This
                  </TrackButton>
                  <TrackButton
                    onClick={() => handleSubmitEvidence(promise)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ background: '#4caf50' }}
                  >
                    Submit Evidence
                  </TrackButton>
                </div>
              </div>
            </PromiseHeader>

            <PromiseContent>
              {promise.description && (
                <PromiseDescription>{promise.description}</PromiseDescription>
              )}

              {promise.tags && promise.tags.length > 0 && (
                <TagsContainer>
                  {promise.tags.map((tag, index) => (
                    <Tag key={index}>#{tag}</Tag>
                  ))}
                </TagsContainer>
              )}
            </PromiseContent>

            <PromiseStats>
              <StatItem>
                <StatValue>{promise.tracking_count || 0}</StatValue>
                <StatLabel>Trackers</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{promise.evidence?.length || 0}</StatValue>
                <StatLabel>Evidence</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{promise.county || 'National'}</StatValue>
                <StatLabel>Scope</StatLabel>
              </StatItem>
            </PromiseStats>
          </PromiseCard>
        ))
      ) : (
        <EmptyState>
          <EmptyIcon>📊</EmptyIcon>
          <h3>No promises yet</h3>
          <p>Political promises will appear here for tracking and accountability</p>
        </EmptyState>
      )}

      {/* Evidence Modal */}
      <PromiseEvidenceModal
        isOpen={showEvidenceModal}
        onClose={() => setShowEvidenceModal(false)}
        promise={selectedPromise}
        onEvidenceSubmitted={handleEvidenceSubmitted}
      />
    </PromisesContainer>
  );
};

export default Promises;