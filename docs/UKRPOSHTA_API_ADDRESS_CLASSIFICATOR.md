Документація
Адресний класифікатор

Версія 3.20 від 09.12.2024

www.ukrposhta.ua

Зміст
1. Формат запиту до API ........................................................................................................................ 2
1.1.

Отримання інформації по області за назвою ............................................................................6

1.2.

Отримання переліку районів за ID області та назвою району ....................................................7

1.3.

Отримання населеного пункту за Id області, Id району та назвою населеного пункту ................8

1.3.1.

Отримання населеного пункту за кодом КОАТУУ ......................................................................9

1.4.

Отримання вулиці за id області, id району, id населеного пункту та назвою вулиці .................. 10

1.5.

Отримання індексу (адреси дому) за Id вулиці ...................................................................... 11

1.6.

Перевірка входження індексу до зони обслуговування ДКД .................................................... 12

2.

Відділення поштового зв’язку................................................................................................... 13

2.1.

Отримання поштових відділень за індексом відділення ........................................................... 15

2.2.

Отримання графіку роботи поштового відділення за індексом ................................................. 17

2.2.1.

Отримання інформації про графік відділення за ID................................................................. 20

2.2.2.

Отримання інформації про графік приїзду пересувних відділень до населеного пункту............. 22

2.3.

Отримання інформації про найближчі поштові відділення за координатами ............................. 23

2.4.

Отримання інформації про поштові відділення населеного пункту ........................................... 24

2.5.

Отримання інформації про населений пункт за індексом ........................................................ 28

2.6.

Отримання інформації про адресу за індексом ....................................................................... 29

2.7.

Отримання інформації про код зони доставки за ідентифікатором населеного пункту ............... 30

2.8.

Отримання відділень за кодом КОАТУУ населеного пункту...................................................... 31

3.

Пошук інформації за назвою .................................................................................................... 32

3.1.

Отримання інформації по району за його назвою ................................................................... 32

3.2.

Отримання інформації про місто за його назвою .................................................................... 33

3.3.

Отримання інформації про вулицю за її назвою...................................................................... 34

Додаток А. Заблоковані записи та причина блокування ......................................................................... 35
Історія змін API................................................................................................................................... 36

www.ukrposhta.ua

Даний документ не є кінцевою версією і може бути змінений без
попереднього попередження. Розробник не несе відповідальності за
використання застарілих версій документа.

1. Формат запиту до API
Отримати доступ до API можна завдяки authorization bearer.
Authorization bearer необхідно отримати у додатку після підписання
договору.
Передача authorization bearer здійснюється у заголовку запиту в
параметрі Authorization.
Для доступу до сервісу використовується такий самий bearer, що й для
оформлення відправлень (надається у додатку до договору).
Запит складається з переліку обов’язкових параметрів
curl -X {query_type} --header 'Authorization: Bearer
{bearer_Uuid}' --header 'Accept: application/json'
https://www.ukrposhta.ua/{appname}/{request}
{query_type} – метод: GET
Header: 'Authorization: Bearer {bearer_Uuid}' – параметр
authorization bearer для авторизації;
Header: 'Accept: application/json' – додатковий параметр для
отримання відповіді у форматі json. За замовчуванням – text/xml.
{app-name} – address-classifier-ws
{request} – кінцева точка запиту до API. Докладніше див.
документацію.

www.ukrposhta.ua

Приклад запиту виглядає наступним чином:
curl -X GET --header 'Authorization: Bearer 11111111-2222-3333aaaa-bcdef1234567' --header 'Accept: application/json'
'https://www.ukrposhta.ua/address-classifier-ws/
get_postoffices_by_postindex?pi=01001'
Увага! Url для роботи з адресним класифікатором важливо вказувати у
форматі з www: https://www.ukrposhta.ua/....

Увага! Для отримання даних url запиту має містити хоча б один з параметрів.
Якщо виконати запит без параметрів, сервіс повертає порожню відповідь.

www.ukrposhta.ua

1. Створення адреси
Короткий опис. Щоб створити адресу відправника або одержувача в
АРІ, важливо знати за яким саме індексом обслуговується адреса
клієнта. Знаючи область, район, місто, вулицю та номер будинку, слід
виконати ряд запитів до адресного класифікатору та отримати код
(індекс) зони доставки – postcode. Цей індекс слід вказувати під час
створення адреси.
У таблиці 1 наведено унікальні поля, що повертає кожний з запитів у
цьому розділі.
Таблиця 1. Параметри тіла відповіді. Пошук індексу за адресою
Параметр

Тип

Опис
Область

REGION_ID

Number

Ідентифікатор області

REGION_UA

String

Назва області українською

REGION_EN

String

Назва області англійською

REGION_RU

String

Назва області російською

REGION_KOATUU

Number

Код КОАТУУ області

REGION_KATOTTG

Number

Код КАТОТТГ області
Район

DISTRICT_EN

String

Назва району англійською

REGION_UA

String

Назва області українською

REGION_EN

String

Назва області англійською

DISTRICT_UA

String

Назва району українською

DISTRICT_ID

Number

Ідентифікатор району

REGION_RU

String

Назва області російською

DISTRICT_RU

String

Назва району російською

DISTRICT_KOATUU

Number

Код КОАТУУ району

DISTRICT_KATOTTG

Number

Код КАТОТТГ району

CITY_EN

String

Назва населеного пункту англійською

CITYTYPE_RU

String

Тип населеного пункту російською

Населений пункт

CITY_RU

String

Назва населеного пункту російською

OwnOf

String

Сільрада, до якої належить населений пункт

NAME_UA

String

Тип запису українською, наприклад «Активний запит»

OLDCITY_EN

String

Стара назва населеного пункту англійською (до перейменування)

SHORTCITYTYPE_RU

String

Скорочений тип населеного пункту російською

CITY_ID

Number

Ідентифікатор населеного пункту

OLDCITY_RU

String

Стара назва населеного пункту російською (до перейменування)

SHORTCITYTYPE_EN

String

Скорочений тип населеного пункту англійською

CITYTYPE_EN

String

Тип населеного пункту англійською

SHORTCITYTYPE_UA

String

Скорочений тип населеного пункту українською

CITY_UA

String

Назва населеного пункту українською

CITYTYPE_UA

String

Тип населеного пункту

www.ukrposhta.ua
OLDCITY_UA

String

Стара назва населеного пункту українською (до перейменування)

CITY_KOATUU

Number

КОАТУУ населеного пункту (ідентифікатор населеного пункту за
Класифікатором об'єктів адміністративно-територіального устрою
України)

POPULATION

Number

Кількість жителів у населеному пункті, чол.

CITY_KATOTTG

Number

Код КАТОТТГ населеного пункту

IS_DISTRICTCENTER

Number

Чи є населений пункт районним центром

STREET_EN

String

Назва вулиці англійською

STREET_UA

String

Назва вулиці українською

Вулиця

STREETTYPE_EN

String

Тип вулиці англійською

STREET_ID

Number

Ідентифікатор вулиці

STREETTYPE_UA

String

Тип вулиці українською

STREET_RU

String

Назва вулиці російською

STREETTYPE_RU

String

Тип вулиці російською

String

Скорочений тип вулиці російською

String

Скорочений тип вулиці англійською

String

Скорочений тип вулиці українською

String

Попередня назва вулиці українською

SHORTSTREETTYPE_
RU
SHORTSTREETTYPE_
EN
SHORTSTREETTYPE_
UA
OLDSTREET_UA
OLDSTREET_EN

String

Попередня назва вулиці англійською

