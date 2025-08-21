import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useEnhancedUser } from '../contexts/EnhancedUserContext';
import PrivacyIndicator from './PrivacyIndicator';
import EmojiPicker from './EmojiPicker';

const SettingsContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin: 0;
`;

const PrivacyStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #F0F8FF;
  border-radius: 12px;
  border: 1px solid #E1F0FF;
  margin-bottom: 20px;
`;

const StatusText = styled.div`
  flex: 1;
`;

const StatusTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #007AFF;
  margin: 0 0 4px 0;
`;

const StatusDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.4;
`;

const SettingItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #F2F2F7;
  
  &:last-child {
    border-bottom: none;
  }
`;

const SettingInfo = styled.div`
  flex: 1;
`;

const SettingTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
`;

const SettingDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.4;
`;

const AvatarButton = styled(motion.button)`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  border: 2px solid #E5E5E7;
  background: white;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #007AFF;
    transform: scale(1.05);
  }
`;

const Button = styled(motion.button)`
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.secondary {
    background: #F2F2F7;
    color: #666;
  }
  
  &.danger {
    background: #FF3B30;
    color: white;
  }
`;

const DangerZone = styled.div`
  margin-top: 32px;
  padding-top: 24px;
  border-top: 2px solid #FF3B30;
`;

const DangerTitle = styled.h4`
  font-size: 16px;
  font-weight: 700;
  color: #FF3B30;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DangerDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0 0 16px 0;
  line-height: 1.4;
`;

const PrivacySettings = () => {
  const { user, updateProfile, deleteUserData  } = useEnhancedUser();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleEmojiSelect = async (emoji) => {
    try {
      await updateProfile({ emoji });
    } catch (error) {
      console.error('Error updating emoji:', error);
    }
  };

  const handleDeleteData = () => {
    if (window.confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
      deleteUserData();
    }
  };

  return (
    <SettingsContainer>
      <SectionHeader>
        <span>🛡️</span>
        <SectionTitle>Privacy & AnonMode™</SectionTitle>
      </SectionHeader>

      <PrivacyStatus>
        <PrivacyIndicator variant="large" />
        <StatusText>
          <StatusTitle>Your Identity is Protected</StatusTitle>
          <StatusDescription>
            All your data is stored locally and never linked to your real identity. 
            You can delete your data at any time.
          </StatusDescription>
        </StatusText>
      </PrivacyStatus>

      <SettingItem>
        <SettingInfo>
          <SettingTitle>Anonymous Avatar</SettingTitle>
          <SettingDescription>
            Choose an emoji to represent you. This is stored locally only.
          </SettingDescription>
        </SettingInfo>
        <AvatarButton
          onClick={() => setShowEmojiPicker(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {user?.emoji || '🧑'}
        </AvatarButton>
      </SettingItem>

      <SettingItem>
        <SettingInfo>
          <SettingTitle>Display Name</SettingTitle>
          <SettingDescription>
            Your current display name: <strong>{user?.nickname || 'Anonymous'}</strong>
          </SettingDescription>
        </SettingInfo>
        <Button 
          className="secondary"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Edit
        </Button>
      </SettingItem>

      <SettingItem>
        <SettingInfo>
          <SettingTitle>Local Storage</SettingTitle>
          <SettingDescription>
            Your profile data is stored locally on your device for maximum privacy.
          </SettingDescription>
        </SettingInfo>
        <PrivacyIndicator variant="compact" />
      </SettingItem>

      <DangerZone>
        <DangerTitle>
          ⚠️ Danger Zone
        </DangerTitle>
        <DangerDescription>
          These actions will permanently delete your data and cannot be undone.
        </DangerDescription>
        
        <SettingItem>
          <SettingInfo>
            <SettingTitle>Delete All Data</SettingTitle>
            <SettingDescription>
              Permanently delete your profile, settings, and all local data.
            </SettingDescription>
          </SettingInfo>
          <Button 
            className="danger"
            onClick={handleDeleteData}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Delete
          </Button>
        </SettingItem>
      </DangerZone>

      <EmojiPicker
        isOpen={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onSelect={handleEmojiSelect}
        currentEmoji={user?.emoji || '🧑'}
      />
    </SettingsContainer>
  );
};

export default PrivacySettings;
