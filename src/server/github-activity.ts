import type { KVNamespace } from "@cloudflare/workers-types";
import { createServerFn } from "@tanstack/react-start";
import staticGitHubActivity from "@/data/github-activity.json";

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

interface GitHubGraphQLContributionDay {
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
            contributionDays: GitHubGraphQLContributionDay[];
          }>;
        };
      };
    };
  };
  errors?: Array<{ message: string }>;
}

const TARGET_USERNAME = "zeetec20";
const TARGET_YEAR = 2026;
const CACHE_KEY = `github:activity:${TARGET_USERNAME}:${TARGET_YEAR}`;
const CACHE_TTL_SECONDS = 86400;

export const resolveGitHubActivityKV =
  async (): Promise<KVNamespace | null> => {
    try {
      // Platform-specific virtual module that only exists inside Cloudflare Workers runtime
      const workersModule = await import(
        /* @vite-ignore */ "cloudflare:workers"
      ).catch(() => null);
      const workerEnv = workersModule?.env as
        | Record<string, unknown>
        | undefined;
      const workerBinding =
        workerEnv?.GITHUB_ACTIVITY_KV ?? workerEnv?.github_activity_kv;
      if (workerBinding) {
        return workerBinding as KVNamespace;
      }
    } catch {
      // cloudflare:workers unavailable outside Cloudflare runtime
    }

    const globalScope = globalThis as Record<string, unknown>;
    const globalBinding =
      globalScope.GITHUB_ACTIVITY_KV ?? globalScope.github_activity_kv;
    if (globalBinding) {
      return globalBinding as KVNamespace;
    }

    const processScope = (
      typeof process !== "undefined" ? process.env : {}
    ) as Record<string, unknown>;
    const processBinding =
      processScope.GITHUB_ACTIVITY_KV ?? processScope.github_activity_kv;
    if (processBinding) {
      return processBinding as KVNamespace;
    }

    return null;
  };

const mapContributionLevelToNumeric = (level: string): number => {
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

export const calculateGitHubActivityStreaks = (
  days: Array<{ date: string; count: number }>,
): { longestStreak: number; currentStreak: number } => {
  let longestStreak = 0;
  let runningStreak = 0;

  for (const day of days) {
    if (day.count > 0) {
      runningStreak++;
      if (runningStreak > longestStreak) {
        longestStreak = runningStreak;
      }
    } else {
      runningStreak = 0;
    }
  }

  const now = new Date();
  const todayStr = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  const pastDays = days.filter((d) => d.date <= todayStr);
  let currentStreak = 0;

  for (let idx = pastDays.length - 1; idx >= 0; idx--) {
    const day = pastDays[idx];
    if (day.count > 0) {
      currentStreak++;
    } else {
      if (idx === pastDays.length - 1) {
        // Today has no contributions yet; inspect yesterday
        continue;
      }
      break;
    }
  }

  return { longestStreak, currentStreak };
};

export const parseGitHubPublicContributionsHtml = (
  html: string,
): {
  totalContributions: number;
  days: Record<string, GitHubActivityDayRecord>;
} => {
  const h2Match = html.match(
    /id="js-contribution-activity-description"[^>]*>([\s\S]*?)<\/h2>/i,
  );
  const totalMatch = h2Match
    ? h2Match[1].match(/([\d,]+)\s+contributions/i)
    : null;
  const parsedHeaderTotal = totalMatch
    ? parseInt(totalMatch[1].replace(/,/g, ""), 10)
    : 0;

  const tooltipMap = new Map<string, string>();
  const tooltipRegex =
    /<tool-tip[^>]*\bfor="([^"]+)"[^>]*>([\s\S]*?)<\/tool-tip>/gi;
  let tooltipMatch: RegExpExecArray | null = tooltipRegex.exec(html);
  while (tooltipMatch !== null) {
    tooltipMap.set(tooltipMatch[1], tooltipMatch[2].trim());
    tooltipMatch = tooltipRegex.exec(html);
  }

  const tdRegex = /<td[^>]*\bdata-date="([0-9]{4}-[0-9]{2}-[0-9]{2})"[^>]*>/gi;
  let tdMatch: RegExpExecArray | null = tdRegex.exec(html);
  const days: Record<string, GitHubActivityDayRecord> = {};
  let summedContributions = 0;

  while (tdMatch !== null) {
    const fullTd = tdMatch[0];
    const date = tdMatch[1];
    const levelMatch = fullTd.match(/data-level="([0-9]+)"/i);
    const idMatch = fullTd.match(/id="([^"]+)"/i);
    const level = levelMatch ? parseInt(levelMatch[1], 10) : 0;
    let count = 0;

    if (idMatch && tooltipMap.has(idMatch[1])) {
      const tooltipText = tooltipMap.get(idMatch[1]) ?? "";
      if (/no contributions/i.test(tooltipText)) {
        count = 0;
      } else {
        const countMatch = tooltipText.match(/([0-9,]+)\s+contribution/i);
        count = countMatch
          ? parseInt(countMatch[1].replace(/,/g, ""), 10)
          : level > 0
            ? 1
            : 0;
      }
    } else {
      count = level > 0 ? 1 : 0;
    }

    days[date] = { count, level };
    summedContributions += count;
    tdMatch = tdRegex.exec(html);
  }

  const totalContributions =
    parsedHeaderTotal > 0 ? parsedHeaderTotal : summedContributions;

  return { totalContributions, days };
};

