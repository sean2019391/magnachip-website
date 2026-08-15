export type Locale = 'en' | 'ko' | 'zh' | 'ja' | 'de';

export const locales: Locale[] = ['en', 'ko', 'zh', 'ja', 'de'];

export const localeLabels: Record<Locale, string> = {
  en: 'English',
  ko: '한국어',
  zh: '中文',
  ja: '日本語',
  de: 'Deutsch',
};

export type TranslationKeys = {
  nav: {
    products: string;
    applications: string;
    designResources: string;
    aboutUs: string;
    search: string;
  };
  hero: {
    tagline: string;
    title1: string;
    title2: string;
    desc: string;
    cta1: string;
    cta2: string;
  };
  metrics: { value: string; label: string }[];
  products: {
    sectionTag: string;
    sectionTitle: string;
    sectionDesc: string;
    items: { category: string; title: string; desc: string; tag: string | null }[];
  };
  about: {
    sectionTag: string;
    sectionTitle: string;
    p1: string;
    p2: string;
    since: string;
  };
  news: {
    sectionTag: string;
    sectionTitle: string;
    items: { date: string; title: string; desc: string }[];
  };
  cta: {
    title: string;
    desc: string;
    btn1: string;
    btn2: string;
  };
  footer: {
    desc: string;
    contactUs: string;
    productsTitle: string;
    companyTitle: string;
    investorsTitle: string;
    products: string[];
    company: string[];
    investors: { label: string; href: string | null }[];
    copyright: string;
    privacy: string;
    terms: string;
    cookies: string;
  };
};

