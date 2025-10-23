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

async function fetchGithubPulse(): Promise<GithubPulseResponse> {
  const response = await fetch("/api/terminal/github", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch GitHub pulse: ${response.status}`);
  }

  return (await response.json()) as GithubPulseResponse;
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

export const liveAliasRegistry: LiveAliasDefinition[] = [
  {
    aliasId: "pulse",
    description: "Live GitHub pulse with followers, repos, and latest push",
    async resolve(): Promise<LiveAliasResult> {
      try {
        const pulse = await fetchGithubPulse();
        console.log(pulse)

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
];
