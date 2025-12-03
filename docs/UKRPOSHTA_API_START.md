Як почати роботу з API

Версія 27.06.2024

Як розпочати роботу з API
Щоб створити відправлення та надрукувати ярлик:
1. Створіть адресу відправника.
2. Створіть адресу одержувача.
3. Створіть клієнта-відправника.
4. Створіть клієнта-одержувача.
5. Створіть відправлення (групу відправлень).
6. Надрукуйте супровідні документи.
Дані для надсилання запитів
URI для створення адрес, клієнтів, відправлень:
https://www.ukrposhta.ua/ecom/0.0.1/
URI для формування супровідних документів:
https://www.ukrposhta.ua/forms/ecom/0.0.1/

Авторизація
Щоб надіслати запит, передайте наступні параметри в заголовках:
- Authorization: Bearer {ваш Bearer Ecom};
- Content-Type: application/json.
Створені дані захищені вашим токеном користувача (кожен запит, крім створення
адрес).
Структура запиту більш детально описана в документації*.
Для роботи з даними через АРІ використовуються наступні методи:
GET. Метод GET використовується для отримання інформації, раніше доданої до
системи (адрес, клієнтів, відправлень та ін.)
POST. Метод POST використовується для створення нових записів в системі
(створення адреси, клієнта або відправлення)
PUT. Метод PUT використовується для оновлення/зміни даних в системі
(оновлення адреси клієнта, зміни довжини або ваги відправлення та ін.)
DELETE. Метод DELETE використовується для окремих операцій видалення
даних з системи (наприклад, для видалення створеного відправлення.)
Увага! Відправлення можливо змінити або видалити, доки воно не було
зареєстровано у відділенні.
*Докладніше див. Документацію по АРІ для відправлень в межах країни яку можна
знайти на сторінці: https://dev.ukrposhta.ua/documentation

Як створити адресу
Надішліть наступний запит, вказавши необхідну інформацію у тілі запиту.
У тілі відповіді ви отримаєте ідентифікатор адреси (addressId). Цей ідентифікатор
необхідно використати під час створення клієнта з такою адресою.

{

}

POST Request
URI:/addresses
"postcode":"07401",
"country":"UA",
"region":"Київська",
"city":"Бровари",
"district":"Київський",
"street":"Котляревського",
"houseNumber":"12",
"apartmentNumber":"33"
Response
Response code: 200

{
"id":50302113,
"postcode":"07401",
"region":"Київська",
"district":"Київський",
"city":"Бровари",
"street":"Котляревського",
"houseNumber":"12",
"apartmentNumber":"33",
"description":null,
"countryside":false,
"foreignStreetHouseApartment":null,
"detailedInfo":"Україна, 07401, Київська, Київський, Бровари, Котляревського
12, 33",
"created":"2019-11-12T17:21:49",
"lastModified":"2019-11-12T17:21:49",
"country":"UA"
}

Як створити відправника та/або одержувача
Надішліть наступний запит, вказавши необхідну інформацію у тілі запиту.
Використайте ідентифікатор адреси, отриманий на попередньому кроці, щоб
встановити адресу відправника або одержувача.

{

}

POST Request
URI:/clients?token={token}
(Юридична особа)
"type":"COMPANY",
"name":"ТОВ Лімон Банк",
"uniqueRegistrationNumber":"0035",
"addressId":"{addressId}",
"phoneNumber":"0671231234",
"email":"test@test.com",
"bankAccount":"UA073808050000000026000439806",
"resident":true,
"edrpou":"40145721"
Response
Код відповіді: 200