const en: TranslationKeys = {
  nav: {
    products: 'Products',
    applications: 'Applications',
    designResources: 'Design Resources',
    aboutUs: 'About Us',
    search: 'Search',
  },
  hero: {
    tagline: 'Powering Magnificent Moments',
    title1: 'Innovative Power',
    title2: 'Semiconductor Solutions',
    desc: 'Making devices smarter, smaller, faster — and greener. Industry-leading MOSFET, Power IC, and SiC technologies for computing, automotive, and industrial applications.',
    cta1: 'Explore Products',
    cta2: 'About MagnaChip',
  },
  metrics: [
    { value: '50+', label: 'Years of Innovation' },
    { value: '3,500+', label: 'Employees Worldwide' },
    { value: '1B+', label: 'Products Shipped Annually' },
    { value: '9', label: 'Global Design Centers' },
  ],
  products: {
    sectionTag: 'Products',
    sectionTitle: 'Power. Control. Efficiency.',
    sectionDesc:
      'From discrete power transistors to fully integrated power management ICs — our portfolio enables the next generation of energy-efficient electronics.',
    items: [
      {
        category: 'Power Solutions',
        title: 'MXT MOSFETs',
        desc: 'Industry-leading trench MOSFET technology delivering ultra-low RDS(on) for high-efficiency power conversion in computing, telecom, and industrial applications.',
        tag: 'Flagship',
      },
      {
        category: 'Power Solutions',
        title: 'SiC MOSFETs',
        desc: 'Silicon Carbide devices for high-voltage, high-temperature operations. Ideal for EV drivetrains, solar inverters, and industrial power supplies.',
        tag: 'Next Gen',
      },
      {
        category: 'Power Solutions',
        title: 'Super Junction MOSFETs',
        desc: 'High-voltage trench MOSFETs optimized for server power supplies, industrial SMPS, and AC-DC converters requiring peak efficiency.',
        tag: null,
      },
      {
        category: 'Power ICs',
        title: 'Motor Driver ICs',
        desc: 'Integrated motor driver solutions for washing machines, air conditioners, and industrial motor control with built-in protection features.',
        tag: null,
      },
      {
        category: 'Automotive',
        title: 'Automotive-Grade MOSFETs',
        desc: 'AEC-Q101 qualified power devices engineered for automotive power distribution, LED lighting, and body electronics.',
        tag: 'AEC-Q101',
      },
      {
        category: 'Power Solutions',
        title: 'IGBTs',
        desc: 'Insulated-gate bipolar transistors for high-power applications including EV charging, induction heating, and industrial motor drives.',
        tag: null,
      },
    ],
  },
  about: {
    sectionTag: 'About Us',
    sectionTitle: 'Semiconductor Excellence Since 1971',
    p1: 'MagnaChip Semiconductor is a leading designer and manufacturer of analog and mixed-signal semiconductor products. Headquartered in Seoul, South Korea, with global design centers and manufacturing facilities across Asia.',
    p2: 'Our power semiconductor solutions are critical enablers in the transition to energy-efficient technologies — from electric vehicles and renewable energy systems to 5G infrastructure and smart consumer devices.',
    since: 'Since 1971',
  },
  news: {
    sectionTag: 'Newsroom',
    sectionTitle: 'Latest Updates',
    items: [
      {
        date: 'Jul 2026',
        title: 'MagnaChip Expands SiC Portfolio with 1200V MOSFETs',
        desc: 'New silicon carbide devices target EV onboard chargers and industrial power conversion with industry-leading efficiency.',
      },
      {
        date: 'Jun 2026',
        title: 'Q2 Revenue Growth Driven by Automotive Demand',
        desc: 'Strong demand for AEC-Q101 qualified power MOSFETs in EV and ADAS applications drove double-digit revenue growth.',
      },
      {
        date: 'May 2026',
        title: 'New 300mm Wafer Fab Construction Begins',
        desc: 'MagnaChip breaks ground on a state-of-the-art 300mm wafer fabrication facility to expand power semiconductor production capacity.',
      },
    ],
  },
  cta: {
    title: 'Ready to Power Your Next Innovation?',
    desc: 'Connect with our engineering team to discuss how MagnaChip solutions can optimize your next design.',
    btn1: 'Contact Sales',
    btn2: 'View Product Catalog',
  },
  footer: {
    desc: 'Powering Magnificent Moments. Innovative semiconductor solutions for a smarter, smaller, faster world.',
    contactUs: 'Contact Us',
    productsTitle: 'Products',
    companyTitle: 'Company',
    investorsTitle: 'Investors',
    products: ['Power Solutions', 'Power ICs', 'Automotive Solutions', 'Silicon Carbide (SiC)'],
    company: ['About Us', 'Corporate Responsibility', 'Newsroom', 'Contact'],
    investors: [
      { label: 'Investor Relations ↗', href: 'https://investors.magnachip.com/' },
      { label: 'Financial Reports', href: null },
      { label: 'Stock Information', href: null },
    ],
    copyright: '© 2026 Magnachip Semiconductor Corporation. All rights reserved.',
    privacy: 'Privacy Policy',
    terms: 'Terms of Use',
    cookies: 'Cookie Policy',
  },
};

