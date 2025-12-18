<script lang="ts">
  import { Bell, Settings, Zap } from '@lucide/svelte';
  import {
    TelegramSettingsForm,
    TelegramTestPanel,
    TelegramInfoPanel,
  } from '$lib/components/admin/features/telegram-management';
  import * as Tabs from '$lib/components/ui/tabs';
  import * as m from '$lib/paraglide/messages';
</script>

<svelte:head>
  <title>{m.telegram_integration()}</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="border-b pb-6">
    <h1 class="text-3xl font-bold">{m.telegram_integration()}</h1>
    <p class="mt-2 text-muted-foreground">
      {m.manage_telegram_bot_settings_and_test_notifications()}
    </p>
  </div>

  <!-- Main Content -->
  <Tabs.Root value="overview" class="space-y-4">
    <Tabs.TabsList class="grid w-full grid-cols-3">
      <Tabs.TabsTrigger value="overview" class="flex items-center gap-2">
        <Zap class="h-4 w-4" />
        <span class="hidden sm:inline">{m.overview()}</span>
      </Tabs.TabsTrigger>
      <Tabs.TabsTrigger value="settings" class="flex items-center gap-2">
        <Settings class="h-4 w-4" />
        <span class="hidden sm:inline">{m.settings()}</span>
      </Tabs.TabsTrigger>
      <Tabs.TabsTrigger value="test" class="flex items-center gap-2">
        <Bell class="h-4 w-4" />
        <span class="hidden sm:inline">{m.test()}</span>
      </Tabs.TabsTrigger>
    </Tabs.TabsList>

    <!-- Overview Tab -->
    <Tabs.TabsContent value="overview" class="space-y-4">
      <div class="grid gap-4">
        <TelegramInfoPanel />

        <!-- Quick Info Cards -->
        <div class="grid gap-4 md:grid-cols-3">
          <div class="rounded-lg border p-4">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm font-medium text-muted-foreground">{m.notifications_enabled()}</p>
                <p class="mt-2 text-2xl font-bold">{m.yes()}</p>
              </div>
              <Bell class="h-5 w-5 text-green-600" />
            </div>
          </div>

          <div class="rounded-lg border p-4">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm font-medium text-muted-foreground">{m.features()}</p>
                <p class="mt-2 text-2xl font-bold">6</p>
              </div>
              <Zap class="h-5 w-5 text-blue-600" />
            </div>
          </div>

          <div class="rounded-lg border p-4">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm font-medium text-muted-foreground">{m.api_status()}</p>
                <p class="mt-2 text-2xl font-bold">{m.v9_2()}</p>
              </div>
              <Settings class="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>

        <!-- Feature List -->
        <div class="rounded-lg border p-6">
          <h3 class="font-semibold mb-4">{m.available_features()}</h3>
          <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <span class="text-green-600">✓</span>
                <span class="text-sm">{m.order_notifications()}</span>
              </div>
              <p class="text-xs text-muted-foreground ml-6">{m.notify_on_new_orders_with_full_details()}</p>
            </div>

            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <span class="text-green-600">✓</span>
                <span class="text-sm">{m.status_updates()}</span>
              </div>
              <p class="text-xs text-muted-foreground ml-6">{m.real_time_order_status_changes()}</p>
            </div>

            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <span class="text-green-600">✓</span>
                <span class="text-sm">{m.payment_confirmations()}</span>
              </div>
              <p class="text-xs text-muted-foreground ml-6">{m.instant_payment_received_alerts()}</p>
            </div>

            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <span class="text-green-600">✓</span>
                <span class="text-sm">{m.low_stock_alerts()}</span>
              </div>
              <p class="text-xs text-muted-foreground ml-6">{m.low_stock_alerts_desc()}</p>
            </div>

            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <span class="text-green-600">✓</span>
                <span class="text-sm">{m.daily_summaries()}</span>
              </div>
              <p class="text-xs text-muted-foreground ml-6">{m.sales_reports_and_metrics()}</p>
            </div>

            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <span class="text-green-600">✓</span>
                <span class="text-sm">{m.custom_alerts()}</span>
              </div>
              <p class="text-xs text-muted-foreground ml-6">{m.system_errors_and_warnings()}</p>
            </div>
          </div>
        </div>

        <!-- Documentation Links -->
        <div class="rounded-lg bg-blue-50 border border-blue-200 p-6">
          <h3 class="font-semibold mb-3">{m.documentation()}</h3>
          <div class="space-y-2 text-sm">
            <p class="text-muted-foreground">
              {m.need_help_check_out_documentation()}
            </p>
            <ul class="space-y-1 ml-4">
              <li>
                <a
                  href="/docs/TELEGRAM_QUICK_START.md"
                  target="_blank"
                  rel="noreferrer"
                  class="text-blue-600 hover:underline"
                >
                  → {m.quick_start_guide()}
                </a>
              </li>
              <li>
                <a
                  href="/docs/TELEGRAM_INTEGRATION.md"
                  target="_blank"
                  rel="noreferrer"
                  class="text-blue-600 hover:underline"
                >
                  → {m.full_integration_guide()}
                </a>
              </li>
              <li>
                <a
                  href="/docs/TELEGRAM_INTEGRATION_EXAMPLES.md"
                  target="_blank"
                  rel="noreferrer"
                  class="text-blue-600 hover:underline"
                >
                  → {m.code_examples()}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Tabs.TabsContent>

    <!-- Settings Tab -->
    <Tabs.TabsContent value="settings" class="space-y-4">
      <div class="grid gap-4">
        <TelegramSettingsForm />

        <!-- Environment Variables Info -->
        <div class="rounded-lg border p-6 bg-slate-50">
          <h3 class="font-semibold mb-4">{m.environment_configuration()}</h3>
          <p class="text-sm text-muted-foreground mb-4">
            {m.add_these_environment_variables()} <code class="bg-slate-200 px-2 py-1 rounded">.env.local</code> {m.file()}
          </p>
          <div class="rounded-md bg-slate-900 p-4 text-xs text-slate-100 font-mono overflow-x-auto">
            <div>TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11</div>
            <div class="mt-2">TELEGRAM_CHANNEL_ID=-1001234567890</div>
          </div>
          <p class="text-xs text-muted-foreground mt-3">
            {m.get_your_bot_token_from_botfather()} <a href="https://t.me/botfather" target="_blank" rel="noreferrer" class="text-blue-600 hover:underline">@BotFather</a> {m.on_telegram()}.
          </p>
        </div>
      </div>
    </Tabs.TabsContent>

    <!-- Test Tab -->
    <Tabs.TabsContent value="test" class="space-y-4">
      <TelegramTestPanel />

      <!-- Test Results Help -->
      <div class="rounded-lg border p-6 bg-amber-50 border-amber-200">
        <h3 class="font-semibold mb-3 text-amber-900">{m.testing_tips()}</h3>
        <ul class="space-y-2 text-sm text-amber-800">
          <li>
            <strong>{m.connection_test()}:</strong> {m.connection_test_desc()}
          </li>
          <li>
            <strong>{m.order_notification_test()}:</strong> {m.order_notification_test_desc()}
          </li>
          <li>
            <strong>{m.custom_alert_test()}:</strong> {m.custom_alert_test_desc()}
          </li>
          <li>
            <strong>{m.stock_alert_test()}:</strong> {m.stock_alert_test_desc()}
          </li>
        </ul>
      </div>
    </Tabs.TabsContent>
  </Tabs.Root>
</div>

<style>
  code {
    font-family: 'Courier New', monospace;
  }
</style>
