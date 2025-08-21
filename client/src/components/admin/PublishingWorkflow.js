import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

// Styled Components
const WorkflowContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const WorkflowHeader = styled.div`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 24px;
  border-radius: 20px;
  margin-bottom: 24px;
  text-align: center;
`;

const WorkflowTitle = styled.h2`
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 8px;
`;

const WorkflowSubtitle = styled.p`
  opacity: 0.9;
  font-size: 16px;
`;

const WorkflowSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: var(--shadow-light);
  border: 1px solid var(--light-border);
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusPipeline = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px;
  background: var(--light-bg);
  border-radius: 12px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--light-border);
    z-index: 1;
  }
`;

const StatusStage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 2;
  
  &.active {
    color: #667eea;
    font-weight: 600;
    
    .icon {
      background: #667eea;
      color: white;
    }
  }
  
  &.completed {
    color: #4caf50;
    
    .icon {
      background: #4caf50;
      color: white;
    }
  }
  
  &.upcoming {
    color: var(--text-secondary);
    
    .icon {
      background: white;
      color: var(--text-secondary);
    }
  }
`;

const StatusIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  border: 3px solid white;
  box-shadow: var(--shadow-light);
  transition: all 0.3s ease;
`;

const StatusLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  text-align: center;
`;

const QualityChecklist = styled.div`
  margin-bottom: 24px;
`;

const ChecklistItem = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--light-bg);
  border-radius: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(102, 126, 234, 0.05);
  }
  
  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    accent-color: #667eea;
  }
  
  .checkmark {
    font-size: 18px;
    transition: all 0.2s ease;
  }
  
  .required {
    color: #e74c3c;
    font-weight: 600;
  }
`;

const PreviewSection = styled.div`
  margin-bottom: 24px;
`;

const PreviewButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
`;

const PreviewButton = styled.button`
  padding: 16px 20px;
  border: 2px solid var(--light-border);
  border-radius: 12px;
  background: white;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.05);
    transform: translateY(-1px);
  }
`;

const PublishControls = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;
`;

const PublishButton = styled.button`
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.primary {
    background: linear-gradient(135deg, #4caf50, #45a049);
    color: white;
  }
  
  &.secondary {
    background: var(--light-bg);
    color: var(--text-primary);
  }
  
  &.schedule {
    background: linear-gradient(135deg, #ff9800, #f57c00);
    color: white;
  }
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-medium);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const SettingsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
`;

const SettingsGroup = styled.div`
  h5 {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 12px;
  }
  
  label {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    cursor: pointer;
    
    input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: #667eea;
    }
  }
  
  select {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid var(--light-border);
    border-radius: 12px;
    font-size: 14px;
    background: white;
    cursor: pointer;
    margin-top: 8px;
    
    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
  }
`;

const WorkflowHistory = styled.div`
  margin-top: 24px;
`;

const HistoryItem = styled.div`
  background: var(--light-bg);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  border-left: 4px solid #667eea;
`;

const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const HistoryStatus = styled.div`
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  background: white;
  color: var(--text-primary);
`;

const HistoryDate = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
`;

const HistoryNotes = styled.div`
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.4;
`;

