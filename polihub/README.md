# 🏛️ PoliHub - Political Education Platform

A modern, engaging platform designed to educate Gen Z about American politics, government, and civic engagement.

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [File Structure](#file-structure)
- [Installation](#installation)
- [Component Guide](#component-guide)
- [Usage](#usage)
- [Contributing](#contributing)

## 🎯 Overview

PoliHub is a comprehensive political education platform that makes learning about democracy accessible and engaging for young people. It combines politician profiles, civic education modules, political discourse, and real-time tracking in a beautifully designed interface.

## ✨ Features

### Core Features
- **Politician Directory**: Browse and filter 8+ politicians with detailed profiles
- **Civic Education**: 6 interactive learning modules on key democratic concepts
- **Political Discourse**: In-depth blog posts on policy and current events
- **Advanced Filtering**: Search and filter by party, chamber, state
- **Interactive Learning**: Progress tracking and difficulty levels
- **Newsletter Integration**: Stay updated with weekly insights
- **Responsive Design**: Beautiful UI that works on all devices

### Technical Features
- React 18+ with functional components
- Lucide React icons
- Tailwind CSS for styling
- Component-based architecture
- No external state management needed
- Mobile-first responsive design

## 📁 File Structure

```
polihub/
├── src/
│   ├── App.jsx                          # Main application
│   ├── index.jsx                        # Entry point
│   │
│   ├── components/                      # Reusable components
│   │   ├── Header.jsx                   # Navigation header
│   │   ├── Footer.jsx                   # Site footer
│   │   ├── PoliticianDetailModal.jsx    # Politician profile modal
│   │   ├── TopicDetailModal.jsx         # Civic education modal
│   │   └── BlogPostDetailModal.jsx      # Blog post reader
│   │
│   ├── pages/                           # Page components
│   │   ├── HomePage.jsx                 # Landing page
│   │   ├── PoliticiansPage.jsx          # Politicians directory
│   │   ├── CivicEducationPage.jsx       # Education hub
│   │   ├── BlogPage.jsx                 # Blog/discourse
│   │   └── AboutPage.jsx                # About us
│   │
│   └── data/                            # Data files
│       ├── politicians.js               # 8 politician profiles
│       ├── civicTopics.js               # 6 educational topics
│       └── blogPosts.js                 # 6 blog articles
│
├── public/
│   └── index.html
│
├── package.json
├── tailwind.config.js
└── README.md
```

## 🚀 Installation

### Prerequisites
- Node.js 16+ and npm/yarn
- Basic knowledge of React

### Step 1: Clone or Download Files

Create a new directory and add all the files provided:

```bash
mkdir polihub
cd polihub
```

### Step 2: Initialize Project

```bash
npm init -y
```

### Step 3: Install Dependencies

```bash
npm install react react-dom
npm install lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
```

### Step 4: Configure Tailwind

Update `tailwind.config.js`:

```javascript
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Step 5: Create File Structure

```bash
mkdir -p src/components src/pages src/data
```

### Step 6: Add Files

Copy all the provided files into their respective directories:

**Data Files** (save in `src/data/`):
- `politicians.js`
- `civicTopics.js`
- `blogPosts.js`

**Component Files** (save in `src/components/`):
- `Header.jsx`
- `Footer.jsx`
- `PoliticianDetailModal.jsx`
- `TopicDetailModal.jsx`
- `BlogPostDetailModal.jsx`

**Page Files** (save in `src/pages/`):
- `HomePage.jsx`
- `PoliticiansPage.jsx`
- `CivicEducationPage.jsx`
- `BlogPage.jsx`
- `AboutPage.jsx`

**Main Files** (save in `src/`):
- `App.jsx` (main application file)

### Step 7: Create Entry Point

Create `src/index.jsx`:

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Step 8: Create CSS File

Create `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### Step 9: Create HTML File

Create `public/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#9333ea" />
    <meta name="description" content="Political education platform for Gen Z" />
    <title>PoliHub - Political Education Platform</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
```

### Step 10: Update package.json

Add scripts to `package.json`:

```json
{
  "name": "polihub",
  "version": "1.0.0",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.263.1",
    "react-scripts": "5.0.1"
  },
  "devDependencies": {
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.24"
  }
}
```

### Step 11: Start Development Server

```bash
npm start
```

Your app should now be running at `http://localhost:3000`

## 📚 Component Guide

### Main App Component (`App.jsx`)

The main application component that manages:
- Page routing
- Global state
- Modal management
- Filtering logic

**Key State Variables:**
```javascript
- currentPage: 'home' | 'politicians' | 'education' | 'blog' | 'about'
- selectedPolitician: Politician object or null
- selectedTopic: Topic object or null
- selectedBlogPost: Post object or null
- filterParty: 'all' | 'Democrat' | 'Republican' | 'Independent'
- filterChamber: 'all' | 'Senate' | 'House' | 'Governor' | etc.
- searchQuery: string
```

### Page Components

#### HomePage
- Featured politician carousel
- Politicians gallery preview
- Civic topics preview
- Sidebar with quick actions

#### PoliticiansPage
- Full politician directory
- Advanced filtering
- Search functionality
- Stats sidebar

#### CivicEducationPage
- Educational topic cards
- Learning path recommendations
- Progress tracking
- Difficulty indicators

#### BlogPage
- Blog post listings
- Category filtering
- Featured authors
- Newsletter signup

#### AboutPage
- Mission and values
- Team profiles
- Impact statistics
- Contact information

### Modal Components

All modals follow the same pattern:
```javascript
<Modal onClick={onClose}>  // Close on backdrop click
  <Content onClick={(e) => e.stopPropagation()}>  // Prevent close on content click
    {/* Modal content */}
  </Content>
</Modal>
```

## 🎨 Customization

### Adding New Politicians

Edit `src/data/politicians.js`:

```javascript
{
  name: "Politician Name",
  nickname: "Short Name",
  title: "Position",
  description: "Bio text",
  gradient: "linear-gradient(135deg, #color1 0%, #color2 100%)",
  imageUrl: "https://image-url.com",
  stats: { views: '10K', comments: '500', time: '2h ago' },
  tags: ['Tag1', 'Tag2'],
  party: 'Democrat' | 'Republican' | 'Independent',
  chamber: 'Senate' | 'House' | 'Cabinet' | etc.,
  state: 'State Name',
  district: 'Number or N/A',
  yearsInOffice: 'Number',
  committees: ['Committee 1', 'Committee 2'],
  keyIssues: ['Issue 1', 'Issue 2'],
  bio: 'Full biography text',
  contact: {
    twitter: '@handle',
    instagram: '@handle',
    website: 'website.com'
  }
}
```

### Adding New Civic Topics

Edit `src/data/civicTopics.js`:

```javascript
{
  title: "Topic Title",
  subtitle: "Brief description",
  icon: "🎯",
  color: "from-color-400 to-color-500",
  badge: "NEW" | "TRENDING" | "HOT",
  category: "Category Name",
  readTime: "X min read",
  difficulty: "Beginner" | "Intermediate" | "Advanced",
  fullContent: {
    intro: "Introduction paragraph",
    keyPoints: [
      {
        title: "Point Title",
        content: "Point content"
      }
    ],
    examples: ["Example 1", "Example 2"]
  }
}
```

### Changing Colors

The app uses a purple-pink gradient theme. To customize:

**Primary Colors:**
```css
/* In your CSS or Tailwind config */
purple-500: #9333ea
purple-600: #7c3aed
pink-500: #ec4899
pink-600: #db2777
```

**Gradient Classes:**
```javascript
// Used throughout the app
"bg-gradient-to-r from-purple-500 to-pink-500"
"bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600"
```

## 💡 Usage Examples

### Filtering Politicians

```javascript
// Filter by party
setFilterParty('Democrat');

// Filter by chamber
setFilterChamber('Senate');

// Search by name or state
setSearchQuery('california');

// Combine filters
// All filters work together automatically
```

### Opening Modals

```javascript
// Open politician detail
setSelectedPolitician(politicianObject);

// Open topic detail
setSelectedTopic(topicObject);

// Open blog post
setSelectedBlogPost(postObject);

// Close any modal
setSelectedPolitician(null);
```

### Newsletter Subscription

```javascript
// Handle subscription
const handleSubscribe = () => {
  if (email && email.includes('@')) {
    setSubscribed(true);
    // Add your email service logic here
    setTimeout(() => {
      setEmail('');
      setSubscribed(false);
    }, 2000);
  }
};
```

## 🔧 Troubleshooting

### Common Issues

**1. Images Not Loading**
- Check image URLs in data files
- Ensure images are publicly accessible
- Add fallback images or error handling

**2. Styles Not Applying**
- Verify Tailwind is configured correctly
- Check that CSS is imported in index.jsx
- Restart development server

**3. Components Not Rendering**
- Check import paths are correct
- Verify all exports are default or named correctly
- Check console for errors

**4. State Not Updating**
- Ensure you're using setState functions
- Check that props are passed correctly
- Verify component re-renders

### Debug Mode

Add console logs to track state:

```javascript
useEffect(() => {
  console.log('Current Page:', currentPage);
  console.log('Selected Politician:', selectedPolitician);
}, [currentPage, selectedPolitician]);
```

## 🎯 Best Practices

### Performance Optimization

1. **Lazy Loading Images**
```javascript
<img 
  loading="lazy"
  src={imageUrl}
  alt={description}
/>
```

2. **Memoize Expensive Calculations**
```javascript
const filteredData = useMemo(() => {
  return data.filter(/* complex filter logic */);
}, [data, filters]);
```

3. **Debounce Search Input**
```javascript
const debouncedSearch = useCallback(
  debounce((value) => setSearchQuery(value), 300),
  []
);
```

### Code Organization

1. **Keep components small** - Each component should have one responsibility
2. **Extract reusable logic** - Create custom hooks for shared functionality
3. **Use consistent naming** - Follow the established naming conventions
4. **Comment complex logic** - Help future developers understand your code

### Accessibility

1. **Add ARIA labels**
```javascript
<button aria-label="Close modal" onClick={onClose}>
  ✕
</button>
```

2. **Keyboard Navigation**
```javascript
<div 
  role="button"
  tabIndex={0}
  onKeyPress={(e) => e.key === 'Enter' && handleClick()}
>
```

3. **Focus Management**
```javascript
useEffect(() => {
  if (modalOpen) {
    modalRef.current?.focus();
  }
}, [modalOpen]);
```

## 📱 Responsive Design

The app is mobile-first and responsive. Key breakpoints:

```javascript
// Tailwind breakpoints used
sm: '640px'   // Tablets
md: '768px'   // Small laptops
lg: '1024px'  // Desktops
xl: '1280px'  // Large screens
2xl: '1536px' // Extra large
```

### Mobile Optimizations

- Touch-friendly buttons (min 44x44px)
- Simplified navigation on small screens
- Collapsible sections
- Optimized images
- Reduced animations

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `build/` folder.

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Environment Variables

Create `.env` file for sensitive data:

```env
REACT_APP_API_KEY=your_api_key
REACT_APP_API_URL=your_api_url
```

Access in code:
```javascript
const apiKey = process.env.REACT_APP_API_KEY;
```

## 🧪 Testing

### Component Testing Example

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import HomePage from './pages/HomePage';

test('renders featured politician', () => {
  render(<HomePage current={mockPolitician} />);
  const name = screen.getByText(/AOC/i);
  expect(name).toBeInTheDocument();
});

test('opens politician modal on click', () => {
  const mockSetSelected = jest.fn();
  render(<HomePage setSelectedPolitician={mockSetSelected} />);
  
  const button = screen.getByText(/Explore Profile/i);
  fireEvent.click(button);
  
  expect(mockSetSelected).toHaveBeenCalledTimes(1);
});
```

## 📈 Future Enhancements

### Planned Features

- [ ] User authentication and profiles
- [ ] Bookmarking and favorites
- [ ] Progress tracking for education modules
- [ ] Comments and discussions
- [ ] Interactive quizzes
- [ ] Bill tracking integration
- [ ] Voting record visualization
- [ ] Push notifications
- [ ] Mobile app (React Native)
- [ ] Multi-language support

### API Integration

Future version will integrate with:
- ProPublica Congress API
- OpenSecrets API
- GovTrack API
- Twitter API for real-time updates

## 🤝 Contributing

We welcome contributions! Here's how:

### Getting Started

1. Fork the repository
2. Create a feature branch
```bash
git checkout -b feature/AmazingFeature
```

3. Make your changes
4. Commit with descriptive messages
```bash
git commit -m 'Add: New politician filtering feature'
```

5. Push to your branch
```bash
git push origin feature/AmazingFeature
```

6. Open a Pull Request

### Contribution Guidelines

- Follow the existing code style
- Write descriptive commit messages
- Add comments for complex logic
- Update documentation
- Test your changes thoroughly
- Keep PRs focused on single features

### Code Review Process

- All PRs require at least one review
- Tests must pass
- Code must follow style guide
- Documentation must be updated

## 📄 License

MIT License - feel free to use this project for educational purposes.

## 👥 Team

- **Alex Chen** - Founder & CEO
- **Jordan Smith** - Head of Content
- **Taylor Kim** - Lead Developer
- **Morgan Davis** - Community Manager
- **Casey Rivera** - Education Director
- **Sam Patel** - Head of Design

## 📞 Support

Need help? Reach out:

- **Email**: support@polihub.com
- **Discord**: discord.gg/polihub
- **Twitter**: @polihub
- **GitHub Issues**: github.com/polihub/issues

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first styling
- Lucide React for beautiful icons
- All contributors and supporters

## 📚 Additional Resources

### Learn More

- [React Documentation](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev)
- [Web Accessibility](https://www.w3.org/WAI/)

### Civic Education Resources

- [Congress.gov](https://www.congress.gov)
- [USA.gov](https://www.usa.gov)
- [Vote.org](https://www.vote.org)
- [Ballotpedia](https://ballotpedia.org)

---

**Built with ❤️ for democracy and civic engagement**

*Last Updated: October 2025*