const ko: TranslationKeys = {
  nav: {
    products: '제품',
    applications: '응용',
    designResources: '설계 지원',
    aboutUs: '회사 소개',
    search: '검색',
  },
  hero: {
    tagline: '위대한 순간을 위한 동력',
    title1: '혁신적인 전력',
    title2: '반도체 솔루션',
    desc: '더 스마트하고, 더 작고, 더 빠르고, 더 친환경적인. 컴퓨팅, 자동차, 산업용 차세대 전력 반도체 기술을 선도합니다.',
    cta1: '제품 살펴보기',
    cta2: '회사 소개',
  },
  metrics: [
    { value: '50+', label: '혁신의 역사' },
    { value: '3,500+', label: '전 세계 임직원' },
    { value: '10억+', label: '연간 출하량' },
    { value: '9', label: '글로벌 설계 센터' },
  ],
  products: {
    sectionTag: '제품',
    sectionTitle: '전력. 제어. 효율.',
    sectionDesc:
      '개별 전력 트랜지스터부터 완전 통합 전력 관리 IC까지 — 차세대 에너지 효율 전자제품을 위한 포트폴리오.',
    items: [
      {
        category: '전력 솔루션',
        title: 'MXT MOSFET',
        desc: '컴퓨팅, 통신, 산업용 고효율 전력 변환을 위한 초저 저항 트렌치 MOSFET 기술.',
        tag: '플래그십',
      },
      {
        category: '전력 솔루션',
        title: 'SiC MOSFET',
        desc: 'EV 구동, 태양광 인버터, 산업용 전원을 위한 고전압·고온 실리카이드 탄화물 소자.',
        tag: '차세대',
      },
      {
        category: '전력 솔루션',
        title: '슈퍼 정션 MOSFET',
        desc: '서버 전원, 산업용 SMPS, 고효율 AC-DC 컨버터용 고전압 트렌치 MOSFET.',
        tag: null,
      },
      {
        category: '전력 IC',
        title: '모터 드라이버 IC',
        desc: '세탁기, 에어컨, 산업용 모터 제어를 위한 내장 보호 기능 통합 모터 드라이버.',
        tag: null,
      },
      {
        category: '자동차',
        title: '자동차용 MOSFET',
        desc: '자동차 전력 배전, LED 조명, 차체 전자장치용 AEC-Q101 인증 전력 소자.',
        tag: 'AEC-Q101',
      },
      {
        category: '전력 솔루션',
        title: 'IGBT',
        desc: 'EV 충전, 유도 가열, 산업용 모터 드라이브를 위한 절연 게이트 바이폴라 트랜지스터.',
        tag: null,
      },
    ],
  },
  about: {
    sectionTag: '회사 소개',
    sectionTitle: '1971년부터 이어온 반도체 명가',
    p1: 'MagnaChip 반도체는 아날로그 및 혼합 신호 반도체 제품의 선도적 설계·제조 기업입니다. 서울 본사를 중심으로 아시아 전역에 글로벌 설계 센터와 생산 시설을 운영하고 있습니다.',
    p2: '전력 반도체 솔루션은 전기차, 재생에너지 시스템, 5G 인프라, 스마트 가전에 이르기까지 에너지 효율 기술 전환의 핵심 역할을 수행합니다.',
    since: '1971년부터',
  },
  news: {
    sectionTag: '뉴스룸',
    sectionTitle: '최신 소식',
    items: [
      {
        date: '2026.07',
        title: 'MagnaChip, 1200V SiC MOSFET 포트폴리오 확대',
        desc: 'EV onboard charger 및 산업용 전력 변환을 위한 고효율 실리카이드 탄화물 소자 출시.',
      },
      {
        date: '2026.06',
        title: '자동차 수요 견인, 2분기 매출 성장',
        desc: 'EV 및 ADAS 응용 분야의 AEC-Q101 인증 전력 MOSFET 수요 증가로 두 자릿수 매출 성장 달성.',
      },
      {
        date: '2026.05',
        title: '300mm 웨이퍼 팩토리 착공',
        desc: '전력 반도체 생산 능력 확대를 위한 최신 300mm 웨이퍼 제조 시설 착공식 개최.',
      },
    ],
  },
  cta: {
    title: '다음 혁신에 전력을 공급할 준비가 되셨나요?',
    desc: 'MagnaChip 솔루션이 귀하의 차세대 설계를 어떻게 최적화할 수 있는지 엔지니어링 팀과 상담하십시오.',
    btn1: '영업팀 문의',
    btn2: '제품 카탈로그 보기',
  },
  footer: {
    desc: '위대한 순간을 위한 동력. 더 스마트하고, 작고, 빠른 세계를 위한 혁신적인 반도체 솔루션.',
    contactUs: '문의하기',
    productsTitle: '제품',
    companyTitle: '회사',
    investorsTitle: '투자자',
    products: ['전력 솔루션', '전력 IC', '자동차 솔루션', '실리카이드 탄화물 (SiC)'],
    company: ['회사 소개', '기업 책임', '뉴스룸', '문의'],
    investors: [
      { label: '투자자 관계 ↗', href: 'https://investors.magnachip.com/' },
      { label: '재무 보고서', href: null },
      { label: '주식 정보', href: null },
    ],
    copyright: '© 2026 Magnachip Semiconductor Corporation. All rights reserved.',
    privacy: '개인정보 처리방침',
    terms: '이용약관',
    cookies: '쿠키 정책',
  },
};

