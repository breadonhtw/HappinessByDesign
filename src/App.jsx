import React, { useEffect, useState } from "react";

import { LOCATION_CHANGE_EVENT } from "./lib/location";
import TrailMapPage from "./pages/TrailMapPage";
import VotingPage from "./pages/VotingPage";

function readPathname() {
  return window.location.pathname;
}

export default function App() {
  const [pathname, setPathname] = useState(readPathname);

  useEffect(() => {
    const syncPathname = () => {
      setPathname(readPathname());
    };

    window.addEventListener("popstate", syncPathname);
    window.addEventListener("hashchange", syncPathname);
    window.addEventListener(LOCATION_CHANGE_EVENT, syncPathname);

    return () => {
      window.removeEventListener("popstate", syncPathname);
      window.removeEventListener("hashchange", syncPathname);
      window.removeEventListener(LOCATION_CHANGE_EVENT, syncPathname);
    };
  }, []);

  if (pathname.startsWith("/map")) {
    return <TrailMapPage />;
  }

  return <VotingPage />;
}
