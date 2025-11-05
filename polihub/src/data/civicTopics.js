export const civicTopics = [
    {
      id: 1,
      icon: '⚖️',
      category: 'Government Structure',
      title: 'Checks & Balances',
      subtitle: 'The three branches of government and how they limit each other\'s power to prevent tyranny',
      readTime: '10 min',
      difficulty: 'Beginner',
      badge: 'TRENDING',
      color: 'from-amber-400 to-orange-500',
      lessonCount: 5,
      duration: '45 min',
      xp: 100,
      description: 'Explore the fundamental system that prevents any one branch of government from becoming too powerful.',
      lessons: [
        { id: 1, title: 'Introduction to Separation of Powers', duration: '8 min', type: 'text' },
        { id: 2, title: 'The Legislative Branch', duration: '10 min', type: 'video' },
        { id: 3, title: 'The Executive Branch', duration: '9 min', type: 'interactive' },
        { id: 4, title: 'The Judicial Branch', duration: '10 min', type: 'text' },
        { id: 5, title: 'Real-World Examples', duration: '8 min', type: 'video' }
      ],
      fullContent: {
        intro: "The system of checks and balances is a fundamental principle of American government, designed to prevent any single branch from becoming too powerful. Each branch has specific powers and can limit the actions of the others.",
        keyPoints: [
          {
            title: "The Executive Branch",
            content: "Led by the President, this branch enforces laws, conducts foreign policy, and commands the military. The President can veto legislation and appoint federal judges, but requires Senate approval for appointments."
          },
          {
            title: "The Legislative Branch",
            content: "Congress makes laws, controls the budget, and can override presidential vetoes with a two-thirds vote. The Senate confirms presidential appointments and ratifies treaties."
          },
          {
            title: "The Judicial Branch",
            content: "Federal courts interpret laws and can declare laws or executive actions unconstitutional through judicial review, established in Marbury v. Madison (1803)."
          },
          {
            title: "How They Work Together",
            content: "No branch can act without consideration of the others. This creates a system where power is distributed and accountability is maintained through mutual oversight."
          }
        ],
        examples: [
          "Congress can impeach and remove the President or federal judges",
          "The President nominates Supreme Court justices, but the Senate must confirm them",
          "The Supreme Court can rule laws passed by Congress unconstitutional"
        ]
      }
    },
    {
      id: 2,
      icon: '🗳️',
      category: 'Electoral Systems',
      title: 'Electoral College',
      subtitle: 'Understanding how presidents are elected through state-by-state electoral votes',
      readTime: '9 min',
      difficulty: 'Intermediate',
      badge: 'NEW',
      color: 'from-blue-400 to-indigo-500',
      lessonCount: 6,
      duration: '60 min',
      xp: 150,
      description: 'Deep dive into the unique American system for electing the President.',
      lessons: [
        { id: 1, title: 'Why the Electoral College Exists', duration: '10 min', type: 'text' },
        { id: 2, title: 'How Electoral Votes Work', duration: '12 min', type: 'video' },
        { id: 3, title: 'Swing States Explained', duration: '10 min', type: 'interactive' },
        { id: 4, title: 'Historical Elections', duration: '12 min', type: 'text' },
        { id: 5, title: 'Controversies and Debates', duration: '10 min', type: 'video' },
        { id: 6, title: 'Electoral Math Practice', duration: '6 min', type: 'interactive' }
      ],
      fullContent: {
        intro: "The Electoral College is the unique American system for electing the President and Vice President. Rather than a direct popular vote, presidents are chosen by electors allocated to each state based on congressional representation.",
        keyPoints: [
          {
            title: "How It Works",
            content: "Each state gets electoral votes equal to its total congressional delegation (House + Senate). Most states use winner-take-all, where the candidate winning the popular vote gets all electoral votes. 270 electoral votes are needed to win."
          },
          {
            title: "Historical Origins",
            content: "The Founders created this system as a compromise between congressional selection and popular vote, reflecting concerns about direct democracy and giving smaller states more influence."
          },
          {
            title: "Controversies",
            content: "Five times in history, the electoral vote winner lost the popular vote (most recently in 2000 and 2016). Critics argue this is undemocratic, while defenders say it ensures attention to all states."
          },
          {
            title: "Reform Proposals",
            content: "The National Popular Vote Interstate Compact aims to guarantee the presidency to the popular vote winner. Constitutional amendments to eliminate the Electoral College have been proposed but never passed."
          }
        ],
        examples: [
          "California has 54 electoral votes; Wyoming has 3",
          "Swing states like Pennsylvania and Georgia receive disproportionate campaign attention",
          "Maine and Nebraska use a district system rather than winner-take-all"
        ]
      }
    },
    {
      id: 3,
      icon: '📜',
      category: 'Rights',
      title: 'Bill of Rights',
      subtitle: 'Explore the first 10 amendments that protect your freedoms',
      readTime: '15 min',
      difficulty: 'Beginner',
      badge: 'CORE',
      color: 'from-purple-400 to-purple-600',
      lessonCount: 7,
      duration: '70 min',
      xp: 120,
      description: 'Understand the fundamental rights guaranteed to all Americans.',
      lessons: [
        { id: 1, title: 'Origins of the Bill of Rights', duration: '10 min', type: 'text' },
        { id: 2, title: 'First Amendment Freedoms', duration: '12 min', type: 'video' },
        { id: 3, title: 'Second Amendment Debate', duration: '10 min', type: 'text' },
        { id: 4, title: 'Criminal Justice Amendments', duration: '12 min', type: 'interactive' },
        { id: 5, title: 'Rights in Practice', duration: '10 min', type: 'video' },
        { id: 6, title: 'Modern Applications', duration: '10 min', type: 'text' },
        { id: 7, title: 'Case Studies', duration: '6 min', type: 'interactive' }
      ]
    },
    {
      id: 4,
      icon: '🏛️',
      category: 'Legislative Process',
      title: 'How Laws Are Made',
      subtitle: 'Follow the journey of a bill from proposal to law',
      readTime: '10 min',
      difficulty: 'Intermediate',
      badge: 'NEW',
      color: 'from-green-400 to-green-600',
      lessonCount: 5,
      duration: '50 min',
      xp: 130,
      description: 'Track the complex legislative process from idea to enacted law.',
      lessons: [
        { id: 1, title: 'Introduction to Legislation', duration: '10 min', type: 'text' },
        { id: 2, title: 'Committee Process', duration: '12 min', type: 'video' },
        { id: 3, title: 'Floor Debates and Voting', duration: '10 min', type: 'interactive' },
        { id: 4, title: 'Presidential Action', duration: '10 min', type: 'text' },
        { id: 5, title: 'Following a Real Bill', duration: '8 min', type: 'video' }
      ]
    },
    {
      id: 5,
      icon: '👔',
      category: 'Political Influence',
      title: 'Lobbying & Interest Groups',
      subtitle: 'How interest groups and corporations influence legislation and policy decisions',
      readTime: '12 min',
      difficulty: 'Advanced',
      badge: 'HOT',
      color: 'from-purple-400 to-pink-500',
      lessonCount: 6,
      duration: '65 min',
      xp: 180,
      description: 'Understand the role of advocacy and influence in American politics.',
      lessons: [
        { id: 1, title: 'What is Lobbying?', duration: '10 min', type: 'text' },
        { id: 2, title: 'Types of Interest Groups', duration: '12 min', type: 'video' },
        { id: 3, title: 'Lobbying Techniques', duration: '11 min', type: 'interactive' },
        { id: 4, title: 'Campaign Finance', duration: '12 min', type: 'text' },
        { id: 5, title: 'Ethics and Regulations', duration: '10 min', type: 'video' },
        { id: 6, title: 'Case Study Analysis', duration: '10 min', type: 'interactive' }
      ],
      fullContent: {
        intro: "Lobbying is the act of attempting to influence decisions made by government officials, most often legislators and regulatory agency members. While protected by the First Amendment's right to petition, lobbying raises important questions about money's influence in politics.",
        keyPoints: [
          {
            title: "What Lobbyists Do",
            content: "Lobbyists provide information to lawmakers, draft legislation, organize grassroots campaigns, and build relationships with decision-makers. They represent corporations, non-profits, unions, and advocacy groups."
          },
          {
            title: "Regulation of Lobbying",
            content: "The Lobbying Disclosure Act requires lobbyists to register and report their activities. However, many argue that current regulations have loopholes that allow significant influence to go unreported."
          },
          {
            title: "Money and Influence",
            content: "Lobbying spending reaches billions annually. Combined with campaign contributions, this creates concerns about whether elected officials prioritize wealthy interests over constituents."
          },
          {
            title: "The Public Interest",
            content: "Not all lobbying is corporate-focused. Advocacy groups for civil rights, environment, healthcare, and other causes also lobby to represent public interests."
          }
        ],
        examples: [
          "In 2022, over $4 billion was spent on federal lobbying",
          "The pharmaceutical industry is consistently among the top lobbying spenders",
          "Environmental groups lobby for climate change legislation and regulations"
        ]
      }
    },
    {
      id: 6,
      icon: '⚡',
      category: 'History',
      title: 'Civil Rights Movement',
      subtitle: 'Journey through the fight for equality in America',
      readTime: '18 min',
      difficulty: 'Intermediate',
      badge: 'MUST',
      color: 'from-pink-400 to-pink-600',
      lessonCount: 8,
      duration: '80 min',
      xp: 160,
      description: 'Explore the pivotal moments and figures in the struggle for civil rights.',
      lessons: [
        { id: 1, title: 'Pre-Civil Rights Era', duration: '10 min', type: 'text' },
        { id: 2, title: 'Montgomery Bus Boycott', duration: '10 min', type: 'video' },
        { id: 3, title: 'Key Leaders and Organizations', duration: '12 min', type: 'interactive' },
        { id: 4, title: 'Major Legislation', duration: '10 min', type: 'text' },
        { id: 5, title: 'Selma and Voting Rights', duration: '10 min', type: 'video' },
        { id: 6, title: 'Impact and Legacy', duration: '10 min', type: 'text' },
        { id: 7, title: 'Modern Civil Rights', duration: '10 min', type: 'video' },
        { id: 8, title: 'Timeline Activity', duration: '8 min', type: 'interactive' }
      ]
    },
    {
      id: 7,
      icon: '🗺️',
      category: 'Electoral Systems',
      title: 'Gerrymandering',
      subtitle: 'How district boundaries are manipulated to favor one party, affecting fair representation and voter power',
      readTime: '8 min',
      difficulty: 'Intermediate',
      badge: 'VIRAL',
      color: 'from-emerald-400 to-teal-500',
      lessonCount: 0,
      duration: '0 min',
      xp: 0,
      description: 'Understand how electoral district manipulation affects democracy and representation.',
      fullContent: {
        intro: "Gerrymandering is the practice of drawing electoral district boundaries to give one political party an unfair advantage over others. Named after Massachusetts Governor Elbridge Gerry, whose salamander-shaped district in 1812 gave rise to the term.",
        keyPoints: [
          {
            title: "What is Gerrymandering?",
            content: "Gerrymandering occurs when political boundaries are redrawn to benefit a particular party or group. This manipulation can significantly impact election outcomes and representation."
          },
          {
            title: "Types of Gerrymandering",
            content: "Packing concentrates opposition voters into few districts. Cracking spreads opposition voters across many districts to dilute their voting power. Both tactics reduce fair representation."
          },
          {
            title: "Impact on Democracy",
            content: "Gerrymandering undermines competitive elections, reduces voter choice, and can lead to political polarization. It often results in 'safe' seats where outcomes are predetermined."
          },
          {
            title: "Reform Efforts",
            content: "Independent redistricting commissions, mathematical fairness criteria, and legal challenges aim to create fairer district maps and restore competitive elections."
          }
        ],
        examples: [
          "In 2018, Pennsylvania's congressional map was ruled unconstitutional due to partisan gerrymandering",
          "North Carolina has been a battleground for gerrymandering cases affecting both state and federal elections",
          "California uses an independent citizens commission for redistricting"
        ]
      }
    },
    {
      id: 8,
      icon: '🎤',
      category: 'Legislative Process',
      title: 'Filibuster',
      subtitle: 'The Senate rule allowing unlimited debate that can block legislation',
      readTime: '7 min',
      difficulty: 'Intermediate',
      badge: 'EXPLAINED',
      color: 'from-red-400 to-pink-500',
      lessonCount: 0,
      duration: '0 min',
      xp: 0,
      description: 'Learn how the filibuster shapes Senate legislation and political strategy.',
      fullContent: {
        intro: "The filibuster is a Senate procedure that allows senators to debate a bill indefinitely, preventing a vote unless 60 senators agree to end debate. This supermajority requirement gives the minority significant power to block legislation.",
        keyPoints: [
          {
            title: "Origins and Evolution",
            content: "The filibuster emerged from Senate rules in the 1800s. Originally requiring continuous floor speeches, it evolved into a procedural tool where merely threatening to filibuster blocks legislation."
          },
          {
            title: "The 60-Vote Threshold",
            content: "Cloture, or ending debate, requires 60 votes. This means even if a party has 51-59 seats, they often can't pass legislation without bipartisan support."
          },
          {
            title: "Recent Changes",
            content: "The filibuster has been eliminated for judicial and executive nominations but remains for most legislation. This has led to increased partisan tension and calls for further reform."
          },
          {
            title: "Reform Debate",
            content: "Proposals include eliminating the filibuster entirely, returning to 'talking filibuster' requirements, or creating exceptions for specific issues like voting rights."
          }
        ],
        examples: [
          "The longest individual filibuster lasted 24 hours (Strom Thurmond, 1957)",
          "In 2013, Democrats eliminated the filibuster for most nominations",
          "Republicans used the same change in 2017 for Supreme Court nominations"
        ]
      }
    },
    {
      id: 9,
      icon: '📋',
      category: 'Electoral Systems',
      title: 'Primary Elections',
      subtitle: 'How political parties choose their candidates before the general election',
      readTime: '11 min',
      difficulty: 'Beginner',
      badge: 'GUIDE',
      color: 'from-cyan-400 to-blue-500',
      lessonCount: 0,
      duration: '0 min',
      xp: 0,
      description: 'Discover how the primary system shapes candidate selection and political outcomes.',
      fullContent: {
        intro: "Primary elections are preliminary elections where voters select their party's candidate for the general election. The primary system determines who appears on the ballot in November and significantly shapes American politics.",
        keyPoints: [
          {
            title: "Types of Primaries",
            content: "Closed primaries allow only registered party members to vote. Open primaries let any voter participate. Semi-closed and jungle primaries offer variations between these extremes."
          },
          {
            title: "Presidential Primaries",
            content: "Presidential primaries involve both primary elections and caucuses, with delegates allocated to candidates. The process begins in Iowa and New Hampshire, giving these states outsized influence."
          },
          {
            title: "Impact on Politics",
            content: "Low primary turnout often means more ideologically extreme voters have disproportionate influence, potentially leading to polarization as candidates appeal to party bases."
          },
          {
            title: "Recent Reforms",
            content: "Some states have adopted ranked-choice voting or top-two primaries to encourage moderation and increase competition."
          }
        ],
        examples: [
          "California's top-two primary can result in two candidates from the same party",
          "Iowa caucuses have traditionally been first in presidential primary season",
          "Alaska uses ranked-choice voting in both primaries and general elections"
        ]
      }
    }
  ];