const zh: TranslationKeys = {
  nav: {
    products: '产品',
    applications: '应用',
    designResources: '设计资源',
    aboutUs: '关于我们',
    search: '搜索',
  },
  hero: {
    tagline: '驱动卓越时刻',
    title1: '创新功率',
    title2: '半导体解决方案',
    desc: '让设备更智能、更小、更快、更节能。引领计算、汽车和工业应用的MOSFET、电源IC和碳化硅技术。',
    cta1: '探索产品',
    cta2: '关于MagnaChip',
  },
  metrics: [
    { value: '50+', label: '年创新历程' },
    { value: '3,500+', label: '全球员工' },
    { value: '10亿+', label: '年出货量' },
    { value: '9', label: '全球设计中心' },
  ],
  products: {
    sectionTag: '产品',
    sectionTitle: '功率·控制·效率',
    sectionDesc: '从分立功率晶体管到完全集成的电源管理IC——助力下一代节能电子产品。',
    items: [
      {
        category: '功率解决方案',
        title: 'MXT MOSFET',
        desc: '行业领先的沟槽MOSFET技术，为计算、电信和工业应用提供超低导通电阻的高效功率转换。',
        tag: '旗舰',
      },
      {
        category: '功率解决方案',
        title: 'SiC MOSFET',
        desc: '适用于高压高温工作的碳化硅器件。理想用于电动汽车驱动、太阳能逆变器和工业电源。',
        tag: '下一代',
      },
      {
        category: '功率解决方案',
        title: '超结MOSFET',
        desc: '专为服务器电源、工业SMPS和高效AC-DC转换器优化的高压沟槽MOSFET。',
        tag: null,
      },
      {
        category: '电源IC',
        title: '电机驱动IC',
        desc: '集成电机驱动方案，适用于洗衣机、空调和工业电机控制，内建保护功能。',
        tag: null,
      },
      {
        category: '汽车',
        title: '汽车级MOSFET',
        desc: 'AEC-Q101认证功率器件，专为汽车配电、LED照明和车身电子设计。',
        tag: 'AEC-Q101',
      },
      {
        category: '功率解决方案',
        title: 'IGBT',
        desc: '用于电动汽车充电、感应加热和工业电机驱动等大功率应用的绝缘栅双极型晶体管。',
        tag: null,
      },
    ],
  },
  about: {
    sectionTag: '关于我们',
    sectionTitle: '自1971年以来的半导体卓越品质',
    p1: 'MagnaChip半导体是模拟和混合信号半导体产品的领先设计和制造商。总部位于韩国首尔，在亚洲设有全球设计中心和制造工厂。',
    p2: '我们的功率半导体解决方案是能源高效技术转型的关键推动者——从电动汽车和可再生能源系统到5G基础设施和智能消费设备。',
    since: '自1971年',
  },
  news: {
    sectionTag: '新闻中心',
    sectionTitle: '最新动态',
    items: [
      {
        date: '2026年7月',
        title: 'MagnaChip扩展1200V SiC MOSFET产品组合',
        desc: '新型碳化硅器件针对电动汽车车载充电器和工业功率转换，实现行业领先的效率。',
      },
      {
        date: '2026年6月',
        title: '汽车需求推动第二季度营收增长',
        desc: '电动汽车和ADAS应用中AEC-Q101认证功率MOSFET的强劲需求推动了两位数营收增长。',
      },
      {
        date: '2026年5月',
        title: '300mm晶圆工厂开工建设',
        desc: 'MagnaChip为扩大功率半导体产能，正式开工建设先进的300mm晶圆制造设施。',
      },
    ],
  },
  cta: {
    title: '准备好为下一个创新提供动力了吗？',
    desc: '与我们的工程团队联系，讨论MagnaChip解决方案如何优化您的下一个设计。',
    btn1: '联系销售',
    btn2: '查看产品目录',
  },
  footer: {
    desc: '驱动卓越时刻。为更智能、更小、更快的世界提供创新半导体解决方案。',
    contactUs: '联系我们',
    productsTitle: '产品',
    companyTitle: '公司',
    investorsTitle: '投资者',
    products: ['功率解决方案', '电源IC', '汽车解决方案', '碳化硅 (SiC)'],
    company: ['关于我们', '企业责任', '新闻中心', '联系我们'],
    investors: [
      { label: '投资者关系 ↗', href: 'https://investors.magnachip.com/' },
      { label: '财务报告', href: null },
      { label: '股票信息', href: null },
    ],
    copyright: '© 2026 Magnachip Semiconductor Corporation. 版权所有。',
    privacy: '隐私政策',
    terms: '使用条款',
    cookies: 'Cookie政策',
  },
};

