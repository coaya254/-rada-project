import React, { useState, useEffect } from 'react';
import { useEnhancedUser } from '../../contexts/EnhancedUserContext';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  font-size: 16px;
`;

const UserGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const UserCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--light-border);
`;

const UserHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const UserAvatar = styled.div`
  font-size: 32px;
  margin-right: 12px;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: var(--text-primary);
`;

const UserDetails = styled.div`
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 4px;
`;

const RoleBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  
  &.anonymous { background: #e5e7eb; color: #374151; }
  &.trusted { background: #dbeafe; color: #1e40af; }
  &.educator { background: #dcfce7; color: #166534; }
  &.moderator { background: #fef3c7; color: #92400e; }
  &.admin { background: #fecaca; color: #991b1b; }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.primary {
    background: var(--primary-color);
    color: white;
    
    &:hover {
      background: var(--primary-dark);
    }
  }
  
  &.secondary {
    background: var(--light-bg);
    color: var(--text-primary);
    border: 1px solid var(--light-border);
    
    &:hover {
      background: var(--light-border);
    }
  }
  
  &.danger {
    background: #ef4444;
    color: white;
    
    &:hover {
      background: #dc2626;
    }
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--text-primary);
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid var(--light-border);
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid var(--light-border);
  border-radius: 6px;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`;

const RoleManagement = () => {
  const { 
    getAllUsers, 
    assignUserRole, 
    revokeUserRole, 
    checkPermission
  } = useEnhancedUser();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(12);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [reason, setReason] = useState('');
  const [assigningRole, setAssigningRole] = useState(false);
  const [revokingRole, setRevokingRole] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await getAllUsers();
      setUsers(usersData);
    } catch (error) {
      toast.error('Failed to load users');
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.uuid.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleAssignRole = async () => {
    try {
      setAssigningRole(true);
      await assignUserRole(selectedUser.uuid, selectedRole, reason);
      toast.success(`Role ${selectedRole} assigned to ${selectedUser.nickname || 'User'}`);
      setShowAssignModal(false);
      setSelectedUser(null);
      setSelectedRole('');
      setReason('');
      loadUsers(); // Refresh the list
    } catch (error) {
      toast.error('Failed to assign role');
      console.error('Error assigning role:', error);
    } finally {
      setAssigningRole(false);
    }
  };

  const handleRevokeRole = async () => {
    try {
      setRevokingRole(true);
      await revokeUserRole(selectedUser.uuid, reason);
      toast.success(`Role revoked from ${selectedUser.nickname || 'User'}`);
      setShowRevokeModal(false);
      setSelectedUser(null);
      setReason('');
      loadUsers(); // Refresh the list
    } catch (error) {
      toast.error('Failed to revoke role');
      console.error('Error revoking role:', error);
    } finally {
      setRevokingRole(false);
    }
  };

  const openAssignModal = (user) => {
    setSelectedUser(user);
    setSelectedRole('');
    setReason('');
    setShowAssignModal(true);
  };

  const openRevokeModal = (user) => {
    setSelectedUser(user);
    setReason('');
    setShowRevokeModal(true);
  };

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Check if user has admin permissions - moved after hooks
  if (!checkPermission('assign_roles')) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h2>Access Denied</h2>
          <p>You need admin permissions to manage user roles.</p>
        </div>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>⏳</div>
          <p>Loading users...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>👥 User Role Management</Title>
        <Subtitle>Assign and revoke user roles. Only admins can manage roles.</Subtitle>
      </Header>

      {/* Search and Filter Controls */}
      <div style={{ 
        display: 'flex', 
        gap: '15px', 
        marginBottom: '30px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ flex: '1', minWidth: '250px' }}>
          <input
            type="text"
            placeholder="Search by nickname or UUID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid var(--light-border)',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{
            padding: '12px',
            border: '1px solid var(--light-border)',
            borderRadius: '8px',
            fontSize: '14px',
            minWidth: '150px'
          }}
        >
          <option value="all">All Roles</option>
          <option value="anonymous">Anonymous</option>
          <option value="trusted">Trusted</option>
          <option value="educator">Educator</option>
          <option value="moderator">Moderator</option>
          <option value="admin">Admin</option>
        </select>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          {filteredUsers.length} users found
        </div>
      </div>

      <UserGrid>
        {currentUsers.map((user) => (
          <UserCard key={user.uuid}>
            <UserHeader>
              <UserAvatar>{user.emoji}</UserAvatar>
              <UserInfo>
                <UserName>{user.nickname || 'Anonymous User'}</UserName>
                <UserDetails>
                  Trust Score: {user.trust_score} • XP: {user.xp} • Joined: {new Date(user.created_at).toLocaleDateString()}
                </UserDetails>
              </UserInfo>
              <RoleBadge className={user.role}>{user.role}</RoleBadge>
            </UserHeader>

            <ActionButtons>
              <Button 
                className="primary" 
                onClick={() => openAssignModal(user)}
                disabled={user.role === 'admin'}
              >
                Assign Role
              </Button>
              <Button 
                className="danger" 
                onClick={() => openRevokeModal(user)}
                disabled={user.role === 'anonymous'}
              >
                Revoke Role
              </Button>
            </ActionButtons>
          </UserCard>
        ))}
      </UserGrid>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '10px', 
          marginTop: '30px',
          flexWrap: 'wrap'
        }}>
          <Button 
            className="secondary"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            style={{ padding: '8px 12px' }}
          >
            Previous
          </Button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
            <Button
              key={number}
              className={currentPage === number ? 'primary' : 'secondary'}
              onClick={() => paginate(number)}
              style={{ padding: '8px 12px', minWidth: '40px' }}
            >
              {number}
            </Button>
          ))}
          
          <Button 
            className="secondary"
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{ padding: '8px 12px' }}
          >
            Next
          </Button>
        </div>
      )}

      {/* No results message */}
      {filteredUsers.length === 0 && !loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>🔍</div>
          <p>No users found matching your criteria.</p>
        </div>
      )}

      {/* Assign Role Modal */}
      {showAssignModal && (
        <Modal onClick={() => setShowAssignModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Assign Role to {selectedUser?.nickname || 'User'}</ModalTitle>
            
            <FormGroup>
              <Label>Select Role</Label>
              <Select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                <option value="">Choose a role...</option>
                <option value="trusted">Trusted User</option>
                <option value="educator">Educator</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Reason (Optional)</Label>
              <TextArea 
                value={reason} 
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why are you assigning this role?"
              />
            </FormGroup>

            <ModalActions>
              <Button 
                className="secondary" 
                onClick={() => setShowAssignModal(false)}
                disabled={assigningRole}
              >
                Cancel
              </Button>
              <Button 
                className="primary" 
                onClick={handleAssignRole}
                disabled={!selectedRole || assigningRole}
              >
                {assigningRole ? 'Assigning...' : 'Assign Role'}
              </Button>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}

      {/* Revoke Role Modal */}
      {showRevokeModal && (
        <Modal onClick={() => setShowRevokeModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Revoke Role from {selectedUser?.nickname || 'User'}</ModalTitle>
            
            <FormGroup>
              <Label>Current Role</Label>
              <div style={{ padding: '12px', background: '#f3f4f6', borderRadius: '6px' }}>
                <RoleBadge className={selectedUser?.role}>{selectedUser?.role}</RoleBadge>
              </div>
            </FormGroup>

            <FormGroup>
              <Label>Reason (Required)</Label>
              <TextArea 
                value={reason} 
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why are you revoking this role?"
                required
              />
            </FormGroup>

            <ModalActions>
              <Button 
                className="secondary" 
                onClick={() => setShowRevokeModal(false)}
                disabled={revokingRole}
              >
                Cancel
              </Button>
              <Button 
                className="danger" 
                onClick={handleRevokeRole}
                disabled={!reason.trim() || revokingRole}
              >
                {revokingRole ? 'Revoking...' : 'Revoke Role'}
              </Button>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default RoleManagement;
