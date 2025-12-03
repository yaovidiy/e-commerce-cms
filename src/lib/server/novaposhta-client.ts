/**
 * Nova Poshta API Client
 *
 * Documentation: https://developers.novaposhta.ua/
 * API Version: 2.0
 *
 * This client provides access to:
 * - Regions (oblasti)
 * - Cities/settlements
 * - Streets
 * - Warehouses (post offices, parcel lockers, cargo reception points)
 * - Delivery cost calculation
 * - Tracking
 *
 * API Key: Free registration at https://new.novaposhta.ua/
 * No contract required - just sign up and get API key from account settings
 */

import { NOVAPOSHTA_API_KEY } from '$env/static/private';

const API_BASE_URL = 'https://api.novaposhta.ua/v2.0/json/';

// Warehouse types
export const WAREHOUSE_TYPES = {
	BRANCH: '841339c7-591a-42e2-8571-3ca4752a3ac3', // Відділення (Branch)
	POSTOMAT: 'f9316480-5f2d-425d-bc2c-ac7cd29decf0', // Поштомат (Parcel Locker)
	CARGO: '9a68df70-0267-42a8-bb5c-37f427e36ee4' // Вантажне відділення (Cargo)
} as const;

// Response status codes
export const STATUS_SUCCESS = true;

// Types for API responses
export interface NovaPoshtaArea {
	Ref: string;
	AreasCenter: string;
	DescriptionRu: string;
	Description: string;
}

export interface NovaPoshtaCity {
	Ref: string;
	Description: string;
	DescriptionRu: string;
	Delivery1: string;
	Delivery2: string;
	Delivery3: string;
	Delivery4: string;
	Delivery5: string;
	Delivery6: string;
	Delivery7: string;
	Area: string;
	SettlementType: string;
	IsBranch: string;
	PreventEntryNewStreetsUser: string;
	CityID: string;
	SettlementTypeDescription: string;
	SettlementTypeDescriptionRu: string;
	SpecialCashCheck: number;
	AreaDescription: string;
	AreaDescriptionRu: string;
}

export interface NovaPoshtaSettlement {
	Ref: string;
	SettlementType: string;
	Latitude: string;
	Longitude: string;
	Description: string;
	DescriptionRu: string;
	DescriptionTranslit: string;
	SettlementTypeDescription: string;
	SettlementTypeDescriptionRu: string;
	Region: string;
	RegionsDescription: string;
	RegionsDescriptionRu: string;
	Area: string;
	AreaDescription: string;
	AreaDescriptionRu: string;
	Index1: string;
	Index2: string;
	IndexCOATSU1: string;
	Delivery1: string;
	Delivery2: string;
	Delivery3: string;
	Delivery4: string;
	Delivery5: string;
	Delivery6: string;
	Delivery7: string;
	Warehouse: string;
	Conglomerates?: string[];
}

export interface NovaPoshtaStreet {
	Ref: string;
	Description: string;
	StreetsTypeRef: string;
	StreetsType: string;
}

export interface NovaPoshtaWarehouse {
	SiteKey: string;
	Description: string;
	DescriptionRu: string;
	ShortAddress: string;
	ShortAddressRu: string;
	Phone: string;
	TypeOfWarehouse: string;
	Ref: string;
	Number: string;
	CityRef: string;
	CityDescription: string;
	CityDescriptionRu: string;
	SettlementRef: string;
	SettlementDescription: string;
	SettlementAreaDescription: string;
	SettlementRegionsDescription: string;
	SettlementTypeDescription: string;
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
	WarehouseIllupinatted: string;
	CategoryOfWarehouse: string;
	Direct: string;
	RegionCity: string;
	WarehouseForAgent: string;
	GeneratorEnabled: string;
	MaxDeclaredCost: string;
	WorkInMobileAwis: string;
	DenyToSelect: string;
	CanGetMoneyTransfer: string;
	HasMirror: string;
	HasFittingRoom: string;
	OnlyReceivingParcel: string;
	PostMachineType: string;
	PostalCodeUA: string;
	WarehouseIndex: string;
	BeaconCode: string;
}

export interface NovaPoshtaWarehouseType {
	Ref: string;
	Description: string;
	DescriptionRu: string;
}

export interface NovaPoshtaDeliveryCost {
	AssessedCost: number;
	Cost: number;
	CostRedelivery: number;
	TZoneInfo: {
		TzoneName: string;
		TzoneID: string;
	};
	CostPack: number;
}

export interface NovaPoshtaDeliveryDate {
	DeliveryDate: {
		date: string;
		timezone_type: number;
		timezone: string;
	};
}

