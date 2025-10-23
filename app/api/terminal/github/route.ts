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
  readonly language: string | null;
  readonly pushed_at: string;
  readonly fork: boolean;
  readonly private: boolean;
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
  readonly fetchedAt: string;
}

export const runtime = "edge";

export async function GET(): Promise<
  NextResponse<GithubPulsePayload | { error: string }>
> {
  try {
    const [userResponse, reposResponse] = await Promise.all([
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

    const user = (await userResponse.json()) as GithubUserResponse;
    const repos = (await reposResponse.json()) as GithubRepoResponse[];

    const latestRepo =
      repos
        .filter((repo) => !repo.fork && !repo.private)
        .sort(
          (first, second) =>
            new Date(second.pushed_at).getTime() -
            new Date(first.pushed_at).getTime(),
        )[0] ?? null;

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
