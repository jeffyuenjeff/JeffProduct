const ATTRACTIONS = [
  // ===== 北地區 梅田地區 =====
  {
    id: 1, region: '北地區・梅田', name: '梅田藍天大廈 空中庭園展望台',
    url: 'https://www.skybldg.co.jp/observatory/',
    img: 'https://osaka-amazing-pass.com/resource/img/free_1.jpg',
    access: 'Osaka Metro 梅田(M16)、阪急・阪神 大阪梅田',
    hours: '9:30～22:30（最後入館22:00）', holiday: '全年無休',
    priceJPY: 2000, priceHKD: 106,
    desc: '大阪地標性摩天大廈，空中庭園展望台可360度俯瞰大阪全景，夜景尤為震撼。',
    lat: 34.7069, lng: 135.4900, tag: ['景觀', '夜景', '必去']
  },
  {
    id: 2, region: '北地區・梅田', name: '梅田藍天大廈 絹谷幸二 天空美術館',
    url: 'https://www.kinutani-tenku.jp/',
    img: 'https://osaka-amazing-pass.com/resource/img/free_2.jpg',
    access: 'Osaka Metro 梅田(M16)、阪急・阪神 大阪梅田',
    hours: '10:00〜18:00（週五、六及節日前天至20:00）', holiday: '週二',
    priceJPY: 1300, priceHKD: 69,
    desc: '日本著名畫家絹谷幸二的作品博物館，展示宏大鮮豔的繪畫作品，令人嘆為觀止。',
    lat: 34.7072, lng: 135.4905, tag: ['藝術', '博物館']
  },
  {
    id: 3, region: '北地區・梅田', name: 'HEP FIVE 摩天輪',
    url: 'https://www.hepfive.jp/ferriswheel/',
    img: 'https://osaka-amazing-pass.com/resource/img/free_3.jpg',
    access: 'Osaka Metro 梅田(M16)、阪急・阪神 大阪梅田',
    hours: '11:00～23:00（最後乘坐22:45）', holiday: '翻新工程中，2026年4月下旬後恢復',
    priceJPY: 800, priceHKD: 42,
    desc: '大阪市中心最著名的摩天輪之一，搭乘可俯瞰整個梅田購物區。',
    lat: 34.7040, lng: 135.4975, tag: ['遊樂', '景觀']
  },
  {
    id: 4, region: '北地區・梅田', name: '大阪生活今昔館（大阪市立人居博物館）',
    url: 'https://www.osaka-angenet.jp/konjyakukan/',
    img: 'https://osaka-amazing-pass.com/resource/img/free_4.jpg',
    access: 'Osaka Metro・阪急 天神橋筋六丁目(T18,K11)',
    hours: '10:00～17:00（最後入館16:30）', holiday: '週二',
    priceJPY: 600, priceHKD: 32,
    desc: '重現江戶及大正時代大阪街景的互動式博物館，可穿和服體驗（另收費）。',
    lat: 34.7234, lng: 135.5097, tag: ['文化', '博物館', '體驗']
  },
  {
    id: 5, region: '北地區・梅田', name: '國立國際美術館',
    url: 'https://www.nmao.go.jp/',
    img: 'https://osaka-amazing-pass.com/resource/img/free_5.jpg',
    access: 'Osaka Metro 肥後橋(Y12)、京阪 渡邊橋',
    hours: '10:00～17:00（週五至20:00）', holiday: '週一',
    priceJPY: 430, priceHKD: 23,
    desc: '日本最重要的現代藝術館之一，地下建築獨具特色，收藏國際頂尖藝術作品。',
    lat: 34.6941, lng: 135.5077, tag: ['藝術', '博物館']
  },
  {
    id: 6, region: '北地區・梅田', name: '大阪企業家博物館',
    url: 'https://www.kigyoka.jp/',
    img: 'https://osaka-amazing-pass.com/resource/img/free_6.jpg',
    access: 'Osaka Metro 堺筋本町(C17,K15)',
    hours: '10:00～17:00（最後入館16:30）', holiday: '週日、週一、節假日',
    priceJPY: 500, priceHKD: 27,
    desc: '介紹大阪商業文化歷史，展示松下、住友等著名企業家的創業故事。',
    lat: 34.6811, lng: 135.5117, tag: ['文化', '博物館']
  },
  // ===== 南地區 難波・道頓堀 =====
  {
    id: 7, region: '南地區・難波道頓堀', name: '道頓堀水上觀光船',
    url: 'http://www.ipponmatsu.co.jp/cruise/tombori.html',
    img: 'https://osaka-amazing-pass.com/resource/img/free_7.jpg',
    access: 'Osaka Metro・南海 難波(Y15,S16,M20)',
    hours: '11:00～21:00（每整點及半點出發）', holiday: '7月13、24、25日',
    priceJPY: 2000, priceHKD: 106,
    desc: '乘船遊覽道頓堀運河，近距離欣賞格力高跑步人、蟹道樂等大阪著名霓虹燈招牌。',
    lat: 34.6689, lng: 135.5007, tag: ['遊船', '必去', '夜景']
  },
  {
    id: 8, region: '南地區・難波道頓堀', name: 'WONDER CRUISE',
    url: 'https://wondercruise.jp/',
    img: 'https://osaka-amazing-pass.com/resource/img/free_8.jpg',
    access: 'Osaka Metro 日本橋(S17,K17)',
    hours: '17:00～21:30', holiday: '全年無休（年末年始除外）',
    priceJPY: 2000, priceHKD: 106,
    desc: '夜間遊覽道頓堀運河的精緻觀光船，設有指定座位，提供拍照服務及英文導覽。',
    lat: 34.6645, lng: 135.5075, tag: ['遊船', '夜景', '浪漫']
  },
  {
    id: 9, region: '南地區・難波道頓堀', name: '上方浮世繪館',
    url: 'http://kamigata.jp/kmgt/',
    img: 'https://osaka-amazing-pass.com/resource/img/free_9.jpg',
    access: 'Osaka Metro・南海 難波(Y15,S16,M20)',
    hours: '11:00～18:00（最後入館17:30）', holiday: '週一',
    priceJPY: 700, priceHKD: 37,
    desc: '展示江戶時代大阪上方歌舞伎浮世繪版畫，可現場體驗浮世繪版畫製作（另收費）。',
    lat: 34.6698, lng: 135.5008, tag: ['文化', '藝術', '體驗']
  },
  // ===== 南地區 新世界・天王寺 =====
  {
    id: 10, region: '南地區・新世界天王寺', name: '通天閣 一般展望台',
    url: 'https://tsutenkaku.co.jp/',
    img: 'https://osaka-amazing-pass.com/resource/img/free_10.jpg',
    access: 'Osaka Metro 惠美須町(K18)、動物園前(M22,K19)',
    hours: '9:00～21:45（最後入場21:15）', holiday: '全年無休',
    priceJPY: 1200, priceHKD: 64,
    desc: '大阪新世界的象徵性地標，高103米，登頂可俯瞰大阪市區，底部有比利肯幸運神像。',
    lat: 34.6525, lng: 135.5063, tag: ['地標', '景觀', '必去']
  },
  {
    id: 11, region: '南地區・新世界天王寺', name: 'TOWER SLIDER（通天閣）',
    url: 'https://tsutenkaku.co.jp/',
    img: 'https://osaka-amazing-pass.com/resource/img/free_11.jpg',
    access: 'Osaka Metro 惠美須町(K18)、動物園前(M22,K19)',
    hours: '10:00～20:00（最後入場19:30）', holiday: '全年無休',
    priceJPY: 1000, priceHKD: 53,
    desc: '從通天閣高空向下滑行的超刺激滑梯，需身高120cm以上、體重120kg以下、年齡7-65歲。',
    lat: 34.6527, lng: 135.5065, tag: ['遊樂', '刺激', '體驗']
  },
  {
    id: 12, region: '南地區・新世界天王寺', name: '通天閣 Dive & Walk',
    url: 'https://www.tsutenkaku.co.jp/other/Dive-Walk2024.html',
    img: 'https://osaka-amazing-pass.com/resource/img/free_12.jpg',
    access: 'Osaka Metro 惠美須町(K18)、動物園前(M22,K19)',
    hours: '9:10～19:00（最後入場18:15）', holiday: '全年無休',
    priceJPY: 3000, priceHKD: 159,
    desc: '通天閣外牆步行體驗，沿塔外側行走或俯衝，需身高130cm以上、年齡9-65歲。',
    lat: 34.6523, lng: 135.5060, tag: ['遊樂', '刺激', '體驗']
  },
  {
    id: 13, region: '南地區・新世界天王寺', name: '天王寺動物園',
    url: 'https://www.tennojizoo.jp/',
    img: 'https://osaka-amazing-pass.com/resource/img/free_13.jpg',
    access: 'Osaka Metro 動物園前(M22,K19)、天王寺(M23,T27)',
    hours: '9:30～17:00（最後入園16:00）', holiday: '週一',
    priceJPY: 500, priceHKD: 27,
    desc: '大阪最大動物園，設有非洲草原區、亞洲熱帶雨林區等，可近距離觀賞長頸鹿、河馬等動物。',
    lat: 34.6503, lng: 135.5040, tag: ['動物', '家庭', '自然']
  },
  {
    id: 14, region: '南地區・新世界天王寺', name: '慶澤園',
    url: 'https://tw.osaka-info.jp/spot/keitakuen-garden/',
    img: 'https://osaka-amazing-pass.com/resource/img/free_14.jpg',
    access: 'Osaka Metro 動物園前(M22,K19)、天王寺(M23,T27)',
    hours: '9:30～17:00', holiday: '週一',
    priceJPY: 300, priceHKD: 16,
    desc: '明治時代建造的傳統日本庭園，以中央池塘為中心，三島飛石假山設計精緻典雅。',
    lat: 34.6492, lng: 135.5057, tag: ['庭園', '文化', '放鬆']
  },
  {
    id: 15, region: '南地區・新世界天王寺', name: 'Shinsekai ZAZA ZAZA Comedy Yose',
    url: 'https://www.vitalartbox.com/zaza/',
    img: 'https://osaka-amazing-pass.com/resource/img/free_15.jpg',
    access: 'Osaka Metro 惠美須町(K18)、動物園前(M22,K19)',
    hours: '11:30、12:30、13:30、14:30、15:30起（每場30分）', holiday: '不定期',
    priceJPY: 1000, priceHKD: 53,
    desc: '新世界傳統落語相聲小劇場，體驗大阪道地的大阪腔喜劇表演（日語）。',
    lat: 34.6530, lng: 135.5048, tag: ['文化', '娛樂', '體驗']
  },
  {
    id: 16, region: '南地區・新世界天王寺', name: '四天王寺',
    url: 'http://www.shitennoji.or.jp/',
    img: 'https://osaka-amazing-pass.com/resource/img/free_16.jpg',
    access: 'Osaka Metro 四天王寺前夕陽丘(T26)',
    hours: '4月～9月：8:30～16:30，10月～3月：8:30～16:00', holiday: '無休',
    priceJPY: 800, priceHKD: 42,
    desc: '推古天皇元年（593年）聖德太子建立，日本最古老的佛教寺院之一，五重塔與金堂莊嚴壯觀。',
    lat: 34.6549, lng: 135.5160, tag: ['神社寺廟', '文化', '歷史']
  },
  // ===== 大阪城週邊 =====
  {
    id: 17, region: '大阪城週邊', name: '大阪城天守閣',
    url: 'https://www.osakacastle.net/hantai/',
    img: 'https://osaka-amazing-pass.com/resource/img/free_18.jpg',
    access: 'Osaka Metro 谷町四丁目(T23,C18)、森之宮(C19,N20)',
    hours: '9:00～18:00（最後入場17:30）', holiday: '12月28日～1月1日',
    priceJPY: 1200, priceHKD: 64,
    desc: '大阪最著名地標，豐臣秀吉建造的雄偉天守閣，8樓展望台可俯瞰大阪城公園及大阪全景。',
    lat: 34.6873, lng: 135.5259, tag: ['地標', '歷史', '必去', '景觀']
  },
  {
    id: 18, region: '大阪城週邊', name: '大阪城西之丸庭園',
    url: 'https://www.osakacastlepark.jp/',
    img: 'https://osaka-amazing-pass.com/resource/img/free_19.jpg',
    access: 'Osaka Metro 谷町四丁目(T23,C18)、天滿橋(T22)',
    hours: '3月～10月：9:00～17:00，11月～2月：9:00～16:30', holiday: '週一',
    priceJPY: 200, priceHKD: 11,
    desc: '大阪城天守閣旁的傳統庭園，春季賞櫻勝地，有300棵以上的染井吉野。',
    lat: 34.6870, lng: 135.5230, tag: ['庭園', '賞櫻', '自然']
  },
  {
    id: 19, region: '大阪城週邊', name: '重要文化遺產 大阪城櫓 YAGURA特別公開',
    url: 'https://www.osakacastlepark.jp/',
    img: 'https://osaka-amazing-pass.com/resource/img/free_20.jpg',
    access: 'Osaka Metro 谷町四丁目(T23,C18)、天滿橋(T22)',
    hours: '10:00～16:30', holiday: '期間限定開放',
    priceJPY: 800, priceHKD: 42,
    desc: '大阪城重要文化財跡的城樓特別公開參觀，難得一見的江戶時代建築精品。',
    lat: 34.6875, lng: 135.5250, tag: ['文化', '歷史', '特別']
  },
  {
    id: 20, region: '大阪城週邊', name: 'KAIYODO FIGURE MUSEUM MIRAIZA OSAKA-JO',
    url: 'https://www.ryuyukan.net/home',
    img: 'https://osaka-amazing-pass.com/resource/img/free_21.jpg',
    access: 'Osaka Metro 谷町四丁目(T23,C18)、大阪商務園區(N21)',
    hours: '9:30～17:30（最後入場17:00）', holiday: '不定期',
    priceJPY: 1000, priceHKD: 53,
    desc: '日本最大玩具模型公司海洋堂在大阪城設立的模型博物館，入場附贈限定手辦。',
    lat: 34.6886, lng: 135.5267, tag: ['體驗', '文化', '特色']
  },
  {
    id: 21, region: '大阪城週邊', name: '大阪城御座船',
    url: 'https://www.banpr.co.jp/',
    img: 'https://osaka-amazing-pass.com/resource/img/free_22.jpg',
    access: 'Osaka Metro 谷町四丁目(T23,C18)、大阪商務園區(N21)',
    hours: '10:00～16:30（末班發船）', holiday: '年末年始',
    priceJPY: 1800, priceHKD: 95,
    desc: '乘坐豐臣秀吉時代風格的御座船遊覽大阪城護城河，感受戰國時代的大阪風情。',
    lat: 34.6893, lng: 135.5274, tag: ['遊船', '文化', '歷史']
  },
  {
    id: 22, region: '大阪城週邊', name: '大阪水上巴士 Aqua-Liner',
    url: 'https://suijo-bus.osaka/language/aqualiner/',
    img: 'https://osaka-amazing-pass.com/resource/img/free_23.jpg',
    access: 'Osaka Metro 大阪商務園區(N21)、淀屋橋(M17)',
    hours: '大阪城港10:00～16:00，淀屋橋港10:20～16:20', holiday: '不定期',
    priceJPY: 2000, priceHKD: 106,
    desc: '連接大阪城-中之島的水上巴士，可飽覽大阪中心水城之美，輕鬆遊覽兩大景區。',
    lat: 34.6898, lng: 135.5299, tag: ['遊船', '交通', '景觀']
  },
  {
    id: 23, region: '大阪城週邊', name: 'YORIMICHI Sunset Cruise',
    url: 'https://suijo-bus.osaka/',
    img: 'https://osaka-amazing-pass.com/resource/img/free_24.jpg',
    access: 'Osaka Metro・京阪 天滿橋(T22)',
    hours: '①17:40出發 ②18:10出發', holiday: '週五、週六限定（9-10月）',
    priceJPY: 1600, priceHKD: 85,
    desc: '期間限定夕陽遊船，在八間屋濱碼頭出發，欣賞大阪河川黃昏美景。',
    lat: 34.6940, lng: 135.5115, tag: ['遊船', '夕陽', '浪漫', '季節限定']
  },
  {
    id: 24, region: '大阪城週邊', name: '大川櫻花遊覽船',
    url: 'http://osakacitycruise.info/',
    img: 'https://osaka-amazing-pass.com/resource/img/free_25.jpg',
    access: 'Osaka Metro・京阪 天滿橋(T22)',
    hours: '10:00～18:00（每隔10～30分鐘出航）', holiday: '3月22日～4月13日期間限定',
    priceJPY: 1500, priceHKD: 80,
    desc: '春季限定賞櫻遊船，沿大川兩岸欣賞300棵以上的染井吉野，是大阪最美的賞櫻方式之一。',
    lat: 34.6940, lng: 135.5115, tag: ['賞櫻', '遊船', '季節限定', '必去']
  },
  {
    id: 25, region: '大阪城週邊', name: '大阪歷史博物館',
    url: 'https://www.osakamushis.jp/',
    img: 'https://osaka-amazing-pass.com/resource/img/free_26.jpg',
    access: 'Osaka Metro 谷町四丁目(T23,C18)',
    hours: '9:30～17:00（最後入館16:30）', holiday: '週二',
    priceJPY: 600, priceHKD: 32,
    desc: '以10層樓展示從古代到近代大阪歷史，可從高層眺望大阪城天守閣，極具視覺震撼力。',
    lat: 34.6837, lng: 135.5235, tag: ['文化', '歷史', '博物館']
  },
  {
    id: 26, region: '大阪城週邊', name: '大阪和平館',
    url: 'http://www.peace-osaka.or.jp/',
    img: 'https://osaka-amazing-pass.com/resource/img/free_27.jpg',
    access: 'Osaka Metro 森之宮(C19,N20)、谷町四丁目(T23,C18)',
    hours: '9:30～17:00', holiday: '週一',
    priceJPY: 250, priceHKD: 13,
    desc: '以照片和影像記錄大阪空襲等二戰歷史，呼籲和平的紀念館，讓人深思歷史。',
    lat: 34.6800, lng: 135.5284, tag: ['歷史', '文化', '教育']
  },
  // ===== 天保山・南港海灣 =====
  {
    id: 27, region: '天保山・南港海灣', name: '天保山大摩天輪',
    url: 'http://tempozan-kanransya.com/',
    img: 'https://osaka-amazing-pass.com/resource/img/free_28.jpg',
    access: 'Osaka Metro 大阪港(C11)',
    hours: '平日10:00～21:00，週六日及假日10:00～22:00', holiday: '不定期',
    priceJPY: 900, priceHKD: 48,
    desc: '曾是世界最大摩天輪（112.5米），設有全透明玻璃廂，在天保山海港上空俯瞰大阪灣。',
    lat: 34.6549, lng: 135.4405, tag: ['遊樂', '景觀', '海港']
  },
  {
    id: 28, region: '天保山・南港海灣', name: '帆船型觀光船 聖瑪麗亞號 白天遊覽',
    url: 'https://suijo-bus.osaka/language/santamaria/',
    img: 'https://osaka-amazing-pass.com/resource/img/free_29.jpg',
    access: 'Osaka Metro 大阪港(C11)',
    hours: '11:00～16:00（每整點出發）', holiday: '不定期',
    priceJPY: 1800, priceHKD: 95,
    desc: '仿哥倫布號聖瑪利亞號的大型帆船，遊覽大阪港及海灣，欣賞阿倍野海洋公園附近風光。',
    lat: 34.6545, lng: 135.4408, tag: ['遊船', '海港', '觀光']
  },
  {
    id: 29, region: '天保山・南港海灣', name: '帆船型觀光船 聖瑪麗亞號 黃昏遊覽',
    url: 'https://suijo-bus.osaka/language/santamaria/',
    img: 'https://osaka-amazing-pass.com/resource/img/free_30.jpg',
    access: 'Osaka Metro 大阪港(C11)',
    hours: '依季節不同：16:30～19:00', holiday: '週六日限定',
    priceJPY: 2300, priceHKD: 122,
    desc: '黃昏時分乘坐帆船型觀光船，欣賞夕陽西下時大阪港的壯麗景色，浪漫非凡。',
    lat: 34.6543, lng: 135.4412, tag: ['遊船', '夕陽', '浪漫', '季節限定']
  },
  {
    id: 30, region: '天保山・南港海灣', name: '船長線（Captain Line）',
    url: 'http://www.mmjp.or.jp/Capt-Line/',
    img: 'https://osaka-amazing-pass.com/resource/img/free_31.jpg',
    access: 'Osaka Metro 大阪港(C11) / USJ 環球影城港灣',
    hours: '9:45～18:00', holiday: '不定期',
    priceJPY: 1700, priceHKD: 90,
    desc: '連接海遊館（天保山）與USJ（環球影城）的水上交通船，便捷遊覽兩大景點。',
    lat: 34.6550, lng: 135.4400, tag: ['交通', '遊船', '資訊']
  },
  {
    id: 31, region: '天保山・南港海灣', name: 'LEGOLAND® Discovery Center Osaka',
    url: 'https://osaka.legolanddiscoverycenter.jp/',
    img: 'https://osaka-amazing-pass.com/resource/img/free_32.jpg',
    access: 'Osaka Metro 大阪港(C11)',
    hours: '平日10:00～18:00，週六日10:00～19:00（需預約）', holiday: '不定期',
    priceJPY: 3300, priceHKD: 175,
    desc: '天保山Market Place內的樂高探索中心，以樂高積木重現大阪城等景點，適合家庭遊覽。',
    lat: 34.6543, lng: 135.4402, tag: ['家庭', '親子', '室內']
  },
  {
    id: 32, region: '天保山・南港海灣', name: 'GLION MUSEUM',
    url: 'https://glion-museum.jp/',
    img: 'https://osaka-amazing-pass.com/resource/img/free_33.jpg',
    access: 'Osaka Metro 大阪港(C11)',
    hours: '11:00～17:00', holiday: '週一',
    priceJPY: 1300, priceHKD: 69,
    desc: '大阪港舉足輕重的古董汽車博物館，收藏超過60輛豪華古董名車，展場設計極具格調。',
    lat: 34.6565, lng: 135.4430, tag: ['博物館', '車迷', '特色']
  },
  {
    id: 33, region: '天保山・南港海灣', name: '咲洲宇宙塔展望台',
    url: 'https://sakishima-observatory.com/',
    img: 'https://osaka-amazing-pass.com/resource/img/free_34.jpg',
    access: 'Osaka Metro 貿易中心前(P10)',
    hours: '11:00～22:00（最後入場21:30）', holiday: '週一',
    priceJPY: 1200, priceHKD: 64,
    desc: '大阪咲洲宇宙塔（252米）展望台，可遠眺大阪灣、明石大橋甚至淡路島，日夜景色壯麗。',
    lat: 34.6480, lng: 135.4204, tag: ['景觀', '展望台', '夜景']
  },
  // ===== 其他地區 =====
  {
    id: 34, region: '其他地區', name: '鮮花競放館',
    url: 'https://www.sakuyakonohana.jp/chinese/',
    img: 'https://osaka-amazing-pass.com/resource/img/free_35.jpg',
    access: 'Osaka Metro 鶴見綠地(N26)',
    hours: '10:00～17:00（最後入館16:30）', holiday: '週一',
    priceJPY: 500, priceHKD: 27,
    desc: '大阪鶴見綠地公園內的植物館，分熱帶、寒帶等多個展館，常年花開四季，有熱帶大溫室。',
    lat: 34.6864, lng: 135.5624, tag: ['自然', '植物', '公園']
  },
  {
    id: 35, region: '其他地區', name: '大阪市立自然史博物館',
    url: 'https://omnh.jp/language/zh-tw/',
    img: 'https://osaka-amazing-pass.com/resource/img/free_36.jpg',
    access: 'Osaka Metro 長居(M26)',
    hours: '3月～10月：9:30～17:00，11月～2月：9:30～16:30', holiday: '週一',
    priceJPY: 300, priceHKD: 16,
    desc: '以地球生命史、大阪自然環境為主題，設有恐龍骨架、長居植物園入場包含在內。',
    lat: 34.6218, lng: 135.5218, tag: ['博物館', '自然', '教育']
  },
  {
    id: 36, region: '其他地區', name: '大阪市立長居植物園',
    url: 'https://botanical-garden.nagai-park.jp/',
    img: 'https://osaka-amazing-pass.com/resource/img/free_37.jpg',
    access: 'Osaka Metro 長居(M26)',
    hours: '3月～10月：9:30～17:00，11月～2月：9:30～16:30', holiday: '週一',
    priceJPY: 300, priceHKD: 16,
    desc: '長居公園內的大型植物園，種植約1,200種植物，是大阪市民最愛的賞花散步場所。',
    lat: 34.6215, lng: 135.5214, tag: ['自然', '公園', '放鬆']
  },
  {
    id: 37, region: '其他地區', name: '堺利晶之杜',
    url: 'http://www.sakai-rishonomori.com/',
    img: 'https://osaka-amazing-pass.com/resource/img/free_38.jpg',
    access: '南海「堺」',
    hours: '9:00～18:00（茶之湯體驗10:00～17:00）', holiday: '每月第3個週二',
    priceJPY: 300, priceHKD: 16,
    desc: '堺市紀念茶道宗師千利休及連歌詩人山上宗二的文化設施，可體驗正宗茶道。',
    lat: 34.5733, lng: 135.4845, tag: ['文化', '茶道', '體驗']
  },
  {
    id: 38, region: '其他地區', name: '堺市博物館',
    url: 'http://www.city.sakai.lg.jp/kanko/hakubutsukan/',
    img: 'https://osaka-amazing-pass.com/resource/img/free_39.jpg',
    access: '南海「堺東」',
    hours: '9:30～17:15（最後入館16:30）', holiday: '翻新工程中，至2026年3月31日',
    priceJPY: 200, priceHKD: 11,
    desc: '堺市歷史、文化財博物館，收藏古墳時代文物，介紹千利休、與謝野晶子等大阪名人。',
    lat: 34.5735, lng: 135.4844, tag: ['歷史', '博物館', '文化']
  },
  // ===== 單軌電車區域 =====
  {
    id: 39, region: '單軌電車區域', name: '萬博紀念公園',
    url: 'https://www.expo70-park.jp/languages/english/',
    img: 'https://osaka-amazing-pass.com/resource/img/free_40.jpg',
    access: '大阪單軌電車 萬博紀念公園站',
    hours: '9:30～17:00（最後入館16:30）', holiday: '週三',
    priceJPY: 260, priceHKD: 14,
    desc: '1970年大阪世博會歷史遺址，岡本太郎設計的太陽之塔巍然矗立，公園四季花卉繽紛。',
    lat: 34.8094, lng: 135.5387, tag: ['公園', '歷史', '地標']
  },
  {
    id: 40, region: '單軌電車區域', name: 'OSAKA WHEEL',
    url: 'https://osaka-wheel.com/',
    img: 'https://osaka-amazing-pass.com/resource/img/free_41.jpg',
    access: '大阪單軌電車 萬博紀念公園站',
    hours: '平日11:00～20:00，週六日及假日11:00～21:00', holiday: '維護期',
    priceJPY: 1000, priceHKD: 53,
    desc: '萬博紀念公園旁的現代摩天輪，坐擁360度全景，伴著太陽之塔的雄姿俯瞰大阪。',
    lat: 34.8094, lng: 135.5394, tag: ['遊樂', '景觀', '現代']
  },
  // ===== 南地區 新世界・天王寺（遺漏補回） =====
  {
    id: 42, region: '南地區・新世界天王寺', name: '大阪市立美術館',
    url: 'https://www.osaka-art-museum.jp/zh-tw/',
    img: 'https://osaka-amazing-pass.com/resource/img/free_17.jpg',
    access: 'Osaka Metro 動物園前(M22,K19)、天王寺(M23,T27)、惠美須町(K18)',
    hours: '9:30～17:00（最後入館16:30）', holiday: '週一',
    priceJPY: 500, priceHKD: 27,
    desc: '位於天王寺公園內的大阪市立美術館，收藏日本、中國繪畫與雕刻等東洋美術精品，免費入場限常設展。',
    lat: 34.6488, lng: 135.5080, tag: ['藝術', '博物館', '文化']
  },
  // ===== 天保山・特別推薦（非周遊卡免費） =====
  {
    id: 41, region: '天保山・南港海灣', name: '大阪海遊館（Kaiyukan 水族館）',
    url: 'https://www.kaiyukan.com/',
    img: 'https://www.kaiyukan.com/seascape_namima/img/kv_pc.jpg',
    access: 'Osaka Metro 大阪港(C11) 步行5分鐘',
    hours: '10:00～20:00（最終入場19:00）※時間因日期而異，建議官網確認', holiday: '不定期（年中無休為原則）',
    priceJPY: 2700, priceHKD: 143,
    desc: '世界最大級水族館之一！以「太平洋環形火山帶」為主題，8層樓展示海洋生態。最大亮點為可容納5,400噸海水的太平洋大魚缸，可近距離欣賞鯨鯊、蝠鱝等龐然大物悠游其中。另設有海豚、海狗、企鵝等多個互動展示區，是天保山必遊之地。注意：本館不包含在大阪周遊卡免費景點內，需購票入場。',
    lat: 34.6548, lng: 135.4283,
    tag: ['水族館', '必去', '家庭', '親子', '打卡', '室內']
  }
];
