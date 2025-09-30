export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  moduleId: number;
  moduleTitle: string;
  createdBy: string;
  createdByUsername: string;
  createdAt: string;
  memberCount: number;
  maxMembers: number;
  isPrivate: boolean;
  tags: string[];
  avatar?: string;
  coverImage?: string;
  rules: string[];
  recentActivity: string;
  isJoined: boolean;
  isOwner: boolean;
}

export interface DiscussionPost {
  id: string;
  groupId: string;
  authorId: string;
  authorUsername: string;
  authorAvatar?: string;
  title: string;
  content: string;
  type: 'question' | 'discussion' | 'resource' | 'announcement';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  likes: number;
  replies: number;
  views: number;
  isLiked: boolean;
  isPinned: boolean;
  isResolved: boolean;
  attachments?: Attachment[];
}

export interface DiscussionReply {
  id: string;
  postId: string;
  authorId: string;
  authorUsername: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  isLiked: boolean;
  isAccepted: boolean;
  parentReplyId?: string;
  replies: DiscussionReply[];
}

export interface Attachment {
  id: string;
  type: 'image' | 'document' | 'video' | 'audio';
  url: string;
  filename: string;
  size: number;
  thumbnail?: string;
}

export interface StudySession {
  id: string;
  groupId: string;
  title: string;
  description: string;
  scheduledFor: string;
  duration: number; // in minutes
  maxParticipants: number;
  currentParticipants: number;
  isVirtual: boolean;
  meetingLink?: string;
  location?: string;
  createdBy: string;
  createdByUsername: string;
  createdAt: string;
  isJoined: boolean;
  participants: StudySessionParticipant[];
}

export interface StudySessionParticipant {
  userId: string;
  username: string;
  avatar?: string;
  joinedAt: string;
  isPresent: boolean;
}

export interface LearningBuddy {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  level: number;
  xp: number;
  completedModules: number;
  badges: string[];
  lastActive: string;
  isOnline: boolean;
  mutualGroups: number;
  studyStreak: number;
  isFriend: boolean;
  isBlocked: boolean;
}

export interface StudyChallenge {
  id: string;
  groupId: string;
  title: string;
  description: string;
  type: 'quiz_competition' | 'study_goal' | 'group_project' | 'discussion_leader';
  startDate: string;
  endDate: string;
  reward: {
    xp: number;
    badge?: string;
    title?: string;
  };
  participants: string[];
  progress: { [userId: string]: number };
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

export interface SocialNotification {
  id: string;
  userId: string;
  type: 'group_invite' | 'post_reply' | 'session_reminder' | 'challenge_complete' | 'buddy_request' | 'mention';
  title: string;
  message: string;
  data: any;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface GroupInvite {
  id: string;
  groupId: string;
  groupName: string;
  invitedBy: string;
  invitedByUsername: string;
  invitedUserId: string;
  message?: string;
  createdAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

export interface StudyGoal {
  id: string;
  userId: string;
  groupId?: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  target: number;
  current: number;
  unit: 'lessons' | 'minutes' | 'quizzes' | 'modules';
  startDate: string;
  endDate: string;
  isCompleted: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SocialStats {
  totalGroups: number;
  joinedGroups: number;
  postsCreated: number;
  repliesGiven: number;
  sessionsAttended: number;
  challengesCompleted: number;
  buddiesCount: number;
  socialXP: number;
  discussionStreak: number;
  helpfulReplies: number;
}

  id: string;
  name: string;
  description: string;
  moduleId: number;
  moduleTitle: string;
  createdBy: string;
  createdByUsername: string;
  createdAt: string;
  memberCount: number;
  maxMembers: number;
  isPrivate: boolean;
  tags: string[];
  avatar?: string;
  coverImage?: string;
  rules: string[];
  recentActivity: string;
  isJoined: boolean;
  isOwner: boolean;
}

export interface DiscussionPost {
  id: string;
  groupId: string;
  authorId: string;
  authorUsername: string;
  authorAvatar?: string;
  title: string;
  content: string;
  type: 'question' | 'discussion' | 'resource' | 'announcement';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  likes: number;
  replies: number;
  views: number;
  isLiked: boolean;
  isPinned: boolean;
  isResolved: boolean;
  attachments?: Attachment[];
}

export interface DiscussionReply {
  id: string;
  postId: string;
  authorId: string;
  authorUsername: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  isLiked: boolean;
  isAccepted: boolean;
  parentReplyId?: string;
  replies: DiscussionReply[];
}

export interface Attachment {
  id: string;
  type: 'image' | 'document' | 'video' | 'audio';
  url: string;
  filename: string;
  size: number;
  thumbnail?: string;
}

export interface StudySession {
  id: string;
  groupId: string;
  title: string;
  description: string;
  scheduledFor: string;
  duration: number; // in minutes
  maxParticipants: number;
  currentParticipants: number;
  isVirtual: boolean;
  meetingLink?: string;
  location?: string;
  createdBy: string;
  createdByUsername: string;
  createdAt: string;
  isJoined: boolean;
  participants: StudySessionParticipant[];
}

export interface StudySessionParticipant {
  userId: string;
  username: string;
  avatar?: string;
  joinedAt: string;
  isPresent: boolean;
}

export interface LearningBuddy {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  level: number;
  xp: number;
  completedModules: number;
  badges: string[];
  lastActive: string;
  isOnline: boolean;
  mutualGroups: number;
  studyStreak: number;
  isFriend: boolean;
  isBlocked: boolean;
}

export interface StudyChallenge {
  id: string;
  groupId: string;
  title: string;
  description: string;
  type: 'quiz_competition' | 'study_goal' | 'group_project' | 'discussion_leader';
  startDate: string;
  endDate: string;
  reward: {
    xp: number;
    badge?: string;
    title?: string;
  };
  participants: string[];
  progress: { [userId: string]: number };
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

export interface SocialNotification {
  id: string;
  userId: string;
  type: 'group_invite' | 'post_reply' | 'session_reminder' | 'challenge_complete' | 'buddy_request' | 'mention';
  title: string;
  message: string;
  data: any;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface GroupInvite {
  id: string;
  groupId: string;
  groupName: string;
  invitedBy: string;
  invitedByUsername: string;
  invitedUserId: string;
  message?: string;
  createdAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

export interface StudyGoal {
  id: string;
  userId: string;
  groupId?: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  target: number;
  current: number;
  unit: 'lessons' | 'minutes' | 'quizzes' | 'modules';
  startDate: string;
  endDate: string;
  isCompleted: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SocialStats {
  totalGroups: number;
  joinedGroups: number;
  postsCreated: number;
  repliesGiven: number;
  sessionsAttended: number;
  challengesCompleted: number;
  buddiesCount: number;
  socialXP: number;
  discussionStreak: number;
  helpfulReplies: number;
}
