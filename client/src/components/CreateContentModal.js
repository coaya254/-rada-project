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

  align-items: flex-end;

  z-index: 10000;

  backdrop-filter: blur(4px);

`;



const ModalContainer = styled(motion.div)`

  background: white;

  border-radius: 20px 20px 0 0;

  width: 100%;

  max-width: 480px;

  max-height: 90vh;

  overflow: hidden;

  display: flex;

  flex-direction: column;

`;



const ModalHeader = styled.div`

  padding: 20px 20px 16px;

  border-bottom: 1px solid var(--light-border);

  display: flex;

  justify-content: space-between;

  align-items: center;

`;



const ModalTitle = styled.h3`

  font-size: 18px;

  font-weight: 700;

  color: var(--text-primary);

  display: flex;

  align-items: center;

  gap: 8px;

`;



const CloseButton = styled.button`

  background: none;

  border: none;

  font-size: 24px;

  cursor: pointer;

  color: var(--text-muted);

  transition: color 0.2s ease;

  

  &:hover {

    color: var(--text-primary);

  }

`;



const ModalContent = styled.div`

  flex: 1;

  overflow-y: auto;

  padding: 20px;

`;



const FormGroup = styled.div`

  margin-bottom: 20px;

`;



const Label = styled.label`

  display: block;

  font-weight: 600;

  margin-bottom: 8px;

  color: var(--text-primary);

  font-size: 14px;

`;



const Input = styled.input`

  width: 100%;

  padding: 12px 16px;

  border: 2px solid var(--light-border);

  border-radius: 12px;

  font-size: 14px;

  transition: all 0.3s ease;

  background: white;

  

  &:focus {

    outline: none;

    border-color: var(--rada-teal);

    box-shadow: 0 0 0 3px rgba(0, 188, 212, 0.1);

  }

`;



const Textarea = styled.textarea`

  width: 100%;

  padding: 12px 16px;

  border: 2px solid var(--light-border);

  border-radius: 12px;

  font-size: 14px;

  transition: all 0.3s ease;

  background: white;

  resize: vertical;

  min-height: 120px;

  

  &:focus {

    outline: none;

    border-color: var(--rada-teal);

    box-shadow: 0 0 0 3px rgba(0, 188, 212, 0.1);

  }

`;



const Select = styled.select`

  width: 100%;

  padding: 12px 16px;

  border: 2px solid var(--light-border);

  border-radius: 12px;

  font-size: 14px;

  transition: all 0.3s ease;

  background: white;

  

  &:focus {

    outline: none;

    border-color: var(--rada-teal);

    box-shadow: 0 0 0 3px rgba(0, 188, 212, 0.1);

  }

`;



const FileUploadArea = styled.div`

  border: 2px dashed var(--light-border);

  border-radius: 12px;

  padding: 40px 20px;

  text-align: center;

  cursor: pointer;

  transition: all 0.3s ease;

  background: var(--light-bg);

  

  &:hover {

    border-color: var(--rada-teal);

    background: rgba(0, 188, 212, 0.05);

  }

  

  &.dragover {

    border-color: var(--rada-teal);

    background: rgba(0, 188, 212, 0.1);

  }

`;



const FileUploadIcon = styled.div`

  font-size: 48px;

  margin-bottom: 12px;

  opacity: 0.6;

`;



const FileUploadText = styled.div`

  color: var(--text-secondary);

  font-size: 14px;

  margin-bottom: 8px;

`;



const FileUploadHint = styled.div`

  color: var(--text-muted);

  font-size: 12px;

`;



const TagsContainer = styled.div`

  display: flex;

  flex-wrap: wrap;

  gap: 8px;

  margin-top: 8px;

`;



const Tag = styled.span`

  background: var(--rada-gold);

  color: var(--text-primary);

  padding: 4px 12px;

  border-radius: 20px;

  font-size: 12px;

  font-weight: 600;

  display: flex;

  align-items: center;

  gap: 4px;

