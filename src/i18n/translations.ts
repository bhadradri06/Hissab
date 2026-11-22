import type { LanguageCode } from '../types';

export interface TranslationDict {
  appName: string;
  tagline: string;
  // Navigation
  navHome: string;
  navCustomers: string;
  navOverdue: string;
  navSettings: string;
  // Dashboard KPIs
  dashboard: string;
  todayLabel: string;
  totalOutstanding: string;
  totalCustomers: string;
  todaysCollections: string;
  overdueCustomers: string;
  customersOweLabel: string;
  owesMost: string;
  collected30d: string;
  given30d: string;
  longestUnpaid: string;
  // Quick Entry & Recent Activity
  quickEntryTitle: string;
  quickEntryPlaceholder: string;
  quickEntrySpeak: string;
  quickEntryListening: string;
  quickEntryRecordBtn: string;
  quickEntryPickCustomer: string;
  quickEntryNeedAmount: string;
  recordEntryCta: string;
  selectCustomerLabel: string;
  recentActivityTitle: string;
  noRecentActivity: string;
  viewAllCustomers: string;
  // Undo & Toast
  undoAction: string;
  savedEntryToast: string;
  deletedEntryToast: string;
  sendReceiptLink: string;
  // Theme
  switchToDark: string;
  switchToLight: string;
  // Search & Filters
  searchPlaceholder: string;
  filterAll: string;
  filterOutstanding: string;
  filterSettled: string;
  filterOverdue: string;
  // Actions
  addCustomer: string;
  editCustomer: string;
  deleteCustomer: string;
  addCredit: string;
  receivePayment: string;
  sendReminder: string;
  edit: string;
  delete: string;
  save: string;
  cancel: string;
  confirm: string;
  close: string;
  back: string;
  exportCsv: string;
  // Status labels
  statusDue: string;
  statusOverdue: string;
  statusSettled: string;
  statusAdvance: string;
  // Customer Fields & Details
  customerName: string;
  phoneNumber: string;
  addressOptional: string;
  notesOptional: string;
  totalCredit: string;
  totalPayments: string;
  outstanding: string;
  advanceBalance: string;
  lastPaymentDate: string;
  daysSinceLastPayment: string;
  noPaymentYet: string;
  daysAgo: string;
  daySingle: string;
  ledgerHistory: string;
  noCustomersFound: string;
  noCustomersHint: string;
  noLedgerEntries: string;
  noLedgerEntriesHint: string;
  // UPI QR & Statement
  upiPayLinkLabel: string;
  upiQrCodeLabel: string;
  scanToPayUpi: string;
  printStatement: string;
  statementHeading: string;
  // Ledger Entries
  credit: string;
  payment: string;
  creditDescription: string;
  paymentDescription: string;
  amount: string;
  date: string;
  note: string;
  addEntryTitleCredit: string;
  addEntryTitlePayment: string;
  editEntryTitle: string;
  // Screenshot & OCR
  paymentScreenshot: string;
  uploadScreenshot: string;
  removeScreenshot: string;
  previewScreenshot: string;
  readingScreenshot: string;
  ocrDetectedAmount: string;
  useDetectedAmount: string;
  ocrNotice: string;
  ocrUnavailable: string;
  // Validations & Confirmations
  errNameRequired: string;
  errPhoneInvalid: string;
  errPhoneDuplicate: string;
  errAmountInvalid: string;
  errDateRequired: string;
  errCustomerRequired: string;
  confirmDeleteCustomerTitle: string;
  confirmDeleteCustomerBody: string;
  confirmDeleteEntryTitle: string;
  confirmDeleteEntryBody: string;
  // Overdue Page
  overdueTitle: string;
  overdueSubtitle: string;
  allDue: string;
  days7Plus: string;
  days15Plus: string;
  days30Plus: string;
  days60Plus: string;
  noOverdueTitle: string;
  noOverdueHint: string;
  basedOnFirstCredit: string;
  // WhatsApp & UPI
  whatsappPreviewTitle: string;
  openInWhatsapp: string;
  copyMessage: string;
  copied: string;
  upiIncludedNote: string;
  upiNotConfiguredHint: string;
  upiVerificationWarning: string;
  // Settings, Export, Import
  settingsTitle: string;
  languageLabel: string;
  shopDetailsTitle: string;
  shopNameLabel: string;
  upiIdLabel: string;
  upiIdPlaceholder: string;
  saveSettings: string;
  settingsSaved: string;
  exportSectionTitle: string;
  exportAllCsv: string;
  exportOutstandingCsv: string;
  exportBackupJson: string;
  importSectionTitle: string;
  importJsonButton: string;
  importAttachedSample: string;
  downloadSampleJson: string;
  importPreviewTitle: string;
  importCustomersFound: string;
  importEntriesFound: string;
  importDuplicatesFound: string;
  importModeSkip: string;
  importModeMerge: string;
  confirmImport: string;
  importSuccess: string;
  localStorageNoticeTitle: string;
  localStorageNoticeBody: string;
  dataManagementTitle: string;
  loadSampleData: string;
  clearAllData: string;
  confirmClearAllTitle: string;
  confirmClearAllBody: string;
  todaysCollectionsTitle: string;
  paymentsReceivedCount: string;
  paymentReceivedSingle: string;
  noCollectionsToday: string;
  noCollectionsTodayHint: string;
}