export interface NovaPoshtaTrackingDocument {
	Number: string;
	Redelivery: string;
	RedeliverySum: string;
	RedeliveryNum: string;
	RedeliveryPayer: string;
	OwnerDocumentType: string;
	LastCreatedOnTheBasisDocumentType: string;
	LastCreatedOnTheBasisPayerType: string;
	LastCreatedOnTheBasisDateTime: string;
	LastTransactionStatusGM: string;
	LastTransactionDateTimeGM: string;
	DateCreated: string;
	DocumentWeight: string;
	FactualWeight: string;
	VolumeWeight: string;
	CheckWeight: string;
	DocumentCost: string;
	CalculatedWeight: string;
	SumBeforeCheckWeight: string;
	PayerType: string;
	RecipientFullName: string;
	RecipientDateTime: string;
	ScheduledDeliveryDate: string;
	PaymentMethod: string;
	CargoDescriptionString: string;
	CargoType: string;
	CitySender: string;
	CityRecipient: string;
	WarehouseRecipient: string;
	CounterpartyType: string;
	AfterpaymentOnGoodsCost: string;
	ServiceType: string;
	UndeliveryReasonsSubtypeDescription: string;
	WarehouseRecipientNumber: number;
	LastCreatedOnTheBasisNumber: string;
	PhoneRecipient: string;
	RecipientFullNameEW: string;
	WarehouseRecipientInternetAddressRef: string;
	MarketplacePartnerToken: string;
	ClientBarcode: string;
	RecipientAddress: string;
	CounterpartyRecipientDescription: string;
	CounterpartySenderType: string;
	DateScan: string;
	PaymentStatus: string;
	PaymentStatusDate: string;
	AmountToPay: string;
	AmountPaid: string;
	Status: string;
	StatusCode: string;
	RefEW: string;
	BackwardDeliverySubTypesActions: string;
	BackwardDeliverySubTypesServices: string;
	UndeliveryReasons: string;
	DatePayedKeeping: string;
	InternationalDeliveryType: string;
	SeatsAmount: string;
	CardMaskedNumber: string;
	ExpressWaybillPaymentStatus: string;
	ExpressWaybillAmountToPay: string;
	PhoneSender: string;
	TrackingUpdateDate: string;
	WarehouseSender: string;
	DateReturnCargo: string;
	DateMoving: string;
	DateFirstDayStorage: string;
	RefCityRecipient: string;
	RefCitySender: string;
	RefSettlementRecipient: string;
	RefSettlementSender: string;
	SenderAddress: string;
	SenderFullNameEW: string;
	AnnouncedPrice: string;
	AdditionalInformationEW: string;
	ActualDeliveryDate: string;
	PostomatV3CellReservationNumber: string;
	OwnerDocumentNumber: string;
	LastAmountTransferGM: string;
	LastAmountReceivedCommissionGM: string;
	DeliveryTimeframe: string;
	CreatedOnTheBasis: string;
	UndeliveryReasonsDate: string;
	RecipientWarehouseTypeRef: string;
	WarehouseRecipientRef: string;
	CategoryOfWarehouse: string;
	WarehouseRecipientAddress: string;
	WarehouseSenderInternetAddressRef: string;
	WarehouseSenderAddress: string;
	AviaDelivery: number;
	BarcodeRedBox: string;
	CargoReturnRefusal: boolean;
	DaysStorageCargo: string;
	Packaging: { Ref: string; Description: string }[];
	PartialReturnGoods: { OrderRef: string; ServiceType: string; ReturnReason: string }[];
	SecurePayment: boolean;
	PossibilityChangeCash2Card: boolean;
	PossibilityChangeDeliveryIntervals: boolean;
	PossibilityTermExtensio: boolean;
	StorageAmount: string;
	StoragePrice: string;
	FreeShipping: boolean;
	LoyaltyCardRecipient: string;
}

interface ApiRequest {
	apiKey: string;
	modelName: string;
	calledMethod: string;
	methodProperties: Record<string, unknown>;
}

interface ApiResponse<T> {
	success: boolean;
	data: T[];
	errors: string[];
	warnings: string[];
	info: {
		totalCount?: number;
	};
	messageCodes: string[];
	errorCodes: string[];
	warningCodes: string[];
	infoCodes: string[];
}

class NovaPoshtaClient {
	private apiKey: string | null;

	constructor() {
		this.apiKey = NOVAPOSHTA_API_KEY || null;
	}

	/**
	 * Check if the client has a valid API key configured
	 */
	isConfigured(): boolean {
		return !!this.apiKey;
	}