OLDSTREET_RU

String

Попередня назва вулиці російською
Адреса

POSTCODE

String

Код зони доставки

HOUSENUMBER_UA

String

Номер будинку

www.ukrposhta.ua

1.1.

Отримання інформації по області за назвою

Дозволяє отримати перелік областей та виконати пошук за частиною назви.
Параметри, що передаються в запиті:
region_name – найменування області;
region_name_en – найменування області англійською.
GET Request

URI:/get_regions_by_region_ua?region_name={region_name}&region_name_en={region_na

me_en}

Response
Код відповіді: 200
"Entries": {
"Entry": [
{
"REGION_ID": "286",
"REGION_UA": "Київ",
"REGION_EN": "Kyiv",
"REGION_KATOTTG": "74000000000025000
},
{
"REGION_ID": "270",
"REGION_UA": "Київська",
"REGION_EN": "Kyivska",
"REGION_KATOTTG": "32000000000030281",
"REGION_KOATUU": "3200000000
}
]
}

www.ukrposhta.ua

1.2.
Отримання переліку районів за ID області та назвою
району
Дозволяє отримати перелік районів та виконати пошук за частиною назви.
Параметри, що передаються в запиті (хоча б один з параметрів):
region_id – ідентифікатор області;
district_ua – найменування району.
GET Request

URI:/get_districts_by_region_id_and_district_ua?region_id={id}&district_ua={district}

Response
Код відповіді: 200
"Entries": {
"Entry": [
{
"REGION_ID": "286",
"DISTRICT_KOATUU": "0000000005",
"REGION_KATOTTG": "74000000000025000",
"DISTRICT_ID": "412",
"REGION_RU": null,
"DISTRICT_KATOTTG": "68060000000063477",
"DISTRICT_EN": "Kyiv",
"REGION_UA": "Київ",
"REGION_EN": "Kyiv",
"DISTRICT_UA": "Київ",
"REGION_KOATUU": "4",
"DISTRICT_RU": "0",
"NEW_DISTRICT_UA": null
}
]
}

www.ukrposhta.ua

1.3.
Отримання населеного пункту за Id області, Id
району та назвою населеного пункту
Дозволяє отримати перелік населених пунктів та виконати пошук за
частиною назви.
Параметри, що передаються в запиті (хоча б один з параметрів):
district_id – ідентифікатор району;
region_id – ідентифікатор області;
city_ua – назва населеного пункту українською;
koatuu – код КОАТУУ;
katottg – код КАТОТТГ.
GET Request

URI:/get_city_by_region_id_and_district_id_and_city_ua?district_id={districtId}&region_id=

{regionId}&city_ua={cityUa}&koatuu={koatuuCode}&katottg={katottg}
Response
Код відповіді: 200

