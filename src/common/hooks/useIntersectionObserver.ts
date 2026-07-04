import { useEffect, useRef } from "react";

export const useIntersectionObserver = (
  refs: React.MutableRefObject<HTMLDivElement[] | null>,
  callback: (entry: IntersectionObserverEntry) => void,
  intersectionObserverOptions = {},
  options: { disabled: boolean } = { disabled: false },
) => {
  const isIntersectionObserverAvailable = useRef(
    typeof IntersectionObserver === "function",
  );
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (
      !refs.current ||
      !isIntersectionObserverAvailable.current ||
      options.disabled
    ) {
      return;
    }

    observerRef.current = new IntersectionObserver(([entry]) => {
      entry.isIntersecting && callback(entry);
    }, intersectionObserverOptions);

    refs.current.forEach((element) => {
      observerRef.current?.observe(element);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [callback, intersectionObserverOptions, options.disabled, refs]);

  return isIntersectionObserverAvailable;
};