{

"uuid":"2e88b642-06ab-44e5-9a28-7acab533ed88",
"name":" ТОВ Лімон Банк ",
"firstName":null,
"middleName":null,
"lastName":null,
"latinName":null,
"postId":null,
"externalId":null,
"uniqueRegistrationNumber":"0035",
"counterpartyUuid":"b17859c4-7fae-46b1-9243-31985df82fd9",
"addressId":7435476,
"addresses":[
{
"uuid":"4a16add9-a2de-45a3-adc0-512a076006c9",
"addressId":7435476,
"address":{
"id":7435476,
"postcode":"04071",
"region":"Київ",
"district":"Подільський",
"city":"Київ",
"street":"Хорива",
"houseNumber":"40",
"apartmentNumber":"20",
"description":"none",
"countryside":false,
"foreignStreetHouseApartment":null,
"detailedInfo":"Україна, 04071, Київ, Подільський, Київ, Хорива 40,
20, none",
"created":"2019-08-07T09:37:56",
"lastModified":"2019-08-07T09:37:56",

}

}

"country":"UA"
},
"type":"PHYSICAL",
"main":true

],
"phoneNumber":"+380671231234",
"phones":[
{
"uuid":"957f83be-666b-4c88-bbc3-b6dfbced3a89",
"phoneId":24645,
"phoneNumber":"+380671231234",
"type":"PERSONAL",
"main":true
}
],
"email":"test@test.com",
"emails":[
{
"uuid":"0b92770a-4186-4b99-ad5f-21570f207410",
"email":"test@test.com",
"main":true
},
"type":"COMPANY",
"postPayPaymentType":"POSTPAY_PAYMENT_CASH_ONLY",
"edrpou":"40145721",
"bankCode":"300001",
"bankAccount":"UA073808050000000026000439806",
"contactPersonName":null,
"resident":true,
"GDPRRead":false,
"GDPRAccept":false,
"personalDataApproved":false,
"checkOnDeliveryAllowed":true

Як створити відправлення
Надішліть наступний запит, вказавши необхідну інформацію у тілі запиту.
Використовуйте uuid відправника та одержувача, отримані на попередньому кроці.
Зверніть увагу! Для зручності відправлення можна об’єднувати в групи. Все що
пов’язано з групами відправлень описано в наступному кроці.
POST Request
URI:/shipments?token={token}

}