const ja: TranslationKeys = {
  nav: {
    products: '製品',
    applications: 'アプリケーション',
    designResources: '設計リソース',
    aboutUs: '会社概要',
    search: '検索',
  },
  hero: {
    tagline: '素晴らしい瞬間を支える',
    title1: '革新的な電力',
    title2: '半導体ソリューション',
    desc: 'よりスマートに、より小さく、より速く、よりグリーンに。コンピューティング、自動車、産業向けの先進的なMOSFET、電源IC、SiC技術をリードします。',
    cta1: '製品を見る',
    cta2: '会社概要',
  },
  metrics: [
    { value: '50+', label: '年のイノベーション' },
    { value: '3,500+', label: '世界の従業員' },
    { value: '10億+', label: '年間出荷量' },
    { value: '9', label: 'グローバル設計センター' },
  ],
  products: {
    sectionTag: '製品',
    sectionTitle: '電力·制御·効率',
    sectionDesc:
      '個別パワートランジスタから完全統合パワーマネジメントICまで——次世代の省エネエレクトロニクスを支えるポートフォリオ。',
    items: [
      {
        category: '電力ソリューション',
        title: 'MXT MOSFET',
        desc: 'コンピューティング、通信、産業向けの超高効率電力変換を実現する業界最先端のトレンチMOSFET技術。',
        tag: 'フラッグシップ',
      },
      {
        category: '電力ソリューション',
        title: 'SiC MOSFET',
        desc: 'EVドライブ、ソーラーインバーター、産業用電源に最適な高電圧・高温対応の炭化ケイ素デバイス。',
        tag: '次世代',
      },
      {
        category: '電力ソリューション',
        title: 'スーパージャンクションMOSFET',
        desc: 'サーバー電源、産業用SMPS、高効率AC-DCコンバータ向けに最適化された高電圧トレンチMOSFET。',
        tag: null,
      },
      {
        category: '電源IC',
        title: 'モータードライバIC',
        desc: '洗濯機、エアコン、産業用モータ制御向けの内蔵保護機能付き統合モータードライバ。',
        tag: null,
      },
      {
        category: '自動車',
        title: '自動車用MOSFET',
        desc: '自動車電力配分、LED照明、ボディエレクトロニクス向けのAEC-Q101認証パワーデバイス。',
        tag: 'AEC-Q101',
      },
      {
        category: '電力ソリューション',
        title: 'IGBT',
        desc: 'EV充電、誘導加熱、産業用モータードライブ向けの絶縁ゲートバイポーラトランジスタ。',
        tag: null,
      },
    ],
  },
  about: {
    sectionTag: '会社概要',
    sectionTitle: '1971年からの半導体の卓越',
    p1: 'MagnaChip半導体は、アナログおよびミックスドシグナル半導体製品のリーディングデザイナーおよびメーカーです。ソウルに本社を置き、アジア各地にグローバル設計センターと製造施設を展開しています。',
    p2: '当社のパワーハーフ導体ソリューションは、電気自動車や再生可能エネルギーから5Gインフラ、スマート家電に至るまで、省エネ技術への転換を支える重要な推進力です。',
    since: '1971年〜',
  },
  news: {
    sectionTag: 'ニュースルーム',
    sectionTitle: '最新情報',
    items: [
      {
        date: '2026年7月',
        title: 'MagnaChip、1200V SiC MOSFETポートフォリオを拡大',
        desc: 'EV車載充電器および産業用電力変換をターゲットとした次世代炭化ケイ素デバイス。',
      },
      {
        date: '2026年6月',
        title: '自動車需要に牽引される第2四半期の収益成長',
        desc: 'EVおよびADAS向けAEC-Q101認証パワーモスフェットの強い需要により二桁収益成長を達成。',
      },
      {
        date: '2026年5月',
        title: '300mmウェーパーファブリケーション着工',
        desc: 'パワーハーフ導体生産能力拡大のため、最先端の300mmウェーパー製造施設の建設を開始。',
      },
    ],
  },
  cta: {
    title: '次のイノベーションに電力を供給しますか？',
    desc: 'MagnaChipソリューションがお客様の次世代設計をどのように最適化できるか、エンジニアリングチームにご相談ください。',
    btn1: '営業に連絡',
    btn2: '製品カタログを見る',
  },
  footer: {
    desc: '素晴らしい瞬間を支える。よりスマートに、小さく、速い世界のための革新的な半導体ソリューション。',
    contactUs: 'お問い合わせ',
    productsTitle: '製品',
    companyTitle: '会社',
    investorsTitle: '投資家',
    products: ['電力ソリューション', '電源IC', '自動車ソリューション', '炭化ケイ素 (SiC)'],
    company: ['会社概要', '企業責任', 'ニュースルーム', 'お問い合わせ'],
    investors: [
      { label: '投資家向け情報 ↗', href: 'https://investors.magnachip.com/' },
      { label: '財務報告書', href: null },
      { label: '株式情報', href: null },
    ],
    copyright: '© 2026 Magnachip Semiconductor Corporation. All rights reserved.',
    privacy: 'プライバシーポリシー',
    terms: '利用規約',
    cookies: 'Cookieポリシー',
  },
};

