import {
  User,
  Client,
  Location,
  Product,
  Campaign,
  Team,
  FormTemplate,
  Assignment,
  AttendanceRecord,
  FieldVisit,
  FieldIssue,
  AuditLogEntry
} from '../types';

export const KENYA_COUNTIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Kiambu', 
  'Machakos', 'Uasin Gishu', 'Meru', 'Kilifi', 'Nyeri', 
  'Kajiado', 'Kakamega', 'Bungoma', 'Kisii', 'Kericho'
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_admin_1',
    employeeCode: 'MIT-SYS-001',
    name: 'Dennis Mwangi',
    email: 'dennis.mwangi@metaintel.co.ke',
    phone: '+254 712 345 678',
    role: 'system_admin',
    isActive: true,
    assignedCampaignIds: ['cmp_eabl_01', 'cmp_safaricom_02', 'cmp_unilever_03'],
    lastLoginAt: '2026-10-02T13:42:00+03:00'
  },
  {
    id: 'usr_ops_1',
    employeeCode: 'MIT-OPS-002',
    name: 'Catherine Mutua',
    email: 'catherine.mutua@metaintel.co.ke',
    phone: '+254 722 987 654',
    role: 'ops_manager',
    isActive: true,
    assignedCampaignIds: ['cmp_eabl_01', 'cmp_safaricom_02', 'cmp_unilever_03'],
    lastLoginAt: '2026-10-02T14:10:00+03:00'
  },
  {
    id: 'usr_mgr_1',
    employeeCode: 'MIT-CMP-003',
    name: 'Brenda Chepkemoi',
    email: 'brenda.c@metaintel.co.ke',
    phone: '+254 733 112 233',
    role: 'campaign_manager',
    isActive: true,
    assignedCampaignIds: ['cmp_eabl_01', 'cmp_unilever_03'],
    lastLoginAt: '2026-10-02T15:02:00+03:00'
  },
  {
    id: 'usr_sup_1',
    employeeCode: 'MIT-SUP-004',
    name: 'Evans Ochieng',
    email: 'evans.ochieng@metaintel.co.ke',
    phone: '+254 720 445 566',
    role: 'supervisor',
    isActive: true,
    assignedCampaignIds: ['cmp_eabl_01', 'cmp_unilever_03'],
    assignedTeamId: 'team_nbi_west',
    territoryId: 'Nairobi West',
    lastLoginAt: '2026-10-02T15:20:00+03:00'
  },
  {
    id: 'usr_fa_1',
    employeeCode: 'MIT-AGT-101',
    name: 'Faith Wanjiku',
    email: 'faith.wanjiku@metaintel.co.ke',
    phone: '+254 701 556 677',
    role: 'field_agent',
    agentSubtype: 'brand_ambassador',
    supervisorId: 'usr_sup_1',
    supervisorName: 'Evans Ochieng',
    isActive: true,
    assignedCampaignIds: ['cmp_eabl_01'],
    assignedTeamId: 'team_nbi_west',
    lastLoginAt: '2026-10-02T16:01:00+03:00',
    currentDevice: {
      model: 'Samsung Galaxy A15',
      osVersion: 'Android 14',
      appVersion: 'v2.4.1',
      isDeviceTrusted: true
    }
  },
  {
    id: 'usr_fa_2',
    employeeCode: 'MIT-AGT-102',
    name: 'Kevin Omondi',
    email: 'kevin.omondi@metaintel.co.ke',
    phone: '+254 703 889 900',
    role: 'field_agent',
    agentSubtype: 'merchandiser',
    supervisorId: 'usr_sup_1',
    supervisorName: 'Evans Ochieng',
    isActive: true,
    assignedCampaignIds: ['cmp_unilever_03'],
    assignedTeamId: 'team_nbi_west',
    lastLoginAt: '2026-10-02T15:45:00+03:00',
    currentDevice: {
      model: 'Tecno Spark 20',
      osVersion: 'Android 13',
      appVersion: 'v2.4.1',
      isDeviceTrusted: true
    }
  },
  {
    id: 'usr_fa_3',
    employeeCode: 'MIT-AGT-103',
    name: 'David Kiprop',
    email: 'david.kiprop@metaintel.co.ke',
    phone: '+254 711 223 344',
    role: 'field_agent',
    agentSubtype: 'sales_rep',
    supervisorId: 'usr_sup_1',
    supervisorName: 'Evans Ochieng',
    isActive: true,
    assignedCampaignIds: ['cmp_safaricom_02'],
    assignedTeamId: 'team_nbi_west',
    lastLoginAt: '2026-10-02T14:30:00+03:00',
    currentDevice: {
      model: 'Infinix Hot 40',
      osVersion: 'Android 13',
      appVersion: 'v2.4.1',
      isDeviceTrusted: true
    }
  },
  {
    id: 'usr_cli_1',
    employeeCode: 'MIT-CLI-801',
    name: 'Patrick Kariuki',
    email: 'patrick.kariuki@eabl.com',
    phone: '+254 721 999 888',
    role: 'client_user',
    clientId: 'cli_eabl',
    clientName: 'East African Breweries PLC',
    isActive: true,
    assignedCampaignIds: ['cmp_eabl_01'],
    lastLoginAt: '2026-10-02T11:15:00+03:00'
  }
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli_eabl',
    code: 'EABL-KE',
    name: 'East African Breweries PLC',
    industry: 'Fast-Moving Consumer Goods (Beverages)',
    primaryContactName: 'Patrick Kariuki (Trade Marketing Lead)',
    email: 'patrick.kariuki@eabl.com',
    phone: '+254 20 866 4000',
    address: 'Ruaraka Industrial Area, Thika Road',
    county: 'Nairobi',
    status: 'active',
    activeCampaignsCount: 1,
    totalBudgetKes: 18500000,
    notes: 'Premium partner. Requires daily OSA audits and live photo watermarking for Matchday activations.',
    createdAt: '2025-01-10T09:00:00Z'
  },
  {
    id: 'cli_safaricom',
    code: 'SAF-TELCO',
    name: 'Safaricom PLC',
    industry: 'Telecommunications & Financial Services',
    primaryContactName: 'Grace Muthoni (Head of Trade Activations)',
    email: 'gmuthoni@safaricom.co.ke',
    phone: '+254 722 000 000',
    address: 'Safaricom House, Waiyaki Way',
    county: 'Nairobi',
    status: 'active',
    activeCampaignsCount: 1,
    totalBudgetKes: 24000000,
    notes: '5G Home Broadband modern trade experiential drives across Tier 1 malls.',
    createdAt: '2025-02-14T08:30:00Z'
  },
  {
    id: 'cli_unilever',
    code: 'UNI-FMCG',
    name: 'Unilever Kenya',
    industry: 'Personal & Home Care FMCG',
    primaryContactName: 'Samuel Gitau (National Modern Trade Merchandising Lead)',
    email: 'samuel.gitau@unilever.com',
    phone: '+254 20 690 2000',
    address: 'Commercial Street, Industrial Area',
    county: 'Nairobi',
    status: 'active',
    activeCampaignsCount: 1,
    totalBudgetKes: 14200000,
    notes: 'Strict planogram compliance and out-of-stock root cause reporting across modern trade.',
    createdAt: '2025-03-01T10:00:00Z'
  }
];

