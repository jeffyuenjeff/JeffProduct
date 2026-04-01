const SHOPPING_CENTERS = [
  {
    id: 'sc1', name: '心齋橋筋商店街',
    area: '心齋橋', type: '商店街',
    desc: '大阪最著名的購物商業街，全長580米的拱廊商店街，集合高街品牌、藥粧店、時裝、餐廳，是大阪購物必去之地。',
    img: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800',
    hours: '11:00～21:00（各店不一）',
    access: 'Osaka Metro 心齋橋(M19)',
    lat: 34.6734, lng: 135.5012,
    highlights: ['藥粧', '化妝品', '時裝', '伴手禮']
  },
  {
    id: 'sc2', name: 'Grand Front Osaka（グランフロント大阪）',
    area: '梅田', type: '購物商場',
    desc: '梅田最新大型複合購物中心，南館北館共300家店鋪，集合時裝、生活雜貨、電子、餐廳、咖啡廳，是梅田最潮的購物地標。',
    img: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800',
    hours: '10:00～21:00',
    access: 'JR 大阪站、Osaka Metro 梅田',
    lat: 34.7040, lng: 135.4960,
    highlights: ['高端品牌', '餐廳', '咖啡廳', '生活雜貨']
  },
  {
    id: 'sc3', name: 'ルクア（LUCUA）大阪',
    area: '梅田', type: '購物商場',
    desc: 'JR大阪站旁的時裝購物中心，LUCUA及LUCUA 1100兩棟相連，集合700多家品牌，是大阪年輕女性最愛的購物場所。',
    img: 'https://images.unsplash.com/photo-1567093322-63fdd6b5fe99?w=800',
    hours: '10:30～20:30',
    access: 'JR 大阪站直達',
    lat: 34.7036, lng: 135.4975,
    highlights: ['快時尚', '女裝', '美妝', '食品']
  },
  {
    id: 'sc4', name: '阪急百貨店（梅田本店）',
    area: '梅田', type: '百貨公司',
    desc: '日本最大的百貨店樓面之一，9層樓的阪急梅田本店，集合高端時裝、精品、食品、餐廳，被譽為梅田時尚界No.1。',
    img: 'https://images.unsplash.com/photo-1581609959475-5d9e2c67f84a?w=800',
    hours: '10:00～20:00',
    access: '阪急 大阪梅田站直達',
    lat: 34.7040, lng: 135.4985,
    highlights: ['高端品牌', '美食', '甜品', '精品']
  },
  {
    id: 'sc5', name: '難波City（なんばCity）',
    area: '難波', type: '購物商場',
    desc: '連接難波車站地下的大型購物中心，集合時裝、雜貨、美食，是難波地區最大的室內購物中心，全年人流如潮。',
    img: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
    hours: '11:00～21:00',
    access: '南海 難波站直達',
    lat: 34.6657, lng: 135.5016,
    highlights: ['時裝', '雜貨', '美食', '生活用品']
  },
  {
    id: 'sc6', name: 'ドン・キホーテ（驚安の殿堂）道頓堀店',
    area: '道頓堀', type: '折扣百貨',
    desc: '大阪最著名的折扣百貨，24小時營業，藥粧、家電、零食、化妝品、服裝應有盡有，價格實惠，是遊客購買手信的首選。',
    img: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800',
    hours: '24小時',
    access: 'Osaka Metro 難波(M20)',
    lat: 34.6683, lng: 135.5013,
    highlights: ['24小時', '藥粧', '零食', '電子', '最低價']
  },
  {
    id: 'sc7', name: 'アメリカ村（美國村）',
    area: '心齋橋', type: '潮流街區',
    desc: '大阪最潮流的購物街區，集合古著、街潮品牌、CD、街頭藝術，是大阪年輕人的時尚指標地區，週末充滿個性獨特的人。',
    img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
    hours: '12:00～21:00',
    access: 'Osaka Metro 心齋橋(M19)',
    lat: 34.6722, lng: 135.4983,
    highlights: ['古著', '潮牌', '街潮', '個性']
  },
  {
    id: 'sc8', name: '日本橋電電城（でんでんタウン）',
    area: '日本橋', type: '電子商圈',
    desc: '大阪版秋葉原！電子產品、動漫周邊、電玩遊戲、模型公仔、Cosplay服裝等應有盡有，是宅文化愛好者的天堂。',
    img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    hours: '11:00～20:00（各店不一）',
    access: 'Osaka Metro 日本橋(K17)',
    lat: 34.6636, lng: 135.5072,
    highlights: ['電子', '動漫', '模型', 'Cosplay']
  },
  {
    id: 'sc9', name: 'EXPOCITY（エキスポシティ）',
    area: '吹田・萬博紀念公園', type: '複合設施',
    desc: '萬博紀念公園旁的大型複合設施，OSAKA WHEEL、Nifrel互動水族館、LaLaport大阪門真等，室外購物街加娛樂設施，是關西最大的複合型商業設施。',
    img: 'https://images.unsplash.com/photo-1579547944212-c4f4961a8dd8?w=800',
    hours: '10:00～21:00',
    access: '大阪單軌電車 萬博紀念公園站',
    lat: 34.8094, lng: 135.5412,
    highlights: ['複合設施', '餐廳', '娛樂', '購物']
  },
  {
    id: 'sc10', name: '天王寺MIO（あべのMio）',
    area: '天王寺', type: '購物商場',
    desc: 'JR天王寺站直達的購物中心，集合主流時裝品牌、美食、超市，旁邊有阿倍野ハルカス（日本最高大廈），是大阪南部最人氣的購物中心。',
    img: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800',
    hours: '11:00～21:00',
    access: 'JR／近鐵 天王寺站直達',
    lat: 34.6476, lng: 135.5136,
    highlights: ['時裝', '美食', '超市', '便利']
  }
];