const de: TranslationKeys = {
  nav: {
    products: 'Produkte',
    applications: 'Anwendungen',
    designResources: 'Design-Ressourcen',
    aboutUs: 'Über uns',
    search: 'Suche',
  },
  hero: {
    tagline: 'Großartige Momente antreiben',
    title1: 'Innovative Leistungs-',
    title2: 'Halbleiterlösungen',
    desc: 'Intelligenter, kleiner, schneller und umweltfreundlicher. Branchenführende MOSFET-, Power-IC- und SiC-Technologien für Computing-, Automobil- und Industrieanwendungen.',
    cta1: 'Produkte entdecken',
    cta2: 'Über MagnaChip',
  },
  metrics: [
    { value: '50+', label: 'Jahre Innovation' },
    { value: '3.500+', label: 'Mitarbeiter weltweit' },
    { value: '1 Mrd.+', label: 'Jährlich versandete Produkte' },
    { value: '9', label: 'Globale Designzentren' },
  ],
  products: {
    sectionTag: 'Produkte',
    sectionTitle: 'Leistung. Kontrolle. Effizienz.',
    sectionDesc:
      'Von diskreten Leistungstransistoren bis hin zu vollständig integrierten Power-Management-ICs — unser Portfolio ermöglicht die nächste Generation energieeffizienter Elektronik.',
    items: [
      {
        category: 'Leistungslösungen',
        title: 'MXT MOSFETs',
        desc: 'Branchenführende Trench-MOSFET-Technologie mit ultraniedrigem RDS(on) für hocheffiziente Energieumwandlung in Computing, Telekommunikation und Industrie.',
        tag: 'Flaggschiff',
      },
      {
        category: 'Leistungslösungen',
        title: 'SiC MOSFETs',
        desc: 'Siliziumkarbid-Bauelemente für Hochspannungs- und Hochtemperaturbetrieb. Ideal für E-Antriebe, Solarwechselrichter und Industrieantriebe.',
        tag: 'Next Gen',
      },
      {
        category: 'Leistungslösungen',
        title: 'Super-Junction MOSFETs',
        desc: 'Hochspannungs-Trench-MOSFETs optimiert für Servernetzteile, Industrie-SMPS und AC-DC-Wandler mit maximaler Effizienz.',
        tag: null,
      },
      {
        category: 'Power-ICs',
        title: 'Motortreiber-ICs',
        desc: 'Integrierte Motortreiberlösungen für Waschmaschinen, Klimaanlagen und industrielle Motorsteuerung mit integriertem Schutz.',
        tag: null,
      },
      {
        category: 'Automobil',
        title: 'Automotive-Grade MOSFETs',
        desc: 'AEC-Q101-zertifizierte Leistungsbauelemente für Automobil-Stromverteilung, LED-Beleuchtung und Karosserieelektronik.',
        tag: 'AEC-Q101',
      },
      {
        category: 'Leistungslösungen',
        title: 'IGBTs',
        desc: 'Isolierte-Gate-Bipolar-Transistoren für Hochleistungsanwendungen wie E-Ladung, Induktionsheizung und industrielle Antriebe.',
        tag: null,
      },
    ],
  },
  about: {
    sectionTag: 'Über uns',
    sectionTitle: 'Halbleiterexzellenz seit 1971',
    p1: 'MagnaChip Semiconductor ist ein führender Designer und Hersteller von Analog- und Mixed-Signal-Halbleiterprodukten. Mit Hauptsitz in Seoul, Südkorea, und globalen Designzentren und Produktionsstätten in ganz Asien.',
    p2: 'Unsere Leistungshalbleiterlösungen sind entscheidende Katalysatoren beim Übergang zu energieeffizienten Technologien — von Elektrofahrzeugen und erneuerbaren Energiesystemen über 5G-Infrastruktur bis hin zu smarten Verbraucherprodukten.',
    since: 'Seit 1971',
  },
  news: {
    sectionTag: 'Newsroom',
    sectionTitle: 'Neueste Updates',
    items: [
      {
        date: 'Juli 2026',
        title: 'MagnaChip erweitert SiC-Portfolio mit 1200V-MOSFETs',
        desc: 'Neue Siliziumkarbid-Bauelemente für E-Fahrzeug-Bordladegeräte und industrielle Energiewandlung mit branchenführender Effizienz.',
      },
      {
        date: 'Juni 2026',
        title: 'Umsatzwachstum im Q2 durch Automobilnachfrage',
        desc: 'Starke Nachfrage nach AEC-Q101-zertifizierten Leistungs-MOSFETs in E-Fahrzeug- und ADAS-Anwendungen führte zu zweistelligem Umsatzwachstum.',
      },
      {
        date: 'Mai 2026',
        title: 'Bau einer 300mm-Wafer-Fabrik beginnt',
        desc: 'MagnaChip bricht den Grundstein für eine hochmoderne 300mm-Wafer-Fertigungsanlage zur Erweiterung der Leistungshalbleiter-Kapazität.',
      },
    ],
  },
  cta: {
    title: 'Bereit, Ihre nächste Innovation mit Energie zu versorgen?',
    desc: 'Kontaktieren Sie unser Engineering-Team, um zu besprechen, wie MagnaChip-Lösungen Ihr nächstes Design optimieren können.',
    btn1: 'Vertrieb kontaktieren',
    btn2: 'Produktkatalog ansehen',
  },
  footer: {
    desc: 'Großartige Momente antreiben. Innovative Halbleiterlösungen für eine intelligentere, kleinere, schnellere Welt.',
    contactUs: 'Kontakt',
    productsTitle: 'Produkte',
    companyTitle: 'Unternehmen',
    investorsTitle: 'Investoren',
    products: ['Leistungslösungen', 'Power-ICs', 'Automotive-Lösungen', 'Siliziumkarbid (SiC)'],
    company: ['Über uns', 'Unternehmensverantwortung', 'Nachrichten', 'Kontakt'],
    investors: [
      { label: 'Investorenbeziehungen ↗', href: 'https://investors.magnachip.com/' },
      { label: 'Finanzberichte', href: null },
      { label: 'Aktieninformationen', href: null },
    ],
    copyright: '© 2026 Magnachip Semiconductor Corporation. Alle Rechte vorbehalten.',
    privacy: 'Datenschutzrichtlinie',
    terms: 'Nutzungsbedingungen',
    cookies: 'Cookie-Richtlinie',
  },
};

export const translations: Record<Locale, TranslationKeys> = { en, ko, zh, ja, de };
