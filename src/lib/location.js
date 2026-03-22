import { useCallback, useEffect, useMemo, useState } from "react";

function readLocationSnapshot() {
  return {
    pathname: window.location.pathname,
    search: window.location.search,
  };
}

export function useLocationSearchParams() {
  const [locationState, setLocationState] = useState(readLocationSnapshot);

  useEffect(() => {
    const handlePopState = () => {
      setLocationState(readLocationSnapshot());
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const searchParams = useMemo(
    () => new URLSearchParams(locationState.search),
    [locationState.search],
  );

  const setSearchParams = useCallback((nextValue, { replace = false } = {}) => {
    const currentParams = new URLSearchParams(window.location.search);
    const nextParams =
      typeof nextValue === "function" ? nextValue(currentParams) : nextValue;
    const normalizedParams =
      nextParams instanceof URLSearchParams
        ? nextParams
        : new URLSearchParams(nextParams);
    const nextSearch = normalizedParams.toString();
    const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}`;

    window.history[replace ? "replaceState" : "pushState"]({}, "", nextUrl);
    setLocationState(readLocationSnapshot());
  }, []);

  return [searchParams, setSearchParams];
}
