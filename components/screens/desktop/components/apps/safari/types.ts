export type TabMode = "direct" | "reader";

export type Tab = {
  id: string;
  title: string;
  url: string;
  input: string;
  history: string[];
  historyIndex: number;
  loading: boolean;
  favicon: string | null;
  frameUrl: string;
  revision: number;
  mode: TabMode;
  restricted: boolean;
};

export const START_PAGE = "https://www.dogpile.com";
