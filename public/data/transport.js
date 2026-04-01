const TRANSPORT_INFO = {
  airportToNamba: {
    title: '關西機場 → 大阪難波 交通指引',
    options: [
      {
        name: '南海電鐵 Rapi:t（ラピート）',
        recommended: true,
        duration: '約38分鐘',
        priceJPY: 1290,
        priceHKD: 68,
        frequency: '每30分鐘一班',
        route: '關西機場站 → 天下茶屋・新今宮・難波',
        bookUrl: 'https://hk.trip.com/things-to-do/detail/57078589?language=HK&locale=zh_hk',
        desc: '最快最方便的選擇！超特急直達，無需換乘，車廂設計現代，設有置物架。可在Trip.com提前購買電子票，直接掃碼乘車。機場一樓南海電鐵售票處購票，列車每30分鐘一班。',
        tips: ['建議提前在Trip.com或網上購買電子票，可享折扣', '抵達難波站後，步行至道頓堀約5分鐘', '行李可存放於頭等廂置物架'],
        img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800'
      },
      {
        name: '南海電鐵 空港急行（普通急行）',
        recommended: false,
        duration: '約55分鐘',
        priceJPY: 930,
        priceHKD: 49,
        frequency: '每15分鐘一班',
        route: '關西機場站 → 各站停靠 → 難波站',
        desc: '較便宜的選擇，沿途各站停靠，適合不赶時間的旅客。',
        tips: ['途中需在泉佐野站換乘部分班次', '錢幣少但需時較長'],
        img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800'
      },
      {
        name: 'OCAT巴士（關西機場利木津巴士）',
        recommended: false,
        duration: '約50～70分鐘（視交通）',
        priceJPY: 1600,
        priceHKD: 85,
        frequency: '每20分鐘一班',
        route: '關西機場 → OCAT（難波）/ 梅田各大飯店',
        desc: '適合入住難波或梅田大型酒店的旅客，巴士可直達鄰近飯店，省去拖行李換乘的麻煩。',
        tips: ['視塞車可能延誤30分鐘以上', '有大件行李時較方便', '國際航廈1樓出口有售票處'],
        img: 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=800'
      }
    ],
    mapImg: 'https://osaka-amazing-pass.com/resource/img/map-area-full_cht.png',
    mapImgTitle: '大阪周遊卡適用地圖（中文版）'
  },
  osaka_metro: {
    title: '大阪地鐵（Osaka Metro）使用指南',
    desc: '大阪Metro是大阪地鐵系統，共9條路線，覆蓋大阪市內主要景點。使用交通IC卡（ICOCA、Suica等）可無縫轉乘，亦可使用大阪周遊卡免費乘搭。',
    lines: [
      { name: '御堂筋線（Midosuji Line）', color: '#E4007F', code: 'M', desc: '大阪最主要幹線，連接梅田（M16）、心齋橋（M19）、難波（M20）、天王寺（M23）等核心站點。' },
      { name: '谷町線（Tanimachi Line）', color: '#88318B', code: 'T', desc: '連接東梅田、谷町四丁目（大阪城）、天王寺等站，是大阪城觀光的主要路線。' },
      { name: '四つ橋線（Yotsubashi Line）', color: '#0068B7', code: 'Y', desc: '連接西梅田（Y11）、肥後橋（Y12，國立國際美術館）、難波（Y15）。' },
      { name: '中央線（Chuo Line）', color: '#E66B00', code: 'C', desc: '連接弁天町、森之宮（C19）、堺筋本町（C17）直到大阪港（C11）。' },
      { name: '堺筋線（Sakaisuji Line）', color: '#B5A100', code: 'K', desc: '連接天六（K11）、日本橋（K17）、惠美須町（K18，通天閣）。' },
      { name: '長堀鶴見緑地線（Nagahori Line）', color: '#569D2D', code: 'N', desc: '連接大正（N10）、心齋橋（N15）、大阪商務園區（N21，大阪城）。' }
    ],
    tips: [
      '購買大阪周遊卡（1日券¥2,800/HK$148或2日券¥3,600/HK$190）可無限次乘搭大阪地鐵',
      'ICOCA交通IC卡可在關西機場購買，全關西通用',
      '地鐵車票約¥190～¥380不等，視距離而定',
      '大阪站≠梅田站，但相距同一建築物並可免費步行轉換'
    ]
  },
  jr_kansai: {
    title: 'JR 關西地區鐵路指引',
    desc: 'JR關西地區鐵路連接大阪各地，包括前往京都、神戶、奈良等地，持JR Pass可不限次乘搭。',
    routes: [
      { name: 'JR 大阪環狀線', desc: '環繞大阪市中心，停靠大阪（梅田）、森之宮、天王寺等主要站，票價約¥150-190。' },
      { name: 'JR 大和路線', desc: '大阪至奈良，從天王寺出發，票價約¥470，車程約35分鐘。' },
      { name: 'JR 京都線（東海道線）', desc: '大阪至京都，從大阪站出發乘新快速，票價¥580/HK$31，車程僅28分鐘。' },
      { name: 'JR 神戶線（山陽線）', desc: '大阪至神戶三宮，從大阪站乘新快速，票價¥420/HK$22，車程約21分鐘。' }
    ]
  }
};

