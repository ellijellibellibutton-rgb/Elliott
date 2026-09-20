import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(9 + Math.floor(Math.random() * 7), Math.floor(Math.random() * 60), 0, 0);
  return d;
}

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(9, 0, 0, 0);
  return d;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log("Seeding Corporate Giving Hub...");

  // ---- Admin ----
  const existingAdmin = await prisma.admin.findFirst();
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash("AAPLE2026", 10);
    await prisma.admin.create({ data: { passwordHash } });
    console.log("Created admin account (password: AAPLE2026)");
  }

  // ---- Campaign settings ----
  const existingSettings = await prisma.campaignSettings.findFirst();
  if (!existingSettings) {
    await prisma.campaignSettings.create({
      data: {
        campaignName: "Corporate Giving Hub",
        campaignDescription:
          "AAPLE's Corporate Giving student committee competition — teams contact businesses, book meetings, pitch, and raise money for a great cause.",
        committeeName: "AAPLE Corporate Giving Committee",
        startDate: daysAgo(28),
        endDate: daysFromNow(28),
        meetingSchedule: "Every Tuesday at 6:00 PM — Room 214",
        showTeamAvatars: true,
        showMoversOnDash: true,
        primaryAccent: "#2a78d6",
      },
    });
    console.log("Created campaign settings");
  }

  // ---- Scoring categories ----
  const scoringDefs = [
    {
      name: "Dollars Raised",
      description: "Points awarded per $100 raised toward the campaign goal.",
      type: "DOLLAR" as const,
      statKind: "DOLLARS" as const,
      pointValue: 0,
      pointsPer100: 3,
      order: 0,
    },
    {
      name: "Business Contacted",
      description: "A new business outreach — call, email, or in-person contact.",
      type: "FIXED" as const,
      statKind: "BUSINESS_CONTACTED" as const,
      pointValue: 2,
      pointsPer100: 0,
      order: 1,
    },
    {
      name: "Meeting / Meaningful Follow-Up",
      description: "A scheduled meeting or a meaningful follow-up conversation.",
      type: "FIXED" as const,
      statKind: "MEETING" as const,
      pointValue: 5,
      pointsPer100: 0,
      order: 2,
    },
    {
      name: "Pitch Completed",
      description: "A full pitch delivered to a business contact.",
      type: "FIXED" as const,
      statKind: "PITCH" as const,
      pointValue: 5,
      pointsPer100: 0,
      order: 3,
    },
    {
      name: "Creative Approach",
      description: "Judge-awarded bonus for a standout creative approach.",
      type: "FIXED" as const,
      statKind: "BONUS" as const,
      pointValue: 5,
      pointsPer100: 0,
      order: 4,
    },
    {
      name: "Teamwork",
      description: "Judge-awarded bonus for excellent teamwork.",
      type: "FIXED" as const,
      statKind: "BONUS" as const,
      pointValue: 5,
      pointsPer100: 0,
      order: 5,
    },
    {
      name: "Most Improved",
      description: "Judge-awarded bonus recognizing week-over-week improvement.",
      type: "FIXED" as const,
      statKind: "BONUS" as const,
      pointValue: 5,
      pointsPer100: 0,
      order: 6,
    },
  ];

  const categoryCount = await prisma.scoringCategory.count();
  let categories = await prisma.scoringCategory.findMany();
  if (categoryCount === 0) {
    for (const def of scoringDefs) {
      await prisma.scoringCategory.create({ data: { ...def, isDemo: true } });
    }
    categories = await prisma.scoringCategory.findMany({ orderBy: { order: "asc" } });
    console.log(`Created ${scoringDefs.length} scoring categories`);
  }

  // ---- Sprints ----
  const sprintCount = await prisma.sprint.count();
  let sprints = await prisma.sprint.findMany();
  if (sprintCount === 0) {
    const sprintDefs = [
      {
        name: "Build the Pipeline",
        description: "Research businesses, identify contacts, and make initial outreach.",
        startDate: daysAgo(28),
        endDate: daysAgo(21),
        status: "COMPLETED" as const,
        bonusOpportunities: "+5 bonus for the most businesses researched in one meeting.",
        order: 0,
      },
      {
        name: "Get the Meeting",
        description: "Book meetings, follow up, and move prospects into active conversations.",
        startDate: daysAgo(20),
        endDate: daysAgo(13),
        status: "COMPLETED" as const,
        bonusOpportunities: "+5 bonus for the fastest follow-up after first contact.",
        order: 1,
      },
      {
        name: "Win the Pitch",
        description:
          "Focus on preparation, creativity, professionalism, and strong presentations.",
        startDate: daysAgo(12),
        endDate: daysFromNow(2),
        status: "ACTIVE" as const,
        bonusOpportunities: "+5 bonus for the most creative pitch of the week.",
        order: 2,
      },
      {
        name: "Finish Strong",
        description:
          "Close donations, follow up with prospects, thank businesses, and help teammates.",
        startDate: daysFromNow(3),
        endDate: daysFromNow(28),
        status: "UPCOMING" as const,
        bonusOpportunities: "+10 bonus for closing the final donation of the campaign.",
        order: 3,
      },
    ];
    for (const def of sprintDefs) {
      await prisma.sprint.create({ data: { ...def, isDemo: true } });
    }
    sprints = await prisma.sprint.findMany({ orderBy: { order: "asc" } });
    console.log(`Created ${sprintDefs.length} sprints`);
  }

  // ---- Teams ----
  const teamCount = await prisma.team.count();
  let teams = await prisma.team.findMany();
  if (teamCount === 0) {
    const teamDefs = [
      {
        name: "Cash Crusaders",
        slug: "cash-crusaders",
        description: "Relentless outreach, relentless energy.",
        slogan: "Raising funds, raising the bar.",
        color: "#2a78d6",
        logo: "🛡️",
      },
      {
        name: "Deal Dynamos",
        slug: "deal-dynamos",
        description: "Turning cold calls into warm partnerships.",
        slogan: "Every pitch is a power move.",
        color: "#eb6834",
        logo: "⚡",
      },
      {
        name: "Golden Pitch",
        slug: "golden-pitch",
        description: "Precision pitches, polished follow-through.",
        slogan: "Strike gold, every time.",
        color: "#1baf7a",
        logo: "🏆",
      },
      {
        name: "Revenue Rangers",
        slug: "revenue-rangers",
        description: "Scouting new businesses across the region.",
        slogan: "On the hunt for the next big yes.",
        color: "#eda100",
        logo: "🎯",
      },
      {
        name: "Profit Pioneers",
        slug: "profit-pioneers",
        description: "First to reach out, first to close.",
        slogan: "Charting new giving territory.",
        color: "#e87ba4",
        logo: "🚀",
      },
      {
        name: "The Closers",
        slug: "the-closers",
        description: "Cool under pressure, closers under deadline.",
        slogan: "We don't chase, we close.",
        color: "#008300",
        logo: "🔥",
      },
      {
        name: "Momentum Makers",
        slug: "momentum-makers",
        description: "Small wins stacked into big momentum.",
        slogan: "Keep the streak alive.",
        color: "#4a3aa7",
        logo: "🌊",
      },
    ];
    for (let i = 0; i < teamDefs.length; i++) {
      await prisma.team.create({ data: { ...teamDefs[i], order: i, isDemo: true } });
    }
    teams = await prisma.team.findMany({ orderBy: { order: "asc" } });
    console.log(`Created ${teamDefs.length} teams`);
  }

  // ---- Students ----
  const studentCount = await prisma.student.count();
  if (studentCount === 0 && teams.length > 0) {
    const firstNames = [
      "Ava", "Liam", "Sophia", "Noah", "Mia", "Ethan", "Isabella", "Lucas",
      "Amelia", "Mason", "Harper", "Logan", "Ella", "Jack", "Grace", "Owen",
      "Chloe", "Wyatt", "Layla", "Carter", "Zoe", "Levi", "Nora", "Leo",
      "Riley", "Henry",
    ];
    const lastNames = [
      "Chen", "Patel", "Garcia", "Kim", "Nguyen", "Smith", "Johnson", "Brown",
      "Davis", "Martinez", "Lopez", "Lee", "Walker", "Hall", "Young", "King",
    ];
    let nameIdx = 0;
    for (const team of teams) {
      const memberCount = randInt(3, 4);
      for (let i = 0; i < memberCount; i++) {
        const name = `${firstNames[nameIdx % firstNames.length]} ${lastNames[(nameIdx * 3) % lastNames.length]}`;
        nameIdx++;
        await prisma.student.create({
          data: { name, teamId: team.id, active: true, isDemo: true },
        });
      }
    }
    console.log("Created demo students");
  }

  const allStudents = await prisma.student.findMany();

  // ---- Judges ----
  const judgeCount = await prisma.judge.count();
  if (judgeCount === 0) {
    const judgeDefs = [
      {
        name: "Mr. Daniel Ruiz",
        role: "Committee Advisor",
        responsibilities: "Oversees scoring accuracy and resolves disputed points.",
        order: 0,
      },
      {
        name: "Ms. Priya Anand",
        role: "Corporate Partnerships Lead",
        responsibilities: "Verifies business contacts and confirms meeting authenticity.",
        order: 1,
      },
      {
        name: "Mr. Trevor Simmons",
        role: "Pitch Evaluator",
        responsibilities: "Scores pitch quality, creativity, and professionalism.",
        order: 2,
      },
      {
        name: "Ms. Olivia Bennett",
        role: "Student Committee Chair",
        responsibilities: "Approves bonus points and hosts weekly Win of the Week.",
        order: 3,
      },
    ];
    for (const def of judgeDefs) {
      await prisma.judge.create({ data: { ...def, isDemo: true } });
    }
    console.log(`Created ${judgeDefs.length} judges`);
  }

  // ---- Rules ----
  const ruleCount = await prisma.rule.count();
  if (ruleCount === 0) {
    const verificationRules = [
      {
        title: "What counts as a Business Contact",
        content:
          "A logged phone call, email, in-person visit, or LinkedIn message to a business decision-maker that has not been previously contacted this campaign.",
      },
      {
        title: "What counts as a Meeting",
        content:
          "A scheduled conversation (phone, video, or in-person) with a business representative that lasts at least 10 minutes and is focused on the Corporate Giving ask.",
      },
      {
        title: "What counts as a Pitch",
        content:
          "A formal presentation of the giving opportunity, including the ask amount, using approved pitch materials.",
      },
      {
        title: "How activities are verified",
        content:
          "Students submit evidence (email thread, calendar invite, photo, or written summary) with each logged activity. Judges spot-check evidence weekly.",
      },
      {
        title: "Who approves bonus points",
        content:
          "Bonus categories (Creative Approach, Teamwork, Most Improved) are awarded by the judging panel during the weekly meeting.",
      },
    ];
    const competitionRules = [
      {
        title: "General competition rules",
        content:
          "All activity must be logged within 48 hours to count toward that week's standings. Points are awarded per the current Scoring Rules on the Judges & Rules page.",
      },
      {
        title: "Duplicate activity rules",
        content:
          "Only one team may claim credit for contacting a specific business. The first team to log a verified contact receives credit.",
      },
      {
        title: "Disputed point rules",
        content:
          "Any team may dispute a logged activity by notifying a judge within 24 hours. The judging panel's decision is final.",
      },
      {
        title: "Tie-breaker rules",
        content:
          "Ties are broken first by total dollars raised, then by number of businesses contacted, then by a head-to-head pitch-off.",
      },
    ];
    let order = 0;
    for (const r of verificationRules) {
      await prisma.rule.create({
        data: { section: "VERIFICATION", ...r, order: order++, isDemo: true },
      });
    }
    order = 0;
    for (const r of competitionRules) {
      await prisma.rule.create({
        data: { section: "COMPETITION", ...r, order: order++, isDemo: true },
      });
    }
    console.log("Created rules");
  }

  // ---- Prizes ----
  const prizeCount = await prisma.prize.count();
  if (prizeCount === 0) {
    const prizeDefs = [
      { name: "Gift Cards", description: "$25 gift cards for the top-scoring team members.", icon: "💳", eligibility: "Top team, ranks 1", requiredRank: 1, quantity: 10 },
      { name: "AAPLE Merchandise", description: "Branded hoodies and water bottles.", icon: "👕", eligibility: "Top 3 teams", requiredRank: 3, quantity: 30 },
      { name: "Snacks / Boba", description: "A boba run for the winning team.", icon: "🧋", eligibility: "Weekly Win of the Week winner", quantity: 20 },
      { name: "Trophies", description: "Engraved trophies for 1st, 2nd, and 3rd place.", icon: "🏆", eligibility: "Top 3 teams", requiredRank: 3, quantity: 3 },
      { name: "Corporate Giving Cup", description: "The traveling championship cup, held until next campaign.", icon: "🏅", eligibility: "1st place team", requiredRank: 1, quantity: 1 },
      { name: "Mystery Prize", description: "A surprise prize revealed at the final meeting.", icon: "🎁", eligibility: "Randomly drawn from all active students", quantity: 1 },
      { name: "Funny Personalized Video", description: "A custom shoutout video for the MVP.", icon: "🎬", eligibility: "MVP award winner", quantity: 1 },
      { name: "Custom Certificates", description: "Personalized certificates recognizing every participant.", icon: "📜", eligibility: "All active students", quantity: 100 },
    ];
    for (let i = 0; i < prizeDefs.length; i++) {
      await prisma.prize.create({ data: { ...prizeDefs[i], order: i, isDemo: true } });
    }
    console.log(`Created ${prizeDefs.length} prizes`);
  }

  // ---- Awards ----
  const awardCount = await prisma.award.count();
  let awards = await prisma.award.findMany();
  if (awardCount === 0) {
    const awardDefs = [
      { name: "Best Pitch", description: "The most polished, persuasive pitch of the week.", icon: "🎤" },
      { name: "Pipeline Builder", description: "Built the strongest pipeline of new business contacts.", icon: "🧱" },
      { name: "Creative Play", description: "The most creative approach to landing a meeting or pitch.", icon: "🎨" },
      { name: "MVP", description: "The standout individual performance of the week.", icon: "⭐" },
      { name: "Most Improved", description: "The biggest jump in performance week-over-week.", icon: "📈" },
      { name: "Team Player", description: "Outstanding teamwork and support for teammates.", icon: "🤝" },
    ];
    for (let i = 0; i < awardDefs.length; i++) {
      await prisma.award.create({ data: { ...awardDefs[i], order: i, isDemo: true } });
    }
    awards = await prisma.award.findMany({ orderBy: { order: "asc" } });
    console.log(`Created ${awardDefs.length} awards`);
  }

  // ---- Activities (demo history across sprints 1-3) ----
  const activityCount = await prisma.activity.count();
  if (activityCount === 0 && teams.length > 0 && categories.length > 0) {
    const studentsByTeam = new Map<string, typeof allStudents>();
    for (const s of allStudents) {
      const list = studentsByTeam.get(s.teamId) ?? [];
      list.push(s);
      studentsByTeam.set(s.teamId, list);
    }

    const dollarCategory = categories.find((c) => c.statKind === "DOLLARS")!;
    const businessCategory = categories.find((c) => c.statKind === "BUSINESS_CONTACTED")!;
    const meetingCategory = categories.find((c) => c.statKind === "MEETING")!;
    const pitchCategory = categories.find((c) => c.statKind === "PITCH")!;
    const bonusCategories = categories.filter((c) => c.statKind === "BONUS");

    function sprintForDaysAgo(n: number) {
      const target = daysAgoDateOnly(n);
      return (
        sprints.find((s) => target >= s.startDate && target <= s.endDate)?.id ?? null
      );
    }
    function daysAgoDateOnly(n: number) {
      const d = new Date();
      d.setDate(d.getDate() - n);
      d.setHours(12, 0, 0, 0);
      return d;
    }

    const activityRows: Array<{
      teamId: string;
      studentId: string | null;
      categoryId: string;
      sprintId: string | null;
      date: Date;
      quantity: number;
      dollarAmount: number;
      notes: string;
      evidence: string;
      approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
      pointsAwarded: number;
    }> = [];

    for (const team of teams) {
      const roster = studentsByTeam.get(team.id) ?? [];
      // Spread activity across the last 27 days (covers sprints 1-3).
      for (let dayOffset = 27; dayOffset >= 1; dayOffset--) {
        // Not every team logs something every day — keeps it realistic.
        if (Math.random() > 0.55) continue;
        const numEntries = randInt(1, 3);
        for (let e = 0; e < numEntries; e++) {
          const student = roster.length ? pick(roster) : null;
          const sprintId = sprintForDaysAgo(dayOffset);
          const roll = Math.random();
          let category = businessCategory;
          let quantity = 1;
          let dollarAmount = 0;

          if (roll < 0.32) {
            category = businessCategory;
            quantity = randInt(1, 4);
          } else if (roll < 0.55) {
            category = meetingCategory;
            quantity = randInt(1, 2);
          } else if (roll < 0.72) {
            category = pitchCategory;
            quantity = 1;
          } else if (roll < 0.9) {
            category = dollarCategory;
            quantity = 1;
            dollarAmount = pick([100, 150, 200, 250, 300, 500, 750, 1000]);
          } else {
            category = pick(bonusCategories);
            quantity = 1;
          }

          const points =
            category.type === "DOLLAR"
              ? Math.round(((dollarAmount / 100) * category.pointsPer100) * 100) / 100
              : Math.round(category.pointValue * quantity * 100) / 100;

          activityRows.push({
            teamId: team.id,
            studentId: student?.id ?? null,
            categoryId: category.id,
            sprintId,
            date: daysAgo(dayOffset),
            quantity,
            dollarAmount,
            notes:
              category.statKind === "DOLLARS"
                ? "Donation confirmed via check."
                : category.statKind === "PITCH"
                ? "Pitched the giving opportunity to the business owner."
                : category.statKind === "MEETING"
                ? "Follow-up call scheduled."
                : "Logged during work block.",
            evidence: "Demo evidence — email confirmation on file.",
            approvalStatus: Math.random() < 0.06 ? "PENDING" : "APPROVED",
            pointsAwarded: points,
          });
        }
      }
    }

    // Batch insert.
    const BATCH = 50;
    for (let i = 0; i < activityRows.length; i += BATCH) {
      const batch = activityRows.slice(i, i + BATCH).map((r) => ({ ...r, isDemo: true }));
      await prisma.activity.createMany({ data: batch });
    }
    console.log(`Created ${activityRows.length} demo activities`);
  }

  // ---- Win of the Week history ----
  const winCount = await prisma.winOfWeek.count();
  if (winCount === 0 && awards.length > 0 && teams.length > 0 && allStudents.length > 0) {
    const winWeeksAgo = [21, 14, 7];
    for (const wk of winWeeksAgo) {
      const shuffledAwards = [...awards].sort(() => Math.random() - 0.5).slice(0, 3);
      for (const award of shuffledAwards) {
        const team = pick(teams);
        const roster = allStudents.filter((s) => s.teamId === team.id);
        const winner = roster.length ? pick(roster) : null;
        await prisma.winOfWeek.create({
          data: {
            awardId: award.id,
            winnerName: winner?.name ?? `${team.name} Team`,
            teamId: team.id,
            date: daysAgo(wk),
            description: `Recognized for outstanding performance during Week -${wk}.`,
            bonusPoints: pick([5, 5, 10]),
            prize: pick(["Boba gift card", "AAPLE merch", "Bragging rights + trophy shelf spot"]),
            isDemo: true,
          },
        });
      }
    }
    console.log("Created Win of the Week history");
  }

  // ---- Meetings ----
  const meetingCount = await prisma.meeting.count();
  if (meetingCount === 0) {
    const activeSprint = sprints.find((s) => s.status === "ACTIVE") ?? sprints[2] ?? null;
    const pastMeetings = [21, 14, 7].map((wk, idx) => ({
      date: daysAgo(wk),
      title: `Week ${idx + 1} Check-In`,
      sprintId: sprints[Math.min(idx, sprints.length - 1)]?.id ?? null,
      energyOpener: "Quick trivia: guess this week's total dollars raised!",
      sprintChallenge: "Fastest team to log 3 business contacts wins a shoutout.",
      workBlockNotes: "Teams worked in breakout rooms contacting businesses and practicing pitches.",
      nextMeetingGoal: "Every team books at least 2 new meetings before next week.",
    }));
    for (const m of pastMeetings) {
      await prisma.meeting.create({ data: { ...m, isDemo: true } });
    }
    await prisma.meeting.create({
      data: {
        date: daysFromNow(3),
        title: "Next Meeting — Win the Pitch Sprint",
        sprintId: activeSprint?.id ?? null,
        energyOpener: "60-second challenge: pitch a random object to the group.",
        sprintChallenge: "Best pitch of the day earns bonus Creative Approach points.",
        workBlockNotes: "Bring your pitch deck drafts for peer feedback.",
        nextMeetingGoal: "Every team completes at least 1 full pitch this week.",
        isDemo: true,
      },
    });
    console.log("Created meetings");
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