export const INITIAL_LOCATIONS: Location[] = [
  {
    id: 'loc_two_rivers',
    code: 'LOC-NBI-001',
    name: 'Carrefour Two Rivers Mall',
    category: 'modern_trade',
    county: 'Nairobi',
    subCounty: 'Westlands',
    town: 'Runda / Ruaka',
    address: 'Two Rivers Mall, Ground Floor Hypermarket Wing',
    latitude: -1.2128,
    longitude: 36.7972,
    geofenceRadiusMeters: 150,
    contactPerson: 'David Mutua (Floor Manager)',
    contactPhone: '+254 723 111 222',
    isActive: true,
    channelType: 'Tier 1 Hypermarket',
    averageComplianceScore: 94.5
  },
  {
    id: 'loc_quickmart_kilimani',
    code: 'LOC-NBI-002',
    name: 'QuickMart Supermarket Kilimani',
    category: 'modern_trade',
    county: 'Nairobi',
    subCounty: 'Dagoretti North',
    town: 'Kilimani',
    address: 'Chania Avenue, Off Argwings Kodhek Road',
    latitude: -1.2910,
    longitude: 36.7865,
    geofenceRadiusMeters: 100,
    contactPerson: 'Agnes Wambui (Stock Controller)',
    contactPhone: '+254 724 333 444',
    isActive: true,
    channelType: 'Supermarket Superstore',
    averageComplianceScore: 89.2
  },
  {
    id: 'loc_naivas_junction',
    code: 'LOC-NBI-003',
    name: 'Naivas Hypermarket Junction Mall',
    category: 'modern_trade',
    county: 'Nairobi',
    subCounty: 'Dagoretti South',
    town: 'Ngong Road',
    address: 'The Junction Mall, Ground Floor',
    latitude: -1.2982,
    longitude: 36.7624,
    geofenceRadiusMeters: 120,
    contactPerson: 'Jackson Kilonzo (Branch Merchandising Supervisor)',
    contactPhone: '+254 725 555 666',
    isActive: true,
    channelType: 'Tier 1 Hypermarket',
    averageComplianceScore: 92.0
  },
  {
    id: 'loc_kizito_lounge',
    code: 'LOC-NBI-004',
    name: 'Kizito Lounge & Grill Westlands',
    category: 'on_premise',
    county: 'Nairobi',
    subCounty: 'Westlands',
    town: 'Westlands',
    address: 'Woodvale Grove, Mpaka Road Junction',
    latitude: -1.2655,
    longitude: 36.8040,
    geofenceRadiusMeters: 80,
    contactPerson: 'Martin Otieno (General Manager)',
    contactPhone: '+254 726 777 888',
    isActive: true,
    channelType: 'High-Volume Lounge',
    averageComplianceScore: 96.0
  },
  {
    id: 'loc_cleanshelf_ruiru',
    code: 'LOC-KIA-005',
    name: 'Clean Shelf Supermarket Ruiru',
    category: 'modern_trade',
    county: 'Kiambu',
    subCounty: 'Ruiru',
    town: 'Ruiru CBD',
    address: 'Kamiti Road Corner, Opposite Ruiru Sub-County Offices',
    latitude: -1.1448,
    longitude: 36.9610,
    geofenceRadiusMeters: 90,
    contactPerson: 'Beatrice Ndunge (Floor Manager)',
    contactPhone: '+254 727 999 000',
    isActive: true,
    channelType: 'General Modern Trade',
    averageComplianceScore: 85.4
  },
  {
    id: 'loc_nyali_cinemax',
    code: 'LOC-MSA-006',
    name: 'Nyali Cinemax Mega Market',
    category: 'modern_trade',
    county: 'Mombasa',
    subCounty: 'Nyali',
    town: 'Nyali',
    address: 'Links Road, Nyali Cinemax Complex',
    latitude: -4.0321,
    longitude: 39.6842,
    geofenceRadiusMeters: 120,
    contactPerson: 'Hassan Said (Operations Head)',
    contactPhone: '+254 728 112 233',
    isActive: true,
    channelType: 'Coastal Modern Trade',
    averageComplianceScore: 91.8
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_guinness_500',
    brand: 'Guinness',
    category: 'Alcoholic Beverages',
    name: 'Guinness Foreign Extra Stout 500ml Returnable Glass Bottle',
    sku: 'EABL-GIN-500RGB',
    barcode: '616110001011',
    unit: 'Bottle',
    recommendedRetailPriceKes: 250,
    isActive: true
  },
  {
    id: 'prod_tusker_500',
    brand: 'Tusker',
    category: 'Alcoholic Beverages',
    name: 'Tusker Lager 500ml Bottle',
    sku: 'EABL-TSK-500RGB',
    barcode: '616110001028',
    unit: 'Bottle',
    recommendedRetailPriceKes: 230,
    isActive: true
  },
  {
    id: 'prod_saf_router',
    brand: 'Safaricom 5G',
    category: 'Hardware & Devices',
    name: 'Safaricom 5G Home Broadband Indoor WiFi-6 Router (Nokia)',
    sku: 'SAF-5G-RTR-W6',
    barcode: '616120005044',
    unit: 'Box Kit',
    recommendedRetailPriceKes: 9999,
    isActive: true
  },
  {
    id: 'prod_saf_airtime_1000',
    brand: 'Safaricom',
    category: 'Airtime & Services',
    name: 'Safaricom Scratch Card 1,000 KES Physical Voucher',
    sku: 'SAF-VO-1000',
    barcode: '616120001008',
    unit: 'Voucher',
    recommendedRetailPriceKes: 1000,
    isActive: true
  },
  {
    id: 'prod_omo_1kg',
    brand: 'Omo',
    category: 'Home Care',
    name: 'Omo Extra Power Hand Washing Powder Detergent 1kg Pouch',
    sku: 'UNI-OMO-1KG-EP',
    barcode: '616130009012',
    unit: '1kg Pouch',
    recommendedRetailPriceKes: 395,
    isActive: true
  },
  {
    id: 'prod_sunlight_400g',
    brand: 'Sunlight',
    category: 'Home Care',
    name: 'Sunlight Lemon Dishwashing Paste 400g Tub',
    sku: 'UNI-SUN-400G-DW',
    barcode: '616130004055',
    unit: 'Tub',
    recommendedRetailPriceKes: 180,
    isActive: true
  }
];

