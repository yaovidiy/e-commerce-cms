<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Checkbox } from '$lib/components/ui/checkbox';
  import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
  import * as Card from '$lib/components/ui/card';
  import * as Dialog from '$lib/components/ui/dialog';
  import * as m from '$lib/paraglide/messages';
  import { getTelegramChannelId, setTelegramChannelId } from '$lib/remotes/settings.remote';
  import { PUBLIC_TELEGRAM_BOT_TOKEN } from '$env/static/public';
  import { AlertCircle, HelpCircle, CheckCircle2 } from '@lucide/svelte';
  import { onMount } from 'svelte';

  let botToken = $state(PUBLIC_TELEGRAM_BOT_TOKEN || '');
  let channelId = $state('');
  let channelIdSource = $state<'database' | 'environment' | 'none'>('none');
  let enableNotifications = $state(true);
  let isSaving = $state(false);
  let isLoading = $state(true);
  let saveMessage = $state<{ type: 'success' | 'error'; text: string } | null>(null);
  let showInstructions = $state(false);

  // Load current channel ID on mount
  onMount(() => {
    loadChannelId();
  });

  async function loadChannelId() {
    try {
      isLoading = true;
      const result = await getTelegramChannelId();
      if (result.success && result.channelId) {
        channelId = result.channelId;
        channelIdSource = result.source;
      } else {
        channelIdSource = 'none';
      }
    } catch (error) {
      console.error('Failed to load channel ID:', error);
      channelIdSource = 'none';
    } finally {
      isLoading = false;
    }
  }

  async function handleSave() {
    if (!channelId.trim()) {
      saveMessage = {
        type: 'error',
        text: 'Please enter a channel ID'
      };
      return;
    }

    isSaving = true;
    saveMessage = null;

    try {
      const result = await setTelegramChannelId({ channelId: channelId.trim() });
      if (result.success) {
        channelIdSource = 'database';
        saveMessage = {
          type: 'success',
          text: m.telegram_channel_id_saved()
        };
        setTimeout(() => {
          saveMessage = null;
        }, 5000);
      } else {
        saveMessage = {
          type: 'error',
          text: result.message || 'Failed to save channel ID'
        };
      }
    } catch (error) {
      saveMessage = {
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save channel ID'
      };
    } finally {
      isSaving = false;
    }
  }

  function clearFields() {
    channelId = '';
    channelIdSource = 'none';
    saveMessage = null;
  }

  function getSourceLabel() {
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
    <Card.Title>{m.telegram_settings()}</Card.Title>
    <Card.Description>
      {m.configure_telegram_bot_api_credentials_and_channel_settings()}
    </Card.Description>
  </Card.Header>
  <Card.Content class="space-y-6">
    <!-- Bot Token -->
    <div class="space-y-2">
      <Label for="bot-token">{m.telegram_bot_token()}</Label>
      <Input
        id="bot-token"
        type="password"
        placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
        bind:value={botToken}
        disabled
      />
      <p class="text-xs text-muted-foreground">
        {m.telegram_get_token_from_botfather()}. {m.keep_it_secret()}
      </p>
    </div>

    <!-- Channel ID with Instructions -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <Label for="channel-id">{m.telegram_channel_id()}</Label>
        <Button
          variant="ghost"
          size="sm"
          onclick={() => (showInstructions = true)}
          class="h-auto p-0 text-xs"
        >
          <HelpCircle class="mr-1 h-4 w-4" />
          {m.how_to_find()}
        </Button>
      </div>

      <Input
        id="channel-id"
        placeholder={m.telegram_channel_id_placeholder()}
        bind:value={channelId}
        disabled={isSaving || isLoading}
      />

      <!-- Current Source Indicator -->
      {#if !isLoading}
        <div
          class={`flex items-center gap-2 rounded-md p-2 text-xs ${
            channelIdSource === 'database'
              ? 'bg-green-50 text-green-700'
              : channelIdSource === 'environment'
                ? 'bg-blue-50 text-blue-700'
                : 'bg-gray-50 text-gray-700'
          }`}
        >
          {#if channelIdSource === 'database'}
            <CheckCircle2 class="h-4 w-4" />
          {:else if channelIdSource === 'environment'}
            <AlertCircle class="h-4 w-4" />
          {:else}
            <AlertCircle class="h-4 w-4" />
          {/if}
          <span>{getSourceLabel()}</span>
        </div>
      {/if}
    </div>

    <!-- Enable Notifications -->
    <div class="flex items-center space-x-2">
      <Checkbox
        id="enable-notifications"
        bind:checked={enableNotifications}
        disabled={isSaving}
      />
      <Label for="enable-notifications" class="cursor-pointer">
        {m.enable_telegram_notifications()}
      </Label>
    </div>

    <!-- Messages -->
    {#if saveMessage}
      <Alert class={saveMessage.type === 'error' ? 'border-red-200' : 'border-green-200'}>
        <AlertCircle
          class={`h-4 w-4 ${saveMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}
        />
        <AlertTitle>{saveMessage.type === 'success' ? m.success() : m.error()}</AlertTitle>
        <AlertDescription>{saveMessage.text}</AlertDescription>
      </Alert>
    {/if}
  </Card.Content>
  <Card.Footer class="flex gap-2">
    <Button onclick={handleSave} disabled={isSaving || isLoading || !channelId.trim()}>
      {isSaving ? m.saving() : m.save_settings()}
    </Button>
    <Button variant="outline" onclick={clearFields} disabled={isSaving || isLoading}>
      {m.clear()}
    </Button>
  </Card.Footer>
</Card.Root>

<!-- Instructions Dialog -->
<Dialog.Root bind:open={showInstructions}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>{m.telegram_channel_id_help()}</Dialog.Title>
    </Dialog.Header>

    <div class="space-y-4">
      <Alert>
        <AlertCircle class="h-4 w-4" />
        <AlertTitle>{m.using_getidsbot()}</AlertTitle>
        <AlertDescription>
          {m.easiest_way_to_get_channel_id()}
        </AlertDescription>
      </Alert>

      <div class="space-y-3">
        <div class="flex gap-3">
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
            1
          </div>
          <div class="pt-0.5">
            <p class="font-semibold">{m.telegram_channel_id_step_1()}</p>
            <p class="text-sm text-muted-foreground">
              {m.telegram_channel_id_step_1_desc()}
            </p>
          </div>
        </div>

        <div class="flex gap-3">
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
            2
          </div>
          <div class="pt-0.5">
            <p class="font-semibold">{m.telegram_channel_id_step_2()}</p>
            <p class="text-sm text-muted-foreground">
              {m.telegram_channel_id_step_2_desc()}
            </p>
          </div>
        </div>

        <div class="flex gap-3">
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
            3
          </div>
          <div class="pt-0.5">
            <p class="font-semibold">{m.telegram_channel_id_step_3()}</p>
            <p class="text-sm text-muted-foreground">
              {m.telegram_channel_id_step_3_desc()}
            </p>
          </div>
        </div>

        <div class="flex gap-3">
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
            4
          </div>
          <div class="pt-0.5">
            <p class="font-semibold">{m.telegram_channel_id_step_4()}</p>
            <p class="text-sm text-muted-foreground">
              {m.telegram_channel_id_step_4_desc()}
            </p>
          </div>
        </div>
      </div>

      <Alert>
        <AlertCircle class="h-4 w-4" />
        <AlertTitle>{m.channel_id_format()}</AlertTitle>
        <AlertDescription>
          <p class="mb-2">{m.channel_ids_typically_look_like()}</p>
          <ul class="space-y-1 text-sm">
            <li>
              <code class="rounded bg-gray-100 px-2 py-1">-1001234567890</code> {m.negative_numeric_id()}
            </li>
            <li>
              <code class="rounded bg-gray-100 px-2 py-1">@your_channel_name</code> {m.username_format()}
            </li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>

    <Dialog.Footer>
      <Button variant="outline" onclick={() => (showInstructions = false)}>
        {m.common_close()}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
