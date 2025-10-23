import { TitlebarPortal } from "../../../../window-manager/components/window-view/titlebar-portal";
import type { FSFolder, FSPath } from "../../fs";
import type { ViewMode } from "../../types";
import { Breadcrumb } from "./breadcrumb";
import { Navigation } from "./navigation";
import { PreviewToggle } from "./preview-toggle";
import { SearchBar } from "./search-bar";
import { ViewModeSelector } from "./view-mode-selector";

interface ToolbarProps {
  folder: FSFolder;
  currentCrumb: { id: string; name: string } | undefined;
  path: FSPath;
  view: ViewMode;
  showPreview: boolean;
  query: string;
  onGoUp: () => void;
  onViewChange: (view: ViewMode) => void;
  onPreviewToggle: () => void;
  onQueryChange: (query: string) => void;
}

export function Toolbar({
  folder,
  currentCrumb,
  path,
  view,
  showPreview,
  query,
  onGoUp,
  onViewChange,
  onPreviewToggle,
  onQueryChange,
}: ToolbarProps) {
  return (
    <TitlebarPortal>
      <div className="pointer-events-none w-full pl-46 pt-[1.1rem]">
        <div className="w-full !overflow-visible flex border">
          <div className="flex min-w-0 items-center gap-3">
            <Navigation canGoBack={path.length > 0} onGoBack={onGoUp} />
            <Breadcrumb folder={folder} currentCrumb={currentCrumb} />
          </div>

          <ViewModeSelector view={view} onViewChange={onViewChange} />

          <div className="flex items-center gap-2">
            <PreviewToggle
              showPreview={showPreview}
              onPreviewToggle={onPreviewToggle}
            />
            <SearchBar query={query} onQueryChange={onQueryChange} />
          </div>
        </div>
      </div>
    </TitlebarPortal>
  );
}
