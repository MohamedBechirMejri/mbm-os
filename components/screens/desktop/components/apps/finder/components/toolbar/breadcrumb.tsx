import type { FSFolder } from "../../fs";
import { FileIcon } from "../file-icon";

interface BreadcrumbProps {
  folder: FSFolder;
  currentCrumb: { id: string; name: string } | undefined;
}

export function Breadcrumb({ folder, currentCrumb }: BreadcrumbProps) {
  return (
    <div className="hidden min-w-0 items-center gap-2 rounded-[1.1rem] bg-white/10 px-3 py-[0.45rem] md:flex">
      {currentCrumb ? (
        <>
          <FileIcon node={folder} size={20} />
          <span className="truncate text-[0.8125rem] font-medium text-white/85">
            {currentCrumb.name}
          </span>
        </>
      ) : (
        <span className="text-white/65">Finder</span>
      )}
    </div>
  );
}