const fetchPublicRepositoriesCount = async (): Promise<number> => {
  try {
    const res = await fetch(`https://api.github.com/users/${TARGET_USERNAME}`, {
      headers: {
        "User-Agent": "fiirman-portfolio",
        Accept: "application/vnd.github.v3+json",
      },
    });
    if (!res.ok) {
      return (staticGitHubActivity as GitHubActivitySnapshot).publicRepos;
    }
    const json = (await res.json()) as { public_repos?: number };
    return typeof json.public_repos === "number"
      ? json.public_repos
      : (staticGitHubActivity as GitHubActivitySnapshot).publicRepos;
  } catch {
    return (staticGitHubActivity as GitHubActivitySnapshot).publicRepos;
  }
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
      "User-Agent": "fiirman-portfolio",
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
      `GitHub GraphQL returned status ${response.status}: ${response.statusText}`,
    );
  }

  return (await response.json()) as GitHubGraphQLResponse;
};

export const fetchLiveGitHubActivitySnapshot =
  async (): Promise<GitHubActivitySnapshot> => {
    const token =
      (typeof process !== "undefined" &&
        (process.env.GITHUB_TOKEN || process.env.GH_TOKEN)) ||
      "";

    if (token) {
      try {
        const graphQLData = await fetchGitHubContributionGraphQL(token);
        const user = graphQLData.data?.user;
        const calendar = user?.contributionsCollection?.contributionCalendar;

        if (user && calendar) {
          const publicRepos = user.repositories?.totalCount ?? 0;
          const totalContributions = calendar.totalContributions;
          const allDays = calendar.weeks.flatMap((w) => w.contributionDays);

          const daysMap: Record<string, GitHubActivityDayRecord> = {};
          for (const day of allDays) {
            daysMap[day.date] = {
              count: day.contributionCount,
              level: mapContributionLevelToNumeric(day.contributionLevel),
            };
          }

          const sortedDayList = Object.entries(daysMap)
            .map(([date, rec]) => ({ date, count: rec.count }))
            .sort((a, b) => a.date.localeCompare(b.date));

          const { longestStreak, currentStreak } =
            calculateGitHubActivityStreaks(sortedDayList);

          return {
            year: TARGET_YEAR,
            totalContributions,
            publicRepos,
            longestStreak,
            currentStreak,
            updatedAt: new Date().toISOString(),
            days: daysMap,
          };
        }
      } catch (graphQLError) {
        console.warn(
          `[server:github-activity] GraphQL request failed, falling back to public endpoint: ${(graphQLError as Error).message}`,
        );
      }
    }

    const [htmlResponse, publicRepos] = await Promise.all([
      fetch(
        `https://github.com/users/${TARGET_USERNAME}/contributions?from=${TARGET_YEAR}-01-01&to=${TARGET_YEAR}-12-31`,
        {
          headers: {
            "User-Agent": "fiirman-portfolio",
            Accept: "text/html",
          },
        },
      ),
      fetchPublicRepositoriesCount(),
    ]);

    if (!htmlResponse.ok) {
      throw new Error(
        `Public contributions page returned status ${htmlResponse.status}: ${htmlResponse.statusText}`,
      );
    }

    const html = await htmlResponse.text();
    const { totalContributions, days } =
      parseGitHubPublicContributionsHtml(html);

    const sortedDayList = Object.entries(days)
      .map(([date, rec]) => ({ date, count: rec.count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const { longestStreak, currentStreak } =
      calculateGitHubActivityStreaks(sortedDayList);

    return {
      year: TARGET_YEAR,
      totalContributions,
      publicRepos,
      longestStreak,
      currentStreak,
      updatedAt: new Date().toISOString(),
      days,
    };
  };

export const resolveCachedGitHubActivitySnapshot =
  async (): Promise<GitHubActivitySnapshot> => {
    try {
      const kv = await resolveGitHubActivityKV();
      if (kv) {
        const cached = await kv.get<GitHubActivitySnapshot>(CACHE_KEY, "json");
        if (cached?.days && typeof cached.totalContributions === "number") {
          return cached;
        }
      }

      const liveSnapshot = await fetchLiveGitHubActivitySnapshot();

      if (kv) {
        try {
          await kv.put(CACHE_KEY, JSON.stringify(liveSnapshot), {
            expirationTtl: CACHE_TTL_SECONDS,
          });
        } catch (kvWriteError) {
          console.warn(
            `[server:github-activity] Failed to store snapshot in KV: ${(kvWriteError as Error).message}`,
          );
        }
      }

      return liveSnapshot;
    } catch (error) {
      console.warn(
        `[server:github-activity] Failed to resolve GitHub activity snapshot: ${(error as Error).message}. Falling back to static data.`,
      );
      return staticGitHubActivity as GitHubActivitySnapshot;
    }
  };

export const getGitHubActivityServerFn = createServerFn({
  method: "GET",
}).handler(async () => resolveCachedGitHubActivitySnapshot());
