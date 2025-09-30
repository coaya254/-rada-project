import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import SocialMediaCard from '../components/SocialMediaCard';

const TestSocialCardScreen = () => {
  const testPost = {
    id: 1,
    user: { 
      name: 'Maya Chen', 
      avatar: '🌸', 
      handle: '@mayavibes' 
    },
    content: 'Just attended my first town hall meeting and WOW. The housing crisis discussion was intense. Why aren\'t more young people showing up to these? We literally have the power to change things 💪',
    title: 'First time at a town hall meeting - we need more young voices there!',
    fullContent: 'Just attended my first town hall meeting and WOW. The housing crisis discussion was intense. Why aren\'t more young people showing up to these? We literally have the power to change things 💪\n\nThe city council was discussing a proposal to rezone areas for affordable housing, but only like 12 people under 30 were there! Meanwhile, there were dozens of older residents opposing it. I couldn\'t help but think - this directly affects OUR generation. We\'re the ones struggling with rent, we\'re the ones who will inherit these housing policies.\n\nI ended up speaking during public comment (my hands were literally shaking lol) but I talked about how my friends and I are all living with roommates well into our twenties because we can\'t afford our own places. The look on some council members\' faces when I mentioned that my part-time barista job barely covers rent... it was like a lightbulb moment for them.\n\nWe need to show up. Our voices matter. Next meeting is Thursday at 7pm - who\'s coming with me? 🏛️✊',
    category: 'civic',
    timestamp: '2h ago',
    comments: 34,
    shares: 12,
    readTime: '2 min read',
    hasVoiceNote: true,
    voiceDuration: '1:23',
    topReplies: [
      { user: 'Alex R.', content: 'YES! I\'ll be there Thursday! We need more voices like yours 👏' },
      { user: 'Jordan S.', content: 'This is exactly why local politics matter. Great job speaking up!' }
    ]
  };

  return (
    <ScrollView style={styles.container}>
      <SocialMediaCard 
        postData={testPost}
        onLike={(liked) => console.log('Liked:', liked)}
        onBookmark={(bookmarked) => console.log('Bookmarked:', bookmarked)}
        onShare={() => console.log('Shared')}
        onComment={() => console.log('Comment')}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: 50,
  },
});

export default TestSocialCardScreen;

