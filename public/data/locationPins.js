/* ==========================================
   位置測量 - 預設地標資料 & Saved State
   ========================================== */

const LOCATION_CATEGORIES = [
  { key: 'hotel',      label: '🏨 酒店',     color: '#e85d04', icon: 'fa-bed' },
  { key: 'shopping',   label: '🛍 購物中心', color: '#3a86ff', icon: 'fa-bag-shopping' },
  { key: 'restaurant', label: '🍽 餐廳',     color: '#f72585', icon: 'fa-utensils' },
  { key: 'attraction', label: '⛩ 景點',     color: '#2cb67d', icon: 'fa-torii-gate' },
  { key: 'transport',  label: '🚉 交通站點', color: '#a78bfa', icon: 'fa-train-subway' },
  { key: 'other',      label: '📌 其他',     color: '#ffb703', icon: 'fa-location-pin' }
];

// Key locations (user can optionally display)
const KEY_LOCATIONS = [
  {
    id: 'key_namba',
    name: '難波站 (御堂筋線・四橋線・千日前線)',
    desc: '〒542-0076 大阪府大阪市中央區難波 1 Chome-9',
    lat: 34.667158505175045,
    lng: 135.50034473595477,
    icon: 'fa-train-subway',
    color: '#e5171f'
  },
  {
    id: 'key_umeda',
    name: '梅田站 (御堂筋線)',
    desc: '大阪市北区梅田',
    lat: 34.70284,
    lng: 135.49775,
    icon: 'fa-train-subway',
    color: '#e5171f'
  },
  {
    id: 'key_tennoji',
    name: '天王寺站 (御堂筋線・谷町線・JR)',
    desc: '大阪市天王寺区',
    lat: 34.64608,
    lng: 135.51527,
    icon: 'fa-train-subway',
    color: '#e5171f'
  },
  {
    id: 'key_shinsaibashi',
    name: '心斎橋站 (御堂筋線・長堀鶴見緑地線)',
    desc: '大阪市中央区心斎橋',
    lat: 34.67502,
    lng: 135.50031,
    icon: 'fa-train-subway',
    color: '#f72585'
  },
  {
    id: 'key_kix',
    name: '関西國際空港 KIX',
    desc: '大阪府泉佐野市',
    lat: 34.4320,
    lng: 135.2304,
    icon: 'fa-plane',
    color: '#3a86ff'
  }
];

