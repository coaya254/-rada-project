import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

// Styled Components
const EmbedderContainer = styled.div`
  background: var(--light-bg);
  border-radius: 12px;
  padding: 20px;
  margin-top: 16px;
`;

const EmbedderTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MediaTypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
`;

const MediaTypeButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border: 2px solid var(--light-border);
  border-radius: 12px;
  background: white;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #667eea;
    transform: translateY(-1px);
    box-shadow: var(--shadow-light);
  }
  
  &.active {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.05);
  }
  
  .icon {
    font-size: 24px;
  }
  
  .label {
    font-size: 14px;
    font-weight: 600;
  }
  
  .description {
    font-size: 12px;
    color: var(--text-secondary);
    text-align: center;
    line-height: 1.3;
  }
`;

const MediaInputSection = styled.div`
  margin-bottom: 20px;
`;

const VideoUrlInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--light-border);
  border-radius: 12px;
  font-size: 14px;
  margin-bottom: 12px;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const MediaDescription = styled.p`
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  line-height: 1.4;
`;

const Warning = styled.div`
  background: rgba(255, 152, 0, 0.1);
  border: 1px solid rgba(255, 152, 0, 0.3);
  color: #f57c00;
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const EmbedPreview = styled.div`
  background: white;
  border: 2px solid var(--light-border);
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
`;

const PreviewTitle = styled.h5`
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
`;

const PreviewContent = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  iframe, blockquote {
    max-width: 100%;
    border-radius: 8px;
  }
`;

const PreviewActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const ActionButton = styled.button`
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.confirm {
    background: linear-gradient(135deg, #4caf50, #45a049);
    color: white;
  }
  
  &.cancel {
    background: var(--light-bg);
    color: var(--text-secondary);
  }
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-light);
  }
`;

const CurrentMediaDisplay = styled.div`
  background: white;
  border: 2px solid var(--light-border);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
`;

const CurrentMediaHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const CurrentMediaTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
`;

const CurrentMediaActions = styled.div`
  display: flex;
  gap: 8px;
`;

const MediaActionButton = styled.button`
  padding: 6px 12px;
  border: 1px solid var(--light-border);
  border-radius: 6px;
  background: white;
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #667eea;
    color: #667eea;
  }
