# Ukrposhta Address Classifier API Integration

## Overview

This integration uses the Ukrposhta Address Classifier API (Version 3.20, 09.12.2024) to provide address selection functionality for Ukrainian postal delivery.

**Base URL**: `https://www.ukrposhta.ua/address-classifier-ws/`

> ⚠️ **Important**: The URL must include `www` prefix.

## Authentication

The API requires a Bearer token for authenticated access. Some endpoints may work without authentication for basic queries, but full access requires the token.

```
Authorization: Bearer {bearer_Uuid}
```

The token is obtained from the Ukrposhta contract appendix.

### Configuration

Add the API token to your `.env` file:

```env
UKRPOSHTA_API_TOKEN=your_bearer_token_here
```

## Available Endpoints

### Regions (Області)

| Endpoint | Description |
|----------|-------------|
| `get_regions_by_region_ua` | Get all regions or search by name |

**Parameters**:
- `region_name` (optional) - Region name in Ukrainian
- `region_name_en` (optional) - Region name in English

### Districts (Райони)

| Endpoint | Description |
|----------|-------------|
| `get_districts_by_region_id_and_district_ua` | Get districts by region |
| `get_district_by_name` | Fuzzy search districts by name |

**Parameters**:
- `region_id` - Region ID
- `district_ua` (optional) - District name
- `district_name` - District name (for fuzzy search)
- `lang` - Language: UA or EN
- `fuzzy` - Enable fuzzy matching: 0 or 1

### Cities (Населені пункти)

| Endpoint | Description |
|----------|-------------|
| `get_city_by_region_id_and_district_id_and_city_ua` | Get cities by region/district |
| `get_city_by_name` | Fuzzy search cities by name |
| `get_city_details_by_postcode` | Get city info by postcode |

**Parameters**:
- `region_id` - Region ID
- `district_id` - District ID
- `city_ua` (optional) - City name
- `koatuu` (optional) - KOATUU code
- `katottg` (optional) - KATOTTG code
- `city_name` - City name (for fuzzy search)
- `lang` - Language: UA or EN
- `fuzzy` - Enable fuzzy matching: 0 or 1

**New Fields (v3.20)**:
- `IS_DISTRICTCENTER` - "1" if city is a district center
- `LONGITUDE`, `LATTITUDE` - City coordinates

### Streets (Вулиці)

| Endpoint | Description |
|----------|-------------|
| `get_street_by_region_id_and_district_id_and_city_id_and_street_ua` | Get streets |
| `get_street_by_name` | Fuzzy search streets by name |

**Parameters**:
- `city_id` - City ID
- `street_ua` (optional) - Street name
- `street_name` - Street name (for fuzzy search)
- `lang` - Language: UA or EN
- `fuzzy` - Enable fuzzy matching: 0 or 1

### Houses (Будинки)

| Endpoint | Description |
|----------|-------------|
| `get_addr_house_by_street_id` | Get house postcode |

**Parameters**:
- `street_id` - Street ID
- `housenumber` (optional) - House number

### Post Offices (Відділення)

| Endpoint | Description |
|----------|-------------|
| `get_postoffices_by_postindex` | Get post offices by postindex |
| `get_postoffices_by_city_id` | Get post offices by city ID |
| `get_postoffices_by_postcode_cityid_cityvpzid` | Get post offices by various codes |

**Parameters**:
- `pi` - Post office index
- `pc` - Postal code (delivery zone)
- `city_id` - City ID
- `city_koatuu` - City KOATUU code
- `city_katottg` - City KATOTTG code
- `postcode` - Postal code

**Important Fields**:
- `LOCK_CODE` - Status code (0 = active)
- `IS_SECURITY` - "1" = restricted access (closed institutions)
- `IS_NOLETTERS` - "1" = doesn't forward correspondence
- `AVALIBLE` - "1" = available for operations

### Post Office Working Hours

| Endpoint | Description |
|----------|-------------|
| `get_postoffices_openhours_by_postindex` | Get working hours by postcode |
| `get_postoffices_openhours_by_id` | Get working hours by post office ID |
| `get_postoffices_mobile_openhours_by_postindex` | Get mobile post office schedule |

