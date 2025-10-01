"use server";

import { safeSerialize } from "@/lib/safe-serlialize";
import { QueryClient } from "@tanstack/react-query";

export async function useQueryServer({
  params,
  fetchFn,
  queryKey,
  enabled = true,
  options = {},
}) {
  const queryClient = new QueryClient();
  if (!queryKey) {
    throw new Error("queryKey is required");
  }

  const FIVE_MINUTES = 1000 * 60 * 5;
  const THIRTY_MINUTES = 1000 * 60 * 30;
  const RETRY = 3;
  const RETRY_DELAY = 2000;
  options.staleTime = options.staleTime || FIVE_MINUTES;
  options.cacheTime = options.cacheTime || THIRTY_MINUTES;
  options.retry = options.retry || RETRY;
  options.retryDelay = options.retryDelay || RETRY_DELAY;
  options.refetchOnWindowFocus =
    options.refetchOnWindowFocus !== undefined
      ? options.refetchOnWindowFocus
      : false;
  options.refetchOnReconnect =
    options.refetchOnReconnect !== undefined
      ? options.refetchOnReconnect
      : true;

  const result = await queryClient.fetchQuery({
    queryFn: () => fetchFn(params),
    queryKey: queryKey,
    enabled,
    ...options,
  });

  return safeSerialize(result);

  // dehydrate the query client
}
