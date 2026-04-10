import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Translation dictionary
const translations = {
  en: {
    // Navigation
    home: 'Home',
    restaurants: 'Restaurants',
    orders: 'Orders',
    profile: 'Profile',
    logout: 'Logout',
    login: 'Login',
    register: 'Register',
    
    // Login Page
    welcomeBack: 'Welcome Back!',
    loginToAccount: 'Login to your UniBite account',
    emailAddress: 'Email Address',
    enterEmail: 'Enter your email',
    enterPassword: 'Enter your password',
    rememberMe: 'Remember Me',
    forgotPassword: 'Forgot?',
    signingIn: 'Signing In...',
    continueWithGoogle: 'Continue with Google',
    continueWithApple: 'Continue with Apple',
    dontHaveAccount: "Don't have an account?",
    registerNow: 'Register Now',
    ownRestaurant: 'Own a restaurant?',
    partnerWithUs: 'Partner with UniBite',
    safeSecure: 'Safe & Secure',
    fastDelivery: 'Fast Delivery',
    support247: '24/7 Support',
    
    // Register Page
    createAccount: 'Create Account',
    joinUniBite: 'Join UniBite today',
    fullName: 'Full Name',
    phoneNumber: 'Phone Number',
    confirmPassword: 'Confirm Password',
    iAgree: 'I agree to the',
    termsConditions: 'Terms & Conditions',
    and: 'and',
    privacyPolicy: 'Privacy Policy',
    creatingAccount: 'Creating Account...',
    alreadyHaveAccount: 'Already have an account?',
    loginHere: 'Login Here',
    
    // Home Page
    welcomeTitle: 'Welcome to UniBite',
    welcomeSubtitle: 'Order delicious food from your favorite campus restaurants',
    orderNow: 'Order Now',
    viewRestaurants: 'View Restaurants',
    freeDelivery: 'Free delivery on orders over 200 ETB',
    orderFromFavorite: 'Order from your favorite cafeterias & get it delivered fast!',
    imLovinIt: "I'm lovin' it!",
    fastCampusDelivery: 'Fast Campus Delivery',
    favoriteMeals: 'Your Favorite Meals, Delivered Fresh',
    campusDoor: 'Right to Your Campus Door!',
    qualityFood: 'Quality Food',
    easyPayment: 'Easy Payment',
    
    // Restaurants
    allRestaurants: 'All Campus Restaurants',
    discoverFood: 'Discover amazing food from all our partner restaurants around campus',
    searchRestaurants: 'Search restaurants...',
    open: 'Open',
    closed: 'Closed',
    viewMenu: 'View Menu',
    filterByCategory: 'Filter by Category',
    all: 'All',
    
    // Menu
    menu: 'Menu',
    addToCart: 'Add to Cart',
    cart: 'Cart',
    checkout: 'Checkout',
    total: 'Total',
    subtotal: 'Subtotal',
    deliveryFee: 'Delivery Fee',
    
    // Orders
    myOrders: 'My Orders',
    orderHistory: 'Order History',
    orderNumber: 'Order',
    status: 'Status',
    date: 'Date',
    amount: 'Amount',
    pending: 'Pending',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready: 'Ready',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    
    // Profile
    myProfile: 'My Profile',
    personalInfo: 'Personal Information',
    name: 'Full Name',
    email: 'Email Address',
    phone: 'Phone Number',
    address: 'Address',
    language: 'Language',
    selectLanguage: 'Select Language',
    english: 'English',
    amharic: 'Amharic',
    saveChanges: 'Save Changes',
    editProfile: 'Edit Profile',
    manageAccount: 'Manage your account information',
    selectPreferredLanguage: 'Select your preferred language for the application',
    phoneNote: 'Ethiopian phone number format (e.g., 0911234567)',
    profileNote: 'Your phone number is required for Chapa payment processing. Please ensure it is in Ethiopian format (e.g., 0911234567).',
    back: 'Back',
    
    // Checkout
    checkoutTitle: 'Checkout',
    deliveryAddress: 'Delivery Address',
    paymentMethod: 'Payment Method',
    orderSummary: 'Order Summary',
    placeOrder: 'Place Order',
    
    // Common
    loading: 'Loading...',
    search: 'Search',
    filter: 'Filter',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    save: 'Save',
    next: 'Next',
    submit: 'Submit',
    close: 'Close',
    yes: 'Yes',
    no: 'No',
    currency: 'ETB',
    password: 'Password',
    
    // Admin Dashboard
    dashboard: 'Dashboard',
    welcome: 'Welcome',
    adminPanel: 'Admin Panel',
    totalStudents: 'Total Students',
    totalRestaurants: 'Total Restaurants',
    totalRiders: 'Total Riders',
    totalOrders: 'Total Orders',
    ordersToday: 'Orders Today',
    totalRevenue: 'Total Revenue',
    pendingOrders: 'Pending Orders',
    activeUsers: 'Active Users',
    vsLastMonth: 'vs last month',
    vsYesterday: 'vs yesterday',
    manageOperations: 'Manage your restaurant operations below',
    
    // Users Management
    userManagement: 'User Management',
    managePlatformUsers: 'Manage all platform users and their accounts',
    totalUsers: 'Total Users',
    students: 'Students',
    riders: 'Riders',
    allUsers: 'All Users',
    searchByName: 'Search by name or email...',
    user: 'User',
    role: 'Role',
    contact: 'Contact',
    actions: 'Actions',
    viewProfile: 'View Profile',
    deactivate: 'Deactivate',
    activate: 'Activate',
    deleteUser: 'Delete User',
    userProfile: 'User Profile',
    ownerName: 'Owner Name',
    joinedDate: 'Joined Date',
    userId: 'User ID',
    deactivateAccount: 'Deactivate Account',
    activateAccount: 'Activate Account',
    addEmployee: 'Add Employee',
    addNewEmployee: 'Add New Employee',
    enterFullName: 'Enter full name',
    enterEmail: 'Enter email address',
    enterPhone: 'Enter phone number',
    
    // Restaurant Management
    restaurantManagement: 'Restaurant Management',
    reviewRestaurants: 'Review and manage restaurant registrations',
    pendingStatus: 'Pending',
    approved: 'Approved',
    allRestaurantsFilter: 'All Restaurants',
    noRestaurantsFound: 'No restaurants found',
    noRestaurantsMatch: 'No restaurants match the selected filter',
    viewFullDetails: 'View Full Details',
    menuImages: 'Menu Images',
    businessLicense: 'Business License',
    viewPDF: 'View PDF',
    pdfDocument: 'PDF Document',
    foodCategories: 'Food Categories',
    bankAccountInfo: 'Bank Account Information',
    accountHolder: 'Account Holder',
    accountNumber: 'Account Number',
    bankName: 'Bank Name',
    openingHours: 'Opening Hours',
    description: 'Description',
    approveRestaurant: 'Approve Restaurant',
    rejectRestaurant: 'Reject Restaurant',
    noMenuImages: 'No menu images uploaded',
    
    // Sidebar
    users: 'Users',
    restaurantMgmt: 'Restaurant Management',
    payments: 'Payments',
    coupons: 'Coupons',
    reviews: 'Reviews',
    reports: 'Reports',
    settings: 'Settings',
    notifications: 'Notifications',
    premiumPlan: 'Premium Plan',
    upgradeNow: 'Upgrade now',
    upgrade: 'Upgrade',
    comingSoon: 'Coming Soon',
  },
  am: {
    // Navigation
    home: 'መነሻ',
    restaurants: 'ምግብ ቤቶች',
    orders: 'ትዕዛዞች',
    profile: 'መገለጫ',
    logout: 'ውጣ',
    login: 'ግባ',
    register: 'ተመዝገብ',
    
    // Login Page
    welcomeBack: 'እንኳን ደህና መጡ!',
    loginToAccount: 'ወደ ዩኒባይት መለያዎ ይግቡ',
    emailAddress: 'ኢሜይል አድራሻ',
    enterEmail: 'ኢሜይልዎን ያስገቡ',
    enterPassword: 'የይለፍ ቃልዎን ያስገቡ',
    rememberMe: 'አስታውሰኝ',
    forgotPassword: 'ረሱት?',
    signingIn: 'በመግባት ላይ...',
    continueWithGoogle: 'በጉግል ይቀጥሉ',
    continueWithApple: 'በአፕል ይቀጥሉ',
    dontHaveAccount: 'መለያ የለዎትም?',
    registerNow: 'አሁን ይመዝገቡ',
    ownRestaurant: 'ምግብ ቤት አለዎት?',
    partnerWithUs: 'ከዩኒባይት ጋር አጋር ይሁኑ',
    safeSecure: 'ደህንነቱ የተጠበቀ',
    fastDelivery: 'ፈጣን ማድረስ',
    support247: '24/7 ድጋፍ',
    
    // Register Page
    createAccount: 'መለያ ፍጠር',
    joinUniBite: 'ዛሬ ዩኒባይትን ይቀላቀሉ',
    fullName: 'ሙሉ ስም',
    phoneNumber: 'ስልክ ቁጥር',
    confirmPassword: 'የይለፍ ቃል አረጋግጥ',
    iAgree: 'እስማማለሁ',
    termsConditions: 'ውሎች እና ሁኔታዎች',
    and: 'እና',
    privacyPolicy: 'የግላዊነት ፖሊሲ',
    creatingAccount: 'መለያ በመፍጠር ላይ...',
    alreadyHaveAccount: 'ቀድሞውኑ መለያ አለዎት?',
    loginHere: 'እዚህ ይግቡ',
    
    // Home Page
    welcomeTitle: 'እንኳን ወደ ዩኒባይት በደህና መጡ',
    welcomeSubtitle: 'ከተወዳጅ የካምፓስ ምግብ ቤቶችዎ ጣፋጭ ምግብ ያዝዙ',
    orderNow: 'አሁን ያዝዙ',
    viewRestaurants: 'ምግብ ቤቶችን ይመልከቱ',
    freeDelivery: 'ከ200 ብር በላይ በሆኑ ትዕዛዞች ላይ ነፃ ማድረስ',
    orderFromFavorite: 'ከተወዳጅ ካፌቴሪያዎችዎ ያዝዙ እና ፈጣን ያድርሱ!',
    imLovinIt: 'በጣም እወደዋለሁ!',
    fastCampusDelivery: 'ፈጣን የካምፓስ ማድረስ',
    favoriteMeals: 'የእርስዎ ተወዳጅ ምግቦች፣ ትኩስ ተላልፈዋል',
    campusDoor: 'ወደ የካምፓስ በርዎ በቀጥታ!',
    qualityFood: 'ጥራት ያለው ምግብ',
    easyPayment: 'ቀላል ክፍያ',
    
    // Restaurants
    allRestaurants: 'ሁሉም የካምፓስ ምግብ ቤቶች',
    discoverFood: 'በካምፓስ ዙሪያ ካሉ የአጋር ምግብ ቤቶቻችን አስደናቂ ምግብ ያግኙ',
    searchRestaurants: 'ምግብ ቤቶችን ይፈልጉ...',
    open: 'ክፍት',
    closed: 'ዝግ',
    viewMenu: 'ምናሌ ይመልከቱ',
    filterByCategory: 'በምድብ አጣራ',
    all: 'ሁሉም',
    
    // Menu
    menu: 'ምናሌ',
    addToCart: 'ወደ ጋሪ ጨምር',
    cart: 'ጋሪ',
    checkout: 'ክፈል',
    total: 'ጠቅላላ',
    subtotal: 'ንዑስ ድምር',
    deliveryFee: 'የማድረስ ክፍያ',
    
    // Orders
    myOrders: 'የእኔ ትዕዛዞች',
    orderHistory: 'የትዕዛዝ ታሪክ',
    orderNumber: 'ትዕዛዝ',
    status: 'ሁኔታ',
    date: 'ቀን',
    amount: 'መጠን',
    pending: 'በመጠባበቅ ላይ',
    confirmed: 'ተረጋግጧል',
    preparing: 'በዝግጅት ላይ',
    ready: 'ዝግጁ',
    delivered: 'ተላልፏል',
    cancelled: 'ተሰርዟል',
    
    // Profile
    myProfile: 'የእኔ መገለጫ',
    personalInfo: 'የግል መረጃ',
    name: 'ሙሉ ስም',
    email: 'ኢሜይል አድራሻ',
    phone: 'ስልክ ቁጥር',
    address: 'አድራሻ',
    language: 'ቋንቋ',
    selectLanguage: 'ቋንቋ ይምረጡ',
    english: 'እንግሊዝኛ',
    amharic: 'አማርኛ',
    saveChanges: 'ለውጦችን አስቀምጥ',
    editProfile: 'መገለጫ አርትዕ',
    manageAccount: 'የመለያ መረጃዎን ያስተዳድሩ',
    selectPreferredLanguage: 'ለመተግበሪያው የሚመርጡትን ቋንቋ ይምረጡ',
    phoneNote: 'የኢትዮጵያ ስልክ ቁጥር ቅርጸት (ለምሳሌ 0911234567)',
    profileNote: 'የስልክ ቁጥርዎ ለቻፓ ክፍያ ማስኬጃ ያስፈልጋል። እባክዎ በኢትዮጵያ ቅርጸት መሆኑን ያረጋግጡ (ለምሳሌ 0911234567)።',
    back: 'ተመለስ',
    
    // Checkout
    checkoutTitle: 'ክፍያ',
    deliveryAddress: 'የማድረሻ አድራሻ',
    paymentMethod: 'የክፍያ ዘዴ',
    orderSummary: 'የትዕዛዝ ማጠቃለያ',
    placeOrder: 'ትዕዛዝ ያስቀምጡ',
    
    // Common
    loading: 'በመጫን ላይ...',
    search: 'ፈልግ',
    filter: 'አጣራ',
    cancel: 'ሰርዝ',
    confirm: 'አረጋግጥ',
    delete: 'ሰርዝ',
    edit: 'አርትዕ',
    save: 'አስቀምጥ',
    next: 'ቀጣይ',
    submit: 'አስገባ',
    close: 'ዝጋ',
    yes: 'አዎ',
    no: 'አይ',
    currency: 'ብር',
    password: 'የይለፍ ቃል',
    
    // Admin Dashboard
    dashboard: 'ዳሽቦርድ',
    welcome: 'እንኳን ደህና መጡ',
    adminPanel: 'የአስተዳዳሪ ፓነል',
    totalStudents: 'ጠቅላላ ተማሪዎች',
    totalRestaurants: 'ጠቅላላ ምግብ ቤቶች',
    totalRiders: 'ጠቅላላ አሽከርካሪዎች',
    totalOrders: 'ጠቅላላ ትዕዛዞች',
    ordersToday: 'የዛሬ ትዕዛዞች',
    totalRevenue: 'ጠቅላላ ገቢ',
    pendingOrders: 'በመጠባበቅ ላይ ያሉ ትዕዛዞች',
    activeUsers: 'ንቁ ተጠቃሚዎች',
    vsLastMonth: 'ካለፈው ወር ጋር ሲነፃፀር',
    vsYesterday: 'ከትናንት ጋር ሲነፃፀር',
    manageOperations: 'የምግብ ቤት ስራዎችዎን ከዚህ በታች ያስተዳድሩ',
    
    // Users Management
    userManagement: 'የተጠቃሚ አስተዳደር',
    managePlatformUsers: 'ሁሉንም የመድረክ ተጠቃሚዎች እና መለያዎቻቸውን ያስተዳድሩ',
    totalUsers: 'ጠቅላላ ተጠቃሚዎች',
    students: 'ተማሪዎች',
    riders: 'አሽከርካሪዎች',
    allUsers: 'ሁሉም ተጠቃሚዎች',
    searchByName: 'በስም ወይም ኢሜይል ይፈልጉ...',
    user: 'ተጠቃሚ',
    role: 'ሚና',
    contact: 'ግንኙነት',
    actions: 'ድርጊቶች',
    viewProfile: 'መገለጫ ይመልከቱ',
    deactivate: 'አቦዝን',
    activate: 'አንቃ',
    deleteUser: 'ተጠቃሚ ሰርዝ',
    userProfile: 'የተጠቃሚ መገለጫ',
    ownerName: 'የባለቤት ስም',
    joinedDate: 'የተቀላቀለበት ቀን',
    userId: 'የተጠቃሚ መለያ',
    deactivateAccount: 'መለያ አቦዝን',
    activateAccount: 'መለያ አንቃ',
    addEmployee: 'ሰራተኛ ጨምር',
    addNewEmployee: 'አዲስ ሰራተኛ ጨምር',
    enterFullName: 'ሙሉ ስም ያስገቡ',
    enterEmail: 'ኢሜይል አድራሻ ያስገቡ',
    enterPhone: 'ስልክ ቁጥር ያስገቡ',
    
    // Restaurant Management
    restaurantManagement: 'የምግብ ቤት አስተዳደር',
    reviewRestaurants: 'የምግብ ቤት ምዝገባዎችን ይገምግሙ እና ያስተዳድሩ',
    pendingStatus: 'በመጠባበቅ ላይ',
    approved: 'ጸድቋል',
    allRestaurantsFilter: 'ሁሉም ምግብ ቤቶች',
    noRestaurantsFound: 'ምንም ምግብ ቤቶች አልተገኙም',
    noRestaurantsMatch: 'ምንም ምግብ ቤቶች ከተመረጠው ማጣሪያ ጋር አይዛመዱም',
    viewFullDetails: 'ሙሉ ዝርዝሮችን ይመልከቱ',
    menuImages: 'የምናሌ ምስሎች',
    businessLicense: 'የንግድ ፈቃድ',
    viewPDF: 'ፒዲኤፍ ይመልከቱ',
    pdfDocument: 'ፒዲኤፍ ሰነድ',
    foodCategories: 'የምግብ ምድቦች',
    bankAccountInfo: 'የባንክ መለያ መረጃ',
    accountHolder: 'የመለያ ባለቤት',
    accountNumber: 'የመለያ ቁጥር',
    bankName: 'የባንክ ስም',
    openingHours: 'የመክፈቻ ሰዓቶች',
    description: 'መግለጫ',
    approveRestaurant: 'ምግብ ቤት አጽድቅ',
    rejectRestaurant: 'ምግብ ቤት ውድቅ አድርግ',
    noMenuImages: 'ምንም የምናሌ ምስሎች አልተጫኑም',
    
    // Sidebar
    users: 'ተጠቃሚዎች',
    restaurantMgmt: 'የምግብ ቤት አስተዳደር',
    payments: 'ክፍያዎች',
    coupons: 'ኩፖኖች',
    reviews: 'ግምገማዎች',
    reports: 'ሪፖርቶች',
    settings: 'ቅንብሮች',
    notifications: 'ማሳወቂያዎች',
    premiumPlan: 'ፕሪሚየም እቅድ',
    upgradeNow: 'አሁን አሻሽል',
    upgrade: 'አሻሽል',
    comingSoon: 'በቅርቡ',
  }
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get language from localStorage or default to English
    return localStorage.getItem('language') || 'en'
  })

  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem('language', language)
    console.log('Language changed to:', language)
  }, [language])

  const t = (key) => {
    const translation = translations[language][key]
    if (!translation) {
      console.warn(`Translation missing for key: ${key} in language: ${language}`)
      return key
    }
    return translation
  }

  const changeLanguage = (lang) => {
    if (lang === 'en' || lang === 'am') {
      console.log('Changing language to:', lang)
      setLanguage(lang)
    }
  }

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
