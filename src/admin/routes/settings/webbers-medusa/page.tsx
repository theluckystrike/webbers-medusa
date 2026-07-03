import { defineRouteConfig } from '@medusajs/admin-sdk';
import { Adjustments } from '@medusajs/icons';
import { Container, Heading, Switch, Text, toast } from '@medusajs/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sdk } from '../../../lib/sdk';
import { useFeatureFlags, WEBBERS_SETTINGS_QUERY_KEY } from '../../../lib/use-feature-flags';
import { WEBBERS_FEATURES } from '../../../../feature-flags';

type FlagsResponse = { flags: Record<string, boolean> };

const WebbersSettingsPage = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useFeatureFlags();

  const { mutate, isPending } = useMutation({
    mutationFn: (flags: Record<string, boolean>) =>
      sdk.client.fetch<FlagsResponse>('/admin/webbers-medusa/settings', {
        method: 'POST',
        body: { flags },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: WEBBERS_SETTINGS_QUERY_KEY });
      toast.success('Settings saved');
    },
    onError: () => toast.error('Failed to save settings'),
  });

  const flags = data?.flags ?? {};

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h1">Webbers QoL features</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          Enable or disable the quality-of-life features provided by this plugin. Disabling a feature
          hides its admin widget and blocks its endpoints.
        </Text>
      </div>

      {WEBBERS_FEATURES.map((feature) => {
        const enabled = flags[feature.key] ?? true;
        return (
          <div key={feature.key} className="flex items-center justify-between gap-x-4 px-6 py-4">
            <div className="flex flex-col">
              <Text weight="plus" size="small">
                {feature.label}
              </Text>
              <Text size="small" className="text-ui-fg-subtle">
                {feature.description}
              </Text>
            </div>
            <Switch
              checked={enabled}
              disabled={isLoading || isPending}
              onCheckedChange={(next) => mutate({ [feature.key]: next })}
            />
          </div>
        );
      })}
    </Container>
  );
};

export const config = defineRouteConfig({
  label: 'Webbers QoL',
  icon: Adjustments,
});

export default WebbersSettingsPage;