const TOUR_INFO = {
  title: '大阪出發・近江八幡拉可利納（La Collina）＋草莓採摘無限食之旅',
  source: 'Klook',
  bookUrl: 'https://www.klook.com/zh-HK/activity/188823-osaka-la-collina-omihachiman-all-you-can-eat-strawberry-tour/',
  duration: '約11小時（全日）',
  meetingPoint: '大阪難波 / 梅田集合',
  priceHKD: '約HK$480～680/人',
  priceJPY: '約¥9,000～12,800/人',
  highlights: [
    '無限量草莓採摘體驗（約30分鐘）',
    '參觀由建築師藤森照信設計的La Collina近江八幡',
    '品嘗BAUMKUCHEN（Club Harie年輪蛋糕）',
    '欣賞滋賀縣近江八幡的水鄉古街景色',
    '全程中文導遊服務',
    '往返大阪交通包含'
  ],
  schedule: [
    { time: '08:00', activity: '難波/梅田集合出發' },
    { time: '09:30', activity: '抵達滋賀縣草莓農場' },
    { time: '09:30-10:30', activity: '無限量草莓採摘體驗（採足30分鐘，鮮甜草莓即摘即食）' },
    { time: '11:00', activity: '前往近江八幡La Collina' },
    { time: '11:30-13:30', activity: '遊覽La Collina，品嘗Club Harie年輪蛋糕及特色甜點，欣賞如童話般的田園建築' },
    { time: '13:30-15:00', activity: '自由遊覽近江八幡古街，八幡堀水道，欣賞江戶時代商業街景' },
    { time: '15:30', activity: '返程出發' },
    { time: '17:30', activity: '抵達大阪，解散' }
  ],
  laCollina: {
    title: 'La Collina 近江八幡',
    desc: '由日本著名建築師藤森照信設計，以稻草屋頂覆蓋的童話式建築，是Club Harie（クラブハリエ）的旗艦店面。大片的草坪、水池和農田環繞，是世界著名的打卡景點。',
    address: '滋賀縣近江八幡市北之庄町615-1',
    website: 'https://taneya.jp/la_collina/',
    hours: '9:00～18:00（最後入館17:30）',
    holiday: '週三不定休',
    img: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
    mustBuy: [
      'Club Harie 新鮮BAUMKUCHEN年輪蛋糕（現場限定）約¥450～1,200',
      'La Collina限定紀念餅乾套裝',
      '近江八幡限定抹茶甜點',
      '草莓雪糕（季節限定）'
    ]
  },
  strawberry: {
    season: '1月～5月',
    varieties: ['章姬草莓（あまおとめ）', '京之香（きょのか）', '女峰草莓（にょほう）'],
    tips: [
      '選摘顏色均勻鮮红的草莓，甜度最高',
      '採摘時從草莓蒂處輕輕向上旋轉採下',
      '可搭配現場提供的煉乳或白糖食用',
      '建議穿著輕便衣物，農場地面可能較濕滑'
    ]
  },
  notes: [
    '草莓採摘時間：每年1月下旬～5月中旬（視季節，具體以Klook系統為準）',
    '4月29日出發時草莓季節接近尾聲，建議盡早預約',
    '全程設有中文或廣東話導遊',
    '午餐需自理，La Collina內有餐廳',
    '請提前在Klook預訂，名額有限'
  ],
  photos: [
    'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=800',
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800',
    'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800'
  ]
};
