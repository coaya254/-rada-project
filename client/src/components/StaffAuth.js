import React, { useState } from 'react';
import { useEnhancedUser } from '../contexts/EnhancedUserContext';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';

const AuthContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const AuthCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`;

const AuthHeader = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const AuthTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
`;

const AuthSubtitle = styled.p`
  color: var(--text-secondary);
  font-size: 14px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 2px solid var(--light-border);
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  &:disabled {
    background: var(--light-bg);
    cursor: not-allowed;
  }
`;

const SubmitButton = styled.button`
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 14px;
  text-align: center;
  padding: 8px;
  background: #fef2f2;
  border-radius: 6px;
  border: 1px solid #fecaca;
`;

const SuccessMessage = styled.div`
  color: #10b981;
  font-size: 14px;
  text-align: center;
  padding: 8px;
  background: #f0fdf4;
  border-radius: 6px;
  border: 1px solid #bbf7d0;
`;

const StaffAuth = () => {
  const { staffLogin } = useEnhancedUser();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await staffLogin(formData.email, formData.password);
      toast.success('Successfully logged in!');
    } catch (error) {
      setError(error.message || 'Login failed. Please check your credentials.');
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer>
      <AuthCard>
        <AuthHeader>
          <AuthTitle>🔐 Staff Login</AuthTitle>
          <AuthSubtitle>Access admin and moderation features</AuthSubtitle>
        </AuthHeader>

        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <FormGroup>
            <Label htmlFor="email">Email Address</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@rada.ke"
              required
              disabled={loading}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </FormGroup>

          <SubmitButton type="submit" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </SubmitButton>
        </Form>

        <div style={{ 
          marginTop: '24px', 
          textAlign: 'center', 
          fontSize: '12px', 
          color: 'var(--text-secondary)' 
        }}>
          <p>Need access? Contact your system administrator.</p>
        </div>
      </AuthCard>
    </AuthContainer>
  );
};

export default StaffAuth;
