import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import { useEnhancedUser } from '../contexts/EnhancedUserContext';
import api from '../utils/api';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
  padding: 20px;
`;

const ModalContainer = styled(motion.div)`
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  padding: 24px 24px 16px;
  border-bottom: 1px solid var(--light-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--light-bg);
    color: var(--text-primary);
  }
`;

const ModalContent = styled.div`
  padding: 24px;
  overflow-y: auto;
  flex: 1;
`;

const FormSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--light-border);
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: var(--rada-blue);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--light-border);
  border-radius: 12px;
  font-size: 16px;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: var(--rada-blue);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--light-border);
  border-radius: 12px;
  font-size: 16px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: var(--rada-blue);
  }
`;

const FileUpload = styled.div`
  border: 2px dashed var(--light-border);
  border-radius: 12px;
  padding: 32px 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--rada-blue);
    background: rgba(63, 81, 181, 0.05);
  }
  
  &.has-file {
    border-color: #4caf50;
    background: rgba(76, 175, 80, 0.05);
  }
`;

const FileIcon = styled.div`
  font-size: 32px;
  margin-bottom: 12px;
  color: var(--text-secondary);
`;

const FileText = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
`;

const FileName = styled.div`
  font-size: 12px;
  color: var(--text-primary);
  font-weight: 600;
`;

const RemoveFile = styled.button`
  background: #f44336;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #d32f2f;
  }
`;

const EvidenceTypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
`;

const EvidenceTypeButton = styled.button`
  padding: 12px 16px;
  border: 2px solid ${props => props.selected ? 'var(--rada-blue)' : 'var(--light-border)'};
  background: ${props => props.selected ? 'var(--rada-blue)' : 'white'};
  color: ${props => props.selected ? 'white' : 'var(--text-primary)'};
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--rada-blue);
    background: ${props => props.selected ? 'var(--rada-blue)' : 'rgba(63, 81, 181, 0.05)'};
  }
`;

const ModalFooter = styled.div`
  padding: 16px 24px 24px;
  border-top: 1px solid var(--light-border);
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.primary {
    background: var(--rada-blue);
    color: white;
    
    &:hover {
      background: #303f9f;
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  
  &.secondary {
    background: var(--light-bg);
    color: var(--text-secondary);
    
    &:hover {
      background: #e0e0e0;
    }
  }
`;

