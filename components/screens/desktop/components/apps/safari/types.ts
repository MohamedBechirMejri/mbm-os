export type Tab = {
  id: string;
  title: string;
  url: string;
  input: string;
  history: string[];
  historyIndex: number;
  loading: boolean;
  favicon: string | null;
};

export const START_PAGE = "https://mohamedbechirmejri.dev";