{

{
"sender":{
"uuid":"{SenderUuid}"
},
"recipient":{
"uuid":"{RecipientUuid1}"
},
"deliveryType":"W2D",
"paidByRecipient":true,
"parcels":[
{
"weight":1200,
"length":170
}
]

Response
Код відповіді: 200
"uuid":"9d6285f1-1693-4ea0-8c55-29e13ca8eed2",
"type":"EXPRESS",
"sender":{
"uuid":"3b699af0-276b-4c94-8bef-2bb63a01099f",
"name":"ФОП Петренко",
"firstName":null,
"middleName":null,
"lastName":null,
"latinName":"FOP petrenko",
"postId":null,
"externalId":null,
"uniqueRegistrationNumber":"0035",
"counterpartyUuid":"f48ad867-cb08-426f-9db8-b478e4e320d1",
"addressId":515862,
"addresses":[
{
"uuid":"9652719b-2f85-4466-bcce-feb3d0e045fd",
"addressId":515837,
"address":{
"id":515837,
"postcode":"04071",
"region":"Kyiv",
"district":null,
"city":"Kyiv",
"street":"Khoriva",
"houseNumber":"40",

"apartmentNumber":"20",
"description":"none",
"countryside":false,
"foreignStreetHouseApartment":null,
"detailedInfo":"Україна, 04071, Kyiv, Kyiv, Khoriva 40, 20, none"

,

"created":"2019-03-06T14:23:02",
"lastModified":"2019-03-06T14:23:02",
"country":"UA"

},
{

},
"type":"PHYSICAL",
"main":false

"uuid":"537449ab-5fdd-4022-9147-b0c8ed466f32",
"addressId":515862,
"address":{
"id":515862,
"postcode":"04071",
"region":"Київ",
"district":"Подільський",
"city":"Київ",
"street":"Хорива",
"houseNumber":"40",
"apartmentNumber":"20",
"description":"none",
"countryside":false,
"foreignStreetHouseApartment":null,
"detailedInfo":"Україна, 04071, Київ, Подільський, Київ, Хорива 4
0, 20, none",
"created":"2019-03-06T14:23:04",
"lastModified":"2019-03-06T14:23:04",
"country":"UA"
},
"type":"PHYSICAL",
"main":true
}
],
"phoneNumber":"+380672802273",
"phones":[
{
"uuid":"55dfa5ff-7d4e-4de1-a28b-6b56d4febd46",
"phoneId":387865,
"phoneNumber":"+380672802273",
"type":"PERSONAL",
"main":true
}
],
"email":"",
"emails":[
],
"type":"PRIVATE_ENTREPRENEUR",
"postPayPaymentType":"POSTPAY_PAYMENT_CASH_AND_CASHLESS",

"bankCode":"838012",
"bankAccount":"UA073808050000000026000439806",
"tin":"4201030327",
"contactPersonName":"Аркадий Петрович Боровиков",
"resident":true,
"GDPRRead":false,
"GDPRAccept":false,
"personalDataApproved":true,
"checkOnDeliveryAllowed":true

},
"dropOffPostcode":"04071",
"recipient":{
"uuid":"b533c4a3-e483-4e73-b13b-dbaa53d7e180",
"name":"Іванов Іван Іванович",
"firstName":"Іван",
"middleName":"Іванович",
"lastName":"Іванов",
"latinName":"Ivan Ivanov",
"postId":null,
"externalId":"1045362",
"uniqueRegistrationNumber":" 002",
"counterpartyUuid":"f48ad867-cb08-426f-9db8-b478e4e320d1",
"addressId":515834,
"addresses":[
{
"uuid":"08afd9d7-6cb4-4d0c-a884-6d85a79de34a",
"addressId":515834,
"address":{
"id":515834,
"postcode":"08436",
"region":"Київська",
"district":"Боярка",
"city":"Стовп’яги",
"street":"Франка",
"houseNumber":"21",
"apartmentNumber":null,
"description":"none",
"countryside":true,
"foreignStreetHouseApartment":null,
"detailedInfo":"Україна, 08436, Київська, Боярка, Стовп’яги, Фран
ка 21, none",
"created":"2019-03-06T14:23:01",
"lastModified":"2019-03-06T14:23:01",
"country":"UA"
},
"type":"PHYSICAL",
"main":true
}
],
"phoneNumber":"+380982004113",
"phones":[
{
"uuid":"7118919c-f0fe-48ce-b304-f12297bbaf26",
"phoneId":19716,
"phoneNumber":"+380504001050",

},
{

},
{

}

"type":"WORK",
"main":false

"uuid":"776e26db-bfb8-440f-b6cb-95fbdc79c8d7",
"phoneId":19717,
"phoneNumber":"+380442551122",
"type":"PERSONAL",
"main":false

"uuid":"d9367416-a228-4cc4-b648-82ffb9d3761f",
"phoneId":19715,
"phoneNumber":"+380982004113",
"type":"PERSONAL",
"main":true

],
"email":"test@test.com",
"emails":[
{
"uuid":"0d6f9d60-6574-486f-9b73-148505af4527",
"email":"test@test.com",
"main":true
}
],
"documents":[
{
"uuid":"1ad7f198-460c-4e6a-a169-88bcaec35d00",
"type":"UKRAINE_INTERNAL_PASSPORT",
"series":"ВЗ",
"number":"654321",
"issueDate":"10.05.2015",
"issuedBy":"Дарницький УПОБ",
"assigned":"06.03.2019",
"lastModified":"06.03.2019"
},
{
"uuid":"e51064c2-3bd5-4d7a-91f3-5ea4aa93824c",
"type":"UKRAINE_INTERNAL_TEMPORARY_IDENTIFIER",
"number":"1234569",
"issueDate":"10.04.2017",
"issuedBy":"Подільське РВДМУ МВС в місті Києві",
"assigned":"06.03.2019",
"lastModified":"06.03.2019"
},
{
"uuid":"96b7a195-06e5-4388-b412-e7e9746e6365",
"type":"FOREIGN_PASSPORT",
"number":"WE53964679",
"issueDate":"10.05.1985",
"issuedBy":"Greece international passport",
"assigned":"06.03.2019",
"lastModified":"06.03.2019"
}

],
"type":"INDIVIDUAL",
"postPayPaymentType":"POSTPAY_PAYMENT_CASH_ONLY",
"bankCode":null,
"bankAccount":null,
"tin":"2024425625",
"contactPersonName":null,
"resident":true,
"GDPRRead":false,
"GDPRAccept":false,
"personalDataApproved":false,
"checkOnDeliveryAllowed":false

},
"recipientPhone":"+380982004113",
"recipientEmail":"test@test.com",
"recipientAddressId":515834,
"senderAddressId":515862,
"returnAddressId":515862,
"shipmentGroupUuid":null,
"externalId":null,
"deliveryType":"W2D",
"packageType":null,
"onFailReceiveType":"RETURN",
"barcode":"5551400000659",
"weight":1200,
"length":170,
"width":0,
"height":0,
"declaredPrice":null,
"deliveryPrice":342,
"rawDeliveryPrice":360,
"postPay":null,
"postPayUah":0,
"postPayDeliveryPrice":0,
"currencyCode":null,
"postPayCurrencyCode":null,
"currencyExchangeRate":null,
"discounts":[
{
"uuid":"f5a0b397-c78d-4e84-9411-defa4aeeebd3",
"name":"За використання особистого кабінета 5%",
"fromDate":"2017-01-01",
"toDate":"2099-12-31",
"value":5,
"category":"CONTRACT_DISCOUNT",
"type":"BASE"
}
],
"lastModified":"2019-03-13T11:02:49",
"description":null,
"parcels":[
{
"uuid":"fb56bbda-e400-4ae0-ab62-ab87591274f3",
"name":null,
"parcelNumber":1,

"barcode":"5551400000659",
"weight":1200,
"length":170,
"width":null,
"height":null,
"declaredPrice":null,
"parcelItems":null,
"description":null

}
],
"direction":{
"regionSortingCenter":"Київ",
"districtSortingCenter":"ДОП Яготин ЦПЗ № 8 м. Яготин",
"postOfficeNumber":"08436",
"postOfficeName":"Київська"
},
"lifecycle":{
"status":"CREATED",
"statusDate":"2019-03-13T11:02:49"
},
"deliveryDate":"2019-03-14T00:00:00",
"calculationDescription":"Price=342.00: price for the weight=0.00; tariff (EX
PRESS, REGION, 1200 g, 170 cm)=84.00; using max tariff=84.00; length overpay=252
.00; delivery type(W2D)=12.00; countryside=12.00; За використання особистого каб
інета 5%=18.00",
"paidByRecipient":true,
"postPayPaidByRecipient":true,
"bulky":true,
"fragile":false,
"bees":false,
"recommended":false,
"sms":false,
"toReturnToSender":null,
"international":false,
"documentBack":false,
"checkOnDelivery":false,
"transferPostPayToBankAccount":false,
"deliveryPricePaid":false,
"postPayPaid":false,
"postPayDeliveryPricePaid":false,
"packedBySender":false,
"free":false
}