export const INITIAL_FORMS: FormTemplate[] = [
  {
    id: 'frm_eabl_matchday',
    title: 'Matchday Activation & Bar Audit Questionnaire',
    category: 'On-Premise Brand Activation',
    version: 1,
    isPublished: true,
    sections: ['Activation Setup & POSM', 'Stock & OSA Audit', 'Consumer Engagement & Sales'],
    questions: [
      {
        id: 'q1_posm_ready',
        section: 'Activation Setup & POSM',
        questionText: 'Is the official Guinness Matchday branding, table talkers & TV screen banner properly positioned?',
        questionType: 'yes_no',
        isRequired: true,
        scoreWeight: 20,
        helpText: 'Ensure branded counter mats and hanging banners are visible from main entrance.'
      },
      {
        id: 'q2_posm_photo',
        section: 'Activation Setup & POSM',
        questionText: 'Capture high-resolution photo of the main bar entrance branding and TV zone',
        questionType: 'photo',
        isRequired: true,
        scoreWeight: 15,
        conditionalOnQuestionId: 'q1_posm_ready',
        conditionalExpectedValue: 'true'
      },
      {
        id: 'q3_cold_stock',
        section: 'Stock & OSA Audit',
        questionText: 'Is Guinness Foreign Extra Stout chilled to below 4°C in the venue fridge?',
        questionType: 'yes_no',
        isRequired: true,
        scoreWeight: 20
      },
      {
        id: 'q4_bottles_sold',
        section: 'Consumer Engagement & Sales',
        questionText: 'Total number of Guinness 500ml bottles sold during this activation shift',
        questionType: 'number',
        isRequired: true,
        scoreWeight: 25,
        helpText: 'Cross-check with head bartender till summary.'
      },
      {
        id: 'q5_consumer_feedback',
        section: 'Consumer Engagement & Sales',
        questionText: 'Primary consumer sentiment regarding the promo offer (e.g. Free branded glass for 3 bottles)',
        questionType: 'single_select',
        isRequired: true,
        options: ['Highly Enthusiastic', 'Satisfied', 'Price Sensitive / Neutral', 'Prefers Competitor Offer'],
        scoreWeight: 20
      }
    ],
    createdAt: '2026-09-15T10:00:00Z'
  },
  {
    id: 'frm_unilever_merch',
    title: 'Supermarket Planogram & On-Shelf Availability (OSA) Audit',
    category: 'Retail Merchandising',
    version: 2,
    isPublished: true,
    sections: ['Shelf Availability & Facings', 'Price & POSM Compliance', 'Store Floor Evidence'],
    questions: [
      {
        id: 'qu1_omo_available',
        section: 'Shelf Availability & Facings',
        questionText: 'Is Omo Extra Power 1kg currently present on the main laundry detergent aisle shelf?',
        questionType: 'yes_no',
        isRequired: true,
        scoreWeight: 30
      },
      {
        id: 'qu2_omo_stockout_reason',
        section: 'Shelf Availability & Facings',
        questionText: 'If Omo 1kg is OUT OF STOCK, select root cause verified with warehouse supervisor',
        questionType: 'single_select',
        isRequired: true,
        options: ['Store Backroom Out of Stock', 'Wholesaler / Distributor Short Delivery', 'Shelf Empty but Stock in Backroom', 'Delisted by Supermarket Head Office'],
        conditionalOnQuestionId: 'qu1_omo_available',
        conditionalExpectedValue: 'false',
        scoreWeight: 10
      },
      {
        id: 'qu3_facings_count',
        section: 'Shelf Availability & Facings',
        questionText: 'Count total visible front facings of Omo 1kg on eye-level shelf',
        questionType: 'number',
        isRequired: true,
        scoreWeight: 20
      },
      {
        id: 'qu4_shelf_photo',
        section: 'Store Floor Evidence',
        questionText: 'Capture wide-angle photo of the detergent gondola showing Unilever vs Ariel shelf share',
        questionType: 'photo',
        isRequired: true,
        scoreWeight: 20
      }
    ],
    createdAt: '2026-09-20T11:00:00Z'
  }
];

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'cmp_eabl_01',
    code: 'EABL-MD-2026',
    name: 'Guinness Matchday On-Premise Activation & Sales Drive',
    clientId: 'cli_eabl',
    clientName: 'East African Breweries PLC',
    type: 'Brand Activation & On-Premise Sales',
    description: 'Weekend football matchday bar activations engaging consumers, ensuring chilled Guinness stock, and driving direct bottle sales with branded merchandise redemption.',
    startDate: '2026-09-01',
    endDate: '2026-11-30',
    status: 'active',
    managerId: 'usr_mgr_1',
    managerName: 'Brenda Chepkemoi',
    budgetKes: 18500000,
    targetVisits: 450,
    completedVisits: 312,
    attendanceRate: 94.8,
    osaScore: 92.5,
    salesTotalKes: 4890000,
    assignedTeamIds: ['team_nbi_west'],
    productIds: ['prod_guinness_500', 'prod_tusker_500'],
    locationIds: ['loc_kizito_lounge'],
    activities: [
      {
        id: 'act_eabl_sampling',
        campaignId: 'cmp_eabl_01',
        name: 'Weekend Matchday Bar Activation & Glass Giveaway',
        type: 'brand_activation',
        description: 'Bar sampling, match viewing party hosting, POSM poster and table talker deployment.',
        startDate: '2026-09-01',
        endDate: '2026-11-30',
        targetVisitsCount: 300,
        formId: 'frm_eabl_matchday',
        status: 'in_progress'
      },
      {
        id: 'act_eabl_sales',
        campaignId: 'cmp_eabl_01',
        name: 'Direct Bottle Sales Drive & Till Reconciliation',
        type: 'sales_drive',
        description: 'Direct sales facilitation with bartender till tracking.',
        startDate: '2026-09-01',
        endDate: '2026-11-30',
        targetVisitsCount: 150,
        formId: 'frm_eabl_matchday',
        status: 'in_progress'
      }
    ]
  },
  {
    id: 'cmp_safaricom_02',
    code: 'SAF-5G-EXP',
    name: 'Safaricom 5G Home Broadband Modern Trade Drive',
    clientId: 'cli_safaricom',
    clientName: 'Safaricom PLC',
    type: 'Modern Trade Experiential & Lead Booking',
    description: 'Mall experiential booths showcasing 5G gigabit speeds, live cloud gaming demos, and booking immediate home installation kit orders.',
    startDate: '2026-09-15',
    endDate: '2026-12-15',
    status: 'active',
    managerId: 'usr_mgr_1',
    managerName: 'Brenda Chepkemoi',
    budgetKes: 24000000,
    targetVisits: 280,
    completedVisits: 165,
    attendanceRate: 98.2,
    osaScore: 96.0,
    salesTotalKes: 6850000,
    assignedTeamIds: ['team_nbi_west'],
    productIds: ['prod_saf_router', 'prod_saf_airtime_1000'],
    locationIds: ['loc_two_rivers', 'loc_naivas_junction'],
    activities: [
      {
        id: 'act_saf_mall_demo',
        campaignId: 'cmp_safaricom_02',
        name: '5G Mall Experience Booth & Lead Conversion',
        type: 'brand_activation',
        description: 'Live experiential demonstrations in Tier 1 mall hypermarkets.',
        startDate: '2026-09-15',
        endDate: '2026-12-15',
        targetVisitsCount: 280,
        status: 'in_progress'
      }
    ]
  },
  {
    id: 'cmp_unilever_03',
    code: 'UNI-OMO-Q4',
    name: 'Omo Extra Power Retail Merchandising & OSA Wave 4',
    clientId: 'cli_unilever',
    clientName: 'Unilever Kenya',
    type: 'Retail Merchandising & OSA Audit',
    description: 'Ensuring 100% on-shelf availability for Omo Extra Power 1kg, cleaning gondola displays, restoring front facings, and reporting out-of-stock root causes.',
    startDate: '2026-09-01',
    endDate: '2026-10-31',
    status: 'active',
    managerId: 'usr_mgr_1',
    managerName: 'Brenda Chepkemoi',
    budgetKes: 14200000,
    targetVisits: 600,
    completedVisits: 440,
    attendanceRate: 93.1,
    osaScore: 88.4,
    salesTotalKes: 2150000,
    assignedTeamIds: ['team_nbi_west'],
    productIds: ['prod_omo_1kg', 'prod_sunlight_400g'],
    locationIds: ['loc_two_rivers', 'loc_quickmart_kilimani', 'loc_cleanshelf_ruiru', 'loc_nyali_cinemax'],
    activities: [
      {
        id: 'act_unilever_shelf_audit',
        campaignId: 'cmp_unilever_03',
        name: 'Supermarket Shelf Audit & OSA Verification',
        type: 'osa_audit',
        description: 'Full facing count, price tag verification, and photo recording.',
        startDate: '2026-09-01',
        endDate: '2026-10-31',
        targetVisitsCount: 600,
        formId: 'frm_unilever_merch',
        status: 'in_progress'
      }
    ]
  }
];

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'team_nbi_west',
    name: 'Nairobi West Execution Squad',
    supervisorId: 'usr_sup_1',
    supervisorName: 'Evans Ochieng',
    territory: 'Nairobi West (Westlands, Kilimani, Lavington, Ngong Rd)',
    county: 'Nairobi',
    memberIds: ['usr_fa_1', 'usr_fa_2', 'usr_fa_3'],
    activeCampaignIds: ['cmp_eabl_01', 'cmp_safaricom_02', 'cmp_unilever_03'],
    isActive: true
  }
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg_101',
    campaignId: 'cmp_eabl_01',
    campaignName: 'Guinness Matchday On-Premise Activation',
    activityId: 'act_eabl_sampling',
    activityName: 'Weekend Matchday Bar Activation & Glass Giveaway',
    locationId: 'loc_kizito_lounge',
    locationName: 'Kizito Lounge & Grill Westlands',
    locationCategory: 'on_premise',
    locationAddress: 'Woodvale Grove, Mpaka Road Junction, Westlands',
    latitude: -1.2655,
    longitude: 36.8040,
    geofenceRadiusMeters: 80,
    agentId: 'usr_fa_1',
    agentName: 'Faith Wanjiku',
    scheduledDate: '2026-10-02',
    status: 'in_progress',
    targetSalesKes: 25000,
    notes: 'Verify TV sound setup before 5:00 PM kickoff. Distribute Guinness glasses to first 50 bottle orders.',
    formId: 'frm_eabl_matchday'
  },
  {
    id: 'asg_102',
    campaignId: 'cmp_unilever_03',
    campaignName: 'Omo Extra Power Retail Merchandising',
    activityId: 'act_unilever_shelf_audit',
    activityName: 'Supermarket Shelf Audit & OSA Verification',
    locationId: 'loc_quickmart_kilimani',
    locationName: 'QuickMart Supermarket Kilimani',
    locationCategory: 'modern_trade',
    locationAddress: 'Chania Avenue, Off Argwings Kodhek Road',
    latitude: -1.2910,
    longitude: 36.7865,
    geofenceRadiusMeters: 100,
    agentId: 'usr_fa_2',
    agentName: 'Kevin Omondi',
    scheduledDate: '2026-10-02',
    status: 'completed',
    notes: 'Restock Omo 1kg from backroom if shelf has fewer than 10 facings.',
    formId: 'frm_unilever_merch'
  },
  {
    id: 'asg_103',
    campaignId: 'cmp_safaricom_02',
    campaignName: 'Safaricom 5G Home Broadband Modern Trade Drive',
    activityId: 'act_saf_mall_demo',
    activityName: '5G Mall Experience Booth & Lead Conversion',
    locationId: 'loc_two_rivers',
    locationName: 'Carrefour Two Rivers Mall',
    locationCategory: 'modern_trade',
    locationAddress: 'Two Rivers Mall, Ground Floor Hypermarket Wing',
    latitude: -1.2128,
    longitude: 36.7972,
    geofenceRadiusMeters: 150,
    agentId: 'usr_fa_3',
    agentName: 'David Kiprop',
    scheduledDate: '2026-10-02',
    status: 'pending',
    targetSalesKes: 50000,
    notes: 'Demo setup in front of electronics section. Target 5 active router kit sales.',
    formId: 'frm_eabl_matchday'
  },
  {
    id: 'asg_104',
    campaignId: 'cmp_unilever_03',
    campaignName: 'Omo Extra Power Retail Merchandising',
    activityId: 'act_unilever_shelf_audit',
    activityName: 'Supermarket Shelf Audit & OSA Verification',
    locationId: 'loc_naivas_junction',
    locationName: 'Naivas Hypermarket Junction Mall',
    locationCategory: 'modern_trade',
    locationAddress: 'The Junction Mall, Ground Floor, Ngong Road',
    latitude: -1.2982,
    longitude: 36.7624,
    geofenceRadiusMeters: 120,
    agentId: 'usr_fa_2',
    agentName: 'Kevin Omondi',
    scheduledDate: '2026-10-02',
    status: 'pending',
    notes: 'Check promotional price tag display (Offer 395 KES).',
    formId: 'frm_unilever_merch'
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att_20261002_01',
    agentId: 'usr_fa_1',
    agentName: 'Faith Wanjiku',
    campaignId: 'cmp_eabl_01',
    campaignName: 'Guinness Matchday On-Premise Activation',
    date: '2026-10-02',
    clockInTime: '2026-10-02T13:58:12+03:00',
    clockInLat: -1.2654,
    clockInLng: 36.8041,
    clockInAccuracy: 6.2,
    locationName: 'Kizito Lounge Westlands',
    distanceFromAssignedMeters: 18.5,
    status: 'present',
    isGeofenceCompliant: true
  },
  {
    id: 'att_20261002_02',
    agentId: 'usr_fa_2',
    agentName: 'Kevin Omondi',
    campaignId: 'cmp_unilever_03',
    campaignName: 'Omo Extra Power Retail Merchandising',
    date: '2026-10-02',
    clockInTime: '2026-10-02T08:02:40+03:00',
    clockOutTime: '2026-10-02T16:30:15+03:00',
    clockInLat: -1.2909,
    clockInLng: 36.7866,
    clockInAccuracy: 8.0,
    locationName: 'QuickMart Supermarket Kilimani',
    distanceFromAssignedMeters: 14.2,
    status: 'present',
    isGeofenceCompliant: true
  },
  {
    id: 'att_20261002_03',
    agentId: 'usr_fa_3',
    agentName: 'David Kiprop',
    campaignId: 'cmp_safaricom_02',
    campaignName: 'Safaricom 5G Home Broadband Drive',
    date: '2026-10-02',
    clockInTime: '2026-10-02T09:22:10+03:00',
    clockInLat: -1.2125,
    clockInLng: 36.7975,
    clockInAccuracy: 12.4,
    locationName: 'Carrefour Two Rivers Mall',
    distanceFromAssignedMeters: 45.0,
    status: 'late',
    isGeofenceCompliant: true,
    supervisorOverrideApproved: true
  }
];

