import { useEffect, useRef } from "react";

export default function useOnceEffect(effect) {
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    effect();
  }, []);
}
