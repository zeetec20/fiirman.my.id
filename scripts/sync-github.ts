#!/usr/bin/env bun
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

interface GitHubContributionDayNode {
  date: string;
  contributionCount: number;
  contributionLevel: string;
}

interface GitHubGraphQLResponse {
  data?: {
    user?: {
      repositories?: {
        totalCount: number;
      };
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions: number;
          weeks: Array<{
            contributionDays: GitHubContributionDayNode[];
          }>;
        };
      };
    };
  };
  errors?: Array<{ message: string }>;
}

export interface GitHubActivityDayRecord {
  count: number;
  level: number;
}

export interface GitHubActivitySnapshot {
  year: number;
  totalContributions: number;
  publicRepos: number;
  longestStreak: number;
  currentStreak: number;
  updatedAt: string;
  days: Record<string, GitHubActivityDayRecord>;
}

const ROOT_DIR = path.resolve(import.meta.dir, "..");
const OUTPUT_FILE_PATH = path.join(
  ROOT_DIR,
  "src",
  "data",
  "github-activity.json",
);
const TARGET_YEAR = 2026;
const TARGET_USERNAME = "zeetec20";

const resolveGitHubAuthToken = (): string => {
  if (process.env.GITHUB_TOKEN) {
    return process.env.GITHUB_TOKEN.trim();
  }
  if (process.env.GH_TOKEN) {
    return process.env.GH_TOKEN.trim();
  }
  try {
    return execSync("gh auth token", {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
};

const mapGitHubContributionLevelToNumeric = (level: string): number => {
  switch (level) {
    case "FOURTH_QUARTILE":
      return 4;
    case "THIRD_QUARTILE":
      return 3;
    case "SECOND_QUARTILE":
      return 2;
    case "FIRST_QUARTILE":
      return 1;
    default:
      return 0;
  }
};

const getLocalTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${date}`;
};

const calculateGitHubActivityStreaks = (
  days: GitHubContributionDayNode[],
): { longestStreak: number; currentStreak: number } => {
  let longestStreak = 0;
  let runningStreak = 0;

  for (const day of days) {
    if (day.contributionCount > 0) {
      runningStreak++;
      if (runningStreak > longestStreak) {
        longestStreak = runningStreak;
      }
    } else {
      runningStreak = 0;
    }
  }

  const todayStr = getLocalTodayDateString();
  const pastDays = days.filter((d) => d.date <= todayStr);
  let currentStreak = 0;

  for (let idx = pastDays.length - 1; idx >= 0; idx--) {
    const day = pastDays[idx];
    if (day.contributionCount > 0) {
      currentStreak++;
    } else {
      if (idx === pastDays.length - 1) {
        // Today has 0 contributions so far; continue to inspect yesterday
        continue;
      }
      break;
    }
  }

  return { longestStreak, currentStreak };
};

const fetchGitHubContributionGraphQL = async (
  token: string,
): Promise<GitHubGraphQLResponse> => {
  const fromIso = `${TARGET_YEAR}-01-01T00:00:00Z`;
  const toIso = `${TARGET_YEAR}-12-31T23:59:59Z`;

  const query = `
    query GitHubActivityQuery($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        repositories(privacy: PUBLIC) {
          totalCount
        }
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                contributionLevel
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "fiirman-portfolio-sync",
    },
    body: JSON.stringify({
      query,
      variables: {
        login: TARGET_USERNAME,
        from: fromIso,
        to: toIso,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(
      `GitHub GraphQL API returned HTTP status ${response.status}: ${response.statusText}`,
    );
  }

  return (await response.json()) as GitHubGraphQLResponse;
};

const syncGitHubActivitySnapshot = async (): Promise<void> => {
  console.log(
    `[sync:github] Fetching GitHub contribution data for @${TARGET_USERNAME} (${TARGET_YEAR})...`,
  );

  const token = resolveGitHubAuthToken();
  if (!token) {
    if (existsSync(OUTPUT_FILE_PATH)) {
      console.warn(
        "[sync:github] Warning: No GitHub auth token found. Retaining existing github-activity.json snapshot.",
      );
      return;
    }
    throw new Error(
      "No GitHub token found via GITHUB_TOKEN, GH_TOKEN, or `gh auth token`.",
    );
  }

  try {
    const data = await fetchGitHubContributionGraphQL(token);

    if (data.errors && data.errors.length > 0) {
      throw new Error(
        `GraphQL error: ${data.errors.map((e) => e.message).join(", ")}`,
      );
    }

    const userData = data.data?.user;
    if (!userData) {
      throw new Error(`User @${TARGET_USERNAME} not found in GitHub GraphQL.`);
    }

    const publicRepos = userData.repositories?.totalCount ?? 0;
    const calendar = userData.contributionsCollection?.contributionCalendar;
    const totalContributions = calendar?.totalContributions ?? 0;
    const weeks = calendar?.weeks ?? [];
    const allDays = weeks.flatMap((w) => w.contributionDays);

    const { longestStreak, currentStreak } =
      calculateGitHubActivityStreaks(allDays);

    const daysMap: Record<string, GitHubActivityDayRecord> = {};
    for (const day of allDays) {
      daysMap[day.date] = {
        count: day.contributionCount,
        level: mapGitHubContributionLevelToNumeric(day.contributionLevel),
      };
    }

    const snapshot: GitHubActivitySnapshot = {
      year: TARGET_YEAR,
      totalContributions,
      publicRepos,
      longestStreak,
      currentStreak,
      updatedAt: new Date().toISOString(),
      days: daysMap,
    };

    await mkdir(path.dirname(OUTPUT_FILE_PATH), { recursive: true });
    await writeFile(
      OUTPUT_FILE_PATH,
      `${JSON.stringify(snapshot, null, 2)}\n`,
      "utf8",
    );

    console.log(
      `[sync:github] Successfully updated ${path.relative(ROOT_DIR, OUTPUT_FILE_PATH)}: ` +
        `${totalContributions} contributions, ${publicRepos} public repos, ` +
        `${longestStreak}-day longest streak, ${currentStreak}-day current streak.`,
    );
  } catch (error) {
    if (existsSync(OUTPUT_FILE_PATH)) {
      console.warn(
        `[sync:github] Warning: Failed to sync GitHub activity (${(error as Error).message}). Retaining existing snapshot.`,
      );
      return;
    }
    throw error;
  }
};

await syncGitHubActivitySnapshot();
