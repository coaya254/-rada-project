import React, { useState } from 'react';
import { useEnhancedUser } from '../contexts/EnhancedUserContext';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';

const SecurityContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const SecurityCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  color: white;
`;

const SecurityTitle = styled.h2`
  font-size: 24px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SecuritySubtitle = styled.p`
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 30px;
`;

const SecuritySection = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SectionDescription = styled.p`
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 20px;
  line-height: 1.5;
`;

const SecurityButton = styled.button`
  background: ${props => props.danger ? 'linear-gradient(135deg, #ff6b6b, #ee5a52)' : 'linear-gradient(135deg, #4ecdc4, #44a08d)'};
  color: white;
  border: none;
  border-radius: 10px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 10px;
  margin-bottom: 10px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const WarningBox = styled.div`
  background: rgba(255, 193, 7, 0.2);
  border: 2px solid #ffc107;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
`;

const WarningTitle = styled.h4`
  color: #ffc107;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const WarningText = styled.p`
  font-size: 14px;
  line-height: 1.5;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  margin-bottom: 15px;
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.active ? '#4caf50' : '#f44336'};
`;

const AdminSecurityPanel = () => {
  const { user, checkPermission, globalLogout } = useEnhancedUser();
  const [loading, setLoading] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  // Check if user has admin permissions
  if (!checkPermission('*') && user?.role !== 'admin') {
    return (
      <SecurityContainer>
        <SecurityCard>
          <SecurityTitle>🚫 Access Denied</SecurityTitle>
          <SecuritySubtitle>
            You don't have permission to access the security panel.
          </SecuritySubtitle>
        </SecurityCard>
      </SecurityContainer>
    );
  }

  const handleGlobalLogout = async () => {
    if (!confirmLogout) {
      setConfirmLogout(true);
      toast.error('Click the button again to confirm global logout');
      return;
    }

    setLoading(true);
    try {
      const result = await globalLogout();
      if (result.success) {
        toast.success('All users have been logged out successfully');
      } else {
        toast.error('Failed to logout all users');
      }
    } catch (error) {
      toast.error('An error occurred during global logout');
    } finally {
      setLoading(false);
      setConfirmLogout(false);
    }
  };

  return (
    <SecurityContainer>
      <SecurityCard>
        <SecurityTitle>🔐 Security Panel</SecurityTitle>
        <SecuritySubtitle>
          Manage system security and user sessions
        </SecuritySubtitle>

        <StatusIndicator>
          <StatusDot active={true} />
          <span>System Status: Secure</span>
        </StatusIndicator>

        <WarningBox>
          <WarningTitle>⚠️ Important Security Notice</WarningTitle>
          <WarningText>
            The global logout feature will force ALL users to re-authenticate. 
            This includes anonymous users, staff members, and administrators. 
            Use this feature only when necessary for security purposes.
          </WarningText>
        </WarningBox>

        <SecuritySection>
          <SectionTitle>🔄 Global Session Management</SectionTitle>
          <SectionDescription>
            Force all users to log out and re-authenticate. This will clear all 
            active sessions and require users to go through the authentication 
            process again.
          </SectionDescription>
          
          <SecurityButton
            danger
            onClick={handleGlobalLogout}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmLogout ? 'Confirm Global Logout' : 'Force Logout All Users'}
          </SecurityButton>
        </SecuritySection>

        <SecuritySection>
          <SectionTitle>📊 Session Statistics</SectionTitle>
          <SectionDescription>
            View current session statistics and system health metrics.
          </SectionDescription>
          
          <SecurityButton>
            View Session Analytics
          </SecurityButton>
        </SecuritySection>

        <SecuritySection>
          <SectionTitle>🛡️ Security Settings</SectionTitle>
          <SectionDescription>
            Configure security parameters and access controls.
          </SectionDescription>
          
          <SecurityButton>
            Security Configuration
          </SecurityButton>
        </SecuritySection>
      </SecurityCard>
    </SecurityContainer>
  );
};

export default AdminSecurityPanel;