const PublishingWorkflow = ({ moduleId, isBuildingMode }) => {
  const [publishData, setPublishData] = useState({
    status: 'draft',
    publish_date: null,
    target_audience: [],
    accessibility_features: [],
    quality_checks: {
      title_engaging: false,
      media_included: false,
      kenyan_examples: false,
      quiz_tested: false,
      mobile_preview: false,
      duration_verified: false
    },
    publish_settings: {
      notify_subscribers: false,
      feature_homepage: false,
      push_notifications: false,
      category: ''
    },
    seo_metadata: {
      title: '',
      description: '',
      keywords: []
    }
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);
  const queryClient = useQueryClient();

  // Fetch module data
  const { data: moduleData, isLoading: moduleLoading } = useQuery(
    ['admin-module', moduleId],
    () => api.get(`/admin/learning-modules/${moduleId}`).then(res => res.data),
    {
      enabled: !!moduleId,
      onSuccess: (data) => {
        setPublishData(prev => ({ ...prev, status: data.status || 'draft' }));
      },
      onError: (error) => {
        console.error('Error fetching module:', error);
        toast.error('Failed to load module data');
      }
    }
  );

  // Fetch workflow history
  const { data: workflowHistory } = useQuery(
    ['admin-workflow', moduleId],
    () => api.get(`/admin/learning-modules/${moduleId}/workflow`).then(res => res.data),
    {
      enabled: !!moduleId,
      onError: (error) => {
        console.error('Error fetching workflow history:', error);
      }
    }
  );

  // Update module status mutation
  const updateStatusMutation = useMutation(
    (statusData) => api.put(`/admin/modules/${moduleId}/status`, statusData),
    {
      onSuccess: (data) => {
        toast.success(`Module status updated to ${data.new_status}`);
        queryClient.invalidateQueries(['admin-module', moduleId]);
        queryClient.invalidateQueries(['admin-workflow', moduleId]);
        setPublishData(prev => ({ ...prev, status: data.new_status }));
      },
      onError: (error) => {
        console.error('Error updating status:', error);
        toast.error('Failed to update module status');
      }
    }
  );

  // Handle quality check changes
  const handleQualityCheck = (key, checked) => {
    setPublishData(prev => ({
      ...prev,
      quality_checks: {
        ...prev.quality_checks,
        [key]: checked
      }
    }));
  };

  // Handle publish settings changes
  const handlePublishSetting = (key, value) => {
    setPublishData(prev => ({
      ...prev,
      publish_settings: {
        ...prev.publish_settings,
        [key]: value
      }
    }));
  };

  // Check if all required quality checks are complete
  const allRequiredChecksComplete = () => {
    const requiredChecks = ['title_engaging', 'media_included', 'kenyan_examples'];
    return requiredChecks.every(check => publishData.quality_checks[check]);
  };

  // Check if all quality checks are complete
  const allChecksComplete = () => {
    return Object.values(publishData.quality_checks).every(Boolean);
  };

  // Handle status update
  const handleStatusUpdate = (newStatus) => {
    const statusData = {
      status: newStatus,
      current_status: publishData.status,
      notes: `Status changed to ${newStatus}`,
      quality_checks: publishData.quality_checks
    };

    updateStatusMutation.mutate(statusData);
  };

  // Handle preview
  const openPreview = (type) => {
    // This would open different preview modes
    toast.success(`${type} preview opened`);
  };

  // Handle save draft
  const saveDraft = () => {
    handleStatusUpdate('draft');
  };

  // Handle submit for review
  const submitForReview = () => {
    if (!allRequiredChecksComplete()) {
      toast.error('Please complete all required quality checks');
      return;
    }
    handleStatusUpdate('review');
  };

  // Handle publish now
  const publishNow = () => {
    if (!allChecksComplete()) {
      toast.error('Please complete all quality checks');
      return;
    }
    handleStatusUpdate('published');
  };

  // Handle schedule publish
  const schedulePublish = () => {
    toast.success('Schedule publish functionality coming soon');
  };

  // Show building mode interface when no module is selected
  if (!moduleId && isBuildingMode) {
    return (
      <WorkflowContainer>
        <WorkflowHeader>
          <WorkflowTitle>🚀 Publishing Workflow</WorkflowTitle>
          <WorkflowSubtitle>Publish your new module</WorkflowSubtitle>
        </WorkflowHeader>
        
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-light)',
          border: '1px solid var(--light-border)',
          margin: '24px'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '24px' }}>📤</div>
          <h3 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '700', 
            color: '#1e293b', 
            marginBottom: '16px' 
          }}>
            Module Required First
          </h3>
          <p style={{ 
            fontSize: '1.1rem', 
            color: '#64748b', 
            lineHeight: '1.6',
            marginBottom: '24px'
          }}>
            To access the publishing workflow, you need to first create and save your module. 
            Go to the Module tab to set up your module structure.
          </p>
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('switchToModuleTab'));
            }}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Go to Module Builder →
          </button>
        </div>
      </WorkflowContainer>
    );
  }

  if (!moduleId && !isBuildingMode) {
    return (
      <WorkflowContainer>
        <WorkflowHeader>
          <WorkflowTitle>🚀 Publishing Workflow</WorkflowTitle>
          <WorkflowSubtitle>Select a module to manage its publishing workflow</WorkflowSubtitle>
        </WorkflowHeader>
        
        <WorkflowSection>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: 'var(--text-primary)',
              marginBottom: '8px'
            }}>
              No Module Selected
            </h3>
            <p style={{ 
              fontSize: '14px',
              color: 'var(--text-secondary)'
            }}>
              Please select a module from the Module Builder to manage its publishing workflow
            </p>
          </div>
        </WorkflowSection>
      </WorkflowContainer>
    );
  }

  if (moduleLoading) {
    return (
      <WorkflowContainer>
        <WorkflowHeader>
          <WorkflowTitle>🚀 Publishing Workflow</WorkflowTitle>
          <WorkflowSubtitle>Loading module data...</WorkflowSubtitle>
        </WorkflowHeader>
      </WorkflowContainer>
    );
  }

  const statusPipeline = [
    { status: 'draft', label: 'Draft', icon: '📝' },
    { status: 'review', label: 'Review', icon: '👀' },
    { status: 'ready', label: 'Ready', icon: '✅' },
    { status: 'published', label: 'Published', icon: '🚀' }
  ];

  const qualityCheckItems = {
    title_engaging: { label: 'Title is engaging & benefit-focused', required: true },
    media_included: { label: 'All lessons have media content', required: true },
    kenyan_examples: { label: 'Kenyan examples included', required: true },
    quiz_tested: { label: 'Quiz questions tested', required: false },
    mobile_preview: { label: 'Mobile preview completed', required: false },
    duration_verified: { label: 'Duration calculation verified', required: false }
  };

  return (
    <WorkflowContainer>
      <WorkflowHeader>
        <WorkflowTitle>🚀 Publishing Workflow</WorkflowTitle>
        <WorkflowSubtitle>
          Managing: {moduleData?.title || 'Module'} - Current Status: {publishData.status}
        </WorkflowSubtitle>
      </WorkflowHeader>

      {/* Status Pipeline */}
      <WorkflowSection>
        <SectionTitle>📊 PUBLISHING STATUS</SectionTitle>
        
        <StatusPipeline>
          {statusPipeline.map((stage, index) => {
            let stageClass = 'upcoming';
            if (publishData.status === stage.status) {
              stageClass = 'active';
            } else if (
              (stage.status === 'draft' && publishData.status !== 'draft') ||
              (stage.status === 'review' && ['ready', 'published'].includes(publishData.status)) ||
              (stage.status === 'ready' && publishData.status === 'published')
            ) {
              stageClass = 'completed';
            }

            return (
              <StatusStage key={stage.status} className={stageClass}>
                <StatusIcon className="icon">
                  {stage.icon}
                </StatusIcon>
                <StatusLabel>{stage.label}</StatusLabel>
              </StatusStage>
            );
          })}
        </StatusPipeline>
      </WorkflowSection>

      {/* Quality Checklist */}
      <WorkflowSection>
        <SectionTitle>✅ PRE-PUBLISH QUALITY CHECKLIST</SectionTitle>
        
        <QualityChecklist>
          {Object.entries(qualityCheckItems).map(([key, item]) => (
            <ChecklistItem key={key}>
              <input
                type="checkbox"
                checked={publishData.quality_checks[key]}
                onChange={(e) => handleQualityCheck(key, e.target.checked)}
                required={item.required}
              />
              <span className={`checkmark ${publishData.quality_checks[key] ? 'checked' : ''}`}>
                {publishData.quality_checks[key] ? '✅' : '☐'}
              </span>
              <span>{item.label}</span>
              {item.required && <span className="required">*</span>}
            </ChecklistItem>
          ))}
        </QualityChecklist>
      </WorkflowSection>

      {/* Preview Section */}
      <WorkflowSection>
        <SectionTitle>📱 PREVIEW YOUR MODULE</SectionTitle>
        
        <PreviewButtons>
          <PreviewButton onClick={() => openPreview('desktop')}>
            👁️ Desktop Preview
          </PreviewButton>
          <PreviewButton onClick={() => openPreview('mobile')}>
            📱 Mobile Preview
          </PreviewButton>
          <PreviewButton onClick={() => openPreview('student')}>
            🎯 Student Experience
          </PreviewButton>
          <PreviewButton onClick={() => openPreview('analytics')}>
            📊 Analytics View
          </PreviewButton>
        </PreviewButtons>
      </WorkflowSection>

      {/* Publish Controls */}
      <WorkflowSection>
        <SectionTitle>📤 PUBLISH CONTROLS</SectionTitle>
        
        <PublishControls>
          <PublishButton 
            className="secondary"
            onClick={saveDraft}
          >
            💾 Save Draft
          </PublishButton>
          <PublishButton 
            className="secondary"
            onClick={submitForReview}
            disabled={!allRequiredChecksComplete()}
          >
            📋 Submit for Review
          </PublishButton>
          <PublishButton 
            className="primary"
            onClick={publishNow}
            disabled={!allChecksComplete()}
          >
            ✅ Publish Now
          </PublishButton>
          <PublishButton 
            className="schedule"
            onClick={schedulePublish}
          >
            ⏰ Schedule Publish
          </PublishButton>
        </PublishControls>
        
        <SettingsSection>
          <SettingsGroup>
            <h5>📢 Notification Settings</h5>
            <label>
              <input 
                type="checkbox"
                checked={publishData.publish_settings.notify_subscribers}
                onChange={(e) => handlePublishSetting('notify_subscribers', e.target.checked)}
              />
              Notify subscribers when published
            </label>
            <label>
              <input 
                type="checkbox"
                checked={publishData.publish_settings.feature_homepage}
                onChange={(e) => handlePublishSetting('feature_homepage', e.target.checked)}
              />
              Feature on homepage
            </label>
            <label>
              <input 
                type="checkbox"
                checked={publishData.publish_settings.push_notifications}
                onChange={(e) => handlePublishSetting('push_notifications', e.target.checked)}
              />
              Send push notifications
            </label>
          </SettingsGroup>
          
          <SettingsGroup>
            <h5>🗂️ Organization</h5>
            <select
              value={publishData.publish_settings.category}
              onChange={(e) => handlePublishSetting('category', e.target.value)}
            >
              <option value="">Assign to Module Category...</option>
              <option value="constitution">Constitution Basics</option>
              <option value="democracy">Democratic Participation</option>
              <option value="rights">Rights & Justice</option>
              <option value="leadership">Leadership & Engagement</option>
            </select>
          </SettingsGroup>
        </SettingsSection>
      </WorkflowSection>

      {/* Workflow History */}
      {workflowHistory && workflowHistory.length > 0 && (
        <WorkflowSection>
          <SectionTitle>📋 WORKFLOW HISTORY</SectionTitle>
          
          <WorkflowHistory>
            {workflowHistory.map((item, index) => (
              <HistoryItem key={index}>
                <HistoryHeader>
                  <HistoryStatus>
                    {item.from_status} → {item.to_status}
                  </HistoryStatus>
                  <HistoryDate>
                    {new Date(item.created_at).toLocaleDateString()}
                  </HistoryDate>
                </HistoryHeader>
                {item.notes && (
                  <HistoryNotes>{item.notes}</HistoryNotes>
                )}
              </HistoryItem>
            ))}
          </WorkflowHistory>
        </WorkflowSection>
      )}
    </WorkflowContainer>
  );
};

export default PublishingWorkflow;
