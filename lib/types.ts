export type LeaderboardRow = {
  teamId: string;
  name: string;
  slug: string;
  color: string;
  logo: string;
  slogan: string;
  totalPoints: number;
  dollarsRaised: number;
  businessesContacted: number;
  meetings: number;
  pitches: number;
  bonusPoints: number;
  rank: number;
  previousRank: number | null;
  movement: number | null;
};

export type Sprint = {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "UPCOMING" | "ACTIVE" | "COMPLETED";
  bonusOpportunities: string;
  order: number;
};

export type ScoringCategory = {
  id: string;
  name: string;
  description: string;
  type: "FIXED" | "DOLLAR";
  statKind: "DOLLARS" | "BUSINESS_CONTACTED" | "MEETING" | "PITCH" | "BONUS";
  pointValue: number;
  pointsPer100: number;
  enabled: boolean;
  isDemo: boolean;
  order: number;
};

export type Team = {
  id: string;
  name: string;
  slug: string;
  description: string;
  slogan: string;
  color: string;
  logo: string;
  archived: boolean;
  isDemo: boolean;
  order: number;
  students: Student[];
};

export type Student = {
  id: string;
  name: string;
  active: boolean;
  isDemo: boolean;
  teamId: string;
};

export type Activity = {
  id: string;
  teamId: string;
  team: Team;
  studentId: string | null;
  student: Student | null;
  categoryId: string;
  category: ScoringCategory;
  sprintId: string | null;
  sprint: Sprint | null;
  date: string;
  quantity: number;
  dollarAmount: number;
  notes: string;
  evidence: string;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  pointsAwarded: number;
  isDemo: boolean;
};

export type Judge = {
  id: string;
  name: string;
  role: string;
  responsibilities: string;
  order: number;
};

export type Rule = {
  id: string;
  section: "VERIFICATION" | "COMPETITION";
  title: string;
  content: string;
  order: number;
};

export type Prize = {
  id: string;
  name: string;
  description: string;
  icon: string;
  eligibility: string;
  requiredRank: number | null;
  requiredPoints: number | null;
  quantity: number;
  claimed: boolean;
  isDemo: boolean;
  order: number;
};

export type Award = {
  id: string;
  name: string;
  description: string;
  icon: string;
  isDemo: boolean;
  order: number;
};

export type WinOfWeek = {
  id: string;
  awardId: string;
  award: Award;
  winnerName: string;
  teamId: string | null;
  team: Team | null;
  date: string;
  description: string;
  bonusPoints: number;
  prize: string;
  isDemo: boolean;
};

export type Meeting = {
  id: string;
  date: string;
  title: string;
  sprintId: string | null;
  sprint: Sprint | null;
  energyOpener: string;
  sprintChallenge: string;
  workBlockNotes: string;
  nextMeetingGoal: string;
};

export type CampaignSettings = {
  id: number;
  campaignName: string;
  campaignDescription: string;
  committeeName: string;
  startDate: string | null;
  endDate: string | null;
  meetingSchedule: string;
  showTeamAvatars: boolean;
  showMoversOnDash: boolean;
  primaryAccent: string;
};

export type DashboardData = {
  settings: CampaignSettings;
  leaderboard: LeaderboardRow[];
  currentSprint: Sprint | null;
  latestWin: WinOfWeek | null;
  recentActivity: Activity[];
  scoringCategories: ScoringCategory[];
  nextMeeting: Meeting | null;
  prizes: Prize[];
  totals: {
    totalPoints: number;
    totalDollars: number;
    businessesContacted: number;
    meetings: number;
    pitches: number;
    activeTeams: number;
    activeStudents: number;
  };
};

export type AnalyticsData = {
  totals: DashboardData["totals"];
  teamPerformance: LeaderboardRow[];
  weeklyPerformance: Array<{
    week: string;
    points: number;
    dollars: number;
    businesses: number;
    meetings: number;
    pitches: number;
  }>;
  categoryPerformance: Array<{ id: string; name: string; points: number }>;
  sprintPerformance: Array<{
    id: string;
    name: string;
    status: string;
    points: number;
    dollars: number;
    businesses: number;
    meetings: number;
    pitches: number;
  }>;
  winHistory: WinOfWeek[];
};