Як створити групу
Надішліть наступний запит, вказавши необхідну інформацію у тілі запиту.
Використовуйте uuid відправника, отриманий в одному з попередніх кроків.
За замовчуванням група створюється з типом EXPRESS

{

}

POST Request
URI:/shipment-groups?token={token}
"name":"Group 1",
"clientUuid":"{clientUuid}",
"type":"EXPRESS"
Response
Код відповіді: 200

{

}

"uuid":"15a67e90-10f9-4a5a-a3b1-0f259f910603",
"name":"Group 1",
"clientUuid":"916f812d-1e39-48c4-a819-63eb80f337cd",
"type":"EXPRESS",
"created": "2020-04-14T00:39:17",
"closed":false

Додавання відправлення до групи
Надішліть наступний запит, вказавши необхідну інформацію. Використовуйте uuid
групи відправлень та uuid відправлення, що отримані в попередніх кроках.
До групи можливо додати лише ті відправлення тип яких співпадає з типом групи
(EXRPESS, STANDARD або DOCUMENT).
POST Request
URI:/shipmentgroups/{shipmentGroupUuid}/shipments/{shipmentUuid}?token={token}
Response
Код відповіді: 200
{

"message":"Shipment bb8a0da3-4895-4834-bc4d2100a91104c7 is assigned to group 7b1412ab-9726-40d0-af39-5102f4f83711"
}

Створення відправлення в групі

{

POST Request
URI:/shipment-groups/{shipmentGroupUuid}/shipments?token={token}
"sender":{
"uuid":"{SenderUuid}"
},
"recipient":{

}

"uuid":"{RecipientUuid}"
},
"senderAddressId":"{{senderAddressId}}",
"deliveryType":"W2D",
"paidByRecipient":true,
"parcels":[
{
"weight":1200,
"length":170
}
]
Response
Код відповіді: 200
[Див. відповідь запиту на створення відправлення]

Як надрукувати ярлик
Надішліть наступний запит, вказавши uuid або ШКІ відправлення.
У відповідь ви отримаєте сформований PDF-файл.
GET request on {url}/shipments/{shipmentUuid or Barcode}/sticker?token={token}
Надрукований ярлик виглядає наступним чином.

За необхідності можливо друкувати ярлики за групою відправлень
Надішліть наступний запит, вказавши uuid групи відправлень.
У відповідь ви отримаєте сформований PDF-файл.
GET request on {url}/shipment-groups/{shipment_group_uuid}/sticker?token={token}

Як надрукувати форму 103
Надішліть наступний запит, вказавши uuid групи відправлень.
У відповідь ви отримаєте сформований PDF-файл.
GET request on
{url}/shipment-groups/{shipment_group_uuid}/form103a?token={token}
Надрукована ф103 виглядає наступним чином.

