import React, { useState, useEffect } from 'react';
import { useEnhancedUser } from '../../contexts/EnhancedUserContext';
import api from '../../utils/api';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';

const ModerationContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--light-border);
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
  text-transform: uppercase;
  font-weight: 500;
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 8px 16px;
  border-radius: 20px;
  border: 2px solid ${props => props.active ? 'var(--primary-color)' : 'var(--light-border)'};
  background: ${props => props.active ? 'var(--primary-color)' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--text-secondary)'};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }
`;

const BulkActionsContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  padding: 16px;
  background: var(--light-bg);
  border-radius: 8px;
  align-items: center;
`;

const BulkButton = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.approve {
    background: #10b981;
    color: white;
    
    &:hover {
      background: #059669;
    }
  }
  
  &.reject {
    background: #ef4444;
    color: white;
    
    &:hover {
      background: #dc2626;
    }
  }
  
  &.escalate {
    background: #f59e0b;
    color: white;
    
    &:hover {
      background: #d97706;
    }
  }
`;

const QueueItem = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--light-border);
  border-left: 4px solid ${props => {
    switch (props.priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'normal': return '#3b82f6';
      case 'low': return '#6b7280';
      default: return '#6b7280';
    }
  }};
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const ItemTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;

const PriorityBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  
  &.urgent {
    background: #fef2f2;
    color: #dc2626;
  }
  
  &.high {
    background: #fffbeb;
    color: #d97706;
  }
  
  &.normal {
    background: #eff6ff;
    color: #2563eb;
  }
  
  &.low {
    background: #f3f4f6;
    color: #6b7280;
  }
`;

const ItemContent = styled.div`
  margin-bottom: 16px;
`;

const ContentText = styled.p`
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 12px;
`;

const ItemMeta = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  font-size: 14px;
  color: var(--text-secondary);
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const TrustScore = styled.span`
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  
  &.high {
    background: #dcfce7;
    color: #166534;
  }
  
  &.medium {
    background: #fef3c7;
    color: #92400e;
  }
  
  &.low {
    background: #f3f4f6;
    color: #374151;
  }
`;

const ItemActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.approve {
    background: #10b981;
    color: white;
    
    &:hover {
      background: #059669;
    }
  }
  
  &.reject {
    background: #ef4444;
    color: white;
    
    &:hover {
      background: #dc2626;
    }
  }
  
  &.escalate {
    background: #f59e0b;
    color: white;
    
    &:hover {
      background: #d97706;
    }
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const EnhancedModerationQueue = () => {
  const { user, checkPermission } = useEnhancedUser();
  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({ status: 'pending', priority: 'all' });
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/moderation/queue', { params: filters });
      setQueue(response.data);
    } catch (error) {
      console.error('Error loading moderation queue:', error);
      toast.error('Failed to load moderation queue');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/api/moderation/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error loading moderation stats:', error);
    }
  };

  useEffect(() => {
    if (checkPermission('approve_content')) {
      loadQueue();
      loadStats();
    }
  }, [filters, checkPermission]);

  // Check permissions
  if (!checkPermission('approve_content')) {
    return (
      <ModerationContainer>
        <EmptyState>
          <EmptyIcon>🔒</EmptyIcon>
          <h3>Access Denied</h3>
          <p>You don't have permission to access the moderation queue.</p>
        </EmptyState>
      </ModerationContainer>
    );
  }

  const handleApprove = async (itemId) => {
    try {
      await api.put(`/api/moderation/approve/${itemId}`, {
        review_notes: 'Approved by moderator'
      });
      toast.success('Content approved');
      loadQueue();
      loadStats();
    } catch (error) {
      console.error('Error approving content:', error);
      toast.error('Failed to approve content');
    }
  };

  const handleReject = async (itemId) => {
    try {
      await api.put(`/api/moderation/reject/${itemId}`, {
        review_notes: 'Rejected by moderator'
      });
      toast.success('Content rejected');
      loadQueue();
      loadStats();
    } catch (error) {
      console.error('Error rejecting content:', error);
      toast.error('Failed to reject content');
    }
  };

  const handleEscalate = async (itemId) => {
    try {
      await api.put(`/api/moderation/escalate/${itemId}`, {
        review_notes: 'Escalated to admin'
      });
      toast.success('Content escalated to admin');
      loadQueue();
      loadStats();
    } catch (error) {
      console.error('Error escalating content:', error);
      toast.error('Failed to escalate content');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedItems.length === 0) {
      toast.error('Please select items first');
      return;
    }

    try {
      const promises = selectedItems.map(itemId => {
        switch (action) {
          case 'approve':
            return api.put(`/api/moderation/approve/${itemId}`, {
              review_notes: 'Bulk approved by moderator'
            });
          case 'reject':
            return api.put(`/api/moderation/reject/${itemId}`, {
              review_notes: 'Bulk rejected by moderator'
            });
          case 'escalate':
            return api.put(`/api/moderation/escalate/${itemId}`, {
              review_notes: 'Bulk escalated to admin'
            });
          default:
            return Promise.resolve();
        }
      });

      await Promise.all(promises);
      toast.success(`Bulk ${action} completed`);
      setSelectedItems([]);
      loadQueue();
      loadStats();
    } catch (error) {
      console.error(`Error bulk ${action}:`, error);
      toast.error(`Failed to bulk ${action}`);
    }
  };

  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getTrustLevel = (trustScore) => {
    if (trustScore >= 3.0) return { level: 'high', label: 'Trusted' };
    if (trustScore >= 2.0) return { level: 'medium', label: 'Reliable' };
    return { level: 'low', label: 'New' };
  };

  const filteredQueue = queue.filter(item => {
    if (filters.status !== 'all' && item.status !== filters.status) return false;
    if (filters.priority !== 'all' && item.priority !== filters.priority) return false;
    return true;
  });

  return (
    <ModerationContainer>
      <Header>
        <Title>🛡️ Moderation Queue</Title>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatValue>{stats.pending || 0}</StatValue>
          <StatLabel>Pending Review</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.urgent || 0}</StatValue>
          <StatLabel>Urgent</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.approved || 0}</StatValue>
          <StatLabel>Approved Today</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.rejected || 0}</StatValue>
          <StatLabel>Rejected Today</StatLabel>
        </StatCard>
      </StatsGrid>

      <FiltersContainer>
        <FilterButton
          active={filters.status === 'all'}
          onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))}
        >
          All Status
        </FilterButton>
        <FilterButton
          active={filters.status === 'pending'}
          onClick={() => setFilters(prev => ({ ...prev, status: 'pending' }))}
        >
          Pending
        </FilterButton>
        <FilterButton
          active={filters.priority === 'all'}
          onClick={() => setFilters(prev => ({ ...prev, priority: 'all' }))}
        >
          All Priority
        </FilterButton>
        <FilterButton
          active={filters.priority === 'urgent'}
          onClick={() => setFilters(prev => ({ ...prev, priority: 'urgent' }))}
        >
          Urgent
        </FilterButton>
        <FilterButton
          active={filters.priority === 'high'}
          onClick={() => setFilters(prev => ({ ...prev, priority: 'high' }))}
        >
          High
        </FilterButton>
      </FiltersContainer>

      {selectedItems.length > 0 && (
        <BulkActionsContainer>
          <span>{selectedItems.length} items selected</span>
          <BulkButton className="approve" onClick={() => handleBulkAction('approve')}>
            ✅ Approve All
          </BulkButton>
          <BulkButton className="reject" onClick={() => handleBulkAction('reject')}>
            ❌ Reject All
          </BulkButton>
          <BulkButton className="escalate" onClick={() => handleBulkAction('escalate')}>
            ⚡ Escalate All
          </BulkButton>
        </BulkActionsContainer>
      )}

      {loading ? (
        <EmptyState>
          <EmptyIcon>⏳</EmptyIcon>
          <h3>Loading...</h3>
        </EmptyState>
      ) : filteredQueue.length === 0 ? (
        <EmptyState>
          <EmptyIcon>✅</EmptyIcon>
          <h3>No items in queue</h3>
          <p>All content has been reviewed</p>
        </EmptyState>
      ) : (
        filteredQueue.map(item => {
          const trustLevel = getTrustLevel(item.author_trust_score);
          
          return (
            <QueueItem key={item.id} priority={item.priority}>
              <ItemHeader>
                <ItemTitle>
                  {item.content_type === 'post' ? '📝 Post' : '📋 Submission'} #{item.content_id}
                </ItemTitle>
                <PriorityBadge className={item.priority}>
                  {item.priority}
                </PriorityBadge>
              </ItemHeader>

              <ItemContent>
                <ContentText>{item.content_preview}</ContentText>
              </ItemContent>

              <ItemMeta>
                <MetaItem>
                  <span>👤</span>
                  <span>{item.author_nickname || 'Anonymous'}</span>
                  <TrustScore className={trustLevel.level}>
                    {trustLevel.label}
                  </TrustScore>
                </MetaItem>
                <MetaItem>
                  <span>📅</span>
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                </MetaItem>
                <MetaItem>
                  <span>🏷️</span>
                  <span>{item.flag_reason || 'No reason provided'}</span>
                </MetaItem>
                <MetaItem>
                  <span>🚩</span>
                  <span>{item.community_flags || 0} community flags</span>
                </MetaItem>
              </ItemMeta>

              <ItemActions>
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => toggleItemSelection(item.id)}
                  style={{ marginRight: '8px' }}
                />
                <ActionButton
                  className="approve"
                  onClick={() => handleApprove(item.id)}
                >
                  ✅ Approve
                </ActionButton>
                <ActionButton
                  className="reject"
                  onClick={() => handleReject(item.id)}
                >
                  ❌ Reject
                </ActionButton>
                <ActionButton
                  className="escalate"
                  onClick={() => handleEscalate(item.id)}
                >
                  ⚡ Escalate
                </ActionButton>
              </ItemActions>
            </QueueItem>
          );
        })
      )}
    </ModerationContainer>
  );
};

export default EnhancedModerationQueue;
