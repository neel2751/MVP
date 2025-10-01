import { can } from "@/actions/auth-user";
import { useState, useEffect } from "react";

export function usePermission(permission) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const has = await can(permission);
      if (mounted) setAllowed(has);
    })();
    return () => {
      mounted = false;
    };
  }, [permission]);

  return allowed;
}
