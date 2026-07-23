import type { ReactNode } from "react";

type BlankLayoutProps = {
  description?: ReactNode;
  content: ReactNode;
  floatingToolbar?: ReactNode;
};

export const BlankLayout = ({
  description,
  content,
  floatingToolbar,
}: BlankLayoutProps) => {
  return (
    <div className="flex-1 min-h-0 w-full min-w-0 box-border">
      <section className="h-full w-full relative flex-1 min-h-0 overflow-y-scroll px-3 pb-3">
        {description && <div className="min-h-0 flex">{description}</div>}

        {content}

        {floatingToolbar && (
          <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none z-10">
            {floatingToolbar}
          </div>
        )}
      </section>
    </div>
  );
};
