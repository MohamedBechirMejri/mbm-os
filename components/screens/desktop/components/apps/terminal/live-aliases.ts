type MetricRow = {
  readonly label: string;
  readonly value: string;
};

type HighlightRow = {
  readonly prefix: string;
  readonly detail: string;
};

export interface LiveAliasResult {
  readonly headline: string;
  readonly metrics: MetricRow[];
  readonly highlights?: HighlightRow[];
  readonly footer?: string[];
}

export interface LiveAliasDefinition {
  readonly aliasId: string;
  readonly description: string;
  readonly resolve: () => Promise<LiveAliasResult>;
}

interface GithubPulseResponse {
  readonly login: string;
  readonly name: string;
  readonly followers: number;
  readonly following: number;
  readonly publicRepos: number;
  readonly publicGists: number;
  readonly createdAt: string;
  readonly htmlUrl: string;
  readonly latestRepo: {
    readonly name: string;
    readonly description: string | null;
    readonly stars: number;
    readonly language: string | null;
    readonly pushedAt: string;
    readonly url: string;
  } | null;
  readonly recentRepos: {
    readonly name: string;
    readonly description: string | null;
    readonly stars: number;
    readonly forks: number;
    readonly language: string | null;
    readonly pushedAt: string;
    readonly url: string;
  }[];
  readonly recentActivity: {
    readonly summary: string;
    readonly occurredAt: string;
  }[];
  readonly fetchedAt: string;
}

const FALLBACK_ALIAS_RESULT: LiveAliasResult = {
  headline: "GitHub pulse temporarily unavailable",
  metrics: [
    {
      label: "Status",
      value: "GitHub API rate limit hit. Try again in a bit.",
    },
  ],
};

const PULSE_CACHE_TTL = 1000 * 60 * 2;

let cachedPulse: {
  readonly data: GithubPulseResponse;
  readonly expiresAt: number;
} | null = null;

async function fetchGithubPulse(): Promise<GithubPulseResponse> {
  if (cachedPulse && cachedPulse.expiresAt > Date.now()) {
    return cachedPulse.data;
  }

  const response = await fetch("/api/terminal/github", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch GitHub pulse: ${response.status}`);
  }

  const data = (await response.json()) as GithubPulseResponse;
  cachedPulse = {
    data,
    expiresAt: Date.now() + PULSE_CACHE_TTL,
  };
  return data;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatRelativeTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const delta = date.getTime() - Date.now();
  const absolute = Math.abs(delta);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (absolute >= week) {
    return rtf.format(Math.round(delta / week), "week");
  }
  if (absolute >= day) {
    return rtf.format(Math.round(delta / day), "day");
  }
  if (absolute >= hour) {
    return rtf.format(Math.round(delta / hour), "hour");
  }
  if (absolute >= minute) {
    return rtf.format(Math.round(delta / minute), "minute");
  }
  return "just now";
}

function formatRepoHighlights(
  repos: GithubPulseResponse["recentRepos"],
): HighlightRow[] {
  return repos.map((repo) => ({
    prefix: repo.name,
    detail: `${repo.description ? `${truncate(repo.description.trim(), 84)} • ` : ""}${repo.language ?? "Multi"} • Updated ${formatRelativeTime(repo.pushedAt)}`,
  }));
}

function formatRepoFooter(repos: GithubPulseResponse["recentRepos"]): string[] {
  return repos.map((repo) => `${repo.name}: ${repo.url}`);
}

function formatActivityHighlights(
  activity: GithubPulseResponse["recentActivity"],
): HighlightRow[] {
  return activity.map((item, index) => ({
    prefix: `#${index + 1}`,
    detail: `${item.summary} (${formatRelativeTime(item.occurredAt)})`,
  }));
}

function truncate(value: string, maxLength: number): string {
  if (!value) return "";
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
}

