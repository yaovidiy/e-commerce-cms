<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';
  import { AlertCircle, CheckCircle2 } from '@lucide/svelte';
  import { testTelegramConnection } from '$lib/remotes/telegram.remote';
  import { getTelegramChannelId } from '$lib/remotes/settings.remote';
  import * as m from '$lib/paraglide/messages';
  import { onMount } from 'svelte';

  let status = $state<'checking' | 'connected' | 'disconnected'>('checking');
  let botInfo = $state<{ botId?: number; botName?: string } | null>(null);
  let error = $state<string | null>(null);
  let channelId = $state<string | null>(null);
  let channelIdSource = $state<'database' | 'environment' | 'none'>('none');
  let isLoadingChannelId = $state(true);

  async function checkStatus() {
    status = 'checking';
    error = null;
    try {
      const result = await testTelegramConnection({});
      if (result.success) {
        status = 'connected';
        botInfo = {
          botId: result.botId,
          botName: result.botName,
        };
      } else {
        status = 'disconnected';
        error = result.message;
      }
    } catch (err) {
      status = 'disconnected';
      error = err instanceof Error ? err.message : 'Unknown error';
    }
  }

  async function loadChannelId() {
    isLoadingChannelId = true;
    try {
      const result = await getTelegramChannelId();
      if (result.success && result.channelId) {
        channelId = result.channelId;
        channelIdSource = result.source;
      } else {
        channelIdSource = 'none';
        channelId = null;
      }
    } catch (error) {
      console.error('Failed to load channel ID:', error);
      channelIdSource = 'none';
    } finally {
      isLoadingChannelId = false;
    }
  }

  // Check status and channel ID on mount
  onMount(() => {
    checkStatus();
    loadChannelId();
  });

  function getChannelIdSourceBadge() {
    switch (channelIdSource) {
      case 'database':
        return 'bg-green-100 text-green-800';
      case 'environment':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  function getChannelIdSourceLabel() {
    switch (channelIdSource) {
      case 'database':
        return m.telegram_channel_id_source_db();
      case 'environment':
        return m.telegram_channel_id_source_env();
      default:
        return m.telegram_channel_id_not_set();
    }
  }
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>{m.integration_status()}</Card.Title>
    <Card.Description>{m.telegram_bot_connection_status_and_information()}</Card.Description>
  </Card.Header>
  <Card.Content class="space-y-6">
    <!-- Connection Status -->
    <div class="space-y-3">
      <p class="text-sm font-semibold">Connection</p>
      <div class="flex items-center gap-4">
        {#if status === 'checking'}
          <div class="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <span class="text-sm text-muted-foreground">{m.checking_connection()}</span>
        {:else if status === 'connected'}
          <CheckCircle2 class="h-4 w-4 text-green-600" />
          <div>
            <p class="text-sm font-medium text-green-600">{m.connected()}</p>
            {#if botInfo?.botName}
              <p class="text-xs text-muted-foreground">Bot: @{botInfo.botName}</p>
            {/if}
          </div>
        {:else}
          <AlertCircle class="h-4 w-4 text-red-600" />
          <div>
            <p class="text-sm font-medium text-red-600">{m.disconnected()}</p>
            {#if error}
              <p class="text-xs text-muted-foreground">{error}</p>
            {/if}
          </div>
        {/if}
      </div>
    </div>

    <!-- Channel ID Status -->
    <div class="space-y-3 border-t pt-4">
      <p class="text-sm font-semibold">{m.telegram_channel_id()}</p>
      {#if isLoadingChannelId}
        <div class="flex items-center gap-2">
          <div class="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <span class="text-sm text-muted-foreground">{m.loading()}</span>
        </div>
      {:else if channelId}
        <div class="space-y-2">
          <div class="flex items-center gap-2 rounded-md bg-gray-50 p-2 text-sm">
            <code class="flex-1 break-all font-mono">{channelId}</code>
          </div>
          <div class={`inline-block rounded px-2 py-1 text-xs font-medium ${getChannelIdSourceBadge()}`}>
            {getChannelIdSourceLabel()}
          </div>
        </div>
      {:else}
        <p class="text-sm text-muted-foreground">{m.telegram_channel_id_not_set()}</p>
        <p class="text-xs text-muted-foreground">{m.configure_in_settings_tab()}</p>
      {/if}
    </div>

    <!-- Setup Checklist -->
    <div class="rounded-lg bg-slate-50 p-4 text-sm space-y-2 border-t pt-4">
      <p class="font-medium">{m.quick_setup_checklist()}</p>
      <ul class="space-y-2 text-xs text-muted-foreground">
        <li class="flex items-start gap-2">
          <span class="mt-1">✓</span>
          <span>{m.create_bot_via_botfather()}</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="mt-1">✓</span>
          <span>{m.create_telegram_channel_and_add_bot_as_admin()}</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="mt-1">✓</span>
          <span>{m.set_telegram_bot_token_in_environment()}</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="mt-1">✓</span>
          <span>{m.set_telegram_channel_id_in_environment()}</span>
        </li>
      </ul>
    </div>

    <!-- Features -->
    <div class="rounded-lg bg-blue-50 p-4 text-sm space-y-2 border-t pt-4">
      <p class="font-medium">{m.features_enabled()}</p>
      <ul class="space-y-1 text-xs text-muted-foreground">
        <li>✓ {m.new_order_notifications()}</li>
        <li>✓ {m.order_status_updates()}</li>
        <li>✓ {m.payment_confirmations()}</li>
        <li>✓ {m.low_stock_alerts()}</li>
        <li>✓ {m.daily_sales_summaries()}</li>
        <li>✓ {m.custom_system_alerts()}</li>
      </ul>
    </div>
  </Card.Content>
  <Card.Footer class="flex gap-2">
    <Button variant="outline" onclick={checkStatus}>
      {m.refresh_status()}
    </Button>
    <Button variant="outline" onclick={loadChannelId} disabled={isLoadingChannelId}>
      {m.refresh_channel_id()}
    </Button>
  </Card.Footer>
</Card.Root>