const MUST_BUY = [
  // 食品・零食
  { id: 'b1', category: '食品・零食', name: '551蓬萊豬肉包', shopHint: '551蓬萊', priceHKD: '12～29/個', desc: '大阪最著名手信，皮薄汁多的豬肉燒包，每盒6個，新鮮美味。' },
  { id: 'b2', category: '食品・零食', name: '自由軒咖喱飯醬', shopHint: '自由軒', priceHKD: '42～64', desc: '創業1910年大阪本格咖喱拌飯烹飪包，香辛馥郁的傳統大阪式咖喱。' },
  { id: 'b3', category: '食品・零食', name: '章魚燒煎餅（たこ焼きせんべい）', shopHint: '心齋橋各手信店', priceHKD: '21～42', desc: '章魚燒口味薄脆煎餅，小巧精緻，是大阪最熱門的手信零食之一。' },
  { id: 'b4', category: '食品・零食', name: 'ATELIER du CHOCOLAT大阪限定朱古力', shopHint: '阪急百貨', priceHKD: '53～106', desc: '大阪限定小熊造型朱古力，精緻包裝，作為手信超受歡迎。' },
  { id: 'b5', category: '食品・零食', name: '大阪城太郎煉乳甜點', shopHint: '大阪城紀念品店', priceHKD: '26～53', desc: '大阪城限定甜點，使用北海道煉乳製作，入口即化，是城內必買手信。' },
  { id: 'b6', category: '食品・零食', name: '和三盆糖（和三盆）', shopHint: '百貨食品部', priceHKD: '53～106', desc: '日本傳統精製砂糖製成的精緻甜點，入口即化，是和菓子中的最高貴品種。' },
  { id: 'b7', category: '食品・零食', name: '大阪通天閣比利肯餅乾', shopHint: '通天閣周邊商店', priceHKD: '21～42', desc: '通天閣吉祥物比利肯造型餅乾，造型可愛，送禮自用皆宜。' },
  { id: 'b8', category: '食品・零食', name: '大阪黑糖羊羹', shopHint: '老字號和菓子店', priceHKD: '42～85', desc: '日本傳統和菓子，以沖繩黑糖製作，甜而不膩，配茶最佳。' },
  { id: 'b9', category: '食品・零食', name: '昆布佃煮', shopHint: '黑門市場', priceHKD: '32～64', desc: '大阪傳統昆布佃煮，鮮甜帶微鹹，下飯佐粥，是道地大阪廚房必備調味品。' },
  { id: 'b10', category: '食品・零食', name: '阪神甲子園咖喱', shopHint: '阪神甲子園球場', priceHKD: '37～64', desc: '大阪阪神甲子園球場限定咖喱罐頭，是球迷的必買紀念品。' },

  // 藥粧・美容
  { id: 'b11', category: '藥粧・美容', name: 'HABA 純天然護膚油', shopHint: 'HABA官店', priceHKD: '106～212', desc: '無添加純鯊烷油護膚品，深層保濕，是日本護膚迷必買的殿堂級產品。' },
  { id: 'b12', category: '藥粧・美容', name: '白花油（日本版）', shopHint: '藥局', priceHKD: '32～53', desc: '日本版白花油原料更豐富，香味更淡雅，效果媲美香港版。' },
  { id: 'b13', category: '藥粧・美容', name: '肌研極潤（ヒアルロン酸）化妝水', shopHint: 'Matsumoto Kiyoshi', priceHKD: '53～106', desc: '含高濃度玻尿酸的保濕化妝水，日本藥粧大賞得獎產品，效果卓越。' },
  { id: 'b14', category: '藥粧・美容', name: 'DHC 橄欖護脣膏', shopHint: 'DHC直營店', priceHKD: '26～53', desc: '日本最暢銷護脣膏，純天然橄欖油成分，修護滋潤效果極佳。' },
  { id: 'b15', category: '藥粧・美容', name: '花王Bioré防曬乳', shopHint: '藥妝店', priceHKD: '53～85', desc: '日本超高評價防曬乳，SPF50+清爽不油膩，是亞洲女性最愛的防曬品。' },
  { id: 'b16', category: '藥粧・美容', name: '正官庄紅參面膜', shopHint: '大型藥妝店', priceHKD: '80～160', desc: '韓國高麗參成分護膚面膜，在日本大型藥妝店有售，品質有保障且價格比港澳便宜。' },
  { id: 'b17', category: '藥粧・美容', name: 'SANA豆乳系列', shopHint: 'SANA/藥妝店', priceHKD: '42～85', desc: '豆乳異黃酮護膚系列，物美價廉，男女均適，是日本藥妝必掃系列之一。' },

  // 家品・生活
  { id: 'b18', category: '家品・生活', name: '無印良品（MUJI）限定商品', shopHint: 'MUJI心齋橋旗艦店', priceHKD: '21～530', desc: '無印良品旗艦店提供多款香港未有的日本限定商品，文具、食品、服裝等均有。' },
  { id: 'b19', category: '家品・生活', name: '大阪城磁鐵/扇子紀念品', shopHint: '大阪城紀念品店', priceHKD: '11～53', desc: '大阪城限定各式紀念品，磁鐵、扇子、瓷器杯等，是親友手信首選。' },
  { id: 'b20', category: '家品・生活', name: 'LOFT（ロフト）文具雜貨', shopHint: 'LOFT心齋橋', priceHKD: '11～212', desc: '日本最大生活雜貨連鎖，獨特設計文具、廚具、美容工具，是大阪購物必到的文具天堂。' },
  { id: 'b21', category: '家品・生活', name: 'ダイソー（百元店）日本限定品', shopHint: 'Daiso各分店', priceHKD: '6～11/件', desc: '日本百元店限定商品，日本Daiso款式比香港多，質量更好，是高性價比之選。' },
  { id: 'b22', category: '家品・生活', name: '大阪天守閣陶瓷茶杯組', shopHint: '大阪城禮品店', priceHKD: '80～212', desc: '手繪大阪城圖案陶瓷茶杯套裝，做工精緻，是極具大阪特色的家居擺設。' },

  // 時裝・配飾
  { id: 'b23', category: '時裝・配飾', name: 'UNIQLO日本限定款', shopHint: 'UNIQLO心齋橋旗艦店', priceHKD: '80～424', desc: '日本UNIQLO提供多款香港未有的日本限定款式及UT合作系列，性價比極高。' },
  { id: 'b24', category: '時裝・配飾', name: 'ABC-MART限定波鞋', shopHint: 'ABC-MART心齋橋', priceHKD: '318～795', desc: '日本ABC-MART有多款香港未有的限定版波鞋，New Balance、ASICS等品牌日本限定款。' },
  { id: 'b25', category: '時裝・配飾', name: '浴衣（ゆかた）', shopHint: '阪急百貨 / 心齋橋各店', priceHKD: '212～530', desc: '日本傳統夏季和服，在大阪有各種花紋設計，是獨特的日本拼裝禮品。' },
  { id: 'b26', category: '時裝・配飾', name: 'WC 古著時裝', shopHint: '美國村 WC', priceHKD: '106～530', desc: '日本潮流古著品牌，在美國村開設旗艦店，是大阪年輕人最愛的潮流時裝品牌之一。' },

  // 電子・特色
  { id: 'b27', category: '電子・特色', name: '日本限定任天堂Switch遊戲', shopHint: '日本橋ソフマップ', priceHKD: '212～530', desc: '日本限定版任天堂Switch遊戲，比香港更便宜，電子遊戲迷必買。' },
  { id: 'b28', category: '電子・特色', name: 'Sony 日本限定耳機', shopHint: 'Sony Store 梅田', priceHKD: '318～1060', desc: 'Sony在日本有部分香港未正式發售的限定型號，且比香港便宜最多20%。' },
  { id: 'b29', category: '電子・特色', name: 'Cosplay服裝道具', shopHint: '日本橋Cospa', priceHKD: '212～1060', desc: '日本電電城有大量高品質Cosplay服裝及道具，是日本宅文化的最佳體現。' },
  { id: 'b30', category: '電子・特色', name: 'Gundam 高達模型', shopHint: 'Gundam Base 梅田', priceHKD: '53～530', desc: '大阪梅田Gundam Base有最齊全的高達模型，包括限定版及大師級作品，模型迷必訪。' },

  // 特色伴手禮
  { id: 'b31', category: '特色紀念品', name: '大阪周遊卡（お土産版）', shopHint: '關西機場', priceHKD: '159～371', desc: '大阪周遊卡1日券或2日券，可無限次乘搭大阪Metro及免費入場40個景點。' },
  { id: 'b32', category: '特色紀念品', name: '比利肯（Billiken）公仔', shopHint: '通天閣商店', priceHKD: '53～212', desc: '大阪新世界的幸福之神比利肯，摸腳底帶來好運，是最具大阪特色的紀念品。' },
  { id: 'b33', category: '特色紀念品', name: '大阪波子汽水（ラムネ）', shopHint: '新世界各商店', priceHKD: '11～21', desc: '日本傳統彈珠汽水，新世界限定大阪城等口味，打開彈珠時的儀式感超有趣。' },
  { id: 'b34', category: '特色紀念品', name: '難波御守（災難除厄）', shopHint: '難波神社', priceHKD: '21～53', desc: '難波神社、四天王寺等神社寺院的御守，祈求平安健康，是日本旅行的精神手信。' },
  { id: 'b35', category: '特色紀念品', name: 'Namba猫踊公仔', shopHint: '道頓堀商店', priceHKD: '37～106', desc: '道頓堀著名的招財貓造型大阪限定公仔，有多種顏色代表不同願望。' },

  // 甜點・飲品
  { id: 'b36', category: '甜點・飲品', name: '堂島ロール（堂島蛋糕卷）', shopHint: 'moncher本店', priceHKD: '85～159', desc: '大阪最著名的奶油蛋糕卷，以大量鮮忌廉包裹鬆軟蛋糕，是大阪必買甜品。' },
  { id: 'b37', category: '甜點・飲品', name: '適切屋プリン（提拉米蘇布丁）', shopHint: '大阪市中心', priceHKD: '53～106', desc: '大阪限定手工布丁，使用天然雞蛋和香草製作，入口即化，比香港更便宜。' },
  { id: 'b38', category: '甜點・飲品', name: '通天閣通（冰淇淋卷）', shopHint: '通天閣附近冰淇淋店', priceHKD: '21～42', desc: '大阪新世界區的特製冰淇淋，以通天閣為靈感設計，是新世界打卡必買甜品。' },
  { id: 'b39', category: '甜點・飲品', name: 'Pablo起司撻（大阪發源）', shopHint: 'Pablo 各分店', priceHKD: '64～106', desc: 'Pablo半熟起司撻在大阪發源，現烤香濃，外酥內軟流心，是大阪甜品界的傳奇。' },
  { id: 'b40', category: '甜點・飲品', name: '大阪咖啡店限定拿鐵', shopHint: '梅田各精品咖啡店', priceHKD: '42～64', desc: '大阪擁有許多香港少見的精品咖啡品牌，如Blue Bottle Coffee、Starbucks Reserve等。' },

  // 地道食材
  { id: 'b41', category: '地道食材', name: '蛸章魚醬（章魚燒醬汁）', shopHint: '黑門市場', priceHKD: '21～42', desc: '正宗章魚燒特製醬汁，帶回香港自製章魚燒，重現大阪街頭香味。' },
  { id: 'b42', category: '地道食材', name: '大阪土曜の夜カレー', shopHint: '大阪名立食店', priceHKD: '32～53', desc: '大阪著名即食咖喱品牌，重現大阪本格咖喱風味，帶回後五分鐘即可享用。' },
  { id: 'b43', category: '地道食材', name: '日本進口清酒（地酒）', shopHint: '黑門市場 / 各酒行', priceHKD: '106～530', desc: '大阪及關西地區有多款本地品牌清酒，在香港難以買到，是懂酒之人的必帶手信。' },
  { id: 'b44', category: '地道食材', name: '抹茶商品（宇治抹茶）', shopHint: '中村藤吉 各店', priceHKD: '53～212', desc: '宇治抹茶粉、抹茶朱古力、抹茶糖果等，是日本最受歡迎的手信品類之一。' },
  { id: 'b45', category: '地道食材', name: '七味唐辛子', shopHint: '中辛専門店', priceHKD: '21～53', desc: '日本料理必備七味辣椒粉，各大廠牌在大阪均有特產版，是煮日本料理的必備香料。' },

  // 特別版
  { id: 'b46', category: '限定版', name: '大阪世博2025紀念品', shopHint: '大阪萬博紀念公園', priceHKD: '21～212', desc: '大阪2025年世博會（EXPO 2025 Osaka）的吉祥物「我愛EXPO」相關紀念品，是大阪最特別的紀念品。' },
  { id: 'b47', category: '限定版', name: 'KIRIN限定啤酒', shopHint: '各超市 / 百貨食品部', priceHKD: '11～21/罐', desc: '日本限定版KIRIN一番搾，有大阪地區限定的啤酒，在香港無法購買。' },
  { id: 'b48', category: '限定版', name: '阪神Tigers球隊周邊', shopHint: '阪神甲子園球場', priceHKD: '53～424', desc: '大阪最受愛戴的棒球球隊阪神老虎（Tigers）各式周邊商品，球迷必買。' },
  { id: 'b49', category: '限定版', name: '大阪美食觀光明信片套裝', shopHint: '各文具店 / 觀光店', priceHKD: '21～53', desc: '大阪插畫師設計的手繪章魚燒、道頓堀、通天閣主題明信片套裝，精緻美觀。' },
  { id: 'b50', category: '限定版', name: '關西機場限定伴手禮', shopHint: '關西國際機場', priceHKD: '26～212', desc: '關西機場有多款關西限定的伴手禮，包括大阪・京都・神戶等各地名物，是回港前最後補貨的地方。' }
];
