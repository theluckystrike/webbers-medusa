import { useQuery } from '@tanstack/react-query';
import { sdk } from './sdk';

type FlagsResponse = { flags: Record<string, boolean> };

export const WEBBERS_SETTINGS_QUERY_KEY = ['webbers-medusa-settings'];

export const useFeatureFlags = () =>
  useQuery<FlagsResponse>({
    queryKey: WEBBERS_SETTINGS_QUERY_KEY,
    queryFn: () => sdk.client.fetch<FlagsResponse>('/admin/webbers-medusa/settings'),
    staleTime: 60_000,
  });

/**
 * Whether a feature is enabled. Defaults to `true` while loading or if the flag is missing,
 * so widgets never flicker off before the settings have loaded.
 */
export const useFeatureEnabled = (key: string): boolean => {
  const { data } = useFeatureFlags();
  return data?.flags?.[key] ?? true;
};