	private async request<T>(
		modelName: string,
		calledMethod: string,
		methodProperties: Record<string, unknown> = {}
	): Promise<T[]> {
		if (!this.apiKey) {
			throw new Error('Nova Poshta API key is not configured');
		}

		const requestBody: ApiRequest = {
			apiKey: this.apiKey,
			modelName,
			calledMethod,
			methodProperties
		};

		try {
			const response = await fetch(API_BASE_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(requestBody)
			});

			if (!response.ok) {
				throw new Error(`Nova Poshta API error: ${response.status} ${response.statusText}`);
			}

			const data: ApiResponse<T> = await response.json();

			if (!data.success) {
				const errorMessage = data.errors.join(', ') || 'Unknown API error';
				throw new Error(`Nova Poshta API error: ${errorMessage}`);
			}

			return data.data || [];
		} catch (error) {
			console.error('Nova Poshta API request error:', error);
			throw error;
		}
	}

	// ============================================
	// AREAS (Області)
	// ============================================

	/**
	 * Get all areas (regions/oblasti)
	 */
	async getAreas(): Promise<NovaPoshtaArea[]> {
		return this.request<NovaPoshtaArea>('Address', 'getAreas', {});
	}

	// ============================================
	// CITIES (Міста)
	// ============================================

	/**
	 * Get cities with optional search
	 * @param params.Ref - City reference (for specific city)
	 * @param params.FindByString - Search string
	 * @param params.Limit - Max results (default: 20)
	 * @param params.Page - Page number
	 */
	async getCities(params?: {
		Ref?: string;
		FindByString?: string;
		Limit?: number;
		Page?: number;
	}): Promise<NovaPoshtaCity[]> {
		return this.request<NovaPoshtaCity>('Address', 'getCities', {
			Ref: params?.Ref,
			FindByString: params?.FindByString,
			Limit: params?.Limit?.toString() || '20',
			Page: params?.Page?.toString() || '1'
		});
	}

	/**
	 * Search cities by name
	 */
	async searchCities(searchString: string, limit: number = 20): Promise<NovaPoshtaCity[]> {
		return this.getCities({ FindByString: searchString, Limit: limit });
	}

	/**
	 * Get city by reference
	 */
	async getCityByRef(ref: string): Promise<NovaPoshtaCity | null> {
		const cities = await this.getCities({ Ref: ref });
		return cities.length > 0 ? cities[0] : null;
	}

	// ============================================
	// SETTLEMENTS (Населені пункти - детальніше)
	// ============================================

	/**
	 * Get settlements (more detailed than cities, includes villages)
	 * @param params.Ref - Settlement reference
	 * @param params.RegionRef - Region reference
	 * @param params.AreaRef - Area reference
	 * @param params.FindByString - Search string
	 * @param params.Warehouse - Has warehouse: "1" or "0"
	 * @param params.Limit - Max results
	 * @param params.Page - Page number
	 */
	async getSettlements(params?: {
		Ref?: string;
		RegionRef?: string;
		AreaRef?: string;
		FindByString?: string;
		Warehouse?: '0' | '1';
		Limit?: number;
		Page?: number;
	}): Promise<NovaPoshtaSettlement[]> {
		return this.request<NovaPoshtaSettlement>('Address', 'getSettlements', {
			Ref: params?.Ref,
			RegionRef: params?.RegionRef,
			AreaRef: params?.AreaRef,
			FindByString: params?.FindByString,
			Warehouse: params?.Warehouse,
			Limit: params?.Limit?.toString() || '20',
			Page: params?.Page?.toString() || '1'
		});
	}

	/**
	 * Search settlements by name
	 */
	async searchSettlements(
		searchString: string,
		limit: number = 20
	): Promise<NovaPoshtaSettlement[]> {
		return this.getSettlements({ FindByString: searchString, Limit: limit });
	}

	/**
	 * Get settlements with warehouses only
	 */
	async getSettlementsWithWarehouses(
		areaRef?: string,
		limit: number = 100
	): Promise<NovaPoshtaSettlement[]> {
		return this.getSettlements({ AreaRef: areaRef, Warehouse: '1', Limit: limit });
	}

	// ============================================
	// STREETS (Вулиці)
	// ============================================

	/**
	 * Search streets in a city
	 * @param cityRef - City reference
	 * @param findByString - Search string
	 * @param limit - Max results
	 */
	async searchStreets(
		cityRef: string,
		findByString: string,
		limit: number = 20
	): Promise<NovaPoshtaStreet[]> {
		return this.request<NovaPoshtaStreet>('Address', 'searchSettlementStreets', {
			SettlementRef: cityRef,
			StreetName: findByString,
			Limit: limit.toString()
		});
	}

	/**
	 * Get street by reference
	 */
	async getStreet(streetRef: string, cityRef: string): Promise<NovaPoshtaStreet | null> {
		const streets = await this.request<NovaPoshtaStreet>('Address', 'getStreet', {
			Ref: streetRef,
			CityRef: cityRef
		});
		return streets.length > 0 ? streets[0] : null;
	}

	// ============================================
	// WAREHOUSES (Відділення)
	// ============================================

	/**
	 * Get warehouses (post offices, parcel lockers)
	 * @param params.CityRef - City reference
	 * @param params.CityName - City name search
	 * @param params.SettlementRef - Settlement reference
	 * @param params.TypeOfWarehouseRef - Warehouse type reference
	 * @param params.WarehouseId - Warehouse ID
	 * @param params.FindByString - Search string
	 * @param params.Limit - Max results
	 * @param params.Page - Page number
	 */
	async getWarehouses(params?: {
		CityRef?: string;
		CityName?: string;
		SettlementRef?: string;
		TypeOfWarehouseRef?: string;
		WarehouseId?: string;
		FindByString?: string;
		Limit?: number;
		Page?: number;
	}): Promise<NovaPoshtaWarehouse[]> {
		return this.request<NovaPoshtaWarehouse>('Address', 'getWarehouses', {
			CityRef: params?.CityRef,
			CityName: params?.CityName,
			SettlementRef: params?.SettlementRef,
			TypeOfWarehouseRef: params?.TypeOfWarehouseRef,
			WarehouseId: params?.WarehouseId,
			FindByString: params?.FindByString,
			Limit: params?.Limit?.toString() || '50',
			Page: params?.Page?.toString() || '1'
		});
	}

	/**
	 * Get warehouses by city
	 */
	async getWarehousesByCity(cityRef: string, limit: number = 100): Promise<NovaPoshtaWarehouse[]> {
		return this.getWarehouses({ CityRef: cityRef, Limit: limit });
	}

	/**
	 * Get warehouses by city name
	 */
	async getWarehousesByCityName(
		cityName: string,
		limit: number = 100
	): Promise<NovaPoshtaWarehouse[]> {
		return this.getWarehouses({ CityName: cityName, Limit: limit });
	}

	/**
	 * Search warehouses
	 */
	async searchWarehouses(
		cityRef: string,
		searchString: string,
		limit: number = 50
	): Promise<NovaPoshtaWarehouse[]> {
		return this.getWarehouses({ CityRef: cityRef, FindByString: searchString, Limit: limit });
	}

	/**
	 * Get only branches (standard post offices)
	 */
	async getBranches(cityRef: string, limit: number = 100): Promise<NovaPoshtaWarehouse[]> {
		return this.getWarehouses({
			CityRef: cityRef,
			TypeOfWarehouseRef: WAREHOUSE_TYPES.BRANCH,
			Limit: limit
		});
	}

	/**
	 * Get only parcel lockers (postomats)
	 */
	async getPostomats(cityRef: string, limit: number = 100): Promise<NovaPoshtaWarehouse[]> {
		return this.getWarehouses({
			CityRef: cityRef,
			TypeOfWarehouseRef: WAREHOUSE_TYPES.POSTOMAT,
			Limit: limit
		});
	}

	/**
	 * Get warehouse types
	 */
	async getWarehouseTypes(): Promise<NovaPoshtaWarehouseType[]> {
		return this.request<NovaPoshtaWarehouseType>('Address', 'getWarehouseTypes', {});
	}

	// ============================================
	// DELIVERY COST & DATE
	// ============================================

	/**
	 * Calculate delivery cost
	 * @param params.CitySender - Sender city ref
	 * @param params.CityRecipient - Recipient city ref
	 * @param params.Weight - Package weight in kg
	 * @param params.ServiceType - Service type: DoorsWarehouse, WarehouseWarehouse, etc.
	 * @param params.Cost - Declared cost
	 * @param params.CargoType - Cargo type: Cargo, Documents, TiresWheels, Pallet
	 * @param params.SeatsAmount - Number of seats (packages)
	 */
	async getDeliveryCost(params: {
		CitySender: string;
		CityRecipient: string;
		Weight: number;
		ServiceType: 'DoorsWarehouse' | 'WarehouseWarehouse' | 'WarehouseDoors' | 'DoorsDoors';
		Cost: number;
		CargoType?: 'Cargo' | 'Documents' | 'TiresWheels' | 'Pallet';
		SeatsAmount?: number;
	}): Promise<NovaPoshtaDeliveryCost[]> {
		return this.request<NovaPoshtaDeliveryCost>('InternetDocument', 'getDocumentPrice', {
			CitySender: params.CitySender,
			CityRecipient: params.CityRecipient,
			Weight: params.Weight.toString(),
			ServiceType: params.ServiceType,
			Cost: params.Cost.toString(),
			CargoType: params.CargoType || 'Cargo',
			SeatsAmount: (params.SeatsAmount || 1).toString()
		});
	}

	/**
	 * Get estimated delivery date
	 */
	async getDeliveryDate(params: {
		CitySender: string;
		CityRecipient: string;
		ServiceType: 'DoorsWarehouse' | 'WarehouseWarehouse' | 'WarehouseDoors' | 'DoorsDoors';
	}): Promise<NovaPoshtaDeliveryDate[]> {
		return this.request<NovaPoshtaDeliveryDate>('InternetDocument', 'getDocumentDeliveryDate', {
			DateTime: new Date().toISOString().split('T')[0],
			ServiceType: params.ServiceType,
			CitySender: params.CitySender,
			CityRecipient: params.CityRecipient
		});
	}

	// ============================================
	// TRACKING
	// ============================================

	/**
	 * Track shipment by tracking number (TTN)
	 * @param trackingNumber - Express waybill number (TTN)
	 * @param phone - Optional: recipient phone number for detailed info
	 */
	async trackDocument(
		trackingNumber: string,
		phone?: string
	): Promise<NovaPoshtaTrackingDocument[]> {
		return this.request<NovaPoshtaTrackingDocument>('TrackingDocument', 'getStatusDocuments', {
			Documents: [
				{
					DocumentNumber: trackingNumber,
					Phone: phone || ''
				}
			]
		});
	}

	/**
	 * Track multiple shipments
	 */
	async trackDocuments(
		documents: Array<{ trackingNumber: string; phone?: string }>
	): Promise<NovaPoshtaTrackingDocument[]> {
		return this.request<NovaPoshtaTrackingDocument>('TrackingDocument', 'getStatusDocuments', {
			Documents: documents.map((doc) => ({
				DocumentNumber: doc.trackingNumber,
				Phone: doc.phone || ''
			}))
		});
	}

	// ============================================
	// UTILITY METHODS
	// ============================================

	/**
	 * Filter warehouses by type
	 */
	filterByWarehouseType(
		warehouses: NovaPoshtaWarehouse[],
		type: keyof typeof WAREHOUSE_TYPES
	): NovaPoshtaWarehouse[] {
		return warehouses.filter((w) => w.TypeOfWarehouse === WAREHOUSE_TYPES[type]);
	}

	/**
	 * Filter active warehouses (not denied)
	 */
	filterActiveWarehouses(warehouses: NovaPoshtaWarehouse[]): NovaPoshtaWarehouse[] {
		return warehouses.filter((w) => w.DenyToSelect !== '1' && w.WarehouseStatus !== 'NotWorking');
	}

	/**
	 * Sort warehouses by number
	 */
	sortWarehousesByNumber(warehouses: NovaPoshtaWarehouse[]): NovaPoshtaWarehouse[] {
		return [...warehouses].sort((a, b) => {
			const numA = parseInt(a.Number) || 0;
			const numB = parseInt(b.Number) || 0;
			return numA - numB;
		});
	}

	/**
	 * Get human-readable tracking status
	 */
	getTrackingStatusDescription(statusCode: string): string {
		const statuses: Record<string, string> = {
			'1': 'Нова пошта очікує надходження від відправника',
			'2': 'Видалено',
			'3': 'Номер не знайдено',
			'4': 'Відправлення у місті відправника',
			'5': 'Відправлення прямує до міста одержувача',
			'6': 'Відправлення у місті одержувача',
			'7': 'Прибув на відділення',
			'8': 'Прибув на відділення (завантажено в Поштомат)',
			'9': 'Одержано',
			'10': 'Одержано (з накладеним платежем)',
			'11': 'Одержано (грошовий переказ)',
			'14': 'Одержано (зворотна доставка)',
			'41': 'Прибув на адресу',
			'101': 'На шляху до одержувача',
			'102': 'Відмова одержувача',
			'103': 'Відмова одержувача (неправильна адреса)',
			'104': 'Змінено адресу',
			'105': 'Припинено зберігання',
			'106': 'Одержано і створено зворотну доставку',
			'111': 'Невдала спроба доставки',
			'112': 'Дата доставки перенесена'
		};
		return statuses[statusCode] || `Статус: ${statusCode}`;
	}
}

// Export singleton instance
export const novaPoshtaClient = new NovaPoshtaClient();
