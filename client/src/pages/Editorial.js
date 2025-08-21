import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import { useEnhancedUser } from '../contexts/EnhancedUserContext';
import api from '../utils/api';

const EditorialContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  background: var(--light-bg);
`;

const EditorialHeader = styled.div`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 24px 20px;
  text-align: center;
`;

const EditorialTitle = styled.h1`
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 8px;
`;

const EditorialSubtitle = styled.p`
  opacity: 0.9;
  font-size: 16px;
  margin-bottom: 20px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  backdrop-filter: blur(10px);
`;

const StatCard = styled.div`
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 11px;
  opacity: 0.9;
  text-transform: uppercase;
`;

const TabContainer = styled.div`
  background: white;
  padding: 16px 20px;
  border-bottom: 1px solid var(--light-border);
  display: flex;
  gap: 8px;
  overflow-x: auto;
`;

const Tab = styled.button`
  padding: 8px 16px;
  border-radius: 20px;
  border: 2px solid ${props => props.active ? '#667eea' : 'var(--light-border)'};
  background: ${props => props.active ? '#667eea' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--text-secondary)'};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
`;

const ContentCard = styled.div`
  background: white;
  margin: 16px 20px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-light);
  border: 1px solid var(--light-border);
`;

const CardHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid var(--light-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
`;

const CardMeta = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
`;

const CardContent = styled.div`
  padding: 16px 20px;
`;

const CardDescription = styled.p`
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 12px;
`;

const CardDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  font-size: 12px;
  color: var(--text-secondary);
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const CardActions = styled.div`
  padding: 16px 20px;
  border-top: 1px solid var(--light-border);
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  font-size: 12px;
  font-weight: 600;
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
  
  &.edit {
    background: #3b82f6;
    color: white;
    
    &:hover {
      background: #2563eb;
    }
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
`;

const AddContentButton = styled.button`
  position: fixed;
  bottom: 160px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-secondary);
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const FormLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary);
`;

const FormInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid var(--light-border);
  border-radius: 8px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid var(--light-border);
  border-radius: 8px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid var(--light-border);
  border-radius: 8px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const TabButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const TabButton = styled.button`
  padding: 8px 16px;
  border-radius: 20px;
  border: 2px solid ${props => props.active ? '#667eea' : 'var(--light-border)'};
  background: ${props => props.active ? '#667eea' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--text-secondary)'};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
`;

const ManageContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  padding: 20px;
`;

const ManageCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: var(--shadow-light);
  border: 1px solid var(--light-border);
`;

const ManageCardTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--text-primary);
`;

const ManageCardDescription = styled.p`
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 12px;
  line-height: 1.4;
`;

const ManageCardActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ManageButton = styled.button`
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.edit {
    background: #3b82f6;
    color: white;
  }
  
  &.delete {
    background: #ef4444;
    color: white;
  }
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

const Editorial = () => {
  const { user, checkPermission } = useEnhancedUser();
  const [activeTab, setActiveTab] = useState('submissions');
  const queryClient = useQueryClient();

  // Check if user has moderation permissions
  const isEditorial = checkPermission('approve_content') || 
                     checkPermission('manage_flags') || 
                     user?.role === 'moderator' || 
                     user?.role === 'admin';

  // Fetch submission requests
  const { data: submissions, isLoading: submissionsLoading } = useQuery(
    ['submit-requests'],
    () => api.get('/submit-requests'),
    {
      select: (response) => response.data,
      enabled: isEditorial
    }
  );

  // Fetch memory archive stats
  const { data: memoryStats } = useQuery(
    ['memory-stats'],
    () => api.get('/memory'),
    {
      select: (response) => response.data,
      enabled: isEditorial
    }
  );

  // Fetch protest stats
  const { data: protestStats } = useQuery(
    ['protest-stats'],
    () => api.get('/protests'),
    {
      select: (response) => response.data,
      enabled: isEditorial
    }
  );

  // Update submission status mutation
  const updateSubmissionMutation = useMutation(
    ({ id, status, review_notes }) => 
      api.put(`/submit-requests/${id}/status`, { status, review_notes }),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['submit-requests']);
        toast.success(`Submission ${variables.status === 'approved' ? 'approved' : 'rejected'}!`);
      },
      onError: () => {
        toast.error('Failed to update submission');
      }
    }
  );

  const handleApprove = (submission) => {
    updateSubmissionMutation.mutate({
      id: submission.id,
      status: 'approved',
      review_notes: 'Approved by editorial team'
    });
  };

  const handleReject = (submission) => {
    updateSubmissionMutation.mutate({
      id: submission.id,
      status: 'rejected',
      review_notes: 'Rejected by editorial team'
    });
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    type: 'hero',
    name: '',
    title: '',
    description: '',
    county: '',
    year: '',
    category: '',
    image_url: ''
  });

  const handleAddContent = () => {
    setShowAddModal(true);
  };

  const handleFormChange = (field, value) => {
    setAddForm(prev => ({ ...prev, [field]: value }));
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
        setAddForm(prev => ({ ...prev, image_url: response.data.imageUrl }));
        toast.success('Image uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    }
  };

  const handleSubmitNewContent = async () => {
    try {
      if (addForm.type === 'hero') {
        await api.post('/memory', {
          name: addForm.name,
          achievement: addForm.description,
          date_of_death: addForm.year ? `${addForm.year}-01-01` : null,
          county: addForm.county,
          category: addForm.category,
          tags: JSON.stringify([addForm.category]),
          verified: 1
        });
      } else {
        await api.post('/protests', {
          title: addForm.title,
          description: addForm.description,
          date: addForm.year ? `${addForm.year}-01-01` : null,
          location: addForm.county,
          county: addForm.county,
          category: addForm.category,
          tags: JSON.stringify([addForm.category]),
          verified: 1
        });
      }
      
      toast.success(`${addForm.type === 'hero' ? 'Hero' : 'Protest'} added successfully!`);
      setShowAddModal(false);
      setAddForm({
        type: 'hero',
        name: '',
        title: '',
        description: '',
        county: '',
        year: '',
        category: '',
        image_url: ''
      });
      queryClient.invalidateQueries(['memory-stats']);
      queryClient.invalidateQueries(['protest-stats']);
    } catch (error) {
      toast.error('Failed to add content');
    }
  };

  if (!isEditorial) {
    return (
      <EditorialContainer>
        <EmptyState>
          <EmptyIcon>🔒</EmptyIcon>
          <h3>Access Restricted</h3>
          <p>Editorial privileges required to view this page</p>
        </EmptyState>
      </EditorialContainer>
    );
  }

  const pendingSubmissions = submissions?.filter(s => s.status === 'pending') || [];
  const approvedSubmissions = submissions?.filter(s => s.status === 'approved') || [];
  const rejectedSubmissions = submissions?.filter(s => s.status === 'rejected') || [];

  return (
    <EditorialContainer>
      <EditorialHeader>
        <EditorialTitle>📝 Editorial Panel</EditorialTitle>
        <EditorialSubtitle>Manage Civic Memory Archive content and submissions</EditorialSubtitle>
        
        <StatsGrid>
          <StatCard>
            <StatValue>{pendingSubmissions.length}</StatValue>
            <StatLabel>Pending</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{memoryStats?.length || 0}</StatValue>
            <StatLabel>Heroes</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{protestStats?.length || 0}</StatValue>
            <StatLabel>Protests</StatLabel>
          </StatCard>
        </StatsGrid>
      </EditorialHeader>

      <TabContainer>
        <Tab 
          active={activeTab === 'submissions'} 
          onClick={() => setActiveTab('submissions')}
        >
          📝 Submissions ({pendingSubmissions.length})
        </Tab>
        <Tab 
          active={activeTab === 'approved'} 
          onClick={() => setActiveTab('approved')}
        >
          ✅ Approved ({approvedSubmissions.length})
        </Tab>
        <Tab 
          active={activeTab === 'rejected'} 
          onClick={() => setActiveTab('rejected')}
        >
          ❌ Rejected ({rejectedSubmissions.length})
        </Tab>
        <Tab 
          active={activeTab === 'manage'} 
          onClick={() => setActiveTab('manage')}
        >
          🛠️ Manage Content
        </Tab>
      </TabContainer>

      {activeTab === 'submissions' && (
        <div>
          {pendingSubmissions.length === 0 ? (
            <EmptyState>
              <EmptyIcon>📝</EmptyIcon>
              <h3>No Pending Submissions</h3>
              <p>All submissions have been reviewed</p>
            </EmptyState>
          ) : (
            pendingSubmissions.map((submission) => (
              <ContentCard key={submission.id}>
                <CardHeader>
                  <div>
                    <CardTitle>
                      {submission.type === 'hero' ? '🦸‍♂️' : '📢'} {submission.name || submission.title}
                    </CardTitle>
                    <CardMeta>
                      Submitted by {submission.user_nickname || 'Anonymous'} • {new Date(submission.submitted_at).toLocaleDateString()}
                    </CardMeta>
                  </div>
                </CardHeader>
                
                                 <CardContent>
                   {submission.image_url && (
                     <div style={{ 
                       width: '100%', 
                       height: '120px', 
                       backgroundImage: `url(${submission.image_url})`,
                       backgroundSize: 'cover',
                       backgroundPosition: 'center',
                       borderRadius: '8px',
                       marginBottom: '12px'
                     }} />
                   )}
                   <CardDescription>{submission.description}</CardDescription>
                   <CardDetails>
                    <DetailItem>
                      <span>📍</span>
                      <span>{submission.county}</span>
                    </DetailItem>
                    <DetailItem>
                      <span>📅</span>
                      <span>{submission.year}</span>
                    </DetailItem>
                    <DetailItem>
                      <span>📂</span>
                      <span>{submission.category}</span>
                    </DetailItem>
                    <DetailItem>
                      <span>📧</span>
                      <span>{submission.user_email}</span>
                    </DetailItem>
                  </CardDetails>
                </CardContent>
                
                <CardActions>
                  <ActionButton 
                    className="reject"
                    onClick={() => handleReject(submission)}
                    disabled={updateSubmissionMutation.isLoading}
                  >
                    ❌ Reject
                  </ActionButton>
                  <ActionButton 
                    className="approve"
                    onClick={() => handleApprove(submission)}
                    disabled={updateSubmissionMutation.isLoading}
                  >
                    ✅ Approve
                  </ActionButton>
                </CardActions>
              </ContentCard>
            ))
          )}
        </div>
      )}

      {activeTab === 'approved' && (
        <div>
          {approvedSubmissions.length === 0 ? (
            <EmptyState>
              <EmptyIcon>✅</EmptyIcon>
              <h3>No Approved Submissions</h3>
              <p>Approved submissions will appear here</p>
            </EmptyState>
          ) : (
            approvedSubmissions.map((submission) => (
              <ContentCard key={submission.id}>
                <CardHeader>
                  <div>
                    <CardTitle>
                      {submission.type === 'hero' ? '🦸‍♂️' : '📢'} {submission.name || submission.title}
                    </CardTitle>
                    <CardMeta>
                      Approved on {new Date(submission.reviewed_at).toLocaleDateString()}
                    </CardMeta>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <CardDescription>{submission.description}</CardDescription>
                </CardContent>
              </ContentCard>
            ))
          )}
        </div>
      )}

      {activeTab === 'rejected' && (
        <div>
          {rejectedSubmissions.length === 0 ? (
            <EmptyState>
              <EmptyIcon>❌</EmptyIcon>
              <h3>No Rejected Submissions</h3>
              <p>Rejected submissions will appear here</p>
            </EmptyState>
          ) : (
            rejectedSubmissions.map((submission) => (
              <ContentCard key={submission.id}>
                <CardHeader>
                  <div>
                    <CardTitle>
                      {submission.type === 'hero' ? '🦸‍♂️' : '📢'} {submission.name || submission.title}
                    </CardTitle>
                    <CardMeta>
                      Rejected on {new Date(submission.reviewed_at).toLocaleDateString()}
                    </CardMeta>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <CardDescription>{submission.description}</CardDescription>
                  {submission.review_notes && (
                    <div style={{ marginTop: '8px', padding: '8px', background: '#fef2f2', borderRadius: '4px' }}>
                      <strong>Review Notes:</strong> {submission.review_notes}
                    </div>
                  )}
                </CardContent>
              </ContentCard>
            ))
          )}
        </div>
      )}

             {activeTab === 'manage' && (
         <div>
           <ManageContentGrid>
             <ManageCard>
               <ManageCardTitle>🦸‍♂️ Honor Wall Management</ManageCardTitle>
               <ManageCardDescription>
                 Add, edit, or remove heroes from the Honor Wall. Manage categories, achievements, and biographical information.
               </ManageCardDescription>
               <ManageCardActions>
                 <ManageButton className="edit" onClick={() => setShowAddModal(true)}>
                   ✨ Add Hero
                 </ManageButton>
                 <ManageButton className="edit">
                   📝 Edit Heroes
                 </ManageButton>
                 <ManageButton className="delete">
                   🗑️ Remove
                 </ManageButton>
               </ManageCardActions>
             </ManageCard>
             
             <ManageCard>
               <ManageCardTitle>📢 Protest Archive Management</ManageCardTitle>
               <ManageCardDescription>
                 Manage protest documentation, historical events, and movement records. Add new protests or update existing ones.
               </ManageCardDescription>
               <ManageCardActions>
                 <ManageButton className="edit" onClick={() => {
                   setAddForm(prev => ({ ...prev, type: 'protest' }));
                   setShowAddModal(true);
                 }}>
                   ✨ Add Protest
                 </ManageButton>
                 <ManageButton className="edit">
                   📝 Edit Protests
                 </ManageButton>
                 <ManageButton className="delete">
                   🗑️ Remove
                 </ManageButton>
               </ManageCardActions>
             </ManageCard>
             
             <ManageCard>
               <ManageCardTitle>📊 Content Analytics</ManageCardTitle>
               <ManageCardDescription>
                 View engagement metrics, popular content, and user interaction data for the Civic Memory Archive.
               </ManageCardDescription>
               <ManageCardActions>
                 <ManageButton className="edit">
                   📈 View Stats
                 </ManageButton>
                 <ManageButton className="edit">
                   📋 Export Data
                 </ManageButton>
               </ManageCardActions>
             </ManageCard>
             
             <ManageCard>
               <ManageCardTitle>🔧 System Settings</ManageCardTitle>
               <ManageCardDescription>
                 Configure editorial workflow, approval processes, and content moderation settings.
               </ManageCardDescription>
               <ManageCardActions>
                 <ManageButton className="edit">
                   ⚙️ Settings
                 </ManageButton>
                 <ManageButton className="edit">
                   👥 Team
                 </ManageButton>
               </ManageCardActions>
             </ManageCard>
           </ManageContentGrid>
         </div>
       )}

       {showAddModal && (
         <Modal onClick={() => setShowAddModal(false)}>
           <ModalContent onClick={(e) => e.stopPropagation()}>
             <ModalHeader>
               <ModalTitle>
                 {addForm.type === 'hero' ? '🦸‍♂️ Add New Hero' : '📢 Add New Protest'}
               </ModalTitle>
               <CloseButton onClick={() => setShowAddModal(false)}>×</CloseButton>
             </ModalHeader>
             
             <TabButtons>
               <TabButton 
                 active={addForm.type === 'hero'} 
                 onClick={() => handleFormChange('type', 'hero')}
               >
                 🦸‍♂️ Hero
               </TabButton>
               <TabButton 
                 active={addForm.type === 'protest'} 
                 onClick={() => handleFormChange('type', 'protest')}
               >
                 📢 Protest
               </TabButton>
             </TabButtons>
             
             {addForm.type === 'hero' ? (
               <>
                 <FormGroup>
                   <FormLabel>Hero Name *</FormLabel>
                   <FormInput
                     type="text"
                     value={addForm.name}
                     onChange={(e) => handleFormChange('name', e.target.value)}
                     placeholder="Enter hero's full name"
                   />
                 </FormGroup>
                 
                 <FormGroup>
                   <FormLabel>Achievement/Story *</FormLabel>
                   <FormTextarea
                     value={addForm.description}
                     onChange={(e) => handleFormChange('description', e.target.value)}
                     placeholder="Describe the hero's achievements, contributions, or story..."
                   />
                 </FormGroup>
                 
                 <FormGroup>
                   <FormLabel>County</FormLabel>
                   <FormInput
                     type="text"
                     value={addForm.county}
                     onChange={(e) => handleFormChange('county', e.target.value)}
                     placeholder="e.g., Nairobi, Mombasa"
                   />
                 </FormGroup>
                 
                 <FormGroup>
                   <FormLabel>Year of Death/Event</FormLabel>
                   <FormInput
                     type="number"
                     value={addForm.year}
                     onChange={(e) => handleFormChange('year', e.target.value)}
                     placeholder="e.g., 2020"
                   />
                 </FormGroup>
                 
                                   <FormGroup>
                    <FormLabel>Category</FormLabel>
                    <FormSelect
                      value={addForm.category}
                      onChange={(e) => handleFormChange('category', e.target.value)}
                    >
                      <option value="">Select category</option>
                      <option value="modern-martyrs">Modern Martyrs</option>
                      <option value="independence-heroes">Independence Heroes</option>
                      <option value="community-leaders">Community Leaders</option>
                      <option value="human-rights">Human Rights Activists</option>
                      <option value="environmental">Environmental Activists</option>
                      <option value="education">Education Advocates</option>
                      <option value="health">Health Advocates</option>
                      <option value="youth">Youth Leaders</option>
                    </FormSelect>
                  </FormGroup>
                  
                  <FormGroup>
                    <FormLabel>Hero Image</FormLabel>
                    <ImageUploadContainer>
                      {addForm.image_url ? (
                        <ImagePreview>
                          <img src={addForm.image_url} alt="Preview" />
                          <RemoveButton onClick={() => handleFormChange('image_url', '')}>
                            ×
                          </RemoveButton>
                        </ImagePreview>
                      ) : (
                        <ImageUploadArea>
                          <input
                            type="file"
                            id="hero-image-upload"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                          />
                          <label htmlFor="hero-image-upload">
                            <UploadIcon>📷</UploadIcon>
                            <UploadText>Click to upload image</UploadText>
                            <UploadHint>JPG, PNG, GIF up to 5MB</UploadHint>
                          </label>
                        </ImageUploadArea>
                      )}
                    </ImageUploadContainer>
                  </FormGroup>
               </>
             ) : (
               <>
                 <FormGroup>
                   <FormLabel>Protest Title *</FormLabel>
                   <FormInput
                     type="text"
                     value={addForm.title}
                     onChange={(e) => handleFormChange('title', e.target.value)}
                     placeholder="Enter protest title or name"
                   />
                 </FormGroup>
                 
                 <FormGroup>
                   <FormLabel>Description *</FormLabel>
                   <FormTextarea
                     value={addForm.description}
                     onChange={(e) => handleFormChange('description', e.target.value)}
                     placeholder="Describe the protest, its goals, and significance..."
                   />
                 </FormGroup>
                 
                 <FormGroup>
                   <FormLabel>Location/County</FormLabel>
                   <FormInput
                     type="text"
                     value={addForm.county}
                     onChange={(e) => handleFormChange('county', e.target.value)}
                     placeholder="e.g., Nairobi, Mombasa"
                   />
                 </FormGroup>
                 
                 <FormGroup>
                   <FormLabel>Year</FormLabel>
                   <FormInput
                     type="number"
                     value={addForm.year}
                     onChange={(e) => handleFormChange('year', e.target.value)}
                     placeholder="e.g., 2020"
                   />
                 </FormGroup>
                 
                 <FormGroup>
                   <FormLabel>Category</FormLabel>
                   <FormSelect
                     value={addForm.category}
                     onChange={(e) => handleFormChange('category', e.target.value)}
                   >
                     <option value="">Select category</option>
                     <option value="political">Political Protests</option>
                     <option value="social">Social Justice</option>
                     <option value="economic">Economic Rights</option>
                     <option value="environmental">Environmental</option>
                     <option value="education">Education</option>
                     <option value="health">Healthcare</option>
                     <option value="youth">Youth Movements</option>
                     <option value="labor">Labor Rights</option>
                   </FormSelect>
                 </FormGroup>
                 
                                   <FormGroup>
                    <FormLabel>Protest Image</FormLabel>
                    <ImageUploadContainer>
                      {addForm.image_url ? (
                        <ImagePreview>
                          <img src={addForm.image_url} alt="Preview" />
                          <RemoveButton onClick={() => handleFormChange('image_url', '')}>
                            ×
                          </RemoveButton>
                        </ImagePreview>
                      ) : (
                        <ImageUploadArea>
                          <input
                            type="file"
                            id="protest-image-upload"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                          />
                          <label htmlFor="protest-image-upload">
                            <UploadIcon>📷</UploadIcon>
                            <UploadText>Click to upload image</UploadText>
                            <UploadHint>JPG, PNG, GIF up to 5MB</UploadHint>
                          </label>
                        </ImageUploadArea>
                      )}
                    </ImageUploadContainer>
                  </FormGroup>
               </>
             )}
             
             <SubmitButton onClick={handleSubmitNewContent}>
               ✨ Add {addForm.type === 'hero' ? 'Hero' : 'Protest'}
             </SubmitButton>
           </ModalContent>
         </Modal>
       )}

      <AddContentButton onClick={handleAddContent}>
        +
      </AddContentButton>
    </EditorialContainer>
  );
};

export default Editorial;
