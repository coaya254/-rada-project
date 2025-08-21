import React, { useState } from 'react';
// import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import { useEnhancedUser } from '../contexts/EnhancedUserContext';
// import api from '../utils/api';

const YouthHubContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  background: var(--light-bg);
`;

const PageHeader = styled.div`
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
  padding: 24px 20px;
  text-align: center;
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 8px;
`;

const PageSubtitle = styled.p`
  opacity: 0.9;
  font-size: 16px;
  margin-bottom: 20px;
`;

const QuickStats = styled.div`
  display: flex;
  justify-content: space-around;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  backdrop-filter: blur(10px);
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  opacity: 0.9;
`;

const TabsContainer = styled.div`
  background: white;
  padding: 16px 20px;
  border-bottom: 1px solid var(--light-border);
  display: flex;
  gap: 8px;
  overflow-x: auto;
`;

const Tab = styled.button`
  padding: 10px 16px;
  border-radius: 20px;
  border: 2px solid ${props => props.active ? 'var(--rada-orange)' : 'var(--light-border)'};
  background: ${props => props.active ? 'var(--rada-orange)' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--text-secondary)'};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
`;

const OrganizationCard = styled(motion.div)`
  background: white;
  margin: 16px 20px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-light);
  border: 1px solid var(--light-border);
`;

const OrgHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid var(--light-border);
  display: flex;
  gap: 16px;
`;

const OrgLogo = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => props.color || 'var(--rada-orange)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  font-weight: bold;
  flex-shrink: 0;
`;

const OrgInfo = styled.div`
  flex: 1;
`;

const OrgName = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
`;

const OrgType = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
`;

const OrgLocation = styled.div`
  font-size: 13px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
`;

const OrgContent = styled.div`
  padding: 0 20px 20px;
`;

const OrgDescription = styled.p`
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
`;

const FocusAreas = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
`;

const FocusTag = styled.span`
  background: rgba(255, 152, 0, 0.1);
  color: #ff9800;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
`;

const OrgActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
`;

const ActionButton = styled(motion.button)`
  padding: 8px 16px;
  border-radius: 16px;
  border: 2px solid var(--rada-orange);
  background: ${props => props.primary ? 'var(--rada-orange)' : 'white'};
  color: ${props => props.primary ? 'white' : 'var(--rada-orange)'};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
`;

const OpportunityCard = styled(motion.div)`
  background: white;
  margin: 16px 20px;
  border-radius: 16px;
  padding: 20px;
  box-shadow: var(--shadow-light);
  border: 1px solid var(--light-border);
  border-left: 4px solid var(--rada-orange);
`;

const OpportunityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const OpportunityTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
  flex: 1;
`;

const OpportunityType = styled.span`
  background: ${props => {
    switch (props.type) {
      case 'volunteer': return 'rgba(76, 175, 80, 0.1)';
      case 'internship': return 'rgba(33, 150, 243, 0.1)';
      case 'job': return 'rgba(255, 193, 7, 0.1)';
      case 'training': return 'rgba(156, 39, 176, 0.1)';
      default: return 'var(--light-bg)';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'volunteer': return '#4caf50';
      case 'internship': return '#2196f3';
      case 'job': return '#ffc107';
      case 'training': return '#9c27b0';
      default: return 'var(--text-secondary)';
    }
  }};
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
`;

const OpportunityMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 12px;
`;

const OpportunityDescription = styled.p`
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
`;

const EmptyState = styled.div`
  padding: 60px 20px;
  text-align: center;
  color: var(--text-secondary);
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
`;

const tabs = [
  { key: 'directory', label: '🏢 Organizations', icon: '🏢' },
  { key: 'opportunities', label: '💼 Opportunities', icon: '💼' },
  { key: 'events', label: '🗓️ Events', icon: '🗓️' }
];

const YouthHub = () => {
  const { user, awardXP  } = useEnhancedUser();
  const [activeTab, setActiveTab] = useState('directory');
  const [joinedOrganizations, setJoinedOrganizations] = useState([]);
  const [appliedOpportunities, setAppliedOpportunities] = useState([]);

  const handleJoinOrganization = async (orgId) => {
    if (!user) {
      toast.error('Please complete setup to join organizations');
      return;
    }

    if (joinedOrganizations.includes(orgId)) {
      toast('You are already a member of this organization! 🏢');
      return;
    }

    try {
      await awardXP('join_organization', 20, orgId, 'organization');
      setJoinedOrganizations(prev => [...prev, orgId]);
      toast.success('Joined organization! (+20 XP) 🏢');
    } catch (error) {
      console.error('Error joining organization:', error);
      toast.success('Joined organization! 🏢');
      setJoinedOrganizations(prev => [...prev, orgId]);
    }
  };

  const handleApplyOpportunity = async (opportunityId) => {
    if (!user) {
      toast.error('Please complete setup to apply for opportunities');
      return;
    }

    if (appliedOpportunities.includes(opportunityId)) {
      toast('You have already applied for this opportunity! 💼');
      return;
    }

    try {
      await awardXP('apply_opportunity', 10, opportunityId, 'opportunity');
      setAppliedOpportunities(prev => [...prev, opportunityId]);
      toast.success('Applied! (+10 XP) 💼');
    } catch (error) {
      console.error('Error applying for opportunity:', error);
      toast.success('Applied! 💼');
      setAppliedOpportunities(prev => [...prev, opportunityId]);
    }
  };

  return (
    <YouthHubContainer>
      <PageHeader>
        <PageTitle>👥 Youth Hub</PageTitle>
        <PageSubtitle>Connect with organizations and find opportunities</PageSubtitle>
        
        <QuickStats>
          <StatItem>
            <StatValue>47</StatValue>
            <StatLabel>Organizations</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>23</StatValue>
            <StatLabel>Opportunities</StatLabel>
          </StatItem>
          <StatItem>
            <StatValue>15</StatValue>
            <StatLabel>Events</StatLabel>
          </StatItem>
        </QuickStats>
      </PageHeader>

      <TabsContainer>
        {tabs.map((tab) => (
          <Tab
            key={tab.key}
            active={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon} {tab.label}
          </Tab>
        ))}
      </TabsContainer>

      {activeTab === 'directory' && (
        <>
          <OrganizationCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
          >
            <OrgHeader>
              <OrgLogo color="#4caf50">GG</OrgLogo>
              <OrgInfo>
                <OrgName>Green Generation Initiative</OrgName>
                <OrgType>Environmental Advocacy</OrgType>
                <OrgLocation>📍 Nairobi, Kenya</OrgLocation>
              </OrgInfo>
            </OrgHeader>
            <OrgContent>
              <OrgDescription>
                Empowering youth to take climate action through education, advocacy, and community projects across Kenya.
              </OrgDescription>
              <FocusAreas>
                <FocusTag>Climate Change</FocusTag>
                <FocusTag>Youth Advocacy</FocusTag>
                <FocusTag>Community Action</FocusTag>
              </FocusAreas>
              <OrgActions>
                <ActionButton
                  primary={!joinedOrganizations.includes('green-gen-1')}
                  onClick={() => handleJoinOrganization('green-gen-1')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {joinedOrganizations.includes('green-gen-1') ? 'Joined ✓' : 'Join Organization'}
                </ActionButton>
                <ActionButton
                  onClick={() => toast('Learn more feature coming soon!')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Learn More
                </ActionButton>
              </OrgActions>
            </OrgContent>
          </OrganizationCard>

          <OrganizationCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
          >
            <OrgHeader>
              <OrgLogo color="#2196f3">YG</OrgLogo>
              <OrgInfo>
                <OrgName>Youth Governance Network</OrgName>
                <OrgType>Civic Education</OrgType>
                <OrgLocation>📍 Nationwide</OrgLocation>
              </OrgInfo>
            </OrgHeader>
            <OrgContent>
              <OrgDescription>
                Building civic-minded youth leaders through governance training, policy engagement, and democratic participation.
              </OrgDescription>
              <FocusAreas>
                <FocusTag>Governance</FocusTag>
                <FocusTag>Leadership</FocusTag>
                <FocusTag>Democracy</FocusTag>
              </FocusAreas>
              <OrgActions>
                <ActionButton
                  primary={!joinedOrganizations.includes('youth-gov-2')}
                  onClick={() => handleJoinOrganization('youth-gov-2')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {joinedOrganizations.includes('youth-gov-2') ? 'Joined ✓' : 'Join Organization'}
                </ActionButton>
                <ActionButton
                  onClick={() => toast('Learn more feature coming soon!')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Learn More
                </ActionButton>
              </OrgActions>
            </OrgContent>
          </OrganizationCard>

          <OrganizationCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
          >
            <OrgHeader>
              <OrgLogo color="#9c27b0">YF</OrgLogo>
              <OrgInfo>
                <OrgName>Youth for Democracy Kenya</OrgName>
                <OrgType>Democratic Engagement</OrgType>
                <OrgLocation>📍 Nairobi, Mombasa, Kisumu</OrgLocation>
              </OrgInfo>
            </OrgHeader>
            <OrgContent>
              <OrgDescription>
                Promoting democratic values and civic participation among Kenyan youth through voter education, policy advocacy, and community engagement.
              </OrgDescription>
              <FocusAreas>
                <FocusTag>Democracy</FocusTag>
                <FocusTag>Voter Education</FocusTag>
                <FocusTag>Policy Advocacy</FocusTag>
              </FocusAreas>
              <OrgActions>
                <ActionButton
                  primary={!joinedOrganizations.includes('youth-democracy-3')}
                  onClick={() => handleJoinOrganization('youth-democracy-3')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {joinedOrganizations.includes('youth-democracy-3') ? 'Joined ✓' : 'Join Organization'}
                </ActionButton>
                <ActionButton
                  onClick={() => toast('Learn more feature coming soon!')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Learn More
                </ActionButton>
              </OrgActions>
            </OrgContent>
          </OrganizationCard>

          <OrganizationCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
          >
            <OrgHeader>
              <OrgLogo color="#e91e63">RH</OrgLogo>
              <OrgInfo>
                <OrgName>Rights Hub Kenya</OrgName>
                <OrgType>Human Rights Advocacy</OrgType>
                <OrgLocation>📍 Nationwide</OrgLocation>
              </OrgInfo>
            </OrgHeader>
            <OrgContent>
              <OrgDescription>
                Defending human rights and promoting social justice through legal aid, awareness campaigns, and community mobilization across Kenya.
              </OrgDescription>
              <FocusAreas>
                <FocusTag>Human Rights</FocusTag>
                <FocusTag>Legal Aid</FocusTag>
                <FocusTag>Social Justice</FocusTag>
              </FocusAreas>
              <OrgActions>
                <ActionButton
                  primary={!joinedOrganizations.includes('rights-hub-4')}
                  onClick={() => handleJoinOrganization('rights-hub-4')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {joinedOrganizations.includes('rights-hub-4') ? 'Joined ✓' : 'Join Organization'}
                </ActionButton>
                <ActionButton
                  onClick={() => toast('Learn more feature coming soon!')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Learn More
                </ActionButton>
              </OrgActions>
            </OrgContent>
          </OrganizationCard>

          <OrganizationCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
          >
            <OrgHeader>
              <OrgLogo color="#795548">YC</OrgLogo>
              <OrgInfo>
                <OrgName>Youth Connect Africa</OrgName>
                <OrgType>Cross-Border Collaboration</OrgType>
                <OrgLocation>📍 East Africa Region</OrgLocation>
              </OrgInfo>
            </OrgHeader>
            <OrgContent>
              <OrgDescription>
                Building bridges between youth across East Africa through cultural exchange, joint projects, and regional advocacy initiatives.
              </OrgDescription>
              <FocusAreas>
                <FocusTag>Regional Unity</FocusTag>
                <FocusTag>Cultural Exchange</FocusTag>
                <FocusTag>Cross-Border Projects</FocusTag>
              </FocusAreas>
              <OrgActions>
                <ActionButton
                  primary={!joinedOrganizations.includes('youth-connect-5')}
                  onClick={() => handleJoinOrganization('youth-connect-5')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {joinedOrganizations.includes('youth-connect-5') ? 'Joined ✓' : 'Join Organization'}
                </ActionButton>
                <ActionButton
                  onClick={() => toast('Learn more feature coming soon!')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Learn More
                </ActionButton>
              </OrgActions>
            </OrgContent>
          </OrganizationCard>
        </>
      )}

      {activeTab === 'opportunities' && (
        <>
          <OpportunityCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
          >
            <OpportunityHeader>
              <div style={{ flex: 1 }}>
                <OpportunityTitle>Community Organizer Internship</OpportunityTitle>
                <OpportunityMeta>
                  <span>🏢 Green Generation Initiative</span>
                  <span>🗺️ Nairobi</span>
                  <span>⏰ 3 months</span>
                </OpportunityMeta>
              </div>
              <OpportunityType type="internship">Internship</OpportunityType>
            </OpportunityHeader>
            <OpportunityDescription>
              Join our team to organize climate action campaigns, coordinate youth volunteers, and help build grassroots movements for environmental change.
            </OpportunityDescription>
            <OrgActions>
              <ActionButton
                  primary={!appliedOpportunities.includes('community-org-1')}
                onClick={() => handleApplyOpportunity('community-org-1')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                  {appliedOpportunities.includes('community-org-1') ? 'Applied ✓' : 'Apply Now'}
              </ActionButton>
              <ActionButton
                onClick={() => toast('View details feature coming soon!')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Details
              </ActionButton>
            </OrgActions>
          </OpportunityCard>

          <OpportunityCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
          >
            <OpportunityHeader>
              <div style={{ flex: 1 }}>
                <OpportunityTitle>Civic Education Trainer</OpportunityTitle>
                <OpportunityMeta>
                  <span>🏢 Youth Governance Network</span>
                  <span>🗺️ Remote/Hybrid</span>
                  <span>⏰ Part-time</span>
                </OpportunityMeta>
              </div>
              <OpportunityType type="volunteer">Volunteer</OpportunityType>
            </OpportunityHeader>
            <OpportunityDescription>
              Help deliver civic education workshops to youth across Kenya. Training provided. Flexible schedule, meaningful impact.
            </OpportunityDescription>
            <OrgActions>
              <ActionButton
                  primary={!appliedOpportunities.includes('civic-trainer-2')}
                onClick={() => handleApplyOpportunity('civic-trainer-2')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {appliedOpportunities.includes('civic-trainer-2') ? 'Applied ✓' : 'Apply Now'}
                </ActionButton>
              <ActionButton
                onClick={() => toast('View details feature coming soon!')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Details
              </ActionButton>
            </OrgActions>
          </OpportunityCard>

          <OpportunityCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
          >
            <OpportunityHeader>
              <div style={{ flex: 1 }}>
                <OpportunityTitle>Human Rights Research Assistant</OpportunityTitle>
                <OpportunityMeta>
                  <span>🏢 Rights Hub Kenya</span>
                  <span>🗺️ Nairobi</span>
                  <span>⏰ 6 months</span>
                </OpportunityMeta>
              </div>
              <OpportunityType type="internship">Internship</OpportunityType>
            </OpportunityHeader>
            <OpportunityDescription>
              Support human rights research, document violations, and assist in advocacy campaigns. Perfect for law students and human rights enthusiasts.
            </OpportunityDescription>
            <OrgActions>
              <ActionButton
                primary={!appliedOpportunities.includes('human-rights-research-3')}
                onClick={() => handleApplyOpportunity('human-rights-research-3')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {appliedOpportunities.includes('human-rights-research-3') ? 'Applied ✓' : 'Apply Now'}
              </ActionButton>
              <ActionButton
                onClick={() => toast('View details feature coming soon!')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Details
              </ActionButton>
            </OrgActions>
          </OpportunityCard>

          <OpportunityCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
          >
            <OpportunityHeader>
              <div style={{ flex: 1 }}>
                <OpportunityTitle>Voter Education Campaign Volunteer</OpportunityTitle>
                <OpportunityMeta>
                  <span>🏢 Youth for Democracy Kenya</span>
                  <span>🗺️ Multiple Counties</span>
                  <span>⏰ Flexible</span>
                </OpportunityMeta>
              </div>
              <OpportunityType type="volunteer">Volunteer</OpportunityType>
            </OpportunityHeader>
            <OpportunityDescription>
              Help educate young voters about their rights and responsibilities. Travel to different counties, conduct workshops, and promote democratic participation.
            </OpportunityDescription>
            <OrgActions>
              <ActionButton
                primary={!appliedOpportunities.includes('voter-education-4')}
                onClick={() => handleApplyOpportunity('voter-education-4')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {appliedOpportunities.includes('voter-education-4') ? 'Applied ✓' : 'Apply Now'}
              </ActionButton>
              <ActionButton
                onClick={() => toast('View details feature coming soon!')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Details
              </ActionButton>
            </OrgActions>
          </OpportunityCard>

          <OpportunityCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
          >
            <OpportunityHeader>
              <div style={{ flex: 1 }}>
                <OpportunityTitle>Regional Youth Coordinator</OpportunityTitle>
                <OpportunityMeta>
                  <span>🏢 Youth Connect Africa</span>
                  <span>🗺️ Remote</span>
                  <span>⏰ Full-time</span>
                </OpportunityMeta>
              </div>
              <OpportunityType type="job">Job</OpportunityType>
            </OpportunityHeader>
            <OpportunityDescription>
              Coordinate youth programs across East Africa, manage partnerships, and organize regional events. Requires strong communication and organizational skills.
            </OpportunityDescription>
            <OrgActions>
              <ActionButton
                primary={!appliedOpportunities.includes('regional-coordinator-5')}
                onClick={() => handleApplyOpportunity('regional-coordinator-5')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {appliedOpportunities.includes('regional-coordinator-5') ? 'Applied ✓' : 'Apply Now'}
              </ActionButton>
              <ActionButton
                onClick={() => toast('View details feature coming soon!')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Details
              </ActionButton>
            </OrgActions>
          </OpportunityCard>
        </>
      )}

      {activeTab === 'events' && (
        <>
          <OpportunityCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
          >
            <OpportunityHeader>
              <div style={{ flex: 1 }}>
                <OpportunityTitle>Youth Civic Leadership Summit 2024</OpportunityTitle>
                <OpportunityMeta>
                  <span>🏢 Youth Governance Network</span>
                  <span>🗺️ Nairobi Convention Centre</span>
                  <span>📅 Dec 15-17, 2024</span>
                </OpportunityMeta>
              </div>
              <OpportunityType type="training">Training</OpportunityType>
            </OpportunityHeader>
            <OpportunityDescription>
              Join 500+ youth leaders for a 3-day summit on civic leadership, governance, and community development. Workshops, networking, and action planning sessions.
            </OpportunityDescription>
            <OrgActions>
              <ActionButton
                primary={!appliedOpportunities.includes('civic-summit-1')}
                onClick={() => handleApplyOpportunity('civic-summit-1')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {appliedOpportunities.includes('civic-summit-1') ? 'Registered ✓' : 'Register Now'}
              </ActionButton>
              <ActionButton
                onClick={() => toast('Event details feature coming soon!')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Event Details
              </ActionButton>
            </OrgActions>
          </OpportunityCard>

          <OpportunityCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
          >
            <OpportunityHeader>
              <div style={{ flex: 1 }}>
                <OpportunityTitle>Climate Action Workshop Series</OpportunityTitle>
                <OpportunityMeta>
                  <span>🏢 Green Generation Initiative</span>
                  <span>🗺️ Multiple Locations</span>
                  <span>📅 Monthly (Jan-Dec 2024)</span>
                </OpportunityMeta>
              </div>
              <OpportunityType type="training">Training</OpportunityType>
            </OpportunityHeader>
            <OpportunityDescription>
              Monthly workshops across Kenya teaching youth about climate change, sustainable practices, and how to lead environmental initiatives in their communities.
            </OpportunityDescription>
            <OrgActions>
              <ActionButton
                primary={!appliedOpportunities.includes('climate-workshop-2')}
                onClick={() => handleApplyOpportunity('climate-workshop-2')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {appliedOpportunities.includes('climate-workshop-2') ? 'Registered ✓' : 'Register Now'}
              </ActionButton>
              <ActionButton
                onClick={() => toast('Event details feature coming soon!')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Event Details
              </ActionButton>
            </OrgActions>
          </OpportunityCard>

          <OpportunityCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
          >
            <OpportunityHeader>
              <div style={{ flex: 1 }}>
                <OpportunityTitle>Human Rights Advocacy Training</OpportunityTitle>
                <OpportunityMeta>
                  <span>🏢 Rights Hub Kenya</span>
                  <span>🗺️ Mombasa & Kisumu</span>
                  <span>📅 Feb 20-22, 2024</span>
                </OpportunityMeta>
              </div>
              <OpportunityType type="training">Training</OpportunityType>
            </OpportunityHeader>
            <OpportunityDescription>
              Intensive 3-day training on human rights advocacy, legal frameworks, and community mobilization strategies. Open to youth activists and law students.
            </OpportunityDescription>
            <OrgActions>
              <ActionButton
                primary={!appliedOpportunities.includes('rights-training-3')}
                onClick={() => handleApplyOpportunity('rights-training-3')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {appliedOpportunities.includes('rights-training-3') ? 'Registered ✓' : 'Register Now'}
              </ActionButton>
              <ActionButton
                onClick={() => toast('Event details feature coming soon!')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Event Details
              </ActionButton>
            </OrgActions>
          </OpportunityCard>
        </>
      )}
    </YouthHubContainer>
  );
};

export default YouthHub;