`;



const RemoveTag = styled.button`

  background: none;

  border: none;

  color: var(--text-primary);

  cursor: pointer;

  font-size: 14px;

  padding: 0;

`;



const ModalActions = styled.div`

  padding: 16px 20px;

  border-top: 1px solid var(--light-border);

  display: flex;

  gap: 12px;

`;



const Button = styled.button`

  flex: 1;

  padding: 14px;

  border-radius: 12px;

  font-weight: 600;

  font-size: 14px;

  border: none;

  cursor: pointer;

  transition: all 0.3s ease;

  

  &:disabled {

    opacity: 0.6;

    cursor: not-allowed;

  }

  

  &.secondary {

    background: var(--light-bg);

    color: var(--text-primary);

    border: 2px solid var(--light-border);

  }

  

  &.primary {

    background: var(--rada-gold);

    color: var(--text-primary);

  }

  

  &.primary:hover:not(:disabled) {

    background: #ffca28;

  }

`;



const ProgressBar = styled.div`

  width: 100%;

  height: 4px;

  background: var(--light-border);

  border-radius: 2px;

  overflow: hidden;

  margin: 12px 0;

`;



const ProgressFill = styled.div`

  height: 100%;

  background: var(--rada-teal);

  border-radius: 2px;

  transition: width 0.3s ease;

  width: ${props => props.progress}%;