**Parameters**:
- `pc` - Postal code
- `id` (optional) - Post office ID
- `techindex` - Technical index (for mobile offices)

### Geolocation

| Endpoint | Description |
|----------|-------------|
| `get_postoffices_by_geolocation` | Find nearest post offices |

**Parameters**:
- `lat` - Latitude
- `long` - Longitude
- `maxdistance` - Maximum search radius in km

### Courier Delivery Area

| Endpoint | Description |
|----------|-------------|
| `get_courierarea_by_postindex` | Check if postcode is in courier area |

**Parameters**:
- `postindex` - Postal index

**Response**:
- `IS_COURIERAREA` - "1" = courier delivery available

### Address by Postcode

| Endpoint | Description |
|----------|-------------|
| `get_city_details_by_postcode` | Get city details by postcode |
| `get_address_by_postcode` | Get full address by postcode |
| `get_postcode_by_city_id` | Get delivery zone postcodes |

## Lock Codes (Appendix A)

| Code | Description |
|------|-------------|
| 0 | Active record |
| 1 | Temporarily occupied territories |
| 2 | Temporarily uncontrolled territories |
| 3 | Controlled territories, temporarily not functioning |
| 4 | No linked houses |
| 5 | Ukrposhta excluded (not 1,2,3) |
| 65535 | Blocked record |
| 32768 | Under repair |
| 32774 | Quarantine |

## Integration Files

### Server Client
`src/lib/server/ukrposhta-client.ts`

The client class that handles all API communication:
- Automatic Bearer token authentication
- Response parsing and type safety
- Utility methods for filtering post offices

### Remote Functions
`src/lib/remotes/ukrposhta.remote.ts`

Server-side functions accessible from components:
- `getAllRegions()` - Get all regions
- `getDistrictsByRegion()` - Get districts for a region
- `getCitiesByDistrict()` - Get cities for a district
- `searchStreets()` - Search streets in a city
- `getHousePostcode()` - Get postcode for a house
- `getPostOfficesByCity()` - Get post offices in a city
- `testConnection()` - Test API connectivity
- `checkCourierDelivery()` - Check courier area availability
- `findNearestPostOffices()` - Find nearest offices by coordinates
- `getPostOfficeWorkingHours()` - Get office schedule

### Components

**Admin**:
- `src/lib/components/admin/features/ukrposhta-management/` - Admin panel components
- `src/routes/admin/ukrposhta/+page.svelte` - Admin page

**Client**:
- `src/lib/components/client/features/ukrposhta/ukrposhta-address-selector.svelte` - Address selector

## Usage Examples

### Test Connection

```svelte
<script lang="ts">
  import { testConnection } from '$lib/remotes/ukrposhta.remote';
  
  const result = await testConnection();
  console.log(result.success, result.hasApiToken);
</script>
```

### Get Regions

```svelte
<script lang="ts">
  import { getAllRegions } from '$lib/remotes/ukrposhta.remote';
</script>

{#await getAllRegions() then regions}
  {#each regions as region}
    <option value={region.REGION_ID}>{region.REGION_UA}</option>
  {/each}
{/await}
```

### Check Courier Delivery

```svelte
<script lang="ts">
  import { checkCourierDelivery } from '$lib/remotes/ukrposhta.remote';
  
  const result = await checkCourierDelivery({ postindex: '01001' });
  if (result.isCourierArea) {
    // Courier delivery available
  }
</script>
```

### Find Nearest Post Offices

```svelte
<script lang="ts">
  import { findNearestPostOffices } from '$lib/remotes/ukrposhta.remote';
  
  // Kyiv coordinates
  const offices = await findNearestPostOffices({
    lat: 50.4501,
    long: 30.5234,
    maxDistance: 5 // 5 km radius
  });
</script>
```

## Delivery Types

| Type | Description |
|------|-------------|
| W2W | Warehouse to Warehouse - Customer picks up at post office |
| W2D | Warehouse to Door - Courier delivery to customer address |

## Related Documentation

- [UKRPOSHTA_API_START.md](./UKRPOSHTA_API_START.md) - Shipment creation API
- [Official API Documentation](https://dev.ukrposhta.ua/documentation)