export const INITIAL_VISITS: FieldVisit[] = [
  {
    id: 'vst_9801',
    clientUuid: 'uuid_c8f12a3b_1001',
    assignmentId: 'asg_102',
    campaignId: 'cmp_unilever_03',
    campaignName: 'Omo Extra Power Retail Merchandising',
    activityId: 'act_unilever_shelf_audit',
    activityName: 'Supermarket Shelf Audit & OSA Verification',
    locationId: 'loc_quickmart_kilimani',
    locationName: 'QuickMart Supermarket Kilimani',
    locationCounty: 'Nairobi',
    locationLat: -1.2910,
    locationLng: 36.7865,
    agentId: 'usr_fa_2',
    agentName: 'Kevin Omondi',
    visitDate: '2026-10-02',
    checkInTime: '2026-10-02T08:15:20+03:00',
    checkOutTime: '2026-10-02T09:40:05+03:00',
    checkInLat: -1.2909,
    checkInLng: 36.7866,
    checkInAccuracyMeters: 6.5,
    distanceFromLocationMeters: 14.2,
    geofenceStatus: 'inside_geofence',
    fraudRiskScore: 4, // Clean
    fraudFlags: [],
    status: 'approved',
    formResponses: [
      {
        questionId: 'qu1_omo_available',
        questionText: 'Is Omo Extra Power 1kg currently present on the main laundry detergent aisle shelf?',
        questionType: 'yes_no',
        answer: true
      },
      {
        questionId: 'qu3_facings_count',
        questionText: 'Count total visible front facings of Omo 1kg on eye-level shelf',
        questionType: 'number',
        answer: 14
      }
    ],
    osaRecords: [
      {
        productId: 'prod_omo_1kg',
        productName: 'Omo Extra Power Hand Washing Powder 1kg',
        sku: 'UNI-OMO-1KG-EP',
        isAvailable: true,
        currentShelfPriceKes: 395,
        facingsCount: 14,
        competitorFacingsCount: 10,
        posmPresent: true
      },
      {
        productId: 'prod_sunlight_400g',
        productName: 'Sunlight Lemon Dishwashing Paste 400g',
        sku: 'UNI-SUN-400G-DW',
        isAvailable: true,
        currentShelfPriceKes: 180,
        facingsCount: 8,
        competitorFacingsCount: 6,
        posmPresent: true
      }
    ],
    salesRecords: [],
    evidencePhotos: [
      {
        id: 'ev_01',
        visitId: 'vst_9801',
        photoUrl: 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=800&auto=format&fit=crop',
        caption: 'Omo 1kg restored to 14 facings on eye level shelf',
        capturedAt: '2026-10-02T08:45:00+03:00',
        latitude: -1.2910,
        longitude: 36.7865,
        tag: 'after_merchandising'
      }
    ],
    notes: 'Restocked 2 cartons from stockroom. Aisle shelf clean and compliant with October planogram.',
    verifiedBy: 'usr_sup_1',
    verifiedAt: '2026-10-02T10:15:00+03:00',
    isSynced: true
  },
  {
    id: 'vst_9802',
    clientUuid: 'uuid_c8f12a3b_1002',
    campaignId: 'cmp_eabl_01',
    campaignName: 'Guinness Matchday On-Premise Activation',
    activityId: 'act_eabl_sampling',
    activityName: 'Weekend Matchday Bar Activation & Glass Giveaway',
    locationId: 'loc_kizito_lounge',
    locationName: 'Kizito Lounge & Grill Westlands',
    locationCounty: 'Nairobi',
    locationLat: -1.2655,
    locationLng: 36.8040,
    agentId: 'usr_fa_1',
    agentName: 'Faith Wanjiku',
    visitDate: '2026-10-01',
    checkInTime: '2026-10-01T17:00:10+03:00',
    checkOutTime: '2026-10-01T21:45:00+03:00',
    checkInLat: -1.2654,
    checkInLng: 36.8041,
    checkInAccuracyMeters: 5.8,
    distanceFromLocationMeters: 18.5,
    geofenceStatus: 'inside_geofence',
    fraudRiskScore: 0,
    fraudFlags: [],
    status: 'approved',
    formResponses: [
      {
        questionId: 'q1_posm_ready',
        questionText: 'Is the official Guinness Matchday branding, table talkers & TV screen banner properly positioned?',
        questionType: 'yes_no',
        answer: true
      },
      {
        questionId: 'q3_cold_stock',
        questionText: 'Is Guinness Foreign Extra Stout chilled to below 4°C in the venue fridge?',
        questionType: 'yes_no',
        answer: true
      },
      {
        questionId: 'q4_bottles_sold',
        questionText: 'Total number of Guinness 500ml bottles sold during this activation shift',
        questionType: 'number',
        answer: 86
      }
    ],
    osaRecords: [
      {
        productId: 'prod_guinness_500',
        productName: 'Guinness Foreign Extra Stout 500ml',
        sku: 'EABL-GIN-500RGB',
        isAvailable: true,
        currentShelfPriceKes: 250,
        facingsCount: 20,
        competitorFacingsCount: 15,
        posmPresent: true
      }
    ],
    salesRecords: [
      {
        id: 'sl_001',
        productId: 'prod_guinness_500',
        productName: 'Guinness Foreign Extra Stout 500ml',
        quantity: 86,
        unitPriceKes: 250,
        totalPriceKes: 21500,
        paymentMethod: 'mpesa',
        mpesaReference: 'QKD9821LPS'
      }
    ],
    evidencePhotos: [
      {
        id: 'ev_02',
        visitId: 'vst_9802',
        photoUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&auto=format&fit=crop',
        caption: 'Guinness bar branding and table talkers setup',
        capturedAt: '2026-10-01T17:30:00+03:00',
        latitude: -1.2655,
        longitude: 36.8040,
        tag: 'posm_display'
      }
    ],
    notes: 'Strong turnout during Arsenal match. 86 bottles sold. Branded glasses given to 28 customers.',
    verifiedBy: 'usr_sup_1',
    verifiedAt: '2026-10-01T22:30:00+03:00',
    isSynced: true
  },
  {
    id: 'vst_9803',
    clientUuid: 'uuid_c8f12a3b_1003',
    campaignId: 'cmp_unilever_03',
    campaignName: 'Omo Extra Power Retail Merchandising',
    activityId: 'act_unilever_shelf_audit',
    activityName: 'Supermarket Shelf Audit & OSA Verification',
    locationId: 'loc_cleanshelf_ruiru',
    locationName: 'Clean Shelf Supermarket Ruiru',
    locationCounty: 'Kiambu',
    locationLat: -1.1448,
    locationLng: 36.9610,
    agentId: 'usr_fa_2',
    agentName: 'Kevin Omondi',
    visitDate: '2026-10-02',
    checkInTime: '2026-10-02T11:05:00+03:00',
    checkInLat: -1.1465,
    checkInLng: 36.9628,
    checkInAccuracyMeters: 28.0,
    distanceFromLocationMeters: 260.0,
    geofenceStatus: 'outside_warning',
    fraudRiskScore: 35, // Amber warning
    fraudFlags: ['GEOFENCE_PROXIMITY_WARNING_260M', 'ELEVATED_GPS_ACCURACY_RADIUS_28M'],
    status: 'under_review',
    formResponses: [
      {
        questionId: 'qu1_omo_available',
        questionText: 'Is Omo Extra Power 1kg currently present on the main laundry detergent aisle shelf?',
        questionType: 'yes_no',
        answer: false
      },
      {
        questionId: 'qu2_omo_stockout_reason',
        questionText: 'If Omo 1kg is OUT OF STOCK, select root cause verified with warehouse supervisor',
        questionType: 'single_select',
        answer: 'Wholesaler / Distributor Short Delivery'
      }
    ],
    osaRecords: [
      {
        productId: 'prod_omo_1kg',
        productName: 'Omo Extra Power Hand Washing Powder 1kg',
        sku: 'UNI-OMO-1KG-EP',
        isAvailable: false,
        outOfStockReason: 'Distributor out of stock since Tuesday',
        facingsCount: 0,
        competitorFacingsCount: 18,
        posmPresent: false
      }
    ],
    salesRecords: [],
    evidencePhotos: [
      {
        id: 'ev_03',
        visitId: 'vst_9803',
        photoUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop',
        caption: 'Empty Omo shelf slot occupied by competitor brand',
        capturedAt: '2026-10-02T11:20:00+03:00',
        latitude: -1.1465,
        longitude: 36.9628,
        tag: 'before_merchandising'
      }
    ],
    notes: 'Agent check-in was 260m away (basement loading zone has no signal). Omo 1kg completely out of stock in Ruiru branch.',
    isSynced: true
  }
];