"Entries": {
"Entry": [
{
"REGION_ID": "286",
"POPULATION": "2827400",
"IS_DISTRICTCENTER": "1",
"DISTRICT_ID": "412",
"LONGITUDE": "30.614926",
"CITY_KATOTTG": "80000000000093317",
"CITY_RU": "0",
"DISTRICT_EN": "Kyiv",
"REGION_EN": "Kyiv",
"OLDCITY_RU": null,
"SHORTCITYTYPE_EN": null,
"CITYTYPE_UA": "місто",
"OLDCITY_UA": null,
"NEW_DISTRICT_UA": null,
"CITY_EN": "Kyiv",
"CITYTYPE_RU": null,
"CITY_KOATUU": "8000000000",
"REGION_RU": null,
"NAME_UA": "Активний запис",
"REGION_UA": "Київ",
"OLDCITY_EN": null,
"SHORTCITYTYPE_RU": null,
"MRTPS": null,
"CITY_ID": "29713",
"DISTRICT_UA": "Київ",
"CITYTYPE_EN": "City",
"SHORTCITYTYPE_UA": "м.",
"LATTITUDE": "50.401912",
"CITY_UA": "Київ",
"OWNOF": "Київ",
"DISTRICT_RU": "0"
}

www.ukrposhta.ua

1.3.1.

Отримання населеного пункту за кодом КОАТУУ

Дозволяє отримати населений пункт за кодом КОАТУУ.
Параметри, що передаються в запиті:
koatuu – код КОАТУУ населеного пункту.
GET Request

URI:/get_city_by_region_id_and_district_id_and_city_ua?koatuu={koatuuCode}

Response
Код відповіді: 200
"Entries": {
"Entry": [
{
"REGION_ID": "270",
"POPULATION": "1380",
"DISTRICT_ID": "337",
"LONGITUDE": "30.222166",
"CITY_KATOTTG": "32020010120032765",
"CITY_RU": "0",
"DISTRICT_EN": "BILOTSERKIVSKYI",
"REGION_EN": "Kyivska",
"OLDCITY_RU": null,
"SHORTCITYTYPE_EN": null,
"CITYTYPE_UA": "село",
"OLDCITY_UA": null,
"NEW_DISTRICT_UA": null,
"CITY_EN": "Pishchana",
"CITYTYPE_RU": null,
"CITY_KOATUU": "3220484902",
"REGION_RU": null,
"NAME_UA": "Активний запис",
"REGION_UA": "Київська",
"OLDCITY_EN": null,
"SHORTCITYTYPE_RU": null,
"MRTPS": "9",
"CITY_ID": "10483",
"DISTRICT_UA": "Білоцерківський",
"CITYTYPE_EN": "Village",
"SHORTCITYTYPE_UA": "с.",
"LATTITUDE": "49.8288",
"CITY_UA": "Піщана",
"OWNOF": "Білоцерківська",
"DISTRICT_RU": "0"
}
]
}

www.ukrposhta.ua

1.4.
Отримання вулиці за id області, id району, id
населеного пункту та назвою вулиці
Дозволяє отримати перелік вулиць населеного пункту із деталізацією
інформації по району та області, а також виконати пошук за частиною назви.
Параметри, що передаються в запиті (хоча б один з параметрів):
district_id – ідентифікатор району;
region_id – ідентифікатор області;
city_id – ідентифікатор населеного пункту;
street_ua – назва вулиці українською.
GET Request

URI:/get_street_by_region_id_and_district_id_and_city_id_and_street_ua?region_id={regionId}
&district_id={districtId}&city_id={cityId}&street_ua={street}

Response
Код відповіді: 200
"Entries": {
"Entry": [
{
"REGION_ID": "286",
"OLDSTREET_EN": null,
"DISTRICT_ID": "412",
"CITY_RU": "0",
"STREET_UA": "Хрещатик",
"SHORTSTREETTYPE_UA": "вул.",
"DISTRICT_EN": "Kyiv",
"REGION_EN": "Kyiv",
"STREET_ID": "39804",
"STREETTYPE_UA": "вулиця",
"SHORTSTREETTYPE_RU": null,
"STREETTYPE_RU": null,
"OLDSTREET_UA": null,
"NEW_DISTRICT_UA": null,
"CITY_EN": "Kyiv",
"STREET_EN": "KHRESHCHATYK",
"OLDSTREET_RU": null,
"REGION_RU": null,
"REGION_UA": "Київ",
"SHORTSTREETTYPE_EN": null,
"STREETTYPE_EN": "street",
"CITY_ID": "29713",
"DISTRICT_UA": "Київ",
"STREET_RU": null,
"CITY_UA": "Київ",
"DISTRICT_RU": "0"
}
]
}

www.ukrposhta.ua

1.5.

Отримання індексу (адреси дому) за Id вулиці

Дозволяє отримати перелік будинків на вулиці та виконати пошук за
ідентифікатором вулиці.
Параметри, що передаються в запиті:
street_id – ідентифікатор вулиці*;
housenumber – номер будинку.
* обов’язковий
GET Request

URI:/get_addr_house_by_street_id?street_id={streetId}&housenumber={houseNumber}

Response
Код відповіді: 200
"Entries": {
"Entry": [
{
"STREET_ID": "892",
"POSTCODE": "01010",
"HOUSENUMBER_UA": "2"
}
]
}

www.ukrposhta.ua

1.6.
Перевірка входження індексу до зони
обслуговування ДКД
Дозволяє перевірити, чи входить індекс до зони обслуговування кур’єрської
доставки.
Параметри, що передаються в запиті:
postindex* – індекс, що необхідно перевірити;
* обов’язковий
GET Request

URI:/get_courierarea_by_postindex?postindex=02223

Response
Код відповіді: 200
"Entries": {
"Entry": [
{
"IS_COURIERAREA": "1",
"postindex": "02223"
}
]
}
IS_COURIERAREA = 1 – індекс входить до зони обслуговування ДКД.

www.ukrposhta.ua

2. Відділення поштового зв’язку
Короткий опис. Відділення поштового зв’язку (або поштове відділення)
призначене для обслуговування фізичних та юридичних осіб, виконує
прийом, доставку та видачу відправлень. Розрізняють стаціонарне
поштове відділення (ВПЗ) – знаходиться за постійною адресою та
пересувні відділення (ПВ) – обслуговує одразу декілька населених
пунктів за окремо встановленим графіком та маршрутом. Кожне
відділення може мати кілька дільниць доставки.
Таблиця 2.1. Параметри тіла XML. Поштове відділення
Параметр

Тип

Опис

POLOCK_EN

String

Опис коду блокування поштового відділення англійською

TYPE_SHORT

String

Скорочений тип поштового відділення

POREGION_ID
POSTINDEX
MEREZA_NUMBE
R
POLOCK_UA
ID
POSTREET_ID

Number
(Int)
Number
(Int)
Number
(Int)
String
Number
(Int)
Number
(Int)

Ідентифікатор області, у якій знаходиться поштове відділення
Індекс поштового відділення
Номер запису у АС мережі (сервіс, у якому зберігається
інформація по адресам та відділенням, що їх обслуговують)
Опис коду блокування українською
Унікальний ідентифікатор поштового відділення
Ідентифікатор вулиці, на якій знаходиться поштове відділення

PO_LONG

String

Повний опис, назва поштового відділення

PDCITY_UA

String

Населений пункт зони обслуговування українською

POLOCK_RU

String

Опис коду блокування російською

PO_SHORT

String

Скорочений опис, назва поштового відділення

LOCK_RU

String

Опис коду блокування російською

TYPE_LONG

String

Повний тип поштового відділення

TYPE_ACRONYM

String

Скорочене позначення типу відділення

Number
(Int)
Number
(Int)
Number
(Int)

Ідентифікатор поштового відділення, до якого відноситься
відділення, знайдене за індексом

ADDRESS

String

Адреса поштового відділення

PODISTRICT_ID

Number
(Int)

Ідентифікатор району поштового відділення

LOCK_EN

String

Опис коду блокування англійською

PDOLDCITYNAM
E_EN

String

Стара назва населеного пункту зони обслуговування
англійською

PDCITY_EN

String

Населений пункт зони обслуговування англійською

PHONE

String

Номер телефону відділення

PARENT_ID
TECHINDEX
PDCITY_ID

Технологічний індекс в мережі (внутрішній)
Ідентифікатор населеного пункту зони обслуговування

www.ukrposhta.ua
LONGITUDE
PDREGION_ID

Number
(Float)
Number
(Int)

Географічна довгота поштового відділення
Ідентифікатор району зони обслуговування

LOCK_UA

String

Опис коду блокування українською

ISVPZ

Number
(Int)

PDOLDCITYNAM
E_UA

String

LOCK_CODE

Number
(Int)

PDOLDCITYNAM
E_RU

String

Ознака відділення поштового зв’язку (відділення може бути
також сортувальним)
Стара назва населеного пункту зони обслуговування
українською
Ознака заблокованого відділення (0 – активний запис, 65535
– заблокований)
Стара назва населеного пункту зони обслуговування
російською

POCITY_ID

Number
(Int)

Ідентифікатор населеного пункту поштового відділення

PDCITY_RU

String

Населений пункт зони обслуговування російською

PDDISTRICT_ID
LATTITUDE

Number
(Int)
Number
(Float)

Ідентифікатор району зони обслуговування відділення
Географічна широта поштового відділення

PO_CODE

Number

IS_NODISTRICT

Number
(Int)

PDCITYTYPE_UA

String

Тип населеного пункту зони доставки українською

PDCITYTYPE_EN

String

Тип населеного пункту зони доставки англійською

PDCITYTYPE_RU

String

Тип населеного пункту зони доставки російською

String

Скорочений тип населеного пункту зони доставки українською

String

Скорочений тип населеного пункту зони доставки англійською

String

Скорочений тип населеного пункту зони доставки російською

SHORTPDCITYTY
PE_UA
SHORTPDCITYTY
PE_EN
SHORTPDCITYTY
PE_RU
AVALIBLE

Number
(Int)

MRTPS

Number
(Int)

IS_NOLETTERS

Number
(Int)

Код відділення
Можливість доставки до відділення
0 – можливо виконати доставку у відділення
1 – бездоставочне відділення

Параметр що вказує на роботу відділення:
1 – відділення доступне;
0 – відділення працює автономно.
Параметр що вказує на місце базування пересувного
відділення поштового зв’язку в населеному пункті:
1 – відсутнє;
2 – у приміщенні сільради;
3 – у приміщенні колишнього ВПЗ;
4 – у будинку культури;
5 – у бібліотеці;
6 – у магазині;
7 – на заправній станції;
8 – у сортувальному центрі;
9 – інше.
Ознака пересилання кореспонденції:
0 – пересилає
1 – не пересилає

www.ukrposhta.ua

2.1.
Отримання поштових відділень за індексом
відділення
Дозволяє отримати інформацію про поштове відділення з можливістю пошуку
за індексом поштового відділення.
Параметри, що передаються в запиті (хоча б один з параметрів):
pi – поштовий індекс (індекс поштового відділення);
pc – поштовий код (індекс поштової адреси);
poCityId – ідентифікатор населеного пункту;
poDistrictId – ідентифікатор району;
poStreetId – ідентифікатор вулиці;
poRegionId – ідентифікатор області;
pdCityId – ідентифікатор населеного пункту додатковий;
pdDistrictId – ідентифікатор району додатковий;
pdRegionId – ідентифікатор області додатковий.
GET Request

URI:/get_postoffices_by_postindex?pi={postindex}

Response
Код відповіді: 200
"Entries": {
"Entry": [
{
"POLOCK_EN": "Active record",
"TYPE_SHORT": "МВ",
"CITY_RU": "0",
"POREGION_ID": "286",
"SHORTPDCITYTYPE_RU": null,
"DISTRICT_EN": "Kyiv",
"PDCITYTYPE_EN": "City",
"POSTINDEX": "01001",
"SHORTCITYTYPE_EN": null,
"MEREZA_NUMBER": "2668",
"POLOCK_UA": "Активний запис",
"ID": "2700",
"STREETTYPE_RU": null,
"CITYTYPE_UA": "місто",
"POSTREET_ID": "39804",
"NEW_DISTRICT_UA": null,
"PO_LONG": "Відділення поштового зв'язку № 1 м. Київ Акціонерног
о товариства \"Укрпошта\"",
"PDCITY_UA": "Київ",
"POLOCK_RU": "Активная запись",
"PO_SHORT": "Київ 1",
"LOCK_RU": "Активная запись",
"TYPE_LONG": "Міське відділення поштового зв'язку",
"TYPE_ACRONYM": "МВ",
"PARENT_ID": "152",
"TECHINDEX": "01001",
"REGION_UA": "Київ",
"AVALIBLE": "1",
"PDCITY_ID": "29713",
"PDCITYTYPE_RU": null,
"IS_NODISTRICT": "0",

www.ukrposhta.ua

}

]

}

"DISTRICT_UA": "Київ",
"PO_CODE": "010010",
"ADDRESS": "вул. Хрещатик, 22",
"SHORTCITYTYPE_UA": "м.",
"PODISTRICT_ID": "412",
"LOCK_EN": "Active record",
"PDOLDCITYNAME_EN": null,
"POSTCODE": "01001",
"PDCITY_EN": "Kyiv",
"PHONE": "+380-800-300-545",
"LONGITUDE": "30.523063",
"STREET_UA": "Хрещатик",
"REGION_EN": "Kyiv",
"PDREGION_ID": "286",
"SHORTPDCITYTYPE_UA": "м.",
"STREETTYPE_UA": "вулиця",
"LOCK_UA": "Активний запис",
"ISVPZ": "1",
"PDOLDCITYNAME_UA": null,
"CITY_EN": "Kyiv",
"STREET_EN": "KHRESHCHATYK",
"LOCK_CODE": "0",
"PDOLDCITYNAME_RU": null,
"CITYTYPE_RU": null,
"REGION_RU": null,
"POCITY_ID": "29713",
"PDCITY_RU": "0",
"RESTRICTED_ACCESS": "0",
"PDCITYTYPE_UA": "місто",
"SHORTCITYTYPE_RU": null,
"SHORTPDCITYTYPE_EN": null,
"IS_NOLETTERS": null,
"STREETTYPE_EN": "street",
"PDDISTRICT_ID": "412",
"CITYTYPE_EN": "City",
"HOUSENUMBER": "22",
"LATTITUDE": "50.449855",
"STREET_RU": null,
"CITY_UA": "Київ",
"DISTRICT_RU": "0"

www.ukrposhta.ua

2.2.
Отримання графіку роботи поштового відділення за
індексом
Дозволяє отримати інформацію про графік роботи відділення з можливістю
пошуку за індексом поштового відділення.

Таблиця 2.2. Параметри тіла XML. Графік роботи
Параметр

Тип

Опис

LOCK_REASON

String

Причина блокування запису. Докладніше див. Додаток А

DAYOFWEEK_UA

String

Робочі дні українською
Тип поштового відділення.
Може мати значення:
Дирекція;
ВуПЗ – Вузол поштового зв’язку;
Поштамт;
МВ – Міське відділення поштового зв’язку;
СВ – Сільське відділення поштового зв’язку;
МППЗ – Міський пункт поштового зв’язку;
ПВ – Пересувне відділення поштового зв’язку;
МСВПЗ – Міське сезонне відділення поштового
зв’язку;
ЦОПП – Центр оброблення і перевезення пошти;
ЦОП – Центр оброблення пошти;
ЦПП – Центр перевезення пошти;
ЗВОП – Зональний вузол оброблення пошти;
РНОК – Регіональний навчально-оздоровчий
комплекс;
ВД – Виробнича дільниця;
СД – Страхова дільниця;
ЦехОП – Цех оброблення пошти;
ЦехПП – Цех перевезення пошти;
ССВПЗ – Сільське сезонне відділення поштового
зв’язку;
СППЗ – Сільський пункт поштового зв’язку;
ДОПП – Дирекція оброблення і перевезення пошти;
ЦПЗ – Центр поштового зв’язку;
ПоштамтЦПЗ – Поштамт-Центр поштового зв’язку;
ЦОС – Цех обслуговування споживачів;
ДКД – Дільниця кур’єрської доставки;
ММПО – Місце міжнародного поштового обміну;
МСП – Міська службова пошта;
ЦВПЗ – Центральне відділення поштового зв’язку;
ЦОКК – Цех обслуговування корпоративних клієнтів;
ТПС – Точка присутності (стаціонарна);
ЦехОПП – Цех оброблення та перевезення пошти;
ДВМ – Дільниця «Власна марка»;
ВВ – Вантажне відділення.
Тип отриманого інтервалу часу.
Може мати значення:
W – робочий час;
D – перерва.

POSTOFFICE_TY
PE

String

INTERVALTYPE

String

SHORTNAME

String

Скорочена назва відділення

DAYOFWEEK_EN

String

Робочі дні англійською

POSTOFFICE_PA
RENT

String

Ідентифікатор центрального відділення

www.ukrposhta.ua
DAYOFWEEK_SH
ORTNAME_UA

String

Робочі дні тижня, скорочено

TTO

String

Час закінчення роботи відділення

WORKCOMMENT

String

Коментарі щодо графіку відділення

id

String

Ідентифікатор поштового відділення

FULLNAME

String

Повна назва відділення

TFROM

String

Час початку роботи відділення

DAYOFWEEK_SH
ORTNAME_UA

String

День тижня українською, скорочено

DAYOFWEEK_RU

String

День тижня російською

DAYOFWEEK_NU
M

Number

Номер дня тижня, пн - 1

www.ukrposhta.ua

Параметри, що передаються в запиті:
pc – код зони доставки*;
id – ідентифікатор поштового відділення.
*обов’язковий
GET Request

URI:/get_postoffices_openhours_by_postindex?pc={postcode}&id={postOfficeId}

Response
Код відповіді: 200
"Entries": {
"Entry": [
{
"LOCK_REASON": "Активний запис",
"DAYOFWEEK_UA": "понеділок",
"POSTOFFICE_TYPE": "МВ",
"INTERVALTYPE": "W",
"DAYOFWEEK_NUM": "1",
"LOCK_CODE": "0",
"SHORTNAME": "Київ 1",
"POSTCODE": "01001",
"DAYOFWEEK_EN": "Monday",
"POSTOFFICE_PARENT": "152",
"DAYOFWEEK_SHORTNAME_UA": "пн",
"TTO": "21:00",
"WORKCOMMENT": "Постійний",
"id": "2700",
"FULLNAME": "Відділення поштового зв'язку № 1 м. Київ Акціонерно
го товариства \"Укрпошта\"",
"DAYOFWEEK_RU": "понедельник",
"ISVPZ": "1",
"TFROM": "08:00"
},
-----------записи з даними про графік роботи--------------]
}

www.ukrposhta.ua

2.2.1.

Отримання інформації про графік відділення за ID

Запит дозволяє вказати параметром зону доставки (postcode) та отримати
дані незалежно від типу відділення (ПВ, МВ…).
Параметри, що передаються в запиті (хоча б один з параметрів):
pc – код зони доставки
id – ідентифікатор поштового відділення
GET Request

URI:/get_postoffices_openhours_by_id?pc={postcode}&id={postOfficeId}

Response
Код відповіді: 200
"Entries": {
"Entry": [
{
"LOCK_REASON": "Активний запис",
"DAYOFWEEK_UA": "середа",
"POSTOFFICE_TYPE": "ПВ",
"INTERVALTYPE": "W",
"DAYOFWEEK_NUM": "3",
"LOCK_CODE": "0",
"SHORTNAME": "ПВ 85 Дніпропетровської Нового Формату",
"POSTCODE": "52941",
"CITY_KOATUU": "1222655122",
"DAYOFWEEK_EN": "Wednesday",
"CITY_KATOTTG": "12140150200072261",
"POSTOFFICE_PARENT": "55",
"DAYOFWEEK_SHORTNAME_UA": "ср",
"TTO": "16:40",
"CITY_ID": "4942",
"WORKCOMMENT": "Постійний",
"id": "10283",
"CITY_UA": "Новопідгородне",
"FULLNAME": "Пересувне відділення поштового зв'язку № 85 Дніпроп
етровської області Акціонерного товариства \"Укрпошта\"",
"DAYOFWEEK_RU": "среда",
"ISVPZ": "1",
"TFROM": "13:10"
},
{
"LOCK_REASON": "Активний запис",
"DAYOFWEEK_UA": "п’ятниця",
"POSTOFFICE_TYPE": "ПВ",
"INTERVALTYPE": "W",
"DAYOFWEEK_NUM": "5",
"LOCK_CODE": "0",
"SHORTNAME": "ПВ 85 Дніпропетровської Нового Формату",
"POSTCODE": "52941",
"CITY_KOATUU": "1222655122",
"DAYOFWEEK_EN": "Friday",
"CITY_KATOTTG": "12140150200072261",
"POSTOFFICE_PARENT": "55",
"DAYOFWEEK_SHORTNAME_UA": "пт",
"TTO": "16:10",
"CITY_ID": "4942",
"WORKCOMMENT": "Постійний",

www.ukrposhta.ua
"id": "10283",
"CITY_UA": "Новопідгородне",
"FULLNAME": "Пересувне відділення поштового зв'язку № 85 Дніпроп
етровської області Акціонерного товариства \"Укрпошта\"",
"DAYOFWEEK_RU": "пятница",
"ISVPZ": "1",
"TFROM": "12:55"
}
]
}

www.ukrposhta.ua

2.2.2. Отримання інформації про графік приїзду пересувних
відділень до населеного пункту
Дозволяє отримати час, коли ПВ знаходиться у визначеному місті роботи
населеного пункту.
Увага! Якщо відділення стаціонарне, потрібно використовувати запит для
отримання графіку роботи ВПЗ.

Параметри, що передаються в запиті (хоча б один з параметрів):
pc – код зони доставки;
id – запису з даними про графік приїзду;
techindex – технологічний індекс відділення.
GET Request

URI:/get_postoffices_mobile_openhours_by_postindex?techindex={techindex}

Response
Код відповіді: 200
"Entries": {
"Entry": [
{
"LOCK_REASON": "Активний запис",
"DAYOFWEEK_UA": "вівторок",
"POSTOFFICE_TYPE": "ПВ",
"INTERVALTYPE": "W",
"LOCK_CODE": "0",
"DAYOFWEEK_NUM": "2",
"SHORTNAME": " ПВ 24 Київської Нового Формату",
"POSTCODE": "07201",
"DAYOFWEEK_EN": "Tuesday",
"POSTOFFICE_PARENT": "152",
"DAYOFWEEK_SHORTNAME_UA": "вт",
"TTO": "15:55",
"TECHINDEX": "07285",
"CITY_ID": "11262",
"CITY": "Підгайне",
"WORKCOMMENT": "Постійний",
"id": "6783",
"FULLNAME": "Пересувне відділення поштового зв`язку № 24 Київськ
ої області Акціонерного товариства \"Укрпошта\"",
"DAYOFWEEK_RU": "вторник",
"ISVPZ": "1",
"TFROM": "14:40"
},
------------------Перелік ПВ з графіком їх присутності---------------]
}

www.ukrposhta.ua

2.3. Отримання інформації про найближчі поштові відділення
за координатами
Дозволяє отримати інформацію про найближче відділення за вказаними
координатами.

Таблиця 2.3. Параметри тіла XML. Найближче відділення
Параметр

Тип

Опис

CITYNAME

String

Назва населеного пункту, у якому розташоване відділення

DISTANCE

Number
(Int)

Відстань до найближчого відділення, км

ADDRESS

String

Адреса відділення

ID

Number
(Int)

Ідентифікатор відділення

POSTFILIALNAM
E

String

Назва філіалу

POSTINDEX

String

Індекс відділення

String

Індекс зони доставки, що обслуговується відділенням
(вказується в створеній адресі)

POSTCODE

Параметри, що передаються в запиті:
lat – географічна широта, наприклад 50.450166*;
long – географічна довгота, наприклад 30.523307*;
maxdistance – радіус пошуку поштового відділення в км*.
*обов’язковий
GET Request

URI:/get_postoffices_by_geolocation?lat={latitude}&long={longitude}&maxdistance=
{maxDistance}

Response
Код відповіді: 200
"Entries": {
"Entry": [
{
"CITYNAME": "Київ",
"DISTANCE": "0",
"POSTCODE": "01001",
"LONGITUDE": "30.523063",
"ADDRESS": "вул. Хрещатик, 22",
"POSTINDEX": "01001",
"ID": "2700",
"LATITUDE": "50.449855",
"POSTFILIALNAME": "Київ 1"
}, ...
]
}

www.ukrposhta.ua

2.4.
Отримання інформації про поштові відділення
населеного пункту
Дозволяє отримати відділення з можливістю пошуку за ідентифікатором
населеного пункту, району або області.

Таблиця 2.4. Параметри тіла XML
Параметр

Тип

Опис

String

Скорочений тип населеного пункту українською

String

Скорочений тип населеного пункту англійською

String

Скорочений тип населеного пункту російською

CITYTYPE_UA

String

Тип населеного пункту українською

CITYTYPE_EN

String

Тип населеного пункту англійською

CITYTYPE_RU

String

Тип населеного пункту російською

IS_CASH

Number

Можливість знімати готівку

IS_DHL

Number

Можливість відправки через DHL

IS_SMARTBOX

Number

Можливість скористатися послугою SMARTBOX

PELPEREKAZY

Number

Термінові поштові перекази

IS_FLAGMAN

Number

Флагманське відділення

POSTTERMINAL

Number

Можливість оплати послуг банківською карткою (1)

IS_AUTOMATED

Number

Автоматизоване відділення (1)

IS_SECURITY

Number

Доступ обмежено (1) Відділення закритого типу не працюють
на доставку до адреси (..2D), проте можуть виконувати
доставку з типом ..2W(склад), якщо отримувач є працівником
цієї закритої установи або працівником Укрпошти у цьому
відділенні.

OLDSTREET_NA
ME

String

Попередня назва вулиці

CITYSHORTTYPE
_UA
CITYSHORTTYPE
_EN
CITYSHORTTYPE
_RU

www.ukrposhta.ua

Параметри, що передаються в запиті:
city_ id – ідентифікатор населеного пункту;
district_id – ідентифікатор району;
region_id* – ідентифікатор області;
postindex – індекс поштового відділення.
* обов’язковий
GET Request

URI:/get_postoffices_by_city_id?city_id={city_id}&district_id={district_id}&region_id={region_i
d}&postindex={postIndex}

Response
Код відповіді: 200
"Entries": {
"Entry": [
{
"POSTTERMINAL": "0",
"DISTRICT_ID": "412",
"TYPE_SHORT": "Міське відділення поштового зв'язку",
"CITY_RU": "0",
"IS_CASH": "0",
"DISTRICT_EN": "Kyiv",
"IS_SECURITY": "0",
"IS_SMARTBOX": "0",
"POSTINDEX": "03026",
"SHORTCITYTYPE_EN": null,
"MEREZA_NUMBER": "226",
"ID": "266",
"STREETTYPE_RU": null,
"CITYTYPE_UA": "місто",
"NEW_DISTRICT_UA": null,
"PO_LONG": "Відділення поштового зв'язку № 26 м. Київ Акціонерно
го товариства \"Укрпошта\"",
"PO_SHORT": "Київ 26",
"PELPEREKAZY": "0",
"LOCK_RU": "Активная запись",
"TYPE_LONG": "МВ",
"TYPE_ACRONYM": "МВ",
"PARENT_ID": "152",
"TECHINDEX": "03026",
"REGION_UA": "Київ",
"IS_FLAGMAN": "0",
"DISTRICT_UA": "Київ",
"ADDRESS": "вул. Заболотного Академіка, 37",
"SHORTCITYTYPE_UA": "м.",
"REGION_ID": "286",
"LOCK_EN": "Active record",
"PHONE": "+380-800-300-545",
"LONGITUDE": "30.545475",
"STREET_UA": "Заболотного Академіка",
"REGION_EN": "Kyiv",
"IS_AUTOMATED": "1",
"STREETTYPE_UA": "вулиця",
"LOCK_UA": "Активний запис",
"ISVPZ": "1",
"CITY_EN": "Kyiv",
"STREET_EN": "ZABOLOTNOHO AKADEMIKA",

www.ukrposhta.ua

}

]

}

"LOCK_CODE": "0",
"CITYTYPE_RU": null,
"REGION_RU": null,
"SHORTCITYTYPE_RU": null,
"STREETTYPE_EN": "street",
"CITY_ID": "29713",
"IS_NOLETTERS": "0",
"CITYTYPE_EN": "City",
"HOUSENUMBER": "37",
"LATTITUDE": "50.34345",
"STREET_RU": null,
"CITY_UA": "Київ",
"IS_DHL": "0",
"DISTRICT_RU": "0"

2.4.1. Отримання інформації про поштове відділення за індексом
GET Request

URI:/get_postoffices_by_city_id?postindex={postIndex}

Response
Код відповіді: 200
"Entries": {
"Entry": [
{
"POSTTERMINAL": "0",
"DISTRICT_ID": "412",
"TYPE_SHORT": "Міське відділення поштового зв'язку",
"CITY_RU": "0",
"IS_CASH": "0",
"DISTRICT_EN": "Kyiv",
"IS_SECURITY": "0",
"IS_SMARTBOX": "0",
"POSTINDEX": "01010",
"SHORTCITYTYPE_EN": null,
"MEREZA_NUMBER": "2667",
"ID": "2699",
"STREETTYPE_RU": null,
"CITYTYPE_UA": "місто",
"NEW_DISTRICT_UA": null,
"PO_LONG": "Відділення поштового зв'язку № 10 м. Київ Акціонерно
го товариства \"Укрпошта\"",
"PO_SHORT": "Київ 10",
"PELPEREKAZY": "0",
"LOCK_RU": "Активная запись",
"TYPE_LONG": "МВ",
"TYPE_ACRONYM": "МВ",
"PARENT_ID": "152",
"TECHINDEX": "01010",
"REGION_UA": "Київ",
"IS_FLAGMAN": "0",
"DISTRICT_UA": "Київ",
"ADDRESS": "пров. Іподромний, 5",
"SHORTCITYTYPE_UA": "м.",

www.ukrposhta.ua

}

]

}

"REGION_ID": "286",
"LOCK_EN": "Active record",
"PHONE": "+380-800-300-545",
"LONGITUDE": "30.546159",
"STREET_UA": "Іподромний",
"REGION_EN": "Kyiv",
"IS_AUTOMATED": "1",
"STREETTYPE_UA": "провулок",
"LOCK_UA": "Активний запис",
"ISVPZ": "1",
"CITY_EN": "Kyiv",
"STREET_EN": "IPODROMNYI",
"LOCK_CODE": "0",
"CITYTYPE_RU": null,
"REGION_RU": null,
"SHORTCITYTYPE_RU": null,
"STREETTYPE_EN": "lane",
"CITY_ID": "29713",
"IS_NOLETTERS": "0",
"CITYTYPE_EN": "City",
"HOUSENUMBER": "5",
"LATTITUDE": "50.437968",
"STREET_RU": null,
"CITY_UA": "Київ",
"IS_DHL": "0",
"DISTRICT_RU": "0"

www.ukrposhta.ua

2.5.
Отримання інформації про населений пункт за
індексом

Дозволяє отримати інформацію про область, район і населений пункт за
індексом різними мовами.
Параметри, що передаються в запиті:
postcode – код зони доставки (індекс вказаної адреси)*;
lang – мова (EN, UA).
*обов’язковий
GET Request

URI:/get_city_details_by_postcode?postcode={postcode}&lang={language}

Response
Код відповіді: 200
"Entries": {
"Entry": [
{
"REGION_ID": "286",
"NEW_DISTRICT_NAME": null,
"POSTCODE": "01001",
"DISTRICT_ID": "412",
"OLDSTREET_NAME": null,
"CITYTYPE_ID": "41",
"DISTRICT_NAME": "Київ",
"CITY_ID": "29713",
"REGION_NAME": "Київ",
"CITY_NAME": "Київ",
"CITYTYPE_NAME": "м.",
"OLDCITY_NAME": null
}
]
}

www.ukrposhta.ua

2.6.

Отримання інформації про адресу за індексом

Дозволяє отримати інформацію про адресу за індексом різними мовами.
Параметри, що передаються в запиті:
postcode – код зони доставки (індекс вказаної адреси)*;
language – мова (EN, UA).
*обов’язковий
GET Request

URI:/get_address_by_postcode?postcode={postcode}&lang={language}

Response
Код відповіді: 200
"Entries": {
"Entry": [
{
"REGION_ID": "286",
"STREETTYPE_NAME": "алея",
"NEW_DISTRICT_NAME": null,
"STREETTYPE_ID": "49",
"POSTCODE": "01001",
"DISTRICT_ID": "412",
"OLDSTREET_NAME": "Інститутська",
"SHORTSTREETTYPE_NAME": "алея",
"CITYTYPE_ID": "41",
"DISTRICT_NAME": "Київ",
"CITY_ID": "29713",
"STREET_ID": "63613",
"REGION_NAME": "Київ",
"CITY_NAME": "Київ",
"CITYTYPE_NAME": "м.",
"STREET_NAME": "Героїв Небесної сотні",
"HOUSENUMBER": "1",
"OLDCITY_NAME": null,
"ERP_DISTRICT_ID": "1063478",
"ERP_CITY_ID": "63477",
"ERP_STREET_ID": "3393",
"ERP_REGION_ID": "1063477"
},
----------------------------Перелік адрес----------------------------}

www.ukrposhta.ua

2.7.
Отримання інформації про код зони доставки за
ідентифікатором населеного пункту
Дозволяє отримати код зони доставки за ідентифікатором населеного пункту.
Параметри, що передаються в запиті:
city_id – ідентифікатор населеного пункту*
*обов’язковий
GET Request

URI:/get_postcode_by_city_id?city_id={city_id}

Response
Код відповіді: 200
"Entries": {
"Entry": [
{
"CITY_ID": "11084",
"POSTCODE": "08292"
},
{
"CITY_ID": "11084",
"POSTCODE": "08293"
},
{
"CITY_ID": "11084",
"POSTCODE": "08294"
},
{
"CITY_ID": "11084",
"POSTCODE": "08297"
}
]
}

www.ukrposhta.ua

2.8.
Отримання відділень за кодом КОАТУУ населеного
пункту
Дозволяє отримати переліку відділень населеного пункту за кодом КОАТУУ.
Параметри, що передаються в запиті (хоча б один з параметрів):
city_koatuu – код КОАТУУ;
city_katottg – код КАТОТТГ нас.пункту;
city_vpz_katottg – код КАТОТТГ нас.пункту з ВПЗ.
postcode – код зони доставки
district_id – ID району
GET Request

URI:/get_postoffices_by_postcode_cityid_cityvpzid?city_koatuu={city_koatuu}&
city_katottg={city_katottg}& city_vpz_katottg={city_vpz_katottg}

Response
Код відповіді: 200
«Entries»: {
«Entry»: [
{
«LOCK_EN»: «Active record»,
«CITY_UA_VPZ»: «Бровари»,
«POSTTERMINAL»: «0»,
«POSTOFFICE_UA»: «07400 Бровари»,
«POSTCODE»: «07400»,
«ISAUTOMATED»: «1»,
«PHONE»: «+380-800-300-545»,
«LONGITUDE»: «30.79083»,
«CITY_KATOTTG»: «32060050010081797»,
«STREET_UA_VPZ»: «вул. Героїв України, 20»,
«IS_SECURITY»: «0»,
«POSTOFFICE_ID»: «2738»,
«POSTOFFICE_UA_DETAILS»: null,
«POSTINDEX»: «07400»,
«LOCK_UA»: «Активний запис»,
«CITY_UA_TYPE»: «м.»,
«CITY_VPZ_KATOTTG»: «32060050010081797»,
«LOCK_CODE»: «0»,
«CITY_VPZ_ID»: «10952»,
«CITY_KOATUU»: «3210600000»,
«STREET_ID_VPZ»: «201050»,
«LOCK_RU»: «Активная запись»,
«CITY_VPZ_KOATUU»: «3210600000»,
«TYPE_ACRONYM»: «МВ»,
«TYPE_LONG»: «Міське відділення поштового зв’язку»,
«TYPE_ID»: «48»,
«CITY_ID»: «10952»,
«IS_NOLETTERS»: "1",
«HOUSENUMBER»: «20»,
«LATTITUDE»: «50.51027»,
«CITY_UA»: «Бровари»
},
-------------------------------Перелік відділень-------------------------------]
}

www.ukrposhta.ua

3. Пошук інформації за назвою
Адресний класифікатор дозволяє виконати пошук інформації про район та
населений пункт та вулицю за повною або частковою їх назвою.

3.1.

Отримання інформації по району за його назвою

Дозволяє отримати інформацію по району за його повною або частковою
назвою різними мовами з можливістю нечіткого пошуку.
Параметри, що передаються в запиті:
region_id – ідентифікатор області*;
district_name – назва району (або її частина, якщо fuzzy = 1)*;
lang – обрана мова для пошуку (EN, RU, UA)*;
fuzzy – використання функції нечіткого пошуку*.
*обов’язковий
GET Request

URI:/get_district_by_name?region_id={region_id}&district_name={district_name}&lang=
{language}&fuzzy={usefuzzyserch}

Response
Код відповіді: 200
«Entries»: {
«Entry»: [
{
«REGION_ID»: «270»,
«DISTRICT_NAME»: «Броварський»,
«NEW_DISTRICT_NAME»: null,
«REGION_NAME»: «Київська»,
«DISTRICT_ID»: «339»
}
]
}

www.ukrposhta.ua

3.2.

Отримання інформації про місто за його назвою

Дозволяє отримати інформацію по місту за його повною або частковою назвою
різними мовами з можливістю нечіткого пошуку.
Параметри, що передаються в запиті:
region_id – ідентифікатор області*;
district_id – ідентифікатор району*;
city_name – назва населеного пункту (або її частина, якщо fuzzy = 1)*;
lang – обрана мова для пошуку (EN, UA)*;
fuzzy – використання функції нечіткого пошуку (0, 1)*.
*обов’язковий
GET Request

URI:/get_city_by_name?region_id={region_id}&district_id={district_id}&city_name=
{city_name}&lang={language}&fuzzy={usefuzzyserch}

Response
Код відповіді: 200
«Entries»: {
«Entry»: [
{
«REGION_ID»: «262»,
«DISTRICT_NAME»: «Жмеринський»,
«NEW_DISTRICT_NAME»: null,
«CITY_ID»: «1850»,
«REGION_NAME»: «Вінницька»,
«DISTRICT_ID»: «293»,
«CITY_NAME»: «Грабівці»,
«CITYTYPE_NAME»: «с.»,
«OLDCITY_NAME»: «Червоне»,
«CITYTYPE_ID»: «42»
},
{
«REGION_ID»: «279»,
«DISTRICT_NAME»: «Чортківський»,
«NEW_DISTRICT_NAME»: null,
«CITY_ID»: «22704»,
«REGION_NAME»: «Тернопільська»,
«DISTRICT_ID»: «389»,
«CITY_NAME»: «Грабівці»,
«CITYTYPE_NAME»: «с.»,
«OLDCITY_NAME»: null,
«CITYTYPE_ID»: «42»
}
]
}

www.ukrposhta.ua

3.3.

Отримання інформації про вулицю за її назвою

Дозволяє отримати інформацію по вулиці за її повною або частковою назвою
різними мовами з можливістю нечіткого пошуку.
Параметри, що передаються в запиті:
city_id – ідентифікатор населеного пункту*;
street_name – назва вулиці*;
lang – обрана мова для пошуку (EN, UA)*;
fuzzy – використання функції нечіткого пошуку*.
*обов’язковий
GET Request

URI:/get_street_by_name?city_id={city_id}&street_name={street_name}&lang={language}&
fuzzy={usefuzzyserch}

Response
Код відповіді: 200
«Entries»: {
«Entry»: [
{
«REGION_ID»: «286»,
«STREETTYPE_NAME»: «вулиця»,
«NEW_DISTRICT_NAME»: null,
«STREETTYPE_ID»: «41»,
«DISTRICT_ID»: «412»,
«OLDSTREET_NAME»: «Фрунзе»,
«SHORTSTREETTYPE_NAME»: «вул.»,
«CITYTYPE_ID»: «41»,
«DISTRICT_NAME»: «Київ»,
«CITY_ID»: «29713»,
«STREET_ID»: «45244»,
«REGION_NAME»: «Київ»,
«CITY_NAME»: «Київ»,
«CITYTYPE_NAME»: «м.»,
«STREET_NAME»: «Кирилівська»,
«OLDCITY_NAME»: null
}
]
}

www.ukrposhta.ua

Додаток А. Заблоковані записи та причина блокування
Частина записів у АС мережі заблоковано. Для такого запису неможливо
створити адресу за допомогою АРІ у зв’язку з причиною блокування.
Код
блокування
0
1
2
3
4
5
65535
32768
32774

Причина блокування запису
Активний запис
Тимчасово окуповані території
Тимчасово непідконтрольні території
Підконтрольні території, що тимчасово не функціонують
Відсутні пов’язані дома
ПАТ «Укрпошта» без врахування 1,2,3
Заблокований запис
Ремонт
Карантин

www.ukrposhta.ua

Історія змін API
Дата

Версія

21.02.2018

1

Створено документацію

07.03.2018

2

Додано параметр для отримання результату у форматі json. Змінено вхідні параметри до сервісів
GET_POSTOFFICES_OPENHOURS_BY_POSTINDEX,
GET_CITY_BY_REGION_ID_AND_DISTRICT_ID_AND_CITY_UA, GET_POSTOFFICES_BY_POSTINDEX

09.03.2018

3

Додано приклади результатів виконання запитів

16.03.2018

4

30.03.2018

5

03.04.2018

6

24.04.2018

7

04.05.2018

8

24.05.2018

9

Додано нові сервіси GET_DISTRICT_BY_NAME, GET_CITY_BY_NAME,
GET_STREET_BY_NAME

03.09.2018

2.0

Для сервісу надано доступ без необхідності авторизації. Змінено url запитів.

06.12.2018

2.1

До запиту GET_CITY_BY_REGION_ID_AND_DISTRICT_ID_AND_CITY_UA
додано поле OwnOf

2.2

Додано нові поля до сервісів:
o
GET_STREET_BY_REGION_ID_AND_DISTRICT_ID_AND_CITY_ID_AND_STREET_UA,
o
GET_STREET_BY_NAME,
o
GET_CITY_BY_NAME,
o
GET_CITY_DETAILS_BY_POSTCODE
o
GET_ADDRESS_BY_POSTCODE

18.10.2019

3.0

1. Змінено структуру документу. Додано опис параметрів.
2. В Додатку А додано перелік кодів блокування записів з описом причини.
3. Додано запит на отримання адресного індексу за ідентифікатором населеного пункту.
4. До запиту (відповідь) на отримання інформації про поштові відділення населеного пункту додано
поля cityshorttype_ua, cityshorttype_en, cityshorttype_ru, citytype_ua, citytype_en, citytype_ru.

18.02.2020

3.01

1. Додано запит для отримання графіку присутності пересувних відділень у населеному пункті (розділ
2.2.1).

02.03.2020

3.02

1. До запиту get_postoffices_by_cityid додано параметри IS_CASH, IS_DHL, IS_SMARTBOX, pelperekazy.

16.03.2020

3.03

1. До запиту get_postoffices_by_cityid додано параметр IS_FLAGMAN.

10.04.2020

3.04

1. До переліку кодів блокування відділень Додаток А додано код 32774.

22.04.2020

3.05

24.06.2019

Опис

Додано нові поля: PDOLDCITYNAME_UA, PDOLDCITYNAME_EN,
PDOLDCITYNAME_RU до сервісу GET_POSTOFFICES_BY_POSTINDEX
Додано новий вхідний параметр: region_name_en до сервісу
GET_REGIONS_BY_REGION_UA. Додано новий сервіс
GET_POSTOFFICES_BY_CITY_ID
Додано нові вхідні параметри: district_id, region_id до сервісу
GET_POSTOFFICES_BY_CITY_ID
Додано новий вхідний параметр housenumber до сервісу
GET_ADDR_HOUSE_BY_STREET_ID
Додано нові сервіси GET_CITY_DETAILS_BY_POSTCODE та
GET_ADDRESS_BY_POSTCODE

1. До розділу 1 (get_city_by_region_id_and_district_id_and_city_ua) додано опис параметрів
CITY_KOATUU та POPULATION.
2. До розділу 2.4 додано опис параметрів POSTTERMINAL, IS_AUTOMATED, IS_SECURITY.

1. До методу GET_REGIONS_BY_REGION_UA (Розділ 1.1) додано поле REGION_KOATUU.
20.05.2020

3.06

2. До методу GET_DISTRICTS_BY_REGION_ID_AND_DISTRICT_UA (Розділ 1.2) додано поля
REGION_KOATUU та DISTRICT_KOATUU.

www.ukrposhta.ua
Додано опис полів OLDSTREET_UA, OLDSTREET_EN, OLDSTREET_RU, PO_CODE, IS_NODISTRICT,
16.06.2020

3.07

PDCITYTYPE_UA, PDCITYTYPE_EN, PDCITYTYPE_RU, SHORTPDCITYTYPE_UA, SHORTPDCITYTYPE_EN,
SHORTPDCITYTYPE_RU, DAYOFWEEK_NUM
OLDSTREET_NAME

03.11.2020

3.08

Додано приклад пошуку населеного пункту за його кодом КОАТУУ.

07.12.2020

3.09

Додано приклад перевірки входження індексу до зони обслуговування ДКД.

20.01.2021

3.10

Для забезпечення стабільної роботи url сервісу необхідно вказувати у форматі з www:
https://www.ukrposhta.ua/address-classifier-ws
До запитів додано нові поля для пошуку за кодом КАТОТТГ

28.09.2021

•

GET_REGIONS_BY_REGION_UA, нове поле REGION_KATOTTG;

•

GET_DISTRICTS_BY_REGION_ID_AND_DISTRICT_UA, нові поля REGION_KATOTTG,

3.11

DISTRICT_KATOTTG;
•

GET_CITY_BY_REGION_ID_AND_DISTRICT_ID_AND_CITY_UA, нове поле CITY_KATOTTG та
параметр katottg;

•

GET_POSTOFFICES_BY_POSTCODE_CITYID_CITYVPZID, нові поля CITY_KATOTTG та

14.11.2022

3.12

Розділ 2.1, додано параметр доступності відділення <AVALIBLE>

16.03.2023

3.13

До розділу 2.8 додано параметр IS_SECURITY, що вказує на розміщення відділення у закритій установі.

20.04.2023

3.14

До Розділу 2.2.1 додано приклад запиту для отримання даних про графік відділення за його ID.
1. В розділі 2.2.2 змінено параметр для пошуку відділень.
2. Додано параметр MRTPS до методів:

15.11.2023

3.15

•

get_city_by_region_id_and_district_id_and_city_ua

•

get_street_by_region_id_and_district_id_and_city_id_and_street_ua

•

get_addr_house_by_street_id

•

get_courierarea_by_postindex

•

get_postoffices_mobile_openhours_by_postindex

•

get_city_details_by_postcode

•

get_address_by_postcode

•

get_city_by_name

•

get_street_by_name

Змінено наступні типи відділення:
•
07.03.2024

3.16

МВПЗ на МВ

•

СВПЗ на СВ

•

ПВПЗ на ПВ

Додано новий тип відділення, ВВ – вантажне відділення.
01.04.2024

3.17

Оновлено та відкориговано перелік параметрів запитів.

11.04.2024

3.18

Для методу get_postoffices_by_postcode_cityid_cityvpzid додано параметр district_id.

19.06.2024

3.19

Для методу get_postoffices_by_geolocation додано опис нових полів (postcode та postindex),

оновлено приклад запиту.
1. У наступних методах прибраний параметр MRTPS:

09.12.24

3.20

•

get_city_by_region_id_and_district_id_and_city_ua

•

get_street_by_region_id_and_district_id_and_city_id_and_street_ua

•

get_addr_house_by_street_id

www.ukrposhta.ua
•

get_courierarea_by_postindex

•

get_city_details_by_postcode

•

get_city_by_name

•

get_street_by_name

2. До Таблиці 1 доданий параметр IS_DISTRICTCENTER
3. До методу get_city_by_region_id_and_district_id_and_city_ua доданий параметр
IS_DISTRICTCENTER
4. До Таблиці 2.1 доданий параметр IS_NOLETTERS
5. Додано параметр IS_NOLETTERS до методів:
•

get_postoffices_by_postindex

•

get_postoffices_by_city_id

•

get_postoffices_by_postcode_cityid_cityvpzid

6. У метод get_address_by_postcode додані параметри:
•

ERP_DISTRICT_ID

•

ERP_CITY_ID

•

ERP_STREET_ID

•

ERP_REGION_ID

© Укрпошта 2024. Всі права захищено
www.ukrposhta.ua