export const liveAliasRegistry: LiveAliasDefinition[] = [
  {
    aliasId: "pulse",
    description: "Live GitHub pulse with followers, repos, and latest push",
    async resolve(): Promise<LiveAliasResult> {
      try {
        const pulse = await fetchGithubPulse();

        const metrics: MetricRow[] = [
          { label: "Followers", value: pulse.followers.toString() },
          { label: "Following", value: pulse.following.toString() },
          { label: "Public repos", value: pulse.publicRepos.toString() },
          { label: "Public gists", value: pulse.publicGists.toString() },
        ];

        const highlights: HighlightRow[] = [];

        if (pulse.latestRepo) {
          highlights.push({
            prefix: "Latest push",
            detail: `${pulse.latestRepo.name} • ${formatDate(pulse.latestRepo.pushedAt)}`,
          });
          const trimmedDescription = pulse.latestRepo.description?.trim();
          if (trimmedDescription) {
            highlights.push({
              prefix: "Focus",
              detail: trimmedDescription,
            });
          }
          highlights.push({
            prefix: "Repo",
            detail: `${pulse.latestRepo.url} (${pulse.latestRepo.language ?? "Multi"} • ★ ${pulse.latestRepo.stars})`,
          });
        }

        const footer: string[] = [
          `Profile: ${pulse.htmlUrl}`,
          `Tracking since ${formatDate(pulse.createdAt)}`,
          `Refreshed ${formatDate(pulse.fetchedAt)}`,
        ];

        return {
          headline: `${pulse.name}'s GitHub pulse`,
          metrics,
          highlights,
          footer,
        };
      } catch (cause) {
        console.error(cause);
        return FALLBACK_ALIAS_RESULT;
      }
    },
  },
  {
    aliasId: "repos",
    description: "Top active repositories from the last pushes",
    async resolve(): Promise<LiveAliasResult> {
      try {
        const pulse = await fetchGithubPulse();
        if (!pulse.recentRepos.length) {
          return {
            headline: "No active repositories detected",
            metrics: [
              {
                label: "Status",
                value: "GitHub did not return any public repositories.",
              },
            ],
          };
        }

        const freshest = pulse.recentRepos[0];
        const topStarred = [...pulse.recentRepos].sort(
          (first, second) => second.stars - first.stars,
        )[0];

        const metrics: MetricRow[] = [
          {
            label: "Active repos",
            value: pulse.recentRepos.length.toString(),
          },
          {
            label: "Freshest push",
            value: `${freshest.name} • ${formatRelativeTime(freshest.pushedAt)}`,
          },
          {
            label: "Top stars",
            value: `${topStarred.name} • ★ ${topStarred.stars}`,
          },
        ];

        return {
          headline: "Recent GitHub repository momentum",
          metrics,
          highlights: formatRepoHighlights(pulse.recentRepos),
          footer: formatRepoFooter(pulse.recentRepos),
        };
      } catch (cause) {
        console.error(cause);
        return FALLBACK_ALIAS_RESULT;
      }
    },
  },
  {
    aliasId: "activity",
    description: "Latest GitHub activity condensed into signal",
    async resolve(): Promise<LiveAliasResult> {
      try {
        const pulse = await fetchGithubPulse();

        if (!pulse.recentActivity.length) {
          return {
            headline: "No recent public activity",
            metrics: [
              {
                label: "Status",
                value: "GitHub quiet mode is on — no public events returned.",
              },
            ],
          };
        }

        const newestEvent = pulse.recentActivity[0];

        const metrics: MetricRow[] = [
          {
            label: "Events scanned",
            value: pulse.recentActivity.length.toString(),
          },
          {
            label: "Latest",
            value: `${formatRelativeTime(newestEvent.occurredAt)} (${formatDate(newestEvent.occurredAt)})`,
          },
        ];

        return {
          headline: "Live GitHub activity stream",
          metrics,
          highlights: formatActivityHighlights(pulse.recentActivity),
          footer: [
            `Feed: https://github.com/${pulse.login}?tab=overview`,
            `Refreshed ${formatDate(pulse.fetchedAt)}`,
          ],
        };
      } catch (cause) {
        console.error(cause);
        return FALLBACK_ALIAS_RESULT;
      }
    },
  },
];
