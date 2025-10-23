import { NextResponse } from "next/server";

const GITHUB_USERNAME = "mohamedbechirmejri";
const USER_AGENT_HEADER = "mbm-os-terminal";

interface GithubUserResponse {
  readonly login: string;
  readonly name: string | null;
  readonly followers: number;
  readonly following: number;
  readonly public_repos: number;
  readonly public_gists: number;
  readonly created_at: string;
  readonly html_url: string;
}

interface GithubRepoResponse {
  readonly name: string;
  readonly description: string | null;
  readonly html_url: string;
  readonly stargazers_count: number;
  readonly forks_count: number;
  readonly language: string | null;
  readonly pushed_at: string;
  readonly fork: boolean;
  readonly private: boolean;
}

interface GithubEventResponse {
  readonly id: string;
  readonly type: string;
  readonly created_at: string;
  readonly repo: {
    readonly name: string;
    readonly url: string;
  };
  readonly payload: {
    readonly action?: string;
    readonly ref_type?: string;
    readonly ref?: string;
    readonly commits?: {
      readonly message: string;
    }[];
    readonly pull_request?: {
      readonly number: number;
      readonly title: string;
      readonly merged?: boolean;
      readonly html_url: string;
    };
    readonly issue?: {
      readonly number: number;
      readonly title: string;
      readonly html_url: string;
    };
    readonly release?: {
      readonly name: string | null;
      readonly tag_name: string;
      readonly html_url: string;
    };
  };
}

interface GithubPulsePayload {
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

export const runtime = "edge";

export async function GET(): Promise<
  NextResponse<GithubPulsePayload | { error: string }>
> {
  try {
    const [userResponse, reposResponse, eventsResponse] = await Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": USER_AGENT_HEADER,
        },
        next: {
          revalidate: 600,
        },
      }),
      fetch(
        `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=10&sort=updated`,
        {
          headers: {
            Accept: "application/vnd.github+json",
            "User-Agent": USER_AGENT_HEADER,
          },
          next: {
            revalidate: 600,
          },
        },
      ),
      fetch(
        `https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=12`,
        {
          headers: {
            Accept: "application/vnd.github+json",
            "User-Agent": USER_AGENT_HEADER,
          },
          next: {
            revalidate: 300,
          },
        },
      ),
    ]);

    if (!userResponse.ok) {
      return NextResponse.json(
        {
          error: `GitHub user lookup failed with status ${userResponse.status}`,
        },
        { status: 502 },
      );
    }

    if (!reposResponse.ok) {
      return NextResponse.json(
        {
          error: `GitHub repos lookup failed with status ${reposResponse.status}`,
        },
        { status: 502 },
      );
    }

    if (!eventsResponse.ok) {
      return NextResponse.json(
        {
          error: `GitHub events lookup failed with status ${eventsResponse.status}`,
        },
        { status: 502 },
      );
    }

    const user = (await userResponse.json()) as GithubUserResponse;
    const repos = (await reposResponse.json()) as GithubRepoResponse[];
    const events = (await eventsResponse.json()) as GithubEventResponse[];

    const visibleRepos = repos.filter((repo) => !repo.fork && !repo.private);

    const latestRepo =
      visibleRepos.sort(
        (first, second) =>
          new Date(second.pushed_at).getTime() -
          new Date(first.pushed_at).getTime(),
      )[0] ?? null;

    const recentRepos = visibleRepos
      .sort(
        (first, second) =>
          new Date(second.pushed_at).getTime() -
          new Date(first.pushed_at).getTime(),
      )
      .slice(0, 4)
      .map((repo) => ({
        name: repo.name,
        description: repo.description,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        pushedAt: repo.pushed_at,
        url: repo.html_url,
      }));

    const recentActivity = events
      .map((event) => describeEvent(event))
      .filter(
        (value): value is { summary: string; occurredAt: string } =>
          value !== null,
      )
      .slice(0, 6);

    const payload: GithubPulsePayload = {
      login: user.login,
      name: user.name ?? user.login,
      followers: user.followers,
      following: user.following,
      publicRepos: user.public_repos,
      publicGists: user.public_gists,
      createdAt: user.created_at,
      htmlUrl: user.html_url,
      latestRepo: latestRepo
        ? {
            name: latestRepo.name,
            description: latestRepo.description,
            stars: latestRepo.stargazers_count,
            language: latestRepo.language,
            pushedAt: latestRepo.pushed_at,
            url: latestRepo.html_url,
          }
        : null,
      recentRepos,
      recentActivity,
      fetchedAt: new Date().toISOString(),
    };

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to contact GitHub right now." },
      { status: 503 },
    );
  }
}

function describeEvent(
  event: GithubEventResponse,
): { summary: string; occurredAt: string } | null {
  const occurredAt = event.created_at;
  switch (event.type) {
    case "PushEvent": {
      const commitCount = event.payload.commits?.length ?? 0;
      const primaryMessage = event.payload.commits?.[0]?.message;
      const summary = commitCount
        ? `Pushed ${commitCount} commit${commitCount === 1 ? "" : "s"} to ${event.repo.name} — ${truncate(
            primaryMessage ?? "Latest commit",
            72,
          )}`
        : `Pushed to ${event.repo.name}`;
      return { summary, occurredAt };
    }
    case "PullRequestEvent": {
      const action = event.payload.action ?? "updated";
      const pr = event.payload.pull_request;
      if (!pr) {
        return null;
      }
      const mergedFlag = pr.merged ? " (merged)" : "";
      const summary = `${capitalize(action)} PR #${pr.number} in ${event.repo.name}${mergedFlag} — ${truncate(
        pr.title,
        72,
      )}`;
      return { summary, occurredAt };
    }
    case "IssuesEvent": {
      const action = event.payload.action ?? "updated";
      const issue = event.payload.issue;
      if (!issue) {
        return null;
      }
      const summary = `${capitalize(action)} issue #${issue.number} in ${event.repo.name} — ${truncate(
        issue.title,
        72,
      )}`;
      return { summary, occurredAt };
    }
    case "CreateEvent": {
      const refType = event.payload.ref_type ?? "ref";
      const refName = event.payload.ref ?? event.repo.name;
      const summary = `Created ${refType} ${refName} in ${event.repo.name}`;
      return { summary, occurredAt };
    }
    case "ReleaseEvent": {
      const release = event.payload.release;
      if (!release) {
        return null;
      }
      const summary = `Released ${release.tag_name} in ${event.repo.name} — ${truncate(
        release.name ?? "",
        72,
      )}`;
      return { summary, occurredAt };
    }
    default: {
      const summary = `${event.type.replace(/Event$/, "")} on ${event.repo.name}`;
      return { summary, occurredAt };
    }
  }
}

function truncate(value: string, maxLength: number): string {
  if (!value) return "";
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
}

function capitalize(value: string): string {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}