// Major Osaka train lines for overlay
// Coordinates verified via Wikipedia GeoHack + Nominatim API (Mar 2026)
const OSAKA_TRAIN_LINES = [
  {
    name: '御堂筋線 (Midosuji)',
    code: 'M',
    color: '#e5171f',
    stations: [
      { name: '千里中央', lat: 34.8075, lng: 135.4694 },
      { name: '江坂', lat: 34.7632, lng: 135.4965 },
      { name: '新大阪', lat: 34.7329, lng: 135.4981 },
      { name: '中津', lat: 34.7113, lng: 135.4959 },
      { name: '梅田', lat: 34.7028, lng: 135.4978 },
      { name: '淀屋橋', lat: 34.6923, lng: 135.5010 },
      { name: '本町', lat: 34.6819, lng: 135.4990 },
      { name: '心斎橋', lat: 34.6750, lng: 135.5003 },
      { name: 'なんば', lat: 34.6672, lng: 135.5003 },
      { name: '大国町', lat: 34.6559, lng: 135.4989 },
      { name: '動物園前', lat: 34.6504, lng: 135.5060 },
      { name: '天王寺', lat: 34.6461, lng: 135.5153 },
      { name: 'なかもず', lat: 34.5563, lng: 135.5062 }
    ]
  },
  {
    name: '谷町線 (Tanimachi)',
    code: 'T',
    color: '#522886',
    stations: [
      { name: '大日', lat: 34.7497, lng: 135.5795 },
      { name: '東梅田', lat: 34.7006, lng: 135.4998 },
      { name: '南森町', lat: 34.6976, lng: 135.5110 },
      { name: '天満橋', lat: 34.6903, lng: 135.5164 },
      { name: '谷町四丁目', lat: 34.6834, lng: 135.5193 },
      { name: '谷町六丁目', lat: 34.6734, lng: 135.5189 },
      { name: '谷町九丁目', lat: 34.6643, lng: 135.5178 },
      { name: '天王寺', lat: 34.6461, lng: 135.5153 },
      { name: '八尾南', lat: 34.5968, lng: 135.6017 }
    ]
  },
  {
    name: '四つ橋線 (Yotsubashi)',
    code: 'Y',
    color: '#0078ba',
    stations: [
      { name: '西梅田', lat: 34.6995, lng: 135.4957 },
      { name: '肥後橋', lat: 34.6915, lng: 135.4963 },
      { name: '本町', lat: 34.6815, lng: 135.4960 },
      { name: '四ツ橋', lat: 34.6740, lng: 135.4968 },
      { name: 'なんば', lat: 34.6654, lng: 135.4968 },
      { name: '大国町', lat: 34.6560, lng: 135.4950 },
      { name: '住之江公園', lat: 34.6087, lng: 135.4731 }
    ]
  },
  {
    name: '中央線 (Chuo)',
    code: 'C',
    color: '#009944',
    stations: [
      { name: '長田', lat: 34.6815, lng: 135.5530 },
      { name: '森ノ宮', lat: 34.6822, lng: 135.5334 },
      { name: '谷町四丁目', lat: 34.6834, lng: 135.5193 },
      { name: '堺筋本町', lat: 34.6819, lng: 135.5069 },
      { name: '本町', lat: 34.6819, lng: 135.4990 },
      { name: '阿波座', lat: 34.6816, lng: 135.4863 },
      { name: '弁天町', lat: 34.6703, lng: 135.4618 },
      { name: '大阪港', lat: 34.6539, lng: 135.4344 },
      { name: 'コスモスクエア', lat: 34.6426, lng: 135.4122 }
    ]
  },
  {
    name: '千日前線 (Sennichimae)',
    code: 'S',
    color: '#e44d93',
    stations: [
      { name: '野田阪神', lat: 34.6944, lng: 135.4749 },
      { name: '玉川', lat: 34.6888, lng: 135.4751 },
      { name: '阿波座', lat: 34.6816, lng: 135.4863 },
      { name: '西長堀', lat: 34.6757, lng: 135.4869 },
      { name: '桜川', lat: 34.6688, lng: 135.4884 },
      { name: 'なんば', lat: 34.6672, lng: 135.5003 },
      { name: '日本橋', lat: 34.6668, lng: 135.5077 },
      { name: '谷町九丁目', lat: 34.6643, lng: 135.5178 },
      { name: '鶴橋', lat: 34.6653, lng: 135.5307 },
      { name: '南巽', lat: 34.6437, lng: 135.5532 }
    ]
  },
  {
    name: '堺筋線 (Sakaisuji)',
    code: 'K',
    color: '#814721',
    stations: [
      { name: '天神橋筋六丁目', lat: 34.7098, lng: 135.5108 },
      { name: '扇町', lat: 34.7045, lng: 135.5108 },
      { name: '南森町', lat: 34.6976, lng: 135.5110 },
      { name: '北浜', lat: 34.6912, lng: 135.5066 },
      { name: '堺筋本町', lat: 34.6819, lng: 135.5069 },
      { name: '長堀橋', lat: 34.6753, lng: 135.5063 },
      { name: '日本橋', lat: 34.6668, lng: 135.5077 },
      { name: '恵美須町', lat: 34.6556, lng: 135.5057 },
      { name: '天下茶屋', lat: 34.6372, lng: 135.4967 }
    ]
  },
  {
    name: '長堀鶴見緑地線 (Nagahori)',
    code: 'N',
    color: '#a9cc51',
    stations: [
      { name: '大正', lat: 34.6654, lng: 135.4803 },
      { name: 'ドーム前千代崎', lat: 34.6715, lng: 135.4795 },
      { name: '西長堀', lat: 34.6757, lng: 135.4869 },
      { name: '西大橋', lat: 34.6755, lng: 135.4944 },
      { name: '心斎橋', lat: 34.6750, lng: 135.5003 },
      { name: '長堀橋', lat: 34.6753, lng: 135.5063 },
      { name: '松屋町', lat: 34.6754, lng: 135.5122 },
      { name: '谷町六丁目', lat: 34.6734, lng: 135.5189 },
      { name: '玉造', lat: 34.6740, lng: 135.5270 },
      { name: '森ノ宮', lat: 34.6822, lng: 135.5334 },
      { name: '京橋', lat: 34.6976, lng: 135.5345 },
      { name: '門真南', lat: 34.7171, lng: 135.5931 }
    ]
  },
  {
    name: '南海電鐵 (Nankai)',
    code: '南海',
    color: '#d7003a',
    stations: [
      { name: '難波', lat: 34.6655, lng: 135.5009 },
      { name: '新今宮', lat: 34.6501, lng: 135.5002 },
      { name: '天下茶屋', lat: 34.6372, lng: 135.4967 },
      { name: '堺', lat: 34.5739, lng: 135.4825 },
      { name: '岸和田', lat: 34.4603, lng: 135.3781 },
      { name: '関西空港', lat: 34.4340, lng: 135.2440 }
    ]
  },
  {
    name: 'JR大阪環状線 (Loop)',
    code: 'JR環',
    color: '#ff6600',
    stations: [
      { name: '大阪', lat: 34.7025, lng: 135.4962 },
      { name: '天満', lat: 34.7049, lng: 135.5123 },
      { name: '桜ノ宮', lat: 34.7048, lng: 135.5203 },
      { name: '京橋', lat: 34.6976, lng: 135.5345 },
      { name: '大阪城公園', lat: 34.6878, lng: 135.5344 },
      { name: '森ノ宮', lat: 34.6822, lng: 135.5334 },
      { name: '玉造', lat: 34.6740, lng: 135.5270 },
      { name: '鶴橋', lat: 34.6653, lng: 135.5307 },
      { name: '桃谷', lat: 34.6588, lng: 135.5281 },
      { name: '寺田町', lat: 34.6478, lng: 135.5233 },
      { name: '天王寺', lat: 34.6461, lng: 135.5153 },
      { name: '新今宮', lat: 34.6501, lng: 135.5002 },
      { name: '今宮', lat: 34.6540, lng: 135.4930 },
      { name: '芦原橋', lat: 34.6587, lng: 135.4892 },
      { name: '大正', lat: 34.6654, lng: 135.4803 },
      { name: '弁天町', lat: 34.6703, lng: 135.4618 },
      { name: '西九条', lat: 34.6827, lng: 135.4658 },
      { name: '野田', lat: 34.6922, lng: 135.4723 },
      { name: '福島', lat: 34.6969, lng: 135.4872 },
      { name: '大阪', lat: 34.7025, lng: 135.4962 }
    ]
  },
  {
    name: 'JR関西空港線 (Haruka/ラピート)',
    code: 'JR関空',
    color: '#005aa0',
    stations: [
      { name: '天王寺', lat: 34.6461, lng: 135.5153 },
      { name: '新今宮', lat: 34.6501, lng: 135.5002 },
      { name: '堺市', lat: 34.5778, lng: 135.4987 },
      { name: '日根野', lat: 34.3909, lng: 135.3313 },
      { name: '関西空港', lat: 34.4340, lng: 135.2440 }
    ]
  }
];
