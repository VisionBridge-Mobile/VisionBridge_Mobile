export type Stat = {
  label: string;
  value: string;
  // delta: string;
  icon:
    | "people-outline"
    | "trending-up-outline"
    | "checkmark-circle-outline"
    | "alert-circle-outline";
  tone: "blue" | "green" | "purple" | "orange";
};

export type LinePoint = { label: string; value: number };

export type TopicBar = { label: string; value: number; tone: "green" | "blue" | "orange" };

export type RecentActivityRow = {
  name: string;
  lastQuiz: string;
  score: number;
};

export type WeakTopic = {
  title: string;
  students: number;
  avg: number;
  actions: Array<{ label: string; icon: "videocam-outline" | "document-text-outline" | "book-outline" | "calendar-outline" | "code-slash-outline" | "sparkles-outline"; variant?: "outline" | "solid" }>;
};

export const dashboardStats: Stat[] = [
  {
    label: "Totall Students",
    value: "145",
    // 
    icon: "people-outline",
    tone: "blue"
  },
  {
    label: "Average Score",
    value: "78.5%",
    // delta: "5.2% improvement",
    icon: "trending-up-outline",
    tone: "green"
  },
  {
    label: "Completion Rate",
    value: "92%",
    // delta: "3% from last month",
    icon: "checkmark-circle-outline",
    tone: "purple"
  },
  {
    label: "At-Risk Students",
    value: "18",
    // delta: "4 students decreased",
    icon: "alert-circle-outline",
    tone: "orange"
  }
];

export const avgScoreOverTime: LinePoint[] = [
  { label: "Jan", value: 68 },
  { label: "Feb", value: 72 },
  { label: "Mar", value: 70 },
  { label: "Apr", value: 75 },
  { label: "May", value: 78 },
  { label: "Jun", value: 76 },
  { label: "Jul", value: 80 },
  { label: "Aug", value: 82 },
  { label: "Sep", value: 79 },
  { label: "Oct", value: 85 },
  { label: "Nov", value: 87 },
  { label: "Dec", value: 86 }
];

export const topicPerformance: TopicBar[] = [
  { label: "ICT", value: 86, tone: "green" },
  { label: "H/S", value: 72, tone: "blue" },
  { label: "L/E", value: 66, tone: "orange" },
  { label: "Net", value: 82, tone: "green" },
  { label: "LG", value: 69, tone: "blue" },
  { label: "L/E", value: 66, tone: "orange" },
  { label: "OS", value: 92, tone: "green" },
  { label: "WD", value: 44, tone: "blue" },
  { label: "Pg", value: 21, tone: "orange" },
  { label: "SDLC", value: 32, tone: "green" },
  { label: "HW", value: 54, tone: "blue" },
  { label: "DB", value: 79, tone: "orange" },
  { label: "DR", value: 63, tone: "green" },
];

export const recentActivity: RecentActivityRow[] = [
  { name: "Sanduni Sathsara", lastQuiz: "Hardware Quiz 3", score: 95 },
  { name: "Ravindu Thinusha", lastQuiz: "Programming Quiz 1", score: 45 },
  { name: "Sithumini Sithara", lastQuiz: "Networking Quiz 2", score: 78 },
  { name: "Thinuka Tharun", lastQuiz: "Logic Gates Quiz 2", score: 66 },
  { name: "Shamika Shalutha", lastQuiz: "Logic Gates Quiz 1", score: 71 },
  { name: "Thisun Thineth", lastQuiz: "Health/Security Quiz 2", score: 85 },
  { name: "Chethima Dias", lastQuiz: "Databases Quiz 1", score: 88 },
  { name: "Oneli Rajapakshe", lastQuiz: "Security Basics Quiz 1", score: 52 },
  { name: "Indeewari Galappaththi", lastQuiz: "Web Dev Quiz 2", score: 92 },
  { name: "Tharun Dewmina", lastQuiz: "SDLC Quiz 3", score: 68 },
];

export const weakTopics: WeakTopic[] = [
  {
    title: "OSI Model & Network Layers",
    students: 12,
    avg: 62,
    actions: [
      { label: "Share video tutorial", icon: "videocam-outline", variant: "outline" },
      { label: "Assign practice worksheet", icon: "document-text-outline", variant: "outline" }
    ]
  },
  {
    title: "Encryption & Security",
    students: 10,
    avg: 58,
    actions: [
      { label: "Review lesson material", icon: "book-outline", variant: "outline" },
      { label: "Schedule live Q&A", icon: "calendar-outline", variant: "outline" }
    ]
  },
  {
    title: "Binary Trees & Recursion",
    students: 8,
    avg: 65,
    actions: [
      { label: "Practice problems", icon: "code-slash-outline", variant: "outline" },
      { label: "Share examples", icon: "sparkles-outline", variant: "outline" }
    ]
  },
  {
    title: "Database Normalization",
    students: 7,
    avg: 68,
    actions: [
      { label: "Tutorial video", icon: "videocam-outline", variant: "outline" },
      { label: "Case studies", icon: "document-text-outline", variant: "outline" }
    ]
  },
  {
    title: "Machine Learning Concepts",
    students: 6,
    avg: 70,
    actions: [
      { label: "Simplified guides", icon: "book-outline", variant: "outline" },
      { label: "Interactive demo", icon: "sparkles-outline", variant: "outline" }
    ]
  }
];


