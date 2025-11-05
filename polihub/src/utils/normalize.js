// src/utils/normalize.js
// Normalizes API data to match the UI expectations

const gradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
];

const partyColors = {
  'UDA': 'from-yellow-500 to-orange-600',
  'ODM': 'from-orange-500 to-red-600',
  'NARC Kenya': 'from-green-500 to-teal-600',
  'Wiper': 'from-blue-500 to-purple-600',
  'RADA': 'from-purple-500 to-pink-600',
  'Democrat': 'from-blue-500 to-blue-700',
  'Republican': 'from-red-500 to-red-700',
  'Independent': 'from-purple-500 to-pink-600'
};

let politicianCounter = 0;

export function normalizePolitician(apiData) {
  if (!apiData) return null;

  const index = politicianCounter++;
  const party = apiData.party || 'Independent';
  const name = apiData.full_name || apiData.name || 'Unknown';
  const firstName = name.split(' ')[0];

  return {
    // IDs
    id: apiData.id,

    // Names
    name: name,
    full_name: name,
    nickname: apiData.nickname || firstName,

    // Title and Position
    title: apiData.title || `${apiData.chamber || 'Parliament'} Member • ${party}`,
    position: apiData.position || apiData.title || `${apiData.chamber || 'Parliament'} Member`,
    party: party,
    chamber: apiData.chamber || 'Parliament',
    state: apiData.state,
    district: apiData.district,

    // Description & Bio
    description: apiData.biography || apiData.description ||
      `${name} is a dedicated member of ${party} serving in the ${apiData.chamber || 'Parliament'}. ${apiData.years_in_office ? `With ${apiData.years_in_office} years in office, ` : ''}bringing experience and commitment to public service.`,

    bio: apiData.biography || apiData.bio || apiData.description,
    biography: apiData.biography,

    // Images
    imageUrl: apiData.image_url || '/placeholder-politician.jpg',
    image_url: apiData.image_url,
    image: apiData.image_url,

    // Stats object (THIS IS CRITICAL!)
    stats: {
      views: apiData.total_votes ? `${apiData.total_votes.toLocaleString()}` : '0',
      comments: apiData.rating && parseFloat(apiData.rating) > 0
        ? `${parseFloat(apiData.rating).toFixed(1)}★`
        : 'New',
      time: apiData.years_in_office
        ? `${apiData.years_in_office} years`
        : 'Recently joined'
    },

    // Visual styling
    gradient: gradients[index % gradients.length],
    color: partyColors[party] || partyColors['Independent'],

    // Tags
    tags: [
      party,
      apiData.chamber || 'Parliament',
      apiData.years_in_office ? `${apiData.years_in_office} Years` : 'New Member',
      apiData.status === 'active' ? '✓ Active' : 'Inactive'
    ].filter(Boolean),

    // Key Issues (empty array if not provided)
    keyIssues: apiData.keyIssues || apiData.key_issues || [],

    // Committees (empty array if not provided)
    committees: apiData.committees || [],

    // Contact Information (structured object)
    contact: {
      twitter: apiData.twitter_handle,
      instagram: apiData.instagram_handle,
      website: apiData.website_url,
      facebook: apiData.facebook_url,
      email: apiData.email,
      phone: apiData.phone,
      office: apiData.office_address
    },

    // Contact fields (for backward compatibility)
    office_address: apiData.office_address,
    phone: apiData.phone,
    email: apiData.email,
    website_url: apiData.website_url,
    twitter_handle: apiData.twitter_handle,
    instagram_handle: apiData.instagram_handle,
    facebook_url: apiData.facebook_url,
    wikipedia_url: apiData.wikipedia_url,

    // Metadata
    status: apiData.status || 'active',
    rating: apiData.rating,
    total_votes: apiData.total_votes || 0,
    years_in_office: apiData.years_in_office,
    yearsInOffice: apiData.years_in_office,
    date_of_birth: apiData.date_of_birth,
    created_at: apiData.created_at,
    updated_at: apiData.updated_at
  };
}

export function normalizeTopic(apiData) {
  if (!apiData) return null;

  // Map API data from learning_modules to frontend format
  const lessons = apiData.lessons || [];
  const totalDuration = lessons.reduce((sum, lesson) => sum + (lesson.duration_minutes || 0), 0);

  return {
    id: apiData.id,
    title: apiData.title,
    subtitle: apiData.description || apiData.subtitle,
    description: apiData.description,
    icon: apiData.icon || '📚',
    color: apiData.color || 'from-purple-400 to-pink-500',
    badge: apiData.is_featured ? 'FEATURED' : (apiData.difficulty || 'NEW'),
    difficulty: apiData.difficulty || 'Beginner',
    category: apiData.category || 'Civic Education',
    readTime: `${Math.ceil(totalDuration / 5)} min read`,
    duration: `${totalDuration} min`,
    lessonCount: lessons.length,
    xp: apiData.xp_reward || 100,
    estimated_duration: apiData.estimated_duration,

    // Lessons array for module detail screen
    lessons: lessons.map(lesson => ({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      type: lesson.lesson_type || 'text',
      duration: `${lesson.duration_minutes || 10} min`,
      duration_minutes: lesson.duration_minutes,
      xp_reward: lesson.xp_reward,
      content: lesson.content
    })),

    // Full content for topic detail modal (backward compatibility)
    fullContent: {
      intro: apiData.description || '',
      keyPoints: [],
      examples: []
    },

    // Metadata
    status: apiData.status,
    is_featured: apiData.is_featured,
    created_at: apiData.created_at,
    updated_at: apiData.updated_at
  };
}

export function normalizeBlogPost(apiData) {
  if (!apiData) return null;

  // Parse content if it's a string
  let parsedContent = {};
  try {
    parsedContent = apiData.content ? (typeof apiData.content === 'string' ? JSON.parse(apiData.content) : apiData.content) : {};
  } catch (e) {
    // Content is not valid JSON, use as plain text
    parsedContent = { intro: apiData.content || '', sections: [], conclusion: '' };
  }

  // Parse tags if it's a string
  let parsedTags = [];
  try {
    parsedTags = apiData.tags ? (typeof apiData.tags === 'string' ? JSON.parse(apiData.tags) : apiData.tags) : [];
  } catch (e) {
    // Tags not valid JSON, use empty array
    parsedTags = [];
  }

  return {
    id: apiData.id,
    title: apiData.title,
    subtitle: apiData.excerpt || apiData.subtitle,
    excerpt: apiData.excerpt,
    content: parsedContent,
    author: apiData.author || apiData.author_name || 'PoliHub Team',
    authorRole: apiData.author_role || apiData.authorRole || 'Contributor',
    date: apiData.published_at ? new Date(apiData.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
    readTime: apiData.read_time || (apiData.read_time_minutes ? `${apiData.read_time_minutes} min read` : '5 min read'),
    category: apiData.category || 'General',
    image: apiData.featured_image_url || apiData.image_url || apiData.image || 'https://images.unsplash.com/photo-1555421689-d68471e189f2?w=800',
    imageUrl: apiData.featured_image_url || apiData.image_url || apiData.image,
    likes: apiData.likes || 0,
    comments: apiData.comments_count || apiData.comments || 0,
    tags: parsedTags,
    slug: apiData.slug,
    is_published: apiData.is_published,
    created_at: apiData.created_at,
    updated_at: apiData.updated_at
  };
}

export default {
  normalizePolitician,
  normalizeTopic,
  normalizeBlogPost
};