export const INITIAL_ISSUES: FieldIssue[] = [
  {
    id: 'iss_301',
    campaignId: 'cmp_unilever_03',
    campaignName: 'Omo Extra Power Retail Merchandising',
    locationId: 'loc_cleanshelf_ruiru',
    locationName: 'Clean Shelf Supermarket Ruiru',
    agentId: 'usr_fa_2',
    agentName: 'Kevin Omondi',
    category: 'stock_out',
    priority: 'high',
    status: 'escalated',
    title: 'Zero Stock of Omo 1kg for 4 Consecutive Days',
    description: 'Branch stock controller confirmed their order PO #89201 to the Thika depot has been delayed. Competitor Ariel 1kg is heavily discounted and taking entire shelf space.',
    reportedAt: '2026-10-02T11:25:00+03:00',
    photoUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop',
    assignedSupervisorName: 'Evans Ochieng',
    resolutionNotes: 'Escalated to Unilever National Key Account Manager (Samuel Gitau) for emergency van delivery.'
  },
  {
    id: 'iss_302',
    campaignId: 'cmp_eabl_01',
    campaignName: 'Guinness Matchday On-Premise Activation',
    locationId: 'loc_kizito_lounge',
    locationName: 'Kizito Lounge Westlands',
    agentId: 'usr_fa_1',
    agentName: 'Faith Wanjiku',
    category: 'posm_damaged',
    priority: 'medium',
    status: 'open',
    title: 'Main Outdoor Fabric Banner Grommets Torn',
    description: 'Heavy rain on Wednesday tore the top-right grommet of the 3x1m outdoor Guinness Matchday road banner. Needs replacement before Saturday evening match.',
    reportedAt: '2026-10-02T14:15:00+03:00',
    assignedSupervisorName: 'Evans Ochieng'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud_1001',
    userId: 'usr_admin_1',
    userName: 'Dennis Mwangi',
    userRole: 'system_admin',
    action: 'SYSTEM_SETTINGS_UPDATED',
    module: 'System Administration',
    entityId: 'settings_core',
    entityTitle: 'Agency Geofence & Anti-Spoofing Parameters',
    diffSummary: 'Changed default geofence radius from 100m to 120m for mall channels; enabled strict mock location penalty (Score +50).',
    ipAddress: '197.232.61.18',
    timestamp: '2026-10-02T12:00:15+03:00'
  },
  {
    id: 'aud_1002',
    userId: 'usr_sup_1',
    userName: 'Evans Ochieng',
    userRole: 'supervisor',
    action: 'VISIT_VERIFIED_AND_APPROVED',
    module: 'Quality Assurance',
    entityId: 'vst_9801',
    entityTitle: 'QuickMart Kilimani - Omo Merchandising Audit',
    diffSummary: 'Status changed from "submitted" to "approved". Verified photo evidence matches shelf count of 14.',
    ipAddress: '105.163.2.45',
    timestamp: '2026-10-02T10:15:00+03:00'
  },
  {
    id: 'aud_1003',
    userId: 'usr_mgr_1',
    userName: 'Brenda Chepkemoi',
    userRole: 'campaign_manager',
    action: 'ASSIGNMENT_BATCH_DISPATCHED',
    module: 'Operations Dispatch',
    entityId: 'batch_cmp_eabl_wk40',
    entityTitle: 'EABL Weekend Matchday Schedule (35 Bars)',
    diffSummary: 'Dispatched 35 new field assignments across Nairobi West territory for October 3-5.',
    ipAddress: '197.232.89.102',
    timestamp: '2026-10-02T09:40:00+03:00'
  }
];
