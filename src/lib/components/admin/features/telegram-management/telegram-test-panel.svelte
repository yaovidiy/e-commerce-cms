<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
  import * as Card from '$lib/components/ui/card';
  import * as Alert from '$lib/components/ui/alert';
  import { AlertCircle, CheckCircle2, Loader2 } from '@lucide/svelte';
  import { OrdersBrowser } from '$lib/components/admin/features/notification-management';
  import type { Order } from '$lib/server/db/schema';
  import * as m from '$lib/paraglide/messages';
  import {
    testTelegramConnection,
    sendTestOrderNotification,
    sendTelegramAlert,
    sendLowStockAlert,
  } from '$lib/remotes/telegram.remote';

  let connectionStatus = $state<{ loading: boolean; success?: boolean; message: string }>({
    loading: false,
    message: 'Not tested yet',
  });

  let selectedOrder = $state<Order | null>(null);
  let orderBrowserOpen = $state(false);
  let orderNotificationStatus = $state<{ loading: boolean; success?: boolean; message: string }>({
    loading: false,
    message: 'Ready to send',
  });

  let alertTitle = $state('Test Alert');
  let alertMessage = $state('This is a test Telegram notification');
  let alertSeverity = $state<'info' | 'warning' | 'error'>('info');
  let alertStatus = $state<{ loading: boolean; success?: boolean; message: string }>({
    loading: false,
    message: 'Ready to send',
  });

  let stockProductName = $state('Test Product');
  let stockCurrent = $state(5);
  let stockThreshold = $state(10);
  let stockStatus = $state<{ loading: boolean; success?: boolean; message: string }>({
    loading: false,
    message: 'Ready to send',
  });

  async function handleTestConnection() {
    connectionStatus = { loading: true, message: 'Testing connection...' };
    try {
      const result = await testTelegramConnection({});
      connectionStatus = {
        loading: false,
        success: result.success,
        message: result.message,
      };
    } catch (error) {
      connectionStatus = {
        loading: false,
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async function handleSendOrderNotification() {
    if (!selectedOrder) return;
    orderNotificationStatus = { loading: true, message: 'Sending...' };
    try {
      const result = await sendTestOrderNotification({ orderId: selectedOrder.id });
      orderNotificationStatus = {
        loading: false,
        success: result.success,
        message: result.message,
      };
    } catch (error) {
      orderNotificationStatus = {
        loading: false,
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  function handleOrderSelected(order: Order | 'random') {
    if (order === 'random') {
      selectedOrder = {
        id: `test-order-${Date.now()}`,
        orderNumber: `TEST-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        customerId: 'test-customer',
        totalPrice: Math.floor(Math.random() * 10000),
        totalQuantity: Math.floor(Math.random() * 10) + 1,
        orderStatus: 'pending',
        paymentMethod: 'credit_card',
        paymentStatus: 'pending',
        shippingAddress: JSON.stringify({ city: 'Test City', country: 'UA' }),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Order;
    } else {
      selectedOrder = order;
    }
  }

  async function handleSendAlert() {
    alertStatus = { loading: true, message: 'Sending...' };
    try {
      const result = await sendTelegramAlert({
        title: alertTitle,
        message: alertMessage,
        severity: alertSeverity,
      });
      alertStatus = {
        loading: false,
        success: result.success,
        message: result.message,
      };
    } catch (error) {
      alertStatus = {
        loading: false,
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async function handleSendStockAlert() {
    stockStatus = { loading: true, message: 'Sending...' };
    try {
      const result = await sendLowStockAlert({
        productName: stockProductName,
        currentStock: stockCurrent,
        threshold: stockThreshold,
      });
      stockStatus = {
        loading: false,
        success: result.success,
        message: result.message,
      };
    } catch (error) {
      stockStatus = {
        loading: false,
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>Test Telegram Integration</Card.Title>
    <Card.Description>
      Test your Telegram bot connection and send sample notifications
    </Card.Description>
  </Card.Header>
  <Card.Content>
    <Tabs value="connection" class="space-y-4">
      <TabsList class="grid w-full grid-cols-4">
        <TabsTrigger value="connection">Connection</TabsTrigger>
        <TabsTrigger value="order">{m.order_notification_test()}</TabsTrigger>
        <TabsTrigger value="alert">{m.custom_alert_test()}</TabsTrigger>
        <TabsTrigger value="stock">{m.stock_alert_test()}</TabsTrigger>
      </TabsList>

      <!-- Connection Test -->
      <TabsContent value="connection" class="space-y-4">
        <Alert.Root variant={connectionStatus.success === undefined ? 'default' : connectionStatus.success ? 'default' : 'destructive'}>
          {#if connectionStatus.success === undefined}
            <AlertCircle class="h-4 w-4" />
          {:else if connectionStatus.success}
            <CheckCircle2 class="h-4 w-4" />
          {:else}
            <AlertCircle class="h-4 w-4" />
          {/if}
          <Alert.Title>
            {connectionStatus.success === undefined
              ? m.not_tested()
              : connectionStatus.success
                ? m.connected()
                : m.connection_failed()}
          </Alert.Title>
          <Alert.Description class="whitespace-pre-wrap wrap-break-word">
            {connectionStatus.message}
          </Alert.Description>
        </Alert.Root>

        <Button
          onclick={handleTestConnection}
          disabled={connectionStatus.loading}
          class="w-full"
        >
          {#if connectionStatus.loading}
            <Loader2 class="mr-2 h-4 w-4 animate-spin" />
            {m.testing()}
          {:else}
            {m.test_telegram_connection()}
          {/if}
        </Button>
      </TabsContent>

      <!-- Order Notification Test -->
      <TabsContent value="order" class="space-y-4">
        <div class="space-y-2">
          <Label>{m.selected_order()}</Label>
          <div class="p-3 border rounded-md bg-muted">
            {#if selectedOrder}
              <div class="text-sm space-y-1">
                <p><strong>{m.order_id()}:</strong> {selectedOrder.id}</p>
                <p><strong>{m.order_number()}:</strong> {selectedOrder.orderNumber}</p>
                <p><strong>{m.total_price()}:</strong> {(selectedOrder.totalPrice / 100).toFixed(2)} UAH</p>
                <p><strong>{m.status()}:</strong> {selectedOrder.status}</p>
              </div>
            {:else}
              <p class="text-muted-foreground text-sm">{m.no_order_selected()}</p>
            {/if}
          </div>
          <Button
            type="button"
            variant="outline"
            class="w-full"
            onclick={() => (orderBrowserOpen = true)}
            disabled={orderNotificationStatus.loading}
          >
            {m.select_order()}
          </Button>
        </div>

        <Alert.Root
          variant={orderNotificationStatus.success === undefined ? 'default' : orderNotificationStatus.success ? 'default' : 'destructive'}
        >
          {#if orderNotificationStatus.success === undefined}
            <AlertCircle class="h-4 w-4" />
          {:else if orderNotificationStatus.success}
            <CheckCircle2 class="h-4 w-4" />
          {:else}
            <AlertCircle class="h-4 w-4" />
          {/if}
          <Alert.Title>
            {orderNotificationStatus.success === undefined
              ? m.ready()
              : orderNotificationStatus.success
                ? m.sent()
                : m.failed()}
          </Alert.Title>
          <Alert.Description class="whitespace-pre-wrap wrap-break-word">
            {orderNotificationStatus.message}
          </Alert.Description>
        </Alert.Root>

        <Button
          onclick={handleSendOrderNotification}
          disabled={orderNotificationStatus.loading || !selectedOrder}
          class="w-full"
        >
          {#if orderNotificationStatus.loading}
            <Loader2 class="mr-2 h-4 w-4 animate-spin" />
            {m.sending()}
          {:else}
            {m.send_order_notification()}
          {/if}
        </Button>
      </TabsContent>

      <!-- Custom Alert Test -->
      <TabsContent value="alert" class="space-y-4">
        <div class="space-y-2">
          <Label for="alert-title">{m.alert_title()}</Label>
          <Input
            id="alert-title"
            placeholder={m.enter_alert_title()}
            bind:value={alertTitle}
            disabled={alertStatus.loading}
          />
        </div>

        <div class="space-y-2">
          <Label for="alert-message">{m.alert_message()}</Label>
          <textarea
            id="alert-message"
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={m.enter_alert_title()}
            bind:value={alertMessage}
            disabled={alertStatus.loading}
            rows="4"
          ></textarea>
        </div>

        <div class="space-y-2">
          <Label for="alert-severity">{m.severity()}</Label>
          <select
            id="alert-severity"
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            bind:value={alertSeverity}
            disabled={alertStatus.loading}
          >
            <option value="info">ℹ️ {m.info()}</option>
            <option value="warning">⚠️ {m.warning()}</option>
            <option value="error">🔴 {m.error()}</option>
          </select>
        </div>

        <Alert.Root
          variant={alertStatus.success === undefined ? 'default' : alertStatus.success ? 'default' : 'destructive'}
        >
          {#if alertStatus.success === undefined}
            <AlertCircle class="h-4 w-4" />
          {:else if alertStatus.success}
            <CheckCircle2 class="h-4 w-4" />
          {:else}
            <AlertCircle class="h-4 w-4" />
          {/if}
          <Alert.Title>
            {alertStatus.success === undefined ? m.ready() : alertStatus.success ? m.sent() : m.failed()}
          </Alert.Title>
          <Alert.Description class="whitespace-pre-wrap wrap-break-word">
            {alertStatus.message}
          </Alert.Description>
        </Alert.Root>

        <Button onclick={handleSendAlert} disabled={alertStatus.loading || !alertTitle} class="w-full">
          {#if alertStatus.loading}
            <Loader2 class="mr-2 h-4 w-4 animate-spin" />
            {m.sending()}
          {:else}
            {m.send_custom_alert()}
          {/if}
        </Button>
      </TabsContent>

      <!-- Stock Alert Test -->
      <TabsContent value="stock" class="space-y-4">
        <div class="space-y-2">
          <Label for="product-name">{m.product_name()}</Label>
          <Input
            id="product-name"
            placeholder={m.product_name()}
            bind:value={stockProductName}
            disabled={stockStatus.loading}
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="current-stock">{m.current_stock()}</Label>
            <Input
              id="current-stock"
              type="number"
              min="0"
              bind:value={stockCurrent}
              disabled={stockStatus.loading}
            />
          </div>

          <div class="space-y-2">
            <Label for="threshold">{m.threshold()}</Label>
            <Input
              id="threshold"
              type="number"
              min="0"
              bind:value={stockThreshold}
              disabled={stockStatus.loading}
            />
          </div>
        </div>

        <Alert.Root
          variant={stockStatus.success === undefined ? 'default' : stockStatus.success ? 'default' : 'destructive'}
        >
          {#if stockStatus.success === undefined}
            <AlertCircle class="h-4 w-4" />
          {:else if stockStatus.success}
            <CheckCircle2 class="h-4 w-4" />
          {:else}
            <AlertCircle class="h-4 w-4" />
          {/if}
          <Alert.Title>
            {stockStatus.success === undefined ? m.ready() : stockStatus.success ? m.sent() : m.failed()}
          </Alert.Title>
          <Alert.Description class="whitespace-pre-wrap wrap-break-word">
            {stockStatus.message}
          </Alert.Description>
        </Alert.Root>

        <Button
          onclick={handleSendStockAlert}
          disabled={stockStatus.loading || !stockProductName}
          class="w-full"
        >
          {#if stockStatus.loading}
            <Loader2 class="mr-2 h-4 w-4 animate-spin" />
            {m.sending()}
          {:else}
            {m.send_stock_alert()}
          {/if}
        </Button>
      </TabsContent>
    </Tabs>
  </Card.Content>
</Card.Root>
<!-- Order Browser Dialog -->
<OrdersBrowser
  bind:open={orderBrowserOpen}
  onSelect={handleOrderSelected}
/>