# Nova Poshta API Integration

## Overview

This documentation covers the Nova Poshta API integration for the SvelteKit E-commerce CMS. The integration provides delivery services including address lookup, warehouse selection, package tracking, and delivery cost calculation.

## API Information

- **API Version**: 2.0
- **Base URL**: `https://api.novaposhta.ua/v2.0/json/`
- **Documentation**: [Nova Poshta API Docs](https://developers.novaposhta.ua/)
- **Business Portal**: [business.novaposhta.ua](https://business.novaposhta.ua/)

## Setup

### 1. Get API Key

1. Register at [business.novaposhta.ua](https://business.novaposhta.ua/)
2. Navigate to API settings in your dashboard
3. Generate a new API key

### 2. Configure Environment

Add the API key to your `.env` file:

```env
NOVAPOSHTA_API_KEY=your_api_key_here
```

### 3. Verify Connection

Navigate to the admin panel: `/admin/novaposhta` and test the connection.

## Architecture

### Files

| File | Purpose |
|------|---------|
| `src/lib/server/novaposhta-client.ts` | API client class |
| `src/lib/remotes/novaposhta.remote.ts` | Remote functions for UI |
| `src/lib/components/admin/features/novaposhta-management/` | Admin components |
| `src/routes/admin/novaposhta/+page.svelte` | Admin management page |

### Client Class

The `NovaPoshtaClient` class handles all API communication:

```typescript
import { novaPoshtaClient } from '$lib/server/novaposhta-client';

// Check connection
const isConnected = await novaPoshtaClient.testConnection();

// Get areas (oblasts)
const areas = await novaPoshtaClient.getAreas();

// Search cities
const cities = await novaPoshtaClient.searchCities('Київ');

// Get warehouses
const warehouses = await novaPoshtaClient.getWarehouses({ CityRef: 'city-ref' });
```

## Remote Functions

All remote functions are available in `$lib/remotes/novaposhta.remote.ts`:

### Read Operations (query)

```typescript
import { 
  getAllAreas,
  searchCities,
  searchSettlements,
  searchStreets,
  getWarehousesByCity,
  getBranches,
  getPostomats,
  calculateDeliveryCost,
  trackDocument,
  testConnection
} from '$lib/remotes/novaposhta.remote';
```

### Function Reference

#### `testConnection()`
Test API connectivity.

```typescript
const result = await testConnection();
// { success: true, areasCount: 25 }
```

#### `getAllAreas()`
Get all Ukrainian oblasts.

```typescript
const areas = await getAllAreas();
// [{ Ref: 'xxx', Description: 'Київська', ... }]
```

#### `searchCities(options)`
Search for cities by name.

```typescript
const cities = await searchCities({ 
  searchString: 'Київ',
  limit: 20 
});
```

#### `searchSettlements(options)`
Search for settlements (includes villages, towns).

```typescript
const settlements = await searchSettlements({
  searchString: 'Бровари',
  limit: 20
});
```

#### `searchStreets(options)`
Search for streets within a city.

```typescript
const streets = await searchStreets({
  cityRef: 'city-ref',
  searchString: 'Хрещатик',
  limit: 20
});
```

#### `getWarehousesByCity(options)`
Get all warehouses in a city.

```typescript
const warehouses = await getWarehousesByCity({
  cityRef: 'city-ref',
  limit: 200
});
```

#### `getBranches(options)`
Get Nova Poshta branches in a city.

```typescript
const branches = await getBranches({
  cityRef: 'city-ref',
  limit: 50
});
```

#### `getPostomats(options)`
Get postomats (parcel lockers) in a city.

```typescript
const postomats = await getPostomats({
  cityRef: 'city-ref',
  limit: 100
});
```

#### `trackDocument(trackingNumber)`
Track a shipment by document number.

```typescript
const tracking = await trackDocument('20450xxxxxx');
// { Status: 'Delivered', StatusCode: '9', ... }
```

#### `calculateDeliveryCost(options)`
Calculate delivery cost.

```typescript
const cost = await calculateDeliveryCost({
  citySenderRef: 'sender-city-ref',
  cityRecipientRef: 'recipient-city-ref',
  weight: 1,
  serviceType: 'WarehouseWarehouse',
  cost: 500,
  cargoType: 'Parcel',
  seatsAmount: 1
});
// { Cost: 70, AssessedCost: 500, ... }
```

## Data Types

### NovaPoshtaArea
```typescript
interface NovaPoshtaArea {
  Ref: string;
  AreasCenter: string;
  Description: string;
  DescriptionRu: string;
}
```

### NovaPoshtaCity
```typescript
interface NovaPoshtaCity {
  Ref: string;
  Description: string;
  DescriptionRu: string;
  AreaRef: string;
  AreaDescription: string;
  SettlementType: string;
  SettlementTypeDescription: string;
  CityID: string;
  Delivery1: string;
  Delivery2: string;
  Delivery3: string;
  Delivery4: string;
  Delivery5: string;
  Delivery6: string;
  Delivery7: string;
}
```

### NovaPoshtaWarehouse
```typescript
interface NovaPoshtaWarehouse {
  Ref: string;
  SiteKey: string;
  Description: string;
  DescriptionRu: string;
  ShortAddress: string;
  ShortAddressRu: string;
  Phone: string;
  TypeOfWarehouse: string;
  Number: string;
  CityRef: string;
  CityDescription: string;
  SettlementRef: string;
  SettlementDescription: string;
  Longitude: string;
  Latitude: string;
  PostFinance: string;
  BicycleParking: string;
  PaymentAccess: string;
  POSTerminal: string;
  InternationalShipping: string;
  SelfServiceWorkplacesCount: string;
  TotalMaxWeightAllowed: string;
  PlaceMaxWeightAllowed: string;
  SendingLimitationsOnDimensions: {
    Width: number;
    Height: number;
    Length: number;
  };
  ReceivingLimitationsOnDimensions: {
    Width: number;
    Height: number;
    Length: number;
  };
  Reception: {
    Monday: string;
    Tuesday: string;
    Wednesday: string;
    Thursday: string;
    Friday: string;
    Saturday: string;
    Sunday: string;
  };
  Delivery: {
    Monday: string;
    Tuesday: string;
    Wednesday: string;
    Thursday: string;
    Friday: string;
    Saturday: string;
    Sunday: string;
  };
  Schedule: {
    Monday: string;
    Tuesday: string;
    Wednesday: string;
    Thursday: string;
    Friday: string;
    Saturday: string;
    Sunday: string;
  };
  DistrictCode: string;
  WarehouseStatus: string;
  WarehouseStatusDate: string;
  CategoryOfWarehouse: string;
  Direct: string;
  RegionCity: string;
  WarehouseForAgent: string;
  MaxDeclaredCost: string;
  DenyToSelect: string;
  PostMachineType: string;
  PostalCodeUA: string;
  OnlyReceivingParcel: string;
  WarehouseIndex: string;
}
```

### NovaPoshtaStreet
```typescript
interface NovaPoshtaStreet {
  Ref: string;
  Description: string;
  StreetsTypeRef: string;
  StreetsType: string;
}
```

### NovaPoshtaSettlement
```typescript
interface NovaPoshtaSettlement {
  Ref: string;
  Description: string;
  DescriptionRu: string;
  SettlementTypeDescription: string;
  SettlementTypeDescriptionRu: string;
  RegionsDescription: string;
  AreaDescription: string;
  Latitude: string;
  Longitude: string;
  Delivery1: string;
  Delivery2: string;
  Delivery3: string;
  Delivery4: string;
  Delivery5: string;
  Delivery6: string;
  Delivery7: string;
}
```

## Usage Examples

### Checkout Address Selection

```svelte
<script lang="ts">
  import { searchCities, getWarehousesByCity } from '$lib/remotes/novaposhta.remote';
  import type { NovaPoshtaCity, NovaPoshtaWarehouse } from '$lib/remotes/novaposhta.remote';
  
  let citySearch = $state('');
  let cities = $state<NovaPoshtaCity[]>([]);
  let selectedCityRef = $state('');
  let warehouses = $state<NovaPoshtaWarehouse[]>([]);
  let selectedWarehouseRef = $state('');
  
  async function onCitySearch() {
    if (citySearch.length < 2) return;
    cities = await searchCities({ searchString: citySearch, limit: 20 });
  }
  
  async function onCitySelect(ref: string) {
    selectedCityRef = ref;
    warehouses = await getWarehousesByCity({ cityRef: ref, limit: 200 });
  }
</script>

<input 
  type="text" 
  bind:value={citySearch} 
  onkeyup={(e) => e.key === 'Enter' && onCitySearch()}
  placeholder="Search city..."
/>

<select bind:value={selectedCityRef} onchange={() => onCitySelect(selectedCityRef)}>
  {#each cities as city}
    <option value={city.Ref}>{city.Description}, {city.AreaDescription} обл.</option>
  {/each}
</select>

{#if warehouses.length > 0}
  <select bind:value={selectedWarehouseRef}>
    {#each warehouses as warehouse}
      <option value={warehouse.Ref}>№{warehouse.Number} - {warehouse.Description}</option>
    {/each}
  </select>
{/if}
```

### Tracking Widget

```svelte
<script lang="ts">
  import { trackDocument } from '$lib/remotes/novaposhta.remote';
  
  let trackingNumber = $state('');
  let trackingResult = $state(null);
  let loading = $state(false);
  
  async function track() {
    loading = true;
    try {
      trackingResult = await trackDocument(trackingNumber);
    } finally {
      loading = false;
    }
  }
</script>

<input type="text" bind:value={trackingNumber} placeholder="Enter tracking number" />
<button onclick={track} disabled={loading}>
  {loading ? 'Tracking...' : 'Track'}
</button>

{#if trackingResult}
  <div>
    <p>Status: {trackingResult.Status}</p>
    <p>Actual delivery date: {trackingResult.ActualDeliveryDate || 'In transit'}</p>
  </div>
{/if}
```

### Delivery Cost Calculator

```svelte
<script lang="ts">
  import { calculateDeliveryCost } from '$lib/remotes/novaposhta.remote';
  
  async function calculateCost() {
    const result = await calculateDeliveryCost({
      citySenderRef: senderCityRef,
      cityRecipientRef: recipientCityRef,
      weight: 1,
      serviceType: 'WarehouseWarehouse',
      cost: 500,
      cargoType: 'Parcel',
      seatsAmount: 1
    });
    
    console.log('Delivery cost:', result.Cost, 'UAH');
  }
</script>
```

## Service Types

| Type | Description |
|------|-------------|
| `WarehouseWarehouse` | Warehouse to Warehouse |
| `WarehouseDoors` | Warehouse to Address |
| `DoorsWarehouse` | Address to Warehouse |
| `DoorsDoors` | Address to Address |

## Cargo Types

| Type | Description |
|------|-------------|
| `Parcel` | Standard parcel |
| `Documents` | Documents |
| `TiresWheels` | Tires and wheels |
| `Pallet` | Pallet |

## Warehouse Types

- **Branch** - Full-service Nova Poshta branch
- **Postomat** - Parcel locker (automated pickup point)
- **Warehouse** - Standard warehouse

## Error Handling

The client handles errors gracefully:

```typescript
try {
  const cities = await searchCities({ searchString: 'Київ' });
} catch (error) {
  console.error('API Error:', error.message);
}
```

Common error scenarios:
- Invalid API key
- Network connectivity issues
- Invalid parameters
- API rate limiting

## Rate Limits

Nova Poshta API has the following limits:
- 1000 requests per hour per IP
- Some endpoints may have additional limits

## Admin Panel

Access the Nova Poshta admin panel at `/admin/novaposhta`:

### Features

1. **Connection Status** - Test API connectivity
2. **Address Lookup Test** - Test warehouse and address search
3. **Configuration Info** - View API endpoint and key status

### Navigation

The Nova Poshta link is located in the admin sidebar under **Commerce**.

## Integration with Checkout

To integrate Nova Poshta with your checkout:

1. Import the remote functions
2. Add city search input
3. Add warehouse/address selection
4. Store selected warehouse/address ref in order data
5. Use tracking function for order status updates

## Best Practices

1. **Cache city data** - Cities don't change often
2. **Debounce search** - Avoid excessive API calls during typing
3. **Show loading states** - API calls can take 200-500ms
4. **Handle no results** - Some small villages may not have warehouses
5. **Validate refs** - Always validate warehouse refs before order submission

## Troubleshooting

### "API key not configured"
Add `NOVAPOSHTA_API_KEY` to your `.env` file and restart the application.

### "Connection failed"
1. Check your internet connection
2. Verify the API key is correct
3. Check if Nova Poshta API is operational

### "No warehouses found"
Some small settlements may not have Nova Poshta warehouses. Suggest courier delivery or nearby city warehouses.

### "Tracking returns empty"
- The tracking number may be invalid
- The shipment may not be registered yet
- Allow 1-2 hours after shipment creation for tracking to appear

## Related Documentation

- [Ukrposhta Integration](./UKRPOSHTA_API.md)
- [Shipping Configuration](./SHIPPING.md)
- [Checkout Flow](./CHECKOUT.md)