const PromiseEvidenceModal = ({ isOpen, onClose, promise, onEvidenceSubmitted }) => {
  const { user, awardXP  } = useEnhancedUser();
  const [formData, setFormData] = useState({
    evidenceType: '',
    description: '',
    source: '',
    date: '',
    location: '',
    impact: '',
    confidence: 'medium'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef();

  const evidenceTypes = [
    { key: 'photo', label: '📸 Photo', description: 'Visual evidence' },
    { key: 'document', label: '📄 Document', description: 'Official document' },
    { key: 'news', label: '📰 News Article', description: 'Media coverage' },
    { key: 'witness', label: '👥 Witness', description: 'Personal testimony' },
    { key: 'data', label: '📊 Data', description: 'Statistics or reports' },
    { key: 'other', label: '🔍 Other', description: 'Other evidence type' }
  ];

  const confidenceLevels = [
    { key: 'low', label: 'Low', description: 'Uncertain or weak evidence' },
    { key: 'medium', label: 'Medium', description: 'Moderately reliable evidence' },
    { key: 'high', label: 'High', description: 'Strong, reliable evidence' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.evidenceType || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const evidenceData = {
        promise_id: promise.id,
        uuid: user.uuid,
        evidence_type: formData.evidenceType,
        description: formData.description,
        source: formData.source,
        date: formData.date,
        location: formData.location,
        impact: formData.impact,
        confidence: formData.confidence
      };

      // Submit evidence
      const response = await api.post('/promises/evidence', evidenceData);
      
      // Award XP for submitting evidence
      await awardXP('submit_evidence', 25, promise.id, 'evidence');
      
      toast.success('Evidence submitted successfully! (+25 XP) 📊');
      
      if (onEvidenceSubmitted) {
        onEvidenceSubmitted(response.data);
      }
      
      onClose();
    } catch (error) {
      console.error('Error submitting evidence:', error);
      toast.error('Failed to submit evidence. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      evidenceType: '',
      description: '',
      source: '',
      date: '',
      location: '',
      impact: '',
      confidence: 'medium'
    });
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <ModalOverlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <ModalContainer
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <ModalHeader>
            <ModalTitle>Submit Evidence</ModalTitle>
            <CloseButton onClick={onClose}>&times;</CloseButton>
          </ModalHeader>

          <ModalContent>
            <FormSection>
              <SectionTitle>Promise Details</SectionTitle>
              <div style={{ 
                background: 'var(--light-bg)', 
                padding: '16px', 
                borderRadius: '12px',
                marginBottom: '20px'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '8px' }}>
                  {promise.title}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {promise.description}
                </div>
              </div>
            </FormSection>

            <form onSubmit={handleSubmit}>
              <FormSection>
                <SectionTitle>Evidence Information</SectionTitle>
                
                <FormGroup>
                  <Label>Evidence Type *</Label>
                  <EvidenceTypeGrid>
                    {evidenceTypes.map((type) => (
                      <EvidenceTypeButton
                        key={type.key}
                        type="button"
                        selected={formData.evidenceType === type.key}
                        onClick={() => handleInputChange('evidenceType', type.key)}
                      >
                        <div>{type.label}</div>
                        <div style={{ fontSize: '12px', opacity: 0.8 }}>
                          {type.description}
                        </div>
                      </EvidenceTypeButton>
                    ))}
                  </EvidenceTypeGrid>
                </FormGroup>

                <FormGroup>
                  <Label>Description *</Label>
                  <TextArea
                    placeholder="Describe the evidence and how it relates to the promise..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Source</Label>
                  <Input
                    placeholder="Where did you get this information?"
                    value={formData.source}
                    onChange={(e) => handleInputChange('source', e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Location</Label>
                  <Input
                    placeholder="County, constituency, or specific location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Impact Assessment</Label>
                  <TextArea
                    placeholder="How does this evidence affect the promise status? What impact has been made?"
                    value={formData.impact}
                    onChange={(e) => handleInputChange('impact', e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Confidence Level</Label>
                  <Select
                    value={formData.confidence}
                    onChange={(e) => handleInputChange('confidence', e.target.value)}
                  >
                    {confidenceLevels.map((level) => (
                      <option key={level.key} value={level.key}>
                        {level.label} - {level.description}
                      </option>
                    ))}
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>Supporting File (Optional)</Label>
                  <FileUpload
                    className={selectedFile ? 'has-file' : ''}
                    onClick={handleFileUpload}
                  >
                    <FileIcon>{selectedFile ? '📎' : '📁'}</FileIcon>
                    <FileText>
                      {selectedFile ? 'File selected' : 'Click to upload file'}
                    </FileText>
                    {selectedFile && (
                      <>
                        <FileName>{selectedFile.name}</FileName>
                        <RemoveFile onClick={removeFile}>Remove File</RemoveFile>
                      </>
                    )}
                  </FileUpload>
                  <input
                    ref={fileInputRef}
                    type="file"
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                    accept="image/*,.pdf,.doc,.docx"
                  />
                </FormGroup>
              </FormSection>
            </form>
          </ModalContent>

          <ModalFooter>
            <Button className="secondary" onClick={resetForm}>
              Reset
            </Button>
            <Button className="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="primary"
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.evidenceType || !formData.description}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Evidence'}
            </Button>
          </ModalFooter>
        </ModalContainer>
      </ModalOverlay>
    </AnimatePresence>
  );
};

export default PromiseEvidenceModal;