export const TRANSLATIONS: Record<LanguageCode, TranslationDict> = {
  en: {
    appName: 'Hisaab',
    tagline: 'Every Rupee Accounted. Every Hisaab Sorted.',
    navHome: 'Home',
    navCustomers: 'Customers',
    navOverdue: 'Overdue',
    navSettings: 'Settings',
    dashboard: 'Dashboard',
    todayLabel: 'Today',
    totalOutstanding: 'Total Outstanding',
    totalCustomers: 'Total Customers',
    todaysCollections: "Today's Collections",
    overdueCustomers: 'Overdue Customers',
    customersOweLabel: 'customers owe',
    owesMost: 'Owes Most',
    collected30d: 'Collected (30d)',
    given30d: 'Credited (30d)',
    longestUnpaid: 'Longest Unpaid',
    quickEntryTitle: 'Quick Entry',
    quickEntryPlaceholder: 'e.g. Sunita 500 udhaar or Ramesh 300 paid',
    quickEntrySpeak: 'Speak entry',
    quickEntryListening: 'Listening...',
    quickEntryRecordBtn: 'Record',
    quickEntryPickCustomer: 'Select matching customer:',
    quickEntryNeedAmount: 'Type customer name & amount (e.g. "Ramesh 450 paid")',
    recordEntryCta: 'Record Entry',
    selectCustomerLabel: 'Customer',
    recentActivityTitle: 'Recent Activity',
    noRecentActivity: 'No recent transactions yet.',
    viewAllCustomers: 'View all',
    undoAction: 'Undo',
    savedEntryToast: 'Entry saved',
    deletedEntryToast: 'Entry deleted',
    sendReceiptLink: 'WhatsApp receipt',
    switchToDark: 'Switch to dark mode',
    switchToLight: 'Switch to light mode',
    searchPlaceholder: 'Search customer name or phone...',
    filterAll: 'All',
    filterOutstanding: 'Outstanding',
    filterSettled: 'Settled',
    filterOverdue: 'Overdue',
    addCustomer: 'Add Customer',
    editCustomer: 'Edit Customer',
    deleteCustomer: 'Delete Customer',
    addCredit: '+ Add Credit',
    receivePayment: '+ Receive Payment',
    sendReminder: 'Send Reminder',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    close: 'Close',
    back: 'Back',
    exportCsv: 'Export CSV',
    statusDue: 'Due',
    statusOverdue: 'Overdue',
    statusSettled: 'Settled',
    statusAdvance: 'Advance',
    customerName: 'Customer Name',
    phoneNumber: '10-Digit Mobile Number',
    addressOptional: 'Address (Optional)',
    notesOptional: 'Notes (Optional)',
    totalCredit: 'Total Credit',
    totalPayments: 'Total Payments',
    outstanding: 'Outstanding',
    advanceBalance: 'Advance Balance',
    lastPaymentDate: 'Last Payment',
    daysSinceLastPayment: 'Days Since Last Payment',
    noPaymentYet: 'No payment yet',
    daysAgo: 'days',
    daySingle: 'day',
    ledgerHistory: 'Ledger History',
    noCustomersFound: 'No customers match your filter',
    noCustomersHint: 'Add a new customer or clear your search filter.',
    noLedgerEntries: 'No ledger entries yet',
    noLedgerEntriesHint: 'Tap "+ Add Credit" when giving goods or "+ Receive Payment" when paid.',
    upiPayLinkLabel: 'UPI Pay Link',
    upiQrCodeLabel: 'UPI QR Code',
    scanToPayUpi: 'Customer can scan with GPay, PhonePe, or Paytm for exact balance',
    printStatement: 'Statement (PDF)',
    statementHeading: 'Customer Account Statement',
    credit: 'Credit',
    payment: 'Payment',
    creditDescription: 'Goods given on credit',
    paymentDescription: 'Payment received from customer',
    amount: 'Amount (₹)',
    date: 'Date',
    note: 'Short Note / Items',
    addEntryTitleCredit: 'Add Credit Entry',
    addEntryTitlePayment: 'Receive Payment',
    editEntryTitle: 'Edit Ledger Entry',
    paymentScreenshot: 'Payment Screenshot (Optional)',
    uploadScreenshot: 'Upload Screenshot (JPG, PNG, WEBP)',
    removeScreenshot: 'Remove',
    previewScreenshot: 'View Receipt',
    readingScreenshot: 'Reading payment amount from screenshot...',
    ocrDetectedAmount: 'Detected Amount',
    useDetectedAmount: 'Use this amount',
    ocrNotice: 'OCR reading is a suggestion only. Please verify the amount and confirm receipt in your UPI app before saving.',
    ocrUnavailable: 'Could not auto-read amount from this screenshot. Please type the amount manually.',
    errNameRequired: 'Please enter the customer name.',
    errPhoneInvalid: 'Mobile number must be exactly 10 digits.',
    errPhoneDuplicate: 'A customer with this mobile number already exists.',
    errAmountInvalid: 'Please enter a valid amount greater than ₹0.',
    errDateRequired: 'Please select a valid date.',
    errCustomerRequired: 'Please select a customer.',
    confirmDeleteCustomerTitle: 'Delete Customer & Ledger?',
    confirmDeleteCustomerBody: 'This will permanently delete this customer and all of their credit and payment records. Export a CSV first if you want to keep a copy.',
    confirmDeleteEntryTitle: 'Delete Ledger Entry?',
    confirmDeleteEntryBody: 'Deleting this entry will immediately recalculate the customer balance. This cannot be undone.',
    overdueTitle: 'Overdue Customers',
    overdueSubtitle: 'Customers with pending dues, longest overdue first',
    allDue: 'All Due',
    days7Plus: '7+ days',
    days15Plus: '15+ days',
    days30Plus: '30+ days',
    days60Plus: '60+ days',
    noOverdueTitle: 'No overdue customers in this filter',
    noOverdueHint: 'Customers with ₹0 or advance balances are not marked overdue.',
    basedOnFirstCredit: 'Since first credit',
    whatsappPreviewTitle: 'WhatsApp Payment Reminder',
    openInWhatsapp: 'Open in WhatsApp',
    copyMessage: 'Copy Message',
    copied: 'Copied',
    upiIncludedNote: 'UPI payment link included in message.',
    upiNotConfiguredHint: 'Add your UPI ID in Settings to include a direct payment link.',
    upiVerificationWarning: 'Note: Opening a UPI link does not confirm payment. Always verify payment in your UPI app before recording it.',
    settingsTitle: 'Shop Settings & Data',
    languageLabel: 'App Language',
    shopDetailsTitle: 'Shop & UPI Details',
    shopNameLabel: 'Shop Name',
    upiIdLabel: 'Shop UPI ID (Optional)',
    upiIdPlaceholder: 'e.g. srisaikirana@okaxis',
    saveSettings: 'Save Settings',
    settingsSaved: 'Settings saved',
    exportSectionTitle: 'Export Reports & Backup',
    exportAllCsv: 'Export All Customers (CSV)',
    exportOutstandingCsv: 'Export Outstanding List (CSV)',
    exportBackupJson: 'Download Full JSON Backup',
    importSectionTitle: 'Import Another Shop Data (JSON)',
    importJsonButton: 'Select JSON File to Import',
    importAttachedSample: 'Import Attached Sample (Lakshmi Store)',
    downloadSampleJson: 'Download Sample JSON',
    importPreviewTitle: 'Import Preview',
    importCustomersFound: 'Customers in file',
    importEntriesFound: 'Ledger entries',
    importDuplicatesFound: 'Existing phone matches',
    importModeSkip: 'Skip duplicate phone numbers (Recommended)',
    importModeMerge: 'Add entries to existing customers (Skip new customer creation)',
    confirmImport: 'Confirm Import',
    importSuccess: 'Data imported and balances recalculated.',
    localStorageNoticeTitle: 'Stored Locally on This Device',
    localStorageNoticeBody: 'Your khata data is saved in this browser only and does not automatically sync across phones or browsers. Download a CSV or JSON backup regularly.',
    dataManagementTitle: 'Reset or Sample Data',
    loadSampleData: 'Load Sample Kirana Data',
    clearAllData: 'Clear All Data',
    confirmClearAllTitle: 'Clear All Khata Data?',
    confirmClearAllBody: 'All customers and ledger entries on this browser will be erased. Download a backup first if needed.',
    todaysCollectionsTitle: "Today's Collections Breakup",
    paymentsReceivedCount: 'payments',
    paymentReceivedSingle: 'payment',
    noCollectionsToday: 'No payments recorded today',
    noCollectionsTodayHint: "Payments recorded with today's date will appear here showing who paid.",
  },
  hi: {
    appName: 'हिसाब',
    tagline: 'हर रुपया दर्ज। हर हिसाब व्यवस्थित।',
    navHome: 'होम',
    navCustomers: 'ग्राहक',
    navOverdue: 'बकाया',
    navSettings: 'सेटिंग्स',
    dashboard: 'डैशबोर्ड',
    todayLabel: 'आज',
    totalOutstanding: 'कुल बकाया',
    totalCustomers: 'कुल ग्राहक',
    todaysCollections: 'आज की वसूली',
    overdueCustomers: 'देर से बकाया ग्राहक',
    customersOweLabel: 'ग्राहकों पर बकाया',
    owesMost: 'सबसे ज्यादा बकाया',
    collected30d: 'वसूली (30 दिन)',
    given30d: 'उधार (30 दिन)',
    longestUnpaid: 'सबसे पुराना बकाया',
    quickEntryTitle: 'त्वरित एंट्री',
    quickEntryPlaceholder: 'जैसे: सुनीता 500 उधार या रमेश 300 जमा',
    quickEntrySpeak: 'बोलकर लिखें',
    quickEntryListening: 'सुन रहे हैं...',
    quickEntryRecordBtn: 'दर्ज करें',
    quickEntryPickCustomer: 'सही ग्राहक चुनें:',
    quickEntryNeedAmount: 'ग्राहक का नाम और राशि लिखें (जैसे "रमेश 450 जमा")',
    recordEntryCta: 'एंट्री दर्ज करें',
    selectCustomerLabel: 'ग्राहक',
    recentActivityTitle: 'हाल की गतिविधि',
    noRecentActivity: 'अभी कोई हालिया लेनदेन नहीं है।',
    viewAllCustomers: 'सभी देखें',
    undoAction: 'वापस लें',
    savedEntryToast: 'एंट्री सेव हो गई',
    deletedEntryToast: 'एंट्री हटा दी गई',
    sendReceiptLink: 'व्हाट्सएप रसीद',
    switchToDark: 'डार्क मोड चालू करें',
    switchToLight: 'लाइट मोड चालू करें',
    searchPlaceholder: 'ग्राहक का नाम या मोबाइल नंबर खोजें...',
    filterAll: 'सभी',
    filterOutstanding: 'बकाया',
    filterSettled: 'चुकाया',
    filterOverdue: 'अतिदेय',
    addCustomer: 'ग्राहक जोड़ें',
    editCustomer: 'ग्राहक बदलें',
    deleteCustomer: 'ग्राहक हटाएं',
    addCredit: '+ उधार जोड़ें',
    receivePayment: '+ भुगतान प्राप्त करें',
    sendReminder: 'रिमाइंडर भेजें',
    edit: 'बदलें',
    delete: 'हटाएं',
    save: 'सेव करें',
    cancel: 'रद्द करें',
    confirm: 'पुष्टि करें',
    close: 'बंद करें',
    back: 'वापस',
    exportCsv: 'CSV डाउनलोड',
    statusDue: 'बकाया',
    statusOverdue: 'देरी से बकाया',
    statusSettled: 'हिसाब साफ',
    statusAdvance: 'एडवांस जमा',
    customerName: 'ग्राहक का नाम',
    phoneNumber: '10 अंकों का मोबाइल नंबर',
    addressOptional: 'पता (वैकल्पिक)',
    notesOptional: 'टिप्पणी (वैकल्पिक)',
    totalCredit: 'कुल उधार',
    totalPayments: 'कुल भुगतान',
    outstanding: 'बकाया',
    advanceBalance: 'एडवांस राशि',
    lastPaymentDate: 'पिछला भुगतान',
    daysSinceLastPayment: 'पिछले भुगतान के दिन',
    noPaymentYet: 'अभी तक कोई भुगतान नहीं',
    daysAgo: 'दिन',
    daySingle: 'दिन',
    ledgerHistory: 'खाता इतिहास',
    noCustomersFound: 'कोई ग्राहक नहीं मिला',
    noCustomersHint: 'नया ग्राहक जोड़ें या खोज बदलें।',
    noLedgerEntries: 'अभी कोई एंट्री नहीं है',
    noLedgerEntriesHint: 'सामान उधार देने पर "+ उधार जोड़ें" या पैसे मिलने पर "+ भुगतान प्राप्त करें" दबाएं।',
    upiPayLinkLabel: 'UPI पेमेंट लिंक',
    upiQrCodeLabel: 'UPI QR कोड',
    scanToPayUpi: 'सही बकाया राशि चुकाने के लिए GPay, PhonePe या Paytm से स्कैन करें',
    printStatement: 'स्टेटमेंट (PDF)',
    statementHeading: 'ग्राहक खाता विवरण',
    credit: 'उधार',
    payment: 'भुगतान',
    creditDescription: 'ग्राहक को उधार दिया गया सामान',
    paymentDescription: 'ग्राहक से प्राप्त भुगतान',
    amount: 'राशि (₹)',
    date: 'तारीख',
    note: 'विवरण / सामान',
    addEntryTitleCredit: 'उधार एंट्री जोड़ें',
    addEntryTitlePayment: 'भुगतान दर्ज करें',
    editEntryTitle: 'एंट्री बदलें',
    paymentScreenshot: 'भुगतान स्क्रीनशॉट (वैकल्पिक)',
    uploadScreenshot: 'स्क्रीनशॉट अपलोड करें (JPG, PNG, WEBP)',
    removeScreenshot: 'हटाएं',
    previewScreenshot: 'रसीद देखें',
    readingScreenshot: 'स्क्रीनशॉट से राशि पढ़ी जा रही है...',
    ocrDetectedAmount: 'पहचानी गई राशि',
    useDetectedAmount: 'यह राशि भरें',
    ocrNotice: 'OCR केवल सहायता के लिए है। सेव करने से पहले राशि जांचें और अपने UPI ऐप में भुगतान की पुष्टि करें।',
    ocrUnavailable: 'स्क्रीनशॉट से राशि अपने आप नहीं पढ़ी जा सकी। कृपया राशि हाथ से दर्ज करें।',
    errNameRequired: 'कृपया ग्राहक का नाम लिखें।',
    errPhoneInvalid: 'मोबाइल नंबर ठीक 10 अंकों का होना चाहिए।',
    errPhoneDuplicate: 'इस मोबाइल नंबर का ग्राहक पहले से मौजूद है।',
    errAmountInvalid: 'कृपया ₹0 से अधिक सही राशि दर्ज करें।',
    errDateRequired: 'कृपया सही तारीख चुनें।',
    errCustomerRequired: 'कृपया एक ग्राहक चुनें।',
    confirmDeleteCustomerTitle: 'ग्राहक और खाता हटाएं?',
    confirmDeleteCustomerBody: 'इससे ग्राहक और उसका पूरा उधार-भुगतान रिकॉर्ड हमेशा के लिए हट जाएगा। जरूरत हो तो पहले CSV डाउनलोड करें।',
    confirmDeleteEntryTitle: 'एंट्री हटाएं?',
    confirmDeleteEntryBody: 'यह एंट्री हटाने पर ग्राहक का बकाया अपने आप दोबारा हिसाब होगा। इसे वापस नहीं लाया जा सकता।',
    overdueTitle: 'देरी से बकाया ग्राहक',
    overdueSubtitle: 'सबसे पुराने बकाया वाले ग्राहक सबसे ऊपर',
    allDue: 'सभी बकाया',
    days7Plus: '7+ दिन',
    days15Plus: '15+ दिन',
    days30Plus: '30+ दिन',
    days60Plus: '60+ दिन',
    noOverdueTitle: 'इस श्रेणी में कोई देरी से बकाया नहीं है',
    noOverdueHint: '₹0 या एडवांस वाले ग्राहक बकाया सूची में नहीं आते।',
    basedOnFirstCredit: 'पहले उधार से',
    whatsappPreviewTitle: 'व्हाट्सएप भुगतान रिमाइंडर',
    openInWhatsapp: 'व्हाट्सएप में खोलें',
    copyMessage: 'संदेश कॉपी करें',
    copied: 'कॉपी हो गया',
    upiIncludedNote: 'संदेश में UPI भुगतान लिंक शामिल है।',
    upiNotConfiguredHint: 'सीधे UPI लिंक के लिए सेटिंग्स में अपनी UPI ID जोड़ें।',
    upiVerificationWarning: 'ध्यान दें: लिंक खोलने से भुगतान पक्का नहीं होता। एंट्री करने से पहले अपने UPI ऐप में पैसे जांच लें।',
    settingsTitle: 'दुकान सेटिंग्स और डेटा',
    languageLabel: 'ऐप की भाषा',
    shopDetailsTitle: 'दुकान और UPI जानकारी',
    shopNameLabel: 'दुकान का नाम',
    upiIdLabel: 'दुकान की UPI ID (वैकल्पिक)',
    upiIdPlaceholder: 'जैसे: srisaikirana@okaxis',
    saveSettings: 'सेटिंग्स सेव करें',
    settingsSaved: 'सेटिंग्स सेव हो गईं',
    exportSectionTitle: 'रिपोर्ट और बैकअप डाउनलोड',
    exportAllCsv: 'सभी ग्राहकों का CSV डाउनलोड',
    exportOutstandingCsv: 'बकाया सूची CSV डाउनलोड',
    exportBackupJson: 'पूरा JSON बैकअप डाउनलोड',
    importSectionTitle: 'दूसरी दुकान का डेटा जोड़ें (JSON)',
    importJsonButton: 'इम्पोर्ट के लिए JSON फ़ाइल चुनें',
    importAttachedSample: 'अटैच्ड सैंपल इम्पोर्ट करें (लक्ष्मी स्टोर)',
    downloadSampleJson: 'सैंपल JSON डाउनलोड करें',
    importPreviewTitle: 'इम्पोर्ट प्रीव्यू',
    importCustomersFound: 'फ़ाइल में ग्राहक',
    importEntriesFound: 'कुल एंट्री',
    importDuplicatesFound: 'पहले से मौजूद नंबर',
    importModeSkip: 'डुप्लिकेट नंबर छोड़ दें (सुरक्षित)',
    importModeMerge: 'मौजूदा ग्राहक में नई एंट्री जोड़ें',
    confirmImport: 'इम्पोर्ट की पुष्टि करें',
    importSuccess: 'डेटा इम्पोर्ट हो गया और बकाया अपडेट हो गया।',
    localStorageNoticeTitle: 'डेटा केवल इसी डिवाइस में सुरक्षित है',
    localStorageNoticeBody: 'आपका खाता डेटा केवल इसी ब्राउज़र में सेव रहता है और दूसरे फोन में अपने आप सिंक नहीं होता। नियमित बैकअप डाउनलोड करते रहें।',
    dataManagementTitle: 'रीसेट या सैंपल डेटा',
    loadSampleData: 'सैंपल किराना डेटा लोड करें',
    clearAllData: 'सारा डेटा मिटाएं',
    confirmClearAllTitle: 'सारा खाता डेटा मिटाएं?',
    confirmClearAllBody: 'इस ब्राउज़र के सभी ग्राहक और एंट्री हट जाएंगे। जरूरत हो तो पहले बैकअप लें।',
    todaysCollectionsTitle: 'आज की वसूली का विवरण',
    paymentsReceivedCount: 'भुगतान',
    paymentReceivedSingle: 'भुगतान',
    noCollectionsToday: 'आज कोई भुगतान दर्ज नहीं हुआ',
    noCollectionsTodayHint: 'आज की तारीख में दर्ज भुगतान यहाँ ग्राहक के नाम के साथ दिखेंगे।',
  },
  te: {
    appName: 'హిసాబ్',
    tagline: 'ప్రతి రూపాయి లెక్కలో. ప్రతి హిసాబ్ స్పష్టంగా.',
    navHome: 'హోమ్',
    navCustomers: 'కస్టమర్లు',
    navOverdue: 'బాకీలు',
    navSettings: 'సెట్టింగ్స్',
    dashboard: 'డాష్బోర్డ్',
    todayLabel: 'నేడు',
    totalOutstanding: 'మొత్తం బాకీ',
    totalCustomers: 'మొత్తం కస్టమర్లు',
    todaysCollections: 'నేటి వసూలు',
    overdueCustomers: 'ఆలస్యమైన బాకీలు',
    customersOweLabel: 'కస్టమర్లు బాకీ ఉన్నారు',
    owesMost: 'అత్యధిక బాకీ',
    collected30d: 'వసూలు (30 రోజులు)',
    given30d: 'బాకీ (30 రోజులు)',
    longestUnpaid: 'ఎక్కువ రోజుల బాకీ',
    quickEntryTitle: 'క్విక్ ఎంట్రీ',
    quickEntryPlaceholder: 'ఉదా: సునీత 500 బాకీ లేదా రమేష్ 300 చెల్లింపు',
    quickEntrySpeak: 'మాట్లాడి నమోదు చేయండి',
    quickEntryListening: 'వింటున్నాము...',
    quickEntryRecordBtn: 'నమోదు',
    quickEntryPickCustomer: 'సరిపోయే కస్టమర్ను ఎంచుకోండి:',
    quickEntryNeedAmount: 'కస్టమర్ పేరు మరియు మొత్తం రాయండి (ఉదా "రమేష్ 450 చెల్లింపు")',
    recordEntryCta: 'ఎంట్రీ నమోదు',
    selectCustomerLabel: 'కస్టమర్',
    recentActivityTitle: 'ఇటీవలి లావాదేవీలు',
    noRecentActivity: 'ఇంకా ఇటీవలి లావాదేవీలు లేవు.',
    viewAllCustomers: 'అన్నీ చూడండి',
    undoAction: 'వెనక్కి',
    savedEntryToast: 'ఎంట్రీ సేవ్ అయింది',
    deletedEntryToast: 'ఎంట్రీ తొలగించబడింది',
    sendReceiptLink: 'వాట్సాప్ రసీదు',
    switchToDark: 'డార్క్ మోడ్కు మారండి',
    switchToLight: 'లైట్ మోడ్కు మారండి',
    searchPlaceholder: 'కస్టమర్ పేరు లేదా ఫోన్ నంబర్ వెతకండి...',
    filterAll: 'అన్నీ',
    filterOutstanding: 'బాకీ ఉన్నవి',
    filterSettled: 'చెల్లించినవి',
    filterOverdue: 'గడువు దాటినవి',
    addCustomer: 'కస్టమర్ను జోడించండి',
    editCustomer: 'కస్టమర్ వివరాలు మార్చండి',
    deleteCustomer: 'కస్టమర్ను తొలగించండి',
    addCredit: '+ బాకీ జోడించండి',
    receivePayment: '+ చెల్లింపు స్వీకరించండి',
    sendReminder: 'రిమైండర్ పంపండి',
    edit: 'మార్చండి',
    delete: 'తొలగించండి',
    save: 'సేవ్ చేయండి',
    cancel: 'రద్దు చేయండి',
    confirm: 'నిర్ధారించండి',
    close: 'మూసివేయండి',
    back: 'వెనక్కి',
    exportCsv: 'CSV ఎగుమతి',
    statusDue: 'బాకీ',
    statusOverdue: 'గడువు దాటింది',
    statusSettled: 'సరిపోయింది',
    statusAdvance: 'అడ్వాన్స్ జమ',
    customerName: 'కస్టమర్ పేరు',
    phoneNumber: '10 అంకెల మొబైల్ నంబర్',
    addressOptional: 'చిరునామా (ఐచ్ఛికం)',
    notesOptional: 'గమనికలు (ఐచ్ఛికం)',
    totalCredit: 'మొత్తం బాకీ (ఉధార్)',
    totalPayments: 'మొత్తం చెల్లింపులు',
    outstanding: 'బాకీ మొత్తం',
    advanceBalance: 'అడ్వాన్స్ మొత్తం',
    lastPaymentDate: 'చివరి చెల్లింపు',
    daysSinceLastPayment: 'చివరి చెల్లింపు నుండి రోజులు',
    noPaymentYet: 'ఇంకా చెల్లింపు లేదు',
    daysAgo: 'రోజులు',
    daySingle: 'రోజు',
    ledgerHistory: 'ఖాతా వివరాలు',
    noCustomersFound: 'కస్టమర్లు కనుగొనబడలేదు',
    noCustomersHint: 'కొత్త కస్టమర్ను జోడించండి లేదా శోధన మార్చండి.',
    noLedgerEntries: 'ఇంకా ఖాతా ఎంట్రీలు లేవు',
    noLedgerEntriesHint: 'సరుకు బాకీ ఇస్తే "+ బాకీ జోడించండి" లేదా డబ్బు వస్తే "+ చెల్లింపు స్వీకరించండి" నొక్కండి.',
    upiPayLinkLabel: 'UPI పేమెంట్ లింక్',
    upiQrCodeLabel: 'UPI QR కోడ్',
    scanToPayUpi: 'ఖచ్చితమైన బ్యాలెన్స్ చెల్లించడానికి GPay, PhonePe లేదా Paytm తో స్కాన్ చేయండి',
    printStatement: 'స్టేట్మెంట్ (PDF)',
    statementHeading: 'కస్టమర్ ఖాతా స్టేట్మెంట్',
    credit: 'బాకీ',
    payment: 'చెల్లింపు',
    creditDescription: 'కస్టమర్కు బాకీగా ఇచ్చిన సరుకులు',
    paymentDescription: 'కస్టమర్ నుండి వచ్చిన చెల్లింపు',
    amount: 'మొత్తం (₹)',
    date: 'తేదీ',
    note: 'వివరణ / సరుకులు',
    addEntryTitleCredit: 'బాకీ ఎంట్రీ జోడించండి',
    addEntryTitlePayment: 'చెల్లింపు నమోదు చేయండి',
    editEntryTitle: 'ఎంట్రీ మార్చండి',
    paymentScreenshot: 'చెల్లింపు స్క్రీన్షాట్ (ఐచ్ఛికం)',
    uploadScreenshot: 'స్క్రీన్షాట్ అప్లోడ్ చేయండి (JPG, PNG, WEBP)',
    removeScreenshot: 'తొలగించండి',
    previewScreenshot: 'రసీదు చూడండి',
    readingScreenshot: 'స్క్రీన్షాట్ నుండి మొత్తం చదువుతోంది...',
    ocrDetectedAmount: 'గుర్తించిన మొత్తం',
    useDetectedAmount: 'ఈ మొత్తం వాడండి',
    ocrNotice: 'OCR రీడింగ్ సూచన మాత్రమే. సేవ్ చేసే ముందు మొత్తాన్ని సరిచూసుకొని మీ UPI యాప్లో నిర్ధారించండి.',
    ocrUnavailable: 'స్క్రీన్షాట్ నుండి మొత్తం స్వయంచాలకంగా చదవలేకపోయింది. దయచేసి మొత్తాన్ని టైప్ చేయండి.',
    errNameRequired: 'దయచేసి కస్టమర్ పేరు నమోదు చేయండి.',
    errPhoneInvalid: 'మొబైల్ నంబర్ ఖచ్చితంగా 10 అంకెలు ఉండాలి.',
    errPhoneDuplicate: 'ఈ మొబైల్ నంబర్తో కస్టమర్ ఇప్పటికే ఉన్నారు.',
    errAmountInvalid: 'దయచేసి ₹0 కంటే ఎక్కువ సరైన మొత్తం నమోదు చేయండి.',
    errDateRequired: 'దయచేసి సరైన తేదీని ఎంచుకోండి.',
    errCustomerRequired: 'దయచేసి ఒక కస్టమర్ను ఎంచుకోండి.',
    confirmDeleteCustomerTitle: 'కస్టమర్ & ఖాతాను తొలగించాలా?',
    confirmDeleteCustomerBody: 'ఇది కస్టమర్ మరియు వారి అన్ని బాకీ, చెల్లింపు వివరాలను శాశ్వతంగా తొలగిస్తుంది. అవసరమైతే ముందుగా CSV ఎగుమతి చేయండి.',
    confirmDeleteEntryTitle: 'ఎంట్రీని తొలగించాలా?',
    confirmDeleteEntryBody: 'ఈ ఎంట్రీని తొలగిస్తే కస్టమర్ బ్యాలెన్స్ వెంటనే మారుతుంది. దీనిని తిరిగి పొందలేరు.',
    overdueTitle: 'ఆలస్యమైన బాకీ కస్టమర్లు',
    overdueSubtitle: 'ఎక్కువ రోజులుగా బాకీ ఉన్నవారు ముందుగా కనిపిస్తారు',
    allDue: 'అన్ని బాకీలు',
    days7Plus: '7+ రోజులు',
    days15Plus: '15+ రోజులు',
    days30Plus: '30+ రోజులు',
    days60Plus: '60+ రోజులు',
    noOverdueTitle: 'ఈ ఫిల్టర్లో ఆలస్యమైన బాకీలు లేవు',
    noOverdueHint: '₹0 లేదా అడ్వాన్స్ ఉన్న కస్టమర్లు బాకీ జాబితాలో ఉండరు.',
    basedOnFirstCredit: 'మొదటి బాకీ నుండి',
    whatsappPreviewTitle: 'వాట్సాప్ చెల్లింపు రిమైండర్',
    openInWhatsapp: 'వాట్సాప్లో తెరవండి',
    copyMessage: 'సందేశం కాపీ చేయండి',
    copied: 'కాపీ అయింది',
    upiIncludedNote: 'సందేశంలో UPI చెల్లింపు లింక్ జతచేయబడింది.',
    upiNotConfiguredHint: 'డైరెక్ట్ పేమెంట్ లింక్ కోసం సెట్టింగ్స్లో మీ UPI ID జోడించండి.',
    upiVerificationWarning: 'గమనిక: UPI లింక్ తెరవడం చెల్లింపు నిర్ధారణ కాదు. నమోదు చేసే ముందు మీ UPI యాప్లో డబ్బు వచ్చిందో లేదో చూడండి.',
    settingsTitle: 'షాప్ సెట్టింగ్స్ & డేటా',
    languageLabel: 'యాప్ భాష',
    shopDetailsTitle: 'షాప్ & UPI వివరాలు',
    shopNameLabel: 'షాప్ పేరు',
    upiIdLabel: 'షాప్ UPI ID (ఐచ్ఛికం)',
    upiIdPlaceholder: 'ఉదా: srisaikirana@okaxis',
    saveSettings: 'సెట్టింగ్స్ సేవ్ చేయండి',
    settingsSaved: 'సెట్టింగ్స్ సేవ్ అయ్యాయి',
    exportSectionTitle: 'రిపోర్టులు & బ్యాకప్ ఎగుమతి',
    exportAllCsv: 'అన్ని కస్టమర్లు CSV ఎగుమతి',
    exportOutstandingCsv: 'బాకీల జాబితా CSV ఎగుమతి',
    exportBackupJson: 'పూర్తి JSON బ్యాకప్ డౌన్లోడ్',
    importSectionTitle: 'మరో షాప్ డేటా దిగుమతి (JSON)',
    importJsonButton: 'దిగుమతి కోసం JSON ఫైల్ ఎంచుకోండి',
    importAttachedSample: 'అటాచ్ చేసిన నమూనా దిగుమతి (లక్ష్మీ స్టోర్)',
    downloadSampleJson: 'నమూనా JSON డౌన్లోడ్',
    importPreviewTitle: 'దిగుమతి ప్రివ్యూ',
    importCustomersFound: 'ఫైల్లో ఉన్న కస్టమర్లు',
    importEntriesFound: 'ఖాతా ఎంట్రీలు',
    importDuplicatesFound: 'ఇప్పటికే ఉన్న ఫోన్ నంబర్లు',
    importModeSkip: 'డూప్లికేట్ నంబర్లను వదిలివేయండి (సురక్షితం)',
    importModeMerge: 'ఇప్పటికే ఉన్న కస్టమర్లకు కొత్త ఎంట్రీలు కలపండి',
    confirmImport: 'దిగుమతి నిర్ధారించండి',
    importSuccess: 'డేటా దిగుమతి అయింది మరియు బ్యాలెన్స్లు లెక్కించబడ్డాయి.',
    localStorageNoticeTitle: 'డేటా ఈ పరికరంలో మాత్రమే సేవ్ చేయబడుతుంది',
    localStorageNoticeBody: 'మీ ఖాతా డేటా ఈ బ్రౌజర్లో మాత్రమే ఉంటుంది మరియు ఇతర ఫోన్లలో ఆటోమేటిక్గా సింక్ కాదు. క్రమం తప్పకుండా బ్యాకప్ డౌన్లోడ్ చేసుకోండి.',
    dataManagementTitle: 'రీసెట్ లేదా నమూనా డేటా',
    loadSampleData: 'నమూనా కిరాణా డేటా లోడ్ చేయండి',
    clearAllData: 'మొత్తం డేటా తొలగించండి',
    confirmClearAllTitle: 'మొత్తం ఖాతా డేటాను తొలగించాలా?',
    confirmClearAllBody: 'ఈ బ్రౌజర్లోని అన్ని కస్టమర్లు మరియు ఖాతా ఎంట్రీలు తొలగించబడతాయి. అవసరమైతే ముందుగా బ్యాకప్ తీసుకోండి.',
    todaysCollectionsTitle: 'నేటి వసూలు వివరాలు',
    paymentsReceivedCount: 'చెల్లింపులు',
    paymentReceivedSingle: 'చెల్లింపు',
    noCollectionsToday: 'ఈరోజు ఎటువంటి చెల్లింపు నమోదు కాలేదు',
    noCollectionsTodayHint: 'నేటి తేదీతో నమోదు చేసిన చెల్లింపులు ఇక్కడ కస్టమర్ వివరాలతో కనిపిస్తాయి.',
  },
};