`;



const contentTypeConfig = {

  story: {

    icon: '✍️',

    title: 'Write Civic Story',

    placeholder: 'Share your civic experience, observation, or insight...',

    acceptedFiles: 'image/*',

    xpReward: 25

  },

  poem: {

    icon: '📝',

    title: 'Share Civic Poem',

    placeholder: 'Express your civic thoughts through poetry...',

    acceptedFiles: 'image/*',

    xpReward: 25

  },

  audio: {

    icon: '🎙️',

    title: 'Record Audio Story',

    placeholder: 'Describe what this audio is about...',

    acceptedFiles: 'audio/*',

    xpReward: 30

  },

  image: {

    icon: '📸',

    title: 'Share Civic Image',

    placeholder: 'Describe what this image shows...',

    acceptedFiles: 'image/*',

    xpReward: 20

  },

  evidence: {

    icon: '📊',

    title: 'Submit Evidence',

    placeholder: 'Provide details about this evidence...',

    acceptedFiles: 'image/*,application/pdf',

    xpReward: 35

  }

};



const kenyanCounties = [

  'Nairobi', 'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita-Taveta',

  'Garissa', 'Wajir', 'Mandera', 'Marsabit', 'Isiolo', 'Meru', 'Tharaka-Nithi',

  'Embu', 'Kitui', 'Machakos', 'Makueni', 'Nyandarua', 'Nyeri', 'Kirinyaga',

  'Murang\'a', 'Kiambu', 'Turkana', 'West Pokot', 'Samburu', 'Trans-Nzoia',

  'Uasin Gishu', 'Elgeyo-Marakwet', 'Nandi', 'Baringo', 'Laikipia', 'Nakuru',

  'Narok', 'Kajiado', 'Kericho', 'Bomet', 'Kakamega', 'Vihiga', 'Bungoma',

  'Busia', 'Siaya', 'Kisumu', 'Homa Bay', 'Migori', 'Kisii', 'Nyamira'

];



const CreateContentModal = ({ isOpen, onClose, contentType = 'story' }) => {

  const { user, awardXP  } = useEnhancedUser();

  const fileInputRef = useRef(null);

  

  const [formData, setFormData] = useState({

    title: '',

    content: '',

    county: user?.county || '',

    tags: []

  });

  const [selectedFile, setSelectedFile] = useState(null);

  const [uploading, setUploading] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);

  const [newTag, setNewTag] = useState('');



  const config = contentTypeConfig[contentType];



  const handleInputChange = (e) => {

    setFormData(prev => ({

      ...prev,

      [e.target.name]: e.target.value

    }));

  };



  const handleFileSelect = (file) => {

    if (!file) return;

    

    // Validate file type

    const acceptedTypes = config.acceptedFiles.split(',');

    const isValidType = acceptedTypes.some(type => {

      if (type.includes('*')) {

        const baseType = type.split('/')[0];

        return file.type.startsWith(baseType);

      }

      return file.type === type;

    });

    

    if (!isValidType) {

      toast.error('Please select a valid file type');

      return;

    }

    

    // Validate file size (10MB limit)

    if (file.size > 10 * 1024 * 1024) {

      toast.error('File size must be less than 10MB');

      return;

    }

    

    setSelectedFile(file);

  };



  const handleDrop = (e) => {

    e.preventDefault();

    const files = Array.from(e.dataTransfer.files);

    if (files.length > 0) {

      handleFileSelect(files[0]);

    }

  };



  const handleDragOver = (e) => {

    e.preventDefault();

  };



  const addTag = () => {

    if (newTag.trim() && !formData.tags.includes(newTag.trim().toLowerCase())) {

      setFormData(prev => ({

        ...prev,

        tags: [...prev.tags, newTag.trim().toLowerCase()]

      }));

      setNewTag('');

    }

  };



  const removeTag = (tagToRemove) => {

    setFormData(prev => ({

      ...prev,

      tags: prev.tags.filter(tag => tag !== tagToRemove)

    }));

  };



  const handleSubmit = async (e) => {

    e.preventDefault();

    

    if (!formData.title.trim() || !formData.content.trim()) {

      toast.error('Please fill in all required fields');

      return;

    }

    

    setUploading(true);

    setUploadProgress(0);

    

    try {

      const formDataToSend = new FormData();

      formDataToSend.append('uuid', user.uuid);

      formDataToSend.append('type', contentType);

      formDataToSend.append('title', formData.title);

      formDataToSend.append('content', formData.content);

      formDataToSend.append('county', formData.county);

      formDataToSend.append('tags', JSON.stringify(formData.tags));

      

      if (selectedFile) {

        formDataToSend.append('media', selectedFile);

      }

      

      // Simulate upload progress

      const progressInterval = setInterval(() => {

        setUploadProgress(prev => {

          if (prev >= 90) {

            clearInterval(progressInterval);

            return prev;

          }

          return prev + 10;

        });

      }, 200);

      

      const response = await api.post('/posts', formDataToSend, {

        headers: { 'Content-Type': 'multipart/form-data' }

      });

      

      clearInterval(progressInterval);

      setUploadProgress(100);

      

      // Award XP

      await awardXP(`create_${contentType}`, config.xpReward, response.data.id, 'post');

      

      toast.success('Content submitted for review! 🎉');

      

      // Reset form

      setFormData({ title: '', content: '', county: user?.county || '', tags: [] });

      setSelectedFile(null);

      setUploadProgress(0);

      

      onClose();

    } catch (error) {

      console.error('Error submitting content:', error);

      toast.error('Failed to submit content. Please try again.');

    } finally {

      setUploading(false);

    }

  };



  const modalVariants = {

    hidden: { opacity: 0 },

    visible: { opacity: 1 },

    exit: { opacity: 0 }

  };



  const containerVariants = {

    hidden: { y: '100%' },

    visible: { 

      y: 0,

      transition: {

        type: "spring",

        stiffness: 300,

        damping: 30

      }

    },

    exit: { 

      y: '100%',

      transition: {

        duration: 0.3

      }

    }

  };



  if (!isOpen) return null;



  return (

    <AnimatePresence>

      <ModalOverlay

        variants={modalVariants}

        initial="hidden"

        animate="visible"

        exit="exit"

        onClick={onClose}

      >

        <ModalContainer

          variants={containerVariants}

          initial="hidden"

          animate="visible"

          exit="exit"

          onClick={e => e.stopPropagation()}

        >

          <ModalHeader>

            <ModalTitle>

              {config.icon} {config.title}

            </ModalTitle>

            <CloseButton onClick={onClose}>×</CloseButton>

          </ModalHeader>

          

          <form onSubmit={handleSubmit}>

            <ModalContent>

              <FormGroup>

                <Label>Title *</Label>

                <Input

                  type="text"

                  name="title"

                  value={formData.title}

                  onChange={handleInputChange}

                  placeholder="Give your content a compelling title..."

                  maxLength={200}

                />

              </FormGroup>

              

              <FormGroup>

                <Label>Content *</Label>

                <Textarea

                  name="content"

                  value={formData.content}

                  onChange={handleInputChange}

                  placeholder={config.placeholder}

                  rows={6}

                />

              </FormGroup>

              

              <FormGroup>

                <Label>County</Label>

                <Select

                  name="county"

                  value={formData.county}

                  onChange={handleInputChange}

                >

                  <option value="">Select your county...</option>

                  {kenyanCounties.map(county => (

                    <option key={county} value={county}>{county}</option>

                  ))}

                </Select>

              </FormGroup>

              

              {(contentType === 'audio' || contentType === 'image' || contentType === 'evidence') && (

                <FormGroup>

                  <Label>

                    {contentType === 'audio' ? 'Audio File' : 

                     contentType === 'image' ? 'Image' : 'Evidence File'}

                  </Label>

                  <FileUploadArea

                    onClick={() => fileInputRef.current?.click()}

                    onDrop={handleDrop}

                    onDragOver={handleDragOver}

                  >

                    <FileUploadIcon>

                      {contentType === 'audio' ? '🎙️' : 

                       contentType === 'image' ? '📸' : '📄'}

                    </FileUploadIcon>

                    <FileUploadText>

                      {selectedFile ? selectedFile.name : 'Click to upload or drag & drop'}

                    </FileUploadText>

                    <FileUploadHint>

                      {contentType === 'audio' ? 'MP3, WAV, M4A up to 10MB' :

                       contentType === 'image' ? 'JPG, PNG, GIF up to 10MB' :

                       'Images or PDF up to 10MB'}

                    </FileUploadHint>

                  </FileUploadArea>

                  <input

                    ref={fileInputRef}

                    type="file"

                    accept={config.acceptedFiles}

                    onChange={(e) => handleFileSelect(e.target.files[0])}

                    style={{ display: 'none' }}

                  />

                </FormGroup>

              )}

              

              <FormGroup>

                <Label>Tags</Label>

                <div style={{ display: 'flex', gap: '8px' }}>

                  <Input

                    type="text"

                    value={newTag}

                    onChange={(e) => setNewTag(e.target.value)}

                    placeholder="Add tags (press Enter)"

                    onKeyPress={(e) => {

                      if (e.key === 'Enter') {

                        e.preventDefault();

                        addTag();

                      }

                    }}

                  />

                  <Button

                    type="button"

                    onClick={addTag}

                    style={{ width: 'auto', padding: '0 16px' }}

                  >

                    Add

                  </Button>

                </div>

                <TagsContainer>

                  {formData.tags.map(tag => (

                    <Tag key={tag}>

                      #{tag}

                      <RemoveTag onClick={() => removeTag(tag)}>×</RemoveTag>

                    </Tag>

                  ))}

                </TagsContainer>

              </FormGroup>

              

              {uploading && (

                <div>

                  <div style={{ fontSize: '14px', marginBottom: '8px' }}>

                    Uploading... {uploadProgress}%

                  </div>

                  <ProgressBar>

                    <ProgressFill progress={uploadProgress} />

                  </ProgressBar>

                </div>

              )}

            </ModalContent>

            

            <ModalActions>

              <Button 

                type="button" 

                className="secondary" 

                onClick={onClose}

                disabled={uploading}

              >

                Cancel

              </Button>

              <Button 

                type="submit" 

                className="primary"

                disabled={uploading || !formData.title.trim() || !formData.content.trim()}

              >

                {uploading ? 'Uploading...' : `Submit (+${config.xpReward} XP)`}

              </Button>

            </ModalActions>

          </form>

        </ModalContainer>

      </ModalOverlay>

    </AnimatePresence>

  );

};



export default CreateContentModal;