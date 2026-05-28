-- ============================================================
-- World Country High Points - seed SQL
-- Source: https://peakbagger.com/list.aspx?lid=1100
-- 248 unique peaks, 253 country entries
-- Run this against your Supabase database using the service role.
-- Prerequisites: peaks, collections, and collection_peaks tables must exist.
-- ============================================================

BEGIN;

-- 1. Insert peaks
-- Note: municipality is required (NOT NULL) — set to empty string for world peaks.
-- county field stores the country name.
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mount Everest',8849,'','China / Nepal',27.988257,86.925145,8849,10640);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('K2',8614,'','Pakistan',35.881612,76.512738,4020,10515);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Kangchenjunga',8586,'','India',27.702907,88.147394,3922,10653);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Gangkar Punsum',7570,'','Bhutan',28.047359,90.454878,3049,18686);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Pik Ismail Samani',7495,'','Tajikistan',38.943109,72.01571,3402,10496);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Noshaq',7492,'','Afghanistan',36.433078,71.82832,2024,10491);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Pik Pobeda',7439,'','Kyrgyzstan',42.035293,80.128377,4146,10565);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Khan Tengri',7010,'','Kazakhstan',42.21094,80.174286,1700,10552);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Aconcagua',6962,'','Argentina',-32.653099,-70.012088,6962,8594);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Ojos del Salado',6893,'','Chile',-27.109671,-68.54257,3685,8569);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Nevado Huascarán',6757,'','Peru',-9.120981,-77.604674,2787,8465);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Nevado Sajama',6542,'','Bolivia',-18.107836,-68.882937,2428,8503);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Volcán Chimborazo',6267,'','Ecuador',-1.467064,-78.817499,4122,8400);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Denali',6190,'','United States',63.069042,-151.006347,6140,271);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mount Logan',5959,'','Canada',60.567113,-140.405484,5250,541);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Kilimanjaro',5895,'','Tanzania',-3.076448,37.354034,5885,11202);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Hkakabo Razi',5881,'','Myanmar',28.328107,97.534389,1449,10595);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Pico Simón Bolívar',5720,'','Colombia',10.834718,-73.690453,5529,8289);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Elbrus',5642,'','Russia',43.353811,42.436098,4741,10381);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Pico de Orizaba',5636,'','Mexico',19.030498,-97.269848,4922,8049);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Damavand',5609,'','Iran',35.955533,52.110085,4666,10467);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mount Kenya',5199,'','Kenya',-0.152267,37.308885,3825,11193);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Shkhara',5193,'','Georgia',42.999969,43.109819,1357,10416);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mount Ararat',5137,'','Turkey',39.703475,44.298765,3611,10445);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mount Stanley',5109,'','Congo DRC / Uganda',0.385466,29.873188,3924,11158);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Pico Bolívar',4981,'','Venezuela',8.540899,-71.046462,3957,8344);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Vinson Massif',4892,'','Antarctica',-78.525483,-85.617147,4892,12108);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Carstensz Pyramid',4884,'','Indonesia',-4.078531,137.158077,4884,11360);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mont Blanc',4807,'','France / Italy',45.83267,6.86512,4694,9941);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Alpomish',4651,'','Uzbekistan',38.89304,68.17954,837,130621);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Monte Rosa',4633,'','Switzerland',45.93691,7.86677,2164,10043);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Ras Dashen',4543,'','Ethiopia',13.23692,38.37264,3990,11117);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mount Wilhelm',4509,'','Papua New Guinea',-5.77959,145.02917,2959,11369);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Volcan Karisimbi',4507,'','Rwanda',-1.506085,29.450323,3312,11172);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Bazardüzü',4466,'','Azerbaijan',41.22075,47.85816,2454,10428);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Khüiten Uul',4356,'','Mongolia',49.14669,87.81926,2324,10690);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Volcán Tajumulco',4220,'','Guatemala',15.04303,-91.90367,3980,8079);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Jebel Toubkal',4167,'','Morocco',31.060297,-7.915258,3755,11046);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Kinabalu',4095,'','Malaysia',6.074985,116.558313,4095,10966);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Aragats Lerr',4090,'','Armenia',40.523056,44.195377,2143,10432);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mount Cameroon',4040,'','Cameroon',4.218203,9.173201,3901,11099);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Yushan',3951,'','Taiwan',23.469991,120.957265,3951,10720);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Cerro Chirripó',3819,'','Costa Rica',9.484296,-83.488921,3755,8168);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Großglockner',3797,'','Austria',47.07454,12.69387,2427,10113);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Fuji-san',3776,'','Japan',35.360638,138.727347,3776,10882);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Aoraki/Mount Cook',3718,'','New Zealand',-43.5951,170.14184,NULL,11737);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Pico del Teide',3715,'','Spain',28.27277,-16.64233,3715,11300);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Gunnbjørn Fjeld',3694,'','Greenland',68.918173,-29.898692,3694,719);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Jabal an Nabi Shu''ayb',3666,'','Yemen',15.2802,43.978045,3326,10477);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Cheekha Dar',3611,'','Iraq',36.776705,44.918633,1575,13186);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Thabana Ntlenyana',3482,'','Lesotho',-29.468138,29.269186,2390,11261);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Volcán Barú',3474,'','Panama',8.808814,-82.542664,1314,8189);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mafadi',3451,'','South Africa',-29.202857,29.358324,111,17493);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Emi Koussi',3445,'','Chad',19.792536,18.546365,2934,11071);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Kinyeti',3182,'','South Sudan',3.946253,32.910301,2115,11179);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Fan Si Pan',3147,'','Vietnam',22.30336,103.775239,1606,10961);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Ayrybaba',3139,'','Turkmenistan',37.815118,66.56933,1572,10488);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Pico Duarte',3101,'','Dominican Republic',19.023073,-70.99769,NULL,8224);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Qurnat as Sawda',3088,'','Lebanon',34.300946,36.115817,2393,10450);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Piton des Neiges',3070,'','Reunion',-21.09939,55.47999,NULL,11332);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Jebel Shams',3018,'','Oman',23.238549,57.262955,2818,10480);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Soira',3018,'','Eritrea',14.757516,39.521041,678,11114);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Jabal Marrah',3012,'','Sudan',12.938699,24.235421,2482,11076);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Pico Basilé',3008,'','Equatorial Guinea',3.588271,8.761632,3008,11100);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Sapitwa Peak',3002,'','Malawi',-15.94946,35.59297,2319,11222);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Jabal Ferwa',2999,'','Saudi Arabia',17.928547,43.265528,1199,86060);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Pico da Neblina',2996,'','Brazil',0.799959,-66.007476,2888,8700);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Foho Ramelau',2963,'','East Timor',-8.906625,125.493378,2963,11013);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Zugspitze',2962,'','Germany',47.42123,10.98632,NULL,10012);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mount Apo',2954,'','Philippines',6.98734,125.27103,2954,11028);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Pic de Coma Pedrosa',2943,'','Andorra',42.591796,1.443665,432,9815);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mount Paget',2934,'','South Georgia',-54.449767,-36.524896,2934,8812);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Musala',2925,'','Bulgaria',42.179705,23.585253,2473,10352);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Olympus',2918,'','Greece',40.085657,22.35868,2354,10335);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Tahat',2908,'','Algeria',23.288879,5.53373,2328,11060);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Maromokotro',2876,'','Madagascar',-14.022482,48.967124,2876,11327);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Cerro Las Minas',2870,'','Honduras',14.53387,-88.679882,2090,8099);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Triglav',2864,'','Slovenia',46.37832,13.8366,2052,10160);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Phou Bia',2830,'','Laos',18.980781,103.15155,2079,10962);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Pico do Fogo',2829,'','Cape Verde',14.95039,-24.34236,2829,11308);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mount Hermon',2814,'','Syria',33.416166,35.857035,1804,10452);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mount Roraima - Guyana High Point',2772,'','Guyana',5.213489,-60.746585,NULL,8682);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Korab',2753,'','Albania / North Macedonia',41.790315,20.546885,2158,10332);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Big Ben',2745,'','Heard and McDonald Islands',-53.10456,73.513536,2745,11353);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Paektu-san',2744,'','North Korea',41.993094,128.077071,2593,10734);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Cerro El Pital',2730,'','El Salvador',14.38439,-89.12917,1530,8102);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Pic la Selle',2674,'','Haiti',18.360219,-71.976729,2644,8225);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mont Heha',2670,'','Burundi',-3.6034,29.499168,244,11177);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Velika Rudoka',2660,'','Kosovo',41.91848,20.776532,230,73242);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Gerlachovský štít',2654,'','Slovakia',49.16403,20.13403,2349,10307);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Gebel Katherîna',2653,'','Egypt',28.50936,33.95554,2423,10460);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Morro de Môco',2623,'','Angola',-12.462873,15.173591,1516,11210);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Grauspitz',2600,'','Liechtenstein',47.05271,9.58131,NULL,10000);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mount Nyangani',2593,'','Zimbabwe',-18.29991,32.84194,1521,11229);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Königstein',2573,'','Namibia',-21.149919,14.577509,1769,11224);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Doi Inthanon',2565,'','Thailand',18.587797,98.486963,1835,10952);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Moldoveanu',2544,'','Romania',45.599895,24.736003,2046,10317);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Zla Kolata',2525,'','Montenegro',42.485047,19.896082,54,30157);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Pidurutalagala',2524,'','Sri Lanka',7.00072,80.774143,2524,10665);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Rysy - Northwest Peak',2499,'','Poland',49.179585,20.08804,9,10301);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Galdhøpiggen',2469,'','Norway',61.63643,8.31245,2379,8916);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Shimbiris',2439,'','Somalia',10.735178,47.244581,1450,11145);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mount Binga',2436,'','Mozambique',-19.776551,33.062461,1328,11230);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Chappal Waddi',2419,'','Nigeria',7.036389,11.71477,5,11096);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Veliki Maglić',2386,'','Bosnia and Herzegovina',43.28104,18.733139,51,10327);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Karthala',2361,'','Comoros',-11.758152,43.366549,2361,11322);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Montanha do Pico',2351,'','Portugal',38.468642,-28.399298,2351,11292);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Pic Bette',2350,'','Libya',21.98223,19.144492,650,11064);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mafinga Central',2339,'','Zambia',-9.952694,33.352361,895,11213);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mount Popomanaseu',2335,'','Solomon Islands',-9.703256,160.061472,2335,11822);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Beerenberg',2272,'','Jan Mayen',71.08209,-8.178223,2272,8837);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Blue Mountain Peak',2256,'','Jamaica',18.04689,-76.57889,NULL,8223);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mont Orohena',2241,'','French Polynesia',-17.621412,-149.476779,2241,11946);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mount Kosciuszko',2228,'','Australia',-36.456076,148.263399,2228,11624);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mitze Hashlagim',2222,'','Israel',33.317794,35.803523,72,89864);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Midžor',2169,'','Serbia',43.394695,22.681918,1479,13254);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Hvannadalshnjúkur',2109,'','Iceland',64.01424,-16.67718,2109,8836);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Pico Mogotón',2106,'','Nicaragua',13.76308,-86.39834,1321,8113);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Kebnekaise - Nordtoppen',2097,'','Sweden',67.904729,18.528266,1735,27340);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Hoverla',2061,'','Ukraine',48.159889,24.500396,721,10313);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Queen Mary''s Peak',2060,'','Saint Helena, Ascension, Tristan da Cunha',-37.111542,-12.288754,2060,11314);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Pico de São Tomé',2024,'','Sao Tome and Principe',0.269314,6.541725,2024,11101);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Moussa Ali',2021,'','Djibouti',12.468802,42.404453,1607,11143);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mont Idoukal-n-Taghès',2002,'','Niger',17.838489,8.720123,1307,11062);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Pico Turquino',1974,'','Cuba',19.989776,-76.835954,1974,8220);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Olympus',1951,'','Cyprus',34.93651,32.86454,1951,10449);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Halla-san',1950,'','South Korea',33.361413,126.529395,1950,10939);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Loma Mansa',1942,'','Sierra Leone',9.227155,-11.115761,1662,11082);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Jabal Bil Ays - West Peak',1892,'','United Arab Emirates',25.953735,56.180685,9,27568);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Tabwémasana',1879,'','Vanuatu',-15.362787,166.75474,1879,11832);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Emlembe',1862,'','Eswatini',-25.921275,31.126659,445,11248);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mauga Silisili',1858,'','Samoa',-13.618072,-172.486633,1858,11928);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Jabal Umm ad Dami',1854,'','Jordan',29.307588,35.432854,396,27957);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Bukit Pagon',1850,'','Brunei',4.29621,115.323014,70,10967);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Grand Ross',1850,'','French Southern Lands',-49.594943,69.496725,1850,11351);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Dinara',1831,'','Croatia',44.06299,16.38338,728,10325);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Phnom Aoral',1813,'','Cambodia',12.032699,104.171046,1744,10965);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mont Richard-Molard',1744,'','Ivory Coast / Guinea',7.617325,-8.411698,1284,11088);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Newtontoppen',1712,'','Svalbard',79.01056,17.49122,1712,8817);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mont Panié',1629,'','New Caledonia',-20.58858,164.77018,1629,11843);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Sněžka',1603,'','Czech Republic',50.73602,15.73963,1183,10289);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Jebel Chambi',1544,'','Tunisia',35.206722,8.682862,453,11050);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Monalanong Hill',1492,'','Botswana',-24.840833,25.665084,229,19055);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('La Grande Soufrière',1467,'','Guadeloupe',16.04491,-61.66384,NULL,8257);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mount Wuteve',1449,'','Liberia',8.14537,-9.926713,899,11085);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Morne Diablotins',1435,'','Dominica',15.50431,-61.39846,NULL,8258);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mont Ngaoui',1410,'','Central African Republic',6.746701,14.958199,347,11097);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Montagne Pelée',1397,'','Martinique',14.80916,-61.165341,NULL,8260);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Ben Nevis',1345,'','United Kingdom',56.796869,-5.003666,1345,9269);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Cerro de Punta',1337,'','Puerto Rico',18.17228,-66.59174,NULL,8231);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Halti - South Slope',1324,'','Finland',69.30804,21.265,NULL,8841);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mount Tomanivi',1324,'','Fiji Islands',-17.6146,178.018185,1324,11854);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Julianatop',1256,'','Suriname',3.682376,-56.535633,1167,8709);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('La Soufrière',1233,'','Saint Vincent and the Grenadines',13.347726,-61.176128,NULL,8265);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Doyle''s Delight',1174,'','Belize',16.494063,-89.045641,920,8065);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mount Liamuiga',1156,'','Saint Kitts and Nevis',17.36846,-62.802934,1156,8253);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Hombori Tondo',1155,'','Mali',15.256923,-1.668714,845,11089);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Kao',1109,'','Tonga',-19.668403,-175.01597,1109,11953);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mont Bengoué',1070,'','Gabon',0.955491,13.685637,541,19054);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mowdok Mual',1052,'','Bangladesh',21.78639,92.61,820,10949);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Carrauntoohil',1039,'','Ireland',51.999383,-9.742799,1039,9052);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Nabi Yunis',1030,'','Palestinian Authority',31.578677,35.10474,550,10457);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mont Nabemba',1020,'','Congo Republic',1.843822,13.990038,493,11102);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Kékes',1014,'','Hungary',47.87261,20.008709,774,10314);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mont Atilakoutse',991,'','Togo',7.329054,0.709001,723,74411);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Agrihan High Point',977,'','Northern Marianas',18.768118,145.673237,977,74397);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Lata Mountain',966,'','American Samoa',-14.233143,-169.454316,966,11932);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Tai Mo Shan',957,'','Hong Kong',22.41008,114.124538,897,10702);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mount Gimie',952,'','Saint Lucia',13.86345,-61.01105,NULL,8262);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Cerro del Aripo',941,'','Trinidad and Tobago',10.72944,-61.24335,941,8241);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Kdeyyat ej Joul',915,'','Mauritania',22.651034,-12.574271,596,11055);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Soufriere Hills Volcano',914,'','Montserrat',16.712299,-62.175574,914,8256);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Morne Seychellois',905,'','Seychelles',-4.644788,55.438833,905,11319);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Leklata',900,'','Ghana',7.026892,0.603274,75,11092);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Slættaratindur',880,'','Faroe Islands',62.296655,-7.013191,880,8838);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mount Scenery',870,'','Saba',17.634755,-63.23768,870,8251);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Bellevue de L''Inini',851,'','French Guiana',3.543807,-53.574751,664,8710);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Cerro Tres Kandú',842,'','Paraguay',-25.902033,-56.160021,563,8789);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mount Saint Catherine',840,'','Grenada',12.162281,-61.675035,840,8268);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Piton de la Petite Rivière Noire',828,'','Mauritius',-20.408887,57.407767,828,11331);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Ngihneni',790,'','Micronesia',6.863463,158.236471,780,11797);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Olavtoppen',780,'','Bouvet Island',-54.405132,3.347081,780,11316);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Téna Kourou',747,'','Burkina Faso',10.757728,-5.418577,402,11090);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Monte Titano',739,'','San Marino',43.93217,12.45197,251,10183);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mount Usborne',705,'','Falkland Islands',-51.691928,-58.833955,705,8810);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Signal de Botrange',694,'','Belgium',50.501662,6.092445,119,9606);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Kotopounga',669,'','Benin',10.289369,1.544253,264,11091);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mlima Bénara',660,'','Mayotte',-12.880028,45.162541,660,11323);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Te Manga',653,'','Cook Islands',-21.235754,-159.763353,653,11957);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Felo Barkere',638,'','Senegal',12.373096,-12.543806,228,11080);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Snaefell',621,'','Isle of Man',54.263183,-4.461555,621,9353);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mazinga',600,'','Sint Eustatius',17.476273,-62.959767,600,8252);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Kneiff',560,'','Luxembourg',50.1573,6.03697,55,30150);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mont Puke',522,'','Wallis and Futuna',-14.270767,-178.139062,522,11848);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mount Sage',521,'','British Virgin Islands',18.4095,-64.655632,521,8227);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Cerro Catedral',514,'','Uruguay',-34.383002,-54.673994,373,8805);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Crown Mountain',472,'','U.S. Virgin Islands',18.35674,-64.972,NULL,8228);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Bălăneşti',430,'','Moldova',47.217298,28.083188,285,10322);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Pic Paradis',430,'','Saint Martin',18.077856,-63.049912,420,8244);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Rock of Gibraltar',426,'','Gibraltar',36.126955,-5.343957,423,9870);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mount Lamlam',402,'','Guam',13.34025,144.66545,NULL,11786);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mount Obama',402,'','Antigua and Barbuda',17.044702,-61.86131,402,8255);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Flagstaff - Southwest Ridge',380,'','Sint Maarten',18.063402,-63.0549,0,8246);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Sint Christoffelberg',372,'','Curaçao',12.336903,-69.123162,372,8237);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Murray Hill',361,'','Christmas Island',-10.477683,105.586766,361,11004);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Pawala Valley Ridge',347,'','Pitcairn Island',-25.068309,-130.113101,347,11966);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Hara Dzyarzhynskaya',345,'','Belarus',53.848585,27.06572,185,10284);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mount Hillaby',340,'','Barbados',13.210949,-59.582126,340,8267);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Vaalserberg',321,'','Netherlands',50.755009,6.01999,0,9595);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mount Bates',320,'','Norfolk Island',-29.011227,167.939916,320,11760);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Suur Munamägi',318,'','Estonia',57.71399,27.06007,218,10278);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Gaizinkalns',312,'','Latvia',56.870231,25.959519,187,10280);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Aukstojas',294,'','Lithuania',54.528523,25.626967,NULL,10283);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Kuwait High Point',291,'','Kuwait',29.100479,46.640744,0,10474);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Morne du Vitet',286,'','Saint Barthelemy',17.899218,-62.806344,286,8248);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Dongol Rondè',266,'','Guinea-Bissau',11.683069,-13.892175,122,11081);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Ta'' Dmejrek',253,'','Malta',35.84602,14.39593,NULL,10276);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mount Ngerchelchuus',242,'','Palau',7.562438,134.571189,242,11791);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Brandaris',241,'','Bonaire',12.273759,-68.399306,241,8238);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Morne de la Grande Montagne',240,'','Saint Pierre and Miquelon',47.04399,-56.302654,240,6640);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Jamanota',188,'','Aruba',12.4874,-69.940787,188,8236);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Alto Coloane',172,'','Macau',22.120658,113.561291,172,10700);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Møllehøj',171,'','Denmark',55.97749,9.826407,161,28239);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Bukit Timah',164,'','Singapore',1.354685,103.776405,164,10959);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Chemin des Révoires',162,'','Monaco',43.734826,7.412881,0,9887);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Les Platons',136,'','Jersey',49.247838,-2.1047,136,9556);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Jabal ad Dukhan',134,'','Bahrain',26.038121,50.542541,134,10475);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Le Moulin',114,'','Guernsey',49.431196,-2.362436,114,9554);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Al Galail',103,'','Qatar',24.715871,51.046747,89,10476);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Banaba High Point',81,'','Kiribati',-0.856765,169.535664,81,11800);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Vatican Hill',78,'','Vatican City',41.903493,12.450122,13,10235);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Navassa High Point',77,'','Navassa',18.396813,-75.01249,77,8222);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Town Hill',76,'','Bermuda',32.316557,-64.733324,76,8215);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Niue High Point',69,'','Niue',-18.963383,-169.834769,69,11952);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Command Ridge',65,'','Nauru',-0.530978,166.916756,65,11799);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Crocus Hill',65,'','Anguilla',18.216797,-63.066639,65,8242);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Mount Alvernia',63,'','Bahamas',24.294227,-75.40824,63,8216);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Sare Firasu Hill',51,'','Gambia',13.221566,-14.159756,NULL,98974);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Blue Mountain',49,'','Turks and Caicos Islands',21.786673,-72.246578,49,8217);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('The Bluff',43,'','Cayman Islands',19.750871,-79.723889,43,8221);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Cocos Islands High Point',14,'','Cocos Islands',-12.20836,96.895046,14,11334);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Likiep High Point',10,'','Marshall Islands',9.821869,169.290316,10,11788);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Willis Island High Point',9,'','Coral Sea Islands Territory',-16.287527,149.964778,9,74442);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Baker High Point',8,'','U.S. Minor Pacific Islands',0.19723,-176.47468,8,11923);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Diego Garcia High Point',7,'','British Indian Ocean Territory',-7.263192,72.375031,7,11320);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Niulakita High Point',5,'','Tuvalu',-10.788688,179.472932,5,70853);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Tokelau High Point',5,'','Tokelau',-9.209885,-171.767045,5,11926);
INSERT INTO public.peaks (name,height,municipality,county,lat,lng,primary_factor,peakbagger_id) VALUES ('Wilingili Island High Point',3,'','Maldives',-0.674982,73.194888,3,11318);

-- 2. Insert collection
INSERT INTO public.collections (slug,name,description,min_height,min_primary_factor,nearest_higher_min_height,nearest_higher_label)
VALUES (
  'world-country-highpoints',
  'Høyeste topp i hvert land',
  'Høyeste fjell i hvert land i verden. Basert på Peakbagger liste lid=1100.',
  0, 0, 0, 'Nærmeste høyere'
);

-- 3. Link peaks to collection (run after peaks are inserted)
INSERT INTO public.collection_peaks (collection_id, peak_id)
SELECT c.id, p.id
FROM public.collections c
CROSS JOIN public.peaks p
WHERE c.slug = 'world-country-highpoints'
  AND p.peakbagger_id IN (10640,10515,10653,18686,10496,10491,10565,10552,8594,8569,8465,8503,8400,271,541,11202,10595,8289,10381,8049,10467,11193,10416,10445,11158,8344,12108,11360,9941,130621,10043,11117,11369,11172,10428,10690,8079,11046,10966,10432,11099,10720,8168,10113,10882,11737,11300,719,10477,13186,11261,8189,17493,11071,11179,10961,10488,8224,10450,11332,10480,11114,11076,11100,11222,86060,8700,11013,10012,11028,9815,8812,10352,10335,11060,11327,8099,10160,10962,11308,10452,8682,10332,11353,10734,8102,8225,11177,73242,10307,10460,11210,10000,11229,11224,10952,10317,30157,10665,10301,8916,11145,11230,11096,10327,11322,11292,11064,11213,11822,8837,8223,11946,11624,89864,13254,8836,8113,27340,10313,11314,11101,11143,11062,8220,10449,10939,11082,27568,11832,11248,11928,27957,10967,11351,10325,10965,11088,8817,11843,10289,11050,19055,8257,11085,8258,11097,8260,9269,8231,8841,11854,8709,8265,8065,8253,11089,11953,19054,10949,9052,10457,11102,10314,74411,74397,11932,10702,8262,8241,11055,8256,11319,11092,8838,8251,8710,8789,8268,11331,11797,11316,11090,10183,8810,9606,11091,11323,11957,11080,9353,8252,30150,11848,8227,8805,8228,10322,8244,9870,11786,8255,8246,8237,11004,11966,10284,8267,9595,11760,10278,10280,10283,10474,8248,11081,10276,11791,8238,6640,8236,10700,28239,10959,9887,9556,10475,9554,10476,11800,10235,8222,8215,11952,11799,8242,8216,98974,8217,8221,11334,11788,74442,11923,11320,70853,11926,11318);

COMMIT;