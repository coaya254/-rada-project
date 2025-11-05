const testData = {
  hero: { title: "Test", subtitle: "Test", imageUrl: "" },
  mission: { text: "Test mission" },
  vision: { text: "Test vision" },
  story: { paragraphs: ["Test"], stats: [], imageUrl: "" },
  values: [],
  team: [],
  contact: { email: "test@test.com", socials: [] },
  bannerImageUrl: ""
};

fetch('http://localhost:5000/api/polihub/about-page', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(testData)
})
  .then(response => response.text())
  .then(text => {
    console.log('Response:', text.substring(0, 500));
    try {
      const json = JSON.parse(text);
      console.log('JSON:', json);
    } catch (e) {
      console.log('NOT JSON - HTML response received');
    }
  })
  .catch(error => console.error('Error:', error));
