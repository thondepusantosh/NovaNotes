import { useEffect, useRef, useState } from "react";
import { liveQuery } from "dexie";

// Subscribes to a Dexie liveQuery(querier) and re-renders on change.
// `deps` controls when the querier is re-subscribed (like useEffect deps).
export function useLiveQuery(querier, deps = [], initialValue = undefined) {
  const [value, setValue] = useState(initialValue);
  const querierRef = useRef(querier);
  querierRef.current = querier;

  useEffect(() => {
    const subscription = liveQuery(() => querierRef.current()).subscribe({
      next: setValue,
      error: (err) => console.error("useLiveQuery error:", err),
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return value;
}
