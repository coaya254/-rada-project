# 🎨 User Content Creator Tool

## ✨ Overview

The User Content Creator Tool is a comprehensive system that allows regular users to create and share various types of civic content through a beautiful floating pencil button (✏️) interface.

## 🚀 Features

### 📱 Smart Mobile Interface
- **Floating Action Button** - Easy-to-reach pencil icon with smooth animations
- **Speed Dial Menu** - Quick access to different content types
- **Progressive Disclosure** - Show basic options first, advanced features on demand
- **Touch-Friendly Design** - Large buttons, easy media selection

### 🎯 Content Types
1. **✍️ Story** - Personal experiences, observations, insights
2. **📝 Poem** - Creative expression, thoughts, feelings  
3. **📊 Evidence** - Proof, documentation, reports (requires media)
4. **🎯 Report** - Issues, complaints, suggestions

### 🧠 Smart Features
- **📍 Auto-Location Detection** - Automatically detects user's county
- **🏷️ Smart Tag Suggestions** - AI-powered tag recommendations based on content
- **📱 Media Attachments** - Photos, audio, documents (optional for most, required for evidence)
- **📋 Content Templates** - Pre-filled forms for common content types
- **🔒 Privacy Controls** - Anonymous posting, comment settings
- **⭐ XP Multipliers** - Bonus XP for quality content, media, location, tags

### 💎 XP Reward System
- **Base XP**: Story (25), Poem (25), Evidence (35), Report (30)
- **Media Bonus**: +10 XP for adding media files
- **Location Bonus**: +5 XP for including location
- **Tag Bonus**: +2 XP per tag added
- **Quality Bonus**: Additional XP for approved content

## 🛠️ Setup Instructions

### 1. Database Setup
Run the SQL script to create the required tables:

```bash
mysql -u your_username -p your_database < setup_content_tables.sql
```

This creates:
- `user_content` - Main content storage
- `content_likes` - User likes tracking
- `content_comments` - User comments
- Updates `users` table with `xp_points` column

### 2. Backend Integration
Add the content endpoints to your `server.js`:

```javascript
// Import the content endpoints
const contentEndpoints = require('./content_endpoints');

// Add to your Express app
app.use('/api/content', contentEndpoints);
```

### 3. File Upload Setup
Install required packages:

```bash
npm install multer
```

Create upload directory:

```bash
mkdir -p uploads/content
```

### 4. Frontend Integration
The ContentCreatorModal is already integrated into MainApp.tsx. The floating pencil button will automatically show the content creation interface.

## 📱 How to Use

### For Users:
1. **Tap the Floating Pencil** ✏️ on any screen
2. **Choose Content Type** from the speed dial menu:
   - ✍️ Story
   - 📝 Poem  
   - 📊 Evidence
   - 🎯 Report
3. **Fill Out the Form**:
   - Title and content
   - Category and location
   - Optional tags and media
   - Privacy settings
4. **Submit** and earn XP!

### For Developers:
The system automatically:
- Validates required fields
- Processes media uploads
- Calculates XP rewards
- Stores content in database
- Awards XP to users
- Handles content moderation

## 🔧 Configuration

### Content Types
Edit `contentTypeConfig` in `ContentCreatorModal.tsx` to:
- Add new content types
- Modify XP rewards
- Change templates
- Update descriptions

### Categories
Modify the `categories` array to add/remove content categories.

### Media Settings
Adjust file size limits, allowed types, and upload limits in `content_endpoints.js`.

## 📊 Database Schema

### user_content Table
```sql
- id: Primary key
- title: Content title
- content: Main content text
- content_type: story/poem/evidence/report
- category: Content category
- tags: Comma-separated tags
- location: Kenyan county
- is_anonymous: Anonymous posting flag
- allow_comments: Comments enabled
- allow_sharing: Sharing enabled
- user_id: Creator's UUID
- media_files: JSON array of media
- xp_reward: XP earned
- status: pending_review/approved/rejected/featured
- views_count: View counter
- likes_count: Like counter
- comments_count: Comment counter
- created_at: Creation timestamp
- updated_at: Last update timestamp
```

## 🚨 Security Features

- **File Type Validation** - Only allows safe file types
- **File Size Limits** - Prevents abuse (10MB max)
- **User Authentication** - Requires valid user ID
- **Content Moderation** - All content goes through review
- **Rate Limiting** - Prevents spam submissions

## 🎨 Customization

### Styling
Modify the styles in `ContentCreatorModal.tsx` to match your app's theme.

### Animations
Adjust the animation parameters in the `useEffect` hooks for different effects.

### Templates
Add new content templates by extending the `templates` array in each content type.

### XP System
Modify the `calculateXPReward` function to change how XP is calculated.

## 🔍 Troubleshooting

### Common Issues:
1. **Media Upload Fails** - Check file permissions and directory existence
2. **XP Not Awarded** - Verify database connection and user table structure
3. **Content Not Saving** - Check required fields and database schema
4. **Location Detection Fails** - Ensure location permissions are granted

### Debug Mode:
Enable console logging by setting `console.log` statements in the content creation flow.

## 🚀 Future Enhancements

- **Voice-to-Text** - Speech input for easier content creation
- **AI Content Suggestions** - Smart content recommendations
- **Collaborative Content** - Co-authoring features
- **Content Analytics** - Performance tracking and insights
- **Advanced Moderation** - AI-powered content filtering
- **Content Scheduling** - Post content at specific times
- **Social Sharing** - Direct sharing to social platforms

## 📞 Support

For technical support or feature requests, check the main project documentation or create an issue in the project repository.

---

**Happy Content Creating! 🎉**