`;

const VideoEmbedder = ({ lessonId, contentSection, currentMedia }) => {
  const [activeMediaType, setActiveMediaType] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [embedPreview, setEmbedPreview] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const queryClient = useQueryClient();

  // Add external media mutation
  const addExternalMediaMutation = useMutation(
    (mediaData) => api.post('/admin/media/external', mediaData),
    {
      onSuccess: (data) => {
        toast.success('Media added successfully!');
        queryClient.invalidateQueries(['admin-module']);
        setVideoUrl('');
        setEmbedPreview('');
        setActiveMediaType('');
      },
      onError: (error) => {
        console.error('Error adding media:', error);
        toast.error('Failed to add media');
        setIsProcessing(false);
      }
    }
  );

  // Media types configuration
  const mediaTypes = [
    { 
      type: 'youtube', 
      label: '📺 YouTube Video', 
      placeholder: 'https://www.youtube.com/watch?v=...',
      icon: '📺',
      description: 'Best for educational content, widely accessible'
    },
    { 
      type: 'tiktok', 
      label: '🎵 TikTok Video', 
      placeholder: 'https://www.tiktok.com/@user/video/...',
      icon: '🎵', 
      description: 'Great for short, engaging clips popular with youth',
      warning: 'May not work on all devices/networks'
    },
    { 
      type: 'vimeo', 
      label: '🎬 Vimeo Video', 
      placeholder: 'https://vimeo.com/123456789',
      icon: '🎬',
      description: 'High quality, professional content'
    },
    { 
      type: 'facebook', 
      label: '👥 Facebook Video', 
      placeholder: 'https://www.facebook.com/watch/?v=...',
      icon: '👥',
      description: 'Good for local content and live streams'
    }
  ];

  // Generate embed code for different platforms
  const generateEmbedCode = (url, platform) => {
    try {
      switch (platform) {
        case 'youtube':
          const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
          if (videoId) {
            return `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
          }
          break;
        
        case 'tiktok':
          const tiktokId = url.match(/tiktok\.com\/@[^\/]+\/video\/(\d+)/)?.[1];
          if (tiktokId) {
            return `<blockquote class="tiktok-embed" cite="${url}" data-video-id="${tiktokId}"></blockquote><script async src="https://www.tiktok.com/embed.js"></script>`;
          }
          break;
        
        case 'vimeo':
          const vimeoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
          if (vimeoId) {
            return `<iframe src="https://player.vimeo.com/video/${vimeoId}" width="100%" height="315" frameborder="0" allowfullscreen></iframe>`;
          }
          break;
        
        case 'facebook':
          const fbId = url.match(/facebook\.com\/watch\/\?v=(\d+)/)?.[1];
          if (fbId) {
            return `<iframe src="https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/watch/?v=${fbId}" width="100%" height="315" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen></iframe>`;
          }
          break;
      }
      return null;
    } catch (error) {
      console.error('Error generating embed code:', error);
      return null;
    }
  };

  // Handle video URL change
  const handleVideoUrlChange = (e) => {
    setVideoUrl(e.target.value);
    
    // Auto-generate preview if URL is valid
    if (e.target.value && activeMediaType) {
      const embedCode = generateEmbedCode(e.target.value, activeMediaType);
      if (embedCode) {
        setEmbedPreview(embedCode);
      } else {
        setEmbedPreview('');
      }
    }
  };

  // Handle media type selection
  const handleMediaTypeSelect = (type) => {
    setActiveMediaType(type);
    setVideoUrl('');
    setEmbedPreview('');
  };

  // Confirm embed
  const confirmEmbed = () => {
    if (!videoUrl || !activeMediaType || !lessonId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);
    
    const mediaData = {
      lesson_id: lessonId,
      content_section: contentSection,
      media_type: activeMediaType,
      url: videoUrl,
      title: `Video for ${contentSection}`
    };

    addExternalMediaMutation.mutate(mediaData);
  };

  // Clear preview
  const clearPreview = () => {
    setVideoUrl('');
    setEmbedPreview('');
    setActiveMediaType('');
  };

  // Remove current media
  const removeCurrentMedia = () => {
    if (currentMedia?.id) {
      // Call API to remove media
      api.delete(`/admin/media/${currentMedia.id}`)
        .then(() => {
          toast.success('Media removed successfully!');
          queryClient.invalidateQueries(['admin-module']);
        })
        .catch((error) => {
          console.error('Error removing media:', error);
          toast.error('Failed to remove media');
        });
    }
  };

  // Replace current media
  const replaceCurrentMedia = () => {
    removeCurrentMedia();
    setActiveMediaType('');
    setVideoUrl('');
    setEmbedPreview('');
  };

  return (
    <EmbedderContainer>
      <EmbedderTitle>📎 Add Media Content</EmbedderTitle>
      
      {/* Media Type Selection */}
      <MediaTypeGrid>
        {mediaTypes.map(media => (
          <MediaTypeButton 
            key={media.type}
            className={activeMediaType === media.type ? 'active' : ''}
            onClick={() => handleMediaTypeSelect(media.type)}
          >
            <span className="icon">{media.icon}</span>
            <span className="label">{media.label}</span>
            <span className="description">{media.description}</span>
          </MediaTypeButton>
        ))}
      </MediaTypeGrid>
      
      {/* Current Media Display */}
      {currentMedia && (
        <CurrentMediaDisplay>
          <CurrentMediaHeader>
            <CurrentMediaTitle>
              Current: {currentMedia.type === 'youtube' ? '📺' : 
                        currentMedia.type === 'tiktok' ? '🎵' : 
                        currentMedia.type === 'vimeo' ? '🎬' : '👥'} {currentMedia.title || 'Media'}
            </CurrentMediaTitle>
            <CurrentMediaActions>
              <MediaActionButton onClick={() => setActiveMediaType(currentMedia.type)}>
                Preview
              </MediaActionButton>
              <MediaActionButton onClick={removeCurrentMedia}>
                Remove
              </MediaActionButton>
              <MediaActionButton onClick={replaceCurrentMedia}>
                Replace
              </MediaActionButton>
            </CurrentMediaActions>
          </CurrentMediaHeader>
          
          {currentMedia.embed_code && (
            <div dangerouslySetInnerHTML={{ __html: currentMedia.embed_code }} />
          )}
        </CurrentMediaDisplay>
      )}
      
      {/* Media Input Section */}
      {activeMediaType && (
        <MediaInputSection>
          <VideoUrlInput
            type="url"
            placeholder={mediaTypes.find(m => m.type === activeMediaType)?.placeholder}
            value={videoUrl}
            onChange={handleVideoUrlChange}
          />
          
          <MediaDescription>
            {mediaTypes.find(m => m.type === activeMediaType)?.description}
          </MediaDescription>
          
          {mediaTypes.find(m => m.type === activeMediaType)?.warning && (
            <Warning>
              ⚠️ {mediaTypes.find(m => m.type === activeMediaType)?.warning}
            </Warning>
          )}
        </MediaInputSection>
      )}
      
      {/* Embed Preview */}
      {embedPreview && (
        <EmbedPreview>
          <PreviewTitle>Preview:</PreviewTitle>
          <PreviewContent>
            <div dangerouslySetInnerHTML={{ __html: embedPreview }} />
          </PreviewContent>
          <PreviewActions>
            <ActionButton 
              className="confirm"
              onClick={confirmEmbed}
              disabled={isProcessing}
            >
              {isProcessing ? 'Adding...' : '✅ Use This Media'}
            </ActionButton>
            <ActionButton className="cancel" onClick={clearPreview}>
              ❌ Cancel
            </ActionButton>
          </PreviewActions>
        </EmbedPreview>
      )}
    </EmbedderContainer>
  );
};

export default VideoEmbedder;
