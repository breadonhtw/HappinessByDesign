import { useCallback, useEffect, useMemo, useState } from "react";

export const LOCATION_CHANGE_EVENT = "app:locationchange";

function readLocationSnapshot() {
  return {
    pathname: window.location.pathname,
    search: window.location.search,
  };
}

function notifyLocationChange() {
  window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT));
}

export function navigateToUrl(nextUrl, { replace = false } = {}) {
  window.history[replace ? "replaceState" : "pushState"]({}, "", nextUrl);
  notifyLocationChange();
}

export function useLocationSearchParams() {
  const [locationState, setLocationState] = useState(readLocationSnapshot);

  useEffect(() => {
    const handleLocationChange = () => {
      setLocationState(readLocationSnapshot());
    };

    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener(LOCATION_CHANGE_EVENT, handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener(LOCATION_CHANGE_EVENT, handleLocationChange);
    };
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

    navigateToUrl(nextUrl, { replace });
  }, []);

  return [searchParams, setSearchParams];
}
