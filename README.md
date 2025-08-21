# rada.ke - Civic Engagement Platform

**Kenya's comprehensive civic-tech platform designed to engage, represent, and empower youth through storytelling, education, data analytics, and collective action.**

![rada.ke Logo](https://via.placeholder.com/200x100/ffc107/333333?text=rada.ke)

## 🌟 Overview

rada.ke is a privacy-first, mobile-optimized civic engagement platform built specifically for Kenyan youth. The platform combines storytelling, civic education, government accountability tracking, and community organizing tools into a single, accessible web application.

### Key Features

- **🔐 AnonMode™** - 100% anonymous civic participation using UUID-based accounts
- **📚 Learn Hub** - Interactive civic education modules with gamification
- **🏛️ Civic Memory Archive** - Honor Wall for civic heroes and protest documentation
- **📊 Promise Tracker** - Government accountability and evidence submission system
- **🎨 Expression Space** - Audio, poems, stories, and creative civic content
- **👥 Youth Hub** - Directory of youth organizations and civic assignments
- **📱 Mobile-First Design** - Optimized for smartphones with PWA capabilities
- **🎮 Gamification** - XP system, badges, and civic challenges
- **📊 Civic Mood Polls** - Real-time sentiment tracking with government engagement

## 🚀 Technology Stack

### Frontend
- **React 18** - Modern UI with hooks and context
- **Styled Components** - Component-based styling
- **Framer Motion** - Smooth animations and transitions
- **React Query** - Server state management
- **React Router** - Client-side routing

### Backend
- **Node.js + Express** - RESTful API server
- **MySQL** - Relational database for complex civic data
- **Multer** - File upload handling
- **JWT** - Authentication (future implementation)
- **Helmet** - Security middleware

### Infrastructure
- **PWA Ready** - Service workers and manifest
- **cPanel Compatible** - Deployable to standard web hosting
- **Mobile Optimized** - Responsive design with touch interactions

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 14+ and npm 6+
- MySQL 5.7+ or 8.0+
- cPanel hosting account (for production)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/rada-ke.git
   cd rada-ke
   ```

2. **Install dependencies**
   ```bash
   npm install
   npm run install-client
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your database credentials:
   ```env
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=rada_ke
   PORT=5000
   ```

4. **Create MySQL database**
   ```sql
   CREATE DATABASE rada_ke CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```
   
   This starts both the Express server (port 5000) and React dev server (port 3000)

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## 📊 Database Schema

The application automatically creates the following tables:

- **users** - Anonymous user profiles with UUID-based identification
- **posts** - User-generated civic content (stories, poems, audio, images)
- **memory_archive** - Civic heroes and memorial entries
- **protests** - Documented protests and civic movements  
- **promises** - Government promises and accountability tracking
- **learning_modules** - Civic education content
- **quizzes** - Interactive learning assessments
- **polls** - Civic mood tracking and sentiment polls
- **youth_groups** - Directory of youth organizations
- **assignments** - Civic tasks and community projects

## 🚀 Deployment

### Production Build

1. **Build the React app**
   ```bash
   npm run build
   ```

2. **Test production build locally**
   ```bash
   npm start
   ```

### cPanel Deployment

1. **Upload files via File Manager or FTP**
   - Upload `server.js` and `package.json` to your domain folder
   - Upload `client/build/*` contents to `public_html/`
   - Upload `uploads/` folder for media files

2. **Set up Node.js app in cPanel**
   - Navigate to "Node.js App" in cPanel
   - Create new Node.js app
   - Set entry point: `server.js`
   - Set environment variables

3. **Configure database**
   - Create MySQL database via cPanel
   - Update connection settings in production

4. **Install dependencies**
   ```bash
   npm install --production
   ```

### Environment Variables (Production)

```env
NODE_ENV=production
DB_HOST=localhost
DB_USER=your_cpanel_db_user
DB_PASSWORD=your_cpanel_db_password
DB_NAME=your_cpanel_db_name
PORT=443
```

## 🎮 Features Deep Dive

### AnonMode™ Privacy System
- UUID-based anonymous accounts
- No personal data collection
- Local storage with encrypted cross-device sync
- Always-visible privacy indicators

### XP & Gamification System
- Daily XP caps (150 XP max) with banking system
- Quality bonuses for high-engagement content
- Streak multipliers for consistent participation
- 20+ civic badges with progression tiers
- Real-world impact multipliers

### Civic Memory Archive
- Editorial-only content addition for accuracy
- Community candle lighting system
- Historical protest documentation
- Multi-source verification for sensitive events

### Promise Tracker
- Evidence submission with community verification
- Progress visualization with status indicators
- Manual government engagement pipeline
- Cross-county performance metrics

## 🔐 Security Features

- Helmet.js security headers
- Rate limiting protection
- Input validation and sanitization
- File upload restrictions
- SQL injection prevention
- XSS protection

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow React best practices and hooks patterns
- Use styled-components for styling consistency
- Maintain mobile-first responsive design
- Test all features on mobile devices
- Follow the established component structure
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Kenyan youth civic leaders and activists
- Open source community for excellent tools
- FontAwesome for iconography
- Unsplash for placeholder imagery

## 📞 Support

For support, email support@rada.ke or join our community channels.

---

**Built with ❤️ for Kenya's civic future**

*"Don't just watch change — drive it. rada.ke is how youth track, learn, speak, and lead."*