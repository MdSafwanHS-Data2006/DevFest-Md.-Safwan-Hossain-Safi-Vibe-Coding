export const translations = {
  en: {
    // Navigation / Header
    appTitle: 'Tender Document Package Builder',
    appSubtitle: 'Official Bid Submission Compiler & Compliance Engine',
    contestBadge: 'DevFest 2026',
    languageToggle: 'বাংলা',
    newPackage: 'Reset / New Package',
    confirmReset: 'Are you sure you want to reset all data and start over?',

    // Steps
    stepRequirements: '1. Requirements',
    stepUpload: '2. Upload PDFs',
    stepMatch: '3. Match Documents',
    stepValidation: '4. Status & Verify',
    stepGenerate: '5. Generate Package',

    // Tender Overview
    tenderInfoTitle: 'Tender Details & Submission Profile',
    tenderId: 'Tender ID',
    tenderTitle: 'Tender Title',
    procuringEntity: 'Procuring Entity',
    bidder: 'Bidder Name',
    submissionDeadline: 'Submission Deadline',
    loadSample: 'Load Sample Requirements',
    importJson: 'Import requirements.json',
    dropJsonHint: 'Drop requirements.json here or click to import',
    requirementsLoaded: 'Requirements loaded successfully ({count} items)',
    errorInvalidJson: 'Invalid JSON file format. Please upload a valid requirements.json file.',
    noRequirementsLoaded: 'No requirements imported yet. Please load a requirements.json file or click "Load Sample Requirements".',

    // Requirements table
    reqOrder: 'Order',
    reqTitle: 'Requirement Name',
    reqMandatory: 'Type',
    reqExpiryNeeded: 'Expiry Requirement',
    mandatoryBadge: 'Mandatory',
    optionalBadge: 'Optional',
    expiryNeededBadge: 'Expiry Date Required',
    noExpiryNeededBadge: 'No Expiry Needed',

    // Upload Section
    uploadTitle: 'PDF Document Upload',
    uploadSubtitle: 'Upload up to 30 PDF documents (Max 50 MB total limit)',
    dropPdfHint: 'Drag & drop PDF files here, or click to browse',
    selectPdfBtn: 'Choose PDF Files',
    uploadStats: '{count} of 30 files uploaded ({size} MB of 50 MB)',
    clearAllFiles: 'Clear All Uploads',
    confirmClearFiles: 'Are you sure you want to remove all uploaded PDF files?',
    fileName: 'File Name',
    fileSize: 'Size',
    pageCount: '{count} pages',
    removeFile: 'Remove',
    duplicateWarning: 'Duplicate Content (Identical to {name})',
    duplicateBadge: 'Duplicate File',
    generateDemoPdfs: 'Generate 6 Demo PDFs (Instant Test)',
    generatingDemo: 'Generating Demo PDFs...',

    // Upload Errors
    errorNonPdf: 'Rejected non-PDF file: "{name}". Only PDF files are accepted.',
    errorMaxFiles: 'Maximum 30 PDF files allowed. You have {current} files and attempted to add {attempted}.',
    errorMaxSize: 'Total file size exceeds 50 MB limit. (Total would be {size} MB, limit is 50 MB).',
    errorReadPdf: 'Could not inspect PDF file "{name}". The file may be corrupt or encrypted.',

    // Matching Section
    matchTitle: 'Requirement & Document Matching',
    matchSubtitle: 'Map each requirement to its corresponding PDF file and specify expiry dates where applicable.',
    matchInstructions: 'One requirement can have at most one matched file, and each file can be matched to at most one requirement. Duplicate content cannot be matched to different requirements.',
    selectFilePlaceholder: '-- Select an uploaded PDF --',
    unmatchBtn: 'Unmatch',
    matchedToOther: '(Already matched to #{order})',
    duplicateOfMatched: '(Duplicate of {file} matched to #{order})',
    matchedFileLabel: 'Matched PDF File',
    expiryDateLabel: 'Document Expiry Date',
    expiryDatePlaceholder: 'YYYY-MM-DD',
    expiryValidHint: 'Valid (Expires on or after deadline {deadline})',
    expiryInvalidHint: 'Expired (Expires before deadline {deadline})',
    noFilesUploadedHint: 'No PDF files uploaded yet. Please upload PDF files in the Upload step before matching.',
    autoMatchBtn: 'Smart Match by Filename',
    autoMatchNotice: 'Matched {count} document(s) by filename keywords.',

    // Status Engine Labels & Badges
    statusMissing: 'Missing',
    statusExpiryNeeded: 'Expiry date needed',
    statusExpired: 'Expired',
    statusNotProvided: 'Not provided',
    statusOk: 'OK',

    // Status Descriptions
    descMissing: 'Mandatory document has not been attached.',
    descExpiryNeeded: 'Document attached, but expiry date must be entered.',
    descExpired: 'Document has expired before the tender submission deadline.',
    descNotProvided: 'Optional requirement without an attached file (omitted from final package).',
    descOk: 'Document attached and verified.',

    // Validation & Blocking
    validationTitle: 'Compliance Verification & Status Engine',
    validationSubtitle: 'Real-time validation against tender rules and submission deadlines.',
    readyToGenerate: 'All requirements verified! The submission package is ready to be compiled.',
    generationBlocked: 'Package Generation Blocked',
    blockedExplanation: 'The following blocking issues must be resolved before the combined submission package can be generated:',
    summaryStats: 'Status Summary: {ok} OK | {missing} Missing | {expiryNeeded} Expiry Needed | {expired} Expired | {notProvided} Not Provided',
    zeroMatchesError: 'At least one document must be matched to generate a submission package.',

    // Generate Package Section
    generateTitle: 'Generate Tender Submission Package',
    generateSubtitle: 'Compile all verified documents into a single checked, numbered tender dossier with an official English cover.',
    generateBtn: 'Generate Tender Package PDF',
    generatingBtn: 'Compiling Submission Package...',
    downloadReadyBtn: 'Download Package Again ({filename})',
    packageRulesTitle: 'Automatic Dossier Construction Rules:',
    ruleCover: 'Page 1 is an official English cover showing tender ID, title, procuring entity, bidder, submission deadline, creation date, and document table.',
    ruleOrder: 'Attached documents are ordered according to numeric requirement sequence (#1, #2, etc.).',
    rulePagination: 'Every page (including cover) features a continuous footer: "<tender_id> | Page X of Y".',
    ruleFooterMargin: 'Footers are placed in a protected bottom margin so they never obscure source document content.',
    ruleOptional: 'Optional requirements without a file are automatically omitted.',
    ruleFilename: 'The package downloads automatically with the filename: "<tender_id>_Package.pdf".',
    successGenerated: 'Package successfully generated! ({pages} pages, {size} KB)',

    // General
    actions: 'Actions',
    status: 'Status',
    details: 'Details',
    back: 'Previous',
    next: 'Next',
    close: 'Close',
  },
  bn: {
    // Navigation / Header
    appTitle: 'টেন্ডার নথি প্যাকেজ বিল্ডার',
    appSubtitle: 'অফিসিয়াল দরপত্র নথি সংকলন ও যাচাইকরণ ইঞ্জিন',
    contestBadge: 'দেবফেস্ট ২০২৬',
    languageToggle: 'English',
    newPackage: 'রিসেট / নতুন প্যাকেজ',
    confirmReset: 'আপনি কি নিশ্চিত যে আপনি সকল তথ্য রিসেট করে নতুন করে শুরু করতে চান?',

    // Steps
    stepRequirements: '১. প্রয়োজনীয় শর্তাবলী',
    stepUpload: '২. পিডিএফ আপলোড',
    stepMatch: '৩. নথি মেলানো',
    stepValidation: '৪. স্ট্যাটাস ও যাচাই',
    stepGenerate: '৫. প্যাকেজ তৈরি',

    // Tender Overview
    tenderInfoTitle: 'দরপত্রের বিবরণ ও প্রোফাইল',
    tenderId: 'টেন্ডার আইডি',
    tenderTitle: 'দরপত্রের শিরোনাম',
    procuringEntity: 'ক্রয়কারী প্রতিষ্ঠান',
    bidder: 'দরদাতার নাম',
    submissionDeadline: 'জমা দেওয়ার শেষ সময়',
    loadSample: 'নমুনা শর্তাবলী লোড করুন',
    importJson: 'requirements.json আমদানি করুন',
    dropJsonHint: 'requirements.json ফাইলটি এখানে ফেলুন অথবা ক্লিক করে নির্বাচন করুন',
    requirementsLoaded: 'শর্তাবলী সফলভাবে লোড হয়েছে ({count}টি শর্ত)',
    errorInvalidJson: 'ভুল JSON ফাইল ফরম্যাট। অনুগ্রহ করে একটি সঠিক requirements.json ফাইল আপলোড করুন।',
    noRequirementsLoaded: 'এখনও কোনো শর্তাবলী আমদানি করা হয়নি। অনুগ্রহ করে requirements.json ফাইল আমদানি করুন অথবা "নমুনা শর্তাবলী লোড করুন"-এ ক্লিক করুন।',

    // Requirements table
    reqOrder: 'ক্রম',
    reqTitle: 'শর্তের বিবরণ',
    reqMandatory: 'ধরন',
    reqExpiryNeeded: 'মেয়াদের শর্ত',
    mandatoryBadge: 'বাধ্যতামূলক',
    optionalBadge: 'ঐচ্ছিক',
    expiryNeededBadge: 'মেয়াদের তারিখ প্রয়োজন',
    noExpiryNeededBadge: 'মেয়াদের প্রয়োজন নেই',

    // Upload Section
    uploadTitle: 'পিডিএফ নথি আপলোড',
    uploadSubtitle: 'সর্বোচ্চ ৩০টি পিডিএফ নথি আপলোড করুন (সর্বোচ্চ মোট ৫০ মেগাবাইট)',
    dropPdfHint: 'এখানে পিডিএফ ফাইল টেনে আনুন, অথবা ব্রাউজ করতে ক্লিক করুন',
    selectPdfBtn: 'পিডিএফ ফাইল নির্বাচন করুন',
    uploadStats: '৩০টির মধ্যে {count}টি ফাইল আপলোড হয়েছে (৫০ মেগাবাইটের মধ্যে {size} মেগাবাইট)',
    clearAllFiles: 'সকল আপলোড মুছুন',
    confirmClearFiles: 'আপনি কি নিশ্চিত যে সকল আপলোড করা পিডিএফ ফাইল মুছে ফেলতে চান?',
    fileName: 'ফাইলের নাম',
    fileSize: 'ফাইলের আকার',
    pageCount: '{count} পৃষ্ঠা',
    removeFile: 'মুছুন',
    duplicateWarning: 'অনুরূপ বিষয়বস্তু ({name}-এর সাথে হুবহু এক)',
    duplicateBadge: 'অনুরূপ ফাইল',
    generateDemoPdfs: '৬টি ডেমো পিডিএফ তৈরি করুন (তাত্ক্ষণিক পরীক্ষা)',
    generatingDemo: 'ডেমো পিডিএফ তৈরি হচ্ছে...',

    // Upload Errors
    errorNonPdf: 'পিডিএফ নয় এমন ফাইল বাতিল করা হয়েছে: "{name}"। শুধুমাত্র পিডিএফ ফাইল গ্রহণযোগ্য।',
    errorMaxFiles: 'সর্বোচ্চ ৩০টি পিডিএফ ফাইলের অনুমতি রয়েছে। বর্তমানে {current}টি ফাইল রয়েছে এবং {attempted}টি যোগ করার চেষ্টা করা হয়েছে।',
    errorMaxSize: 'মোট ফাইলের আকার ৫০ মেগাবাইটের সীমা অতিক্রম করেছে। (প্রচেষ্টা: {size} MB, সীমা: ৫০ MB)।',
    errorReadPdf: '"{name}" পিডিএফ ফাইলটি পড়া সম্ভব হয়নি। ফাইলটি নষ্ট বা পাসওয়ার্ডযুক্ত হতে পারে।',

    // Matching Section
    matchTitle: 'শর্ত ও নথি মেলানো (ম্যাচিং)',
    matchSubtitle: 'প্রতিটি শর্তের সাথে উপযুক্ত পিডিএফ নথি নির্বাচন করুন এবং প্রযোজ্য ক্ষেত্রে মেয়াদ শেষের তারিখ দিন।',
    matchInstructions: 'একটি শর্তে সর্বোচ্চ একটি ফাইল এবং একটি ফাইল সর্বোচ্চ একটি শর্তে ম্যাচ করা যাবে। একই বা ডুপ্লিকেট বিষয়বস্তুর ফাইল একাধিক শর্তে ম্যাচ করা যাবে না।',
    selectFilePlaceholder: '-- একটি আপলোডকৃত পিডিএফ বেছে নিন --',
    unmatchBtn: 'মিল বাতিল করুন',
    matchedToOther: '(ইতিমধ্যেই #{order} শর্তে ম্যাচ করা আছে)',
    duplicateOfMatched: '(#{order}-এর {file} ফাইলের অনুরূপ ডুপ্লিকেট)',
    matchedFileLabel: 'ম্যাচ করা পিডিএফ ফাইল',
    expiryDateLabel: 'নথির মেয়াদ শেষের তারিখ',
    expiryDatePlaceholder: 'YYYY-MM-DD',
    expiryValidHint: 'বৈধ (জমা দেওয়ার শেষ তারিখ {deadline}-এর সমান বা পরে)',
    expiryInvalidHint: 'মেয়াদোত্তীর্ণ (জমা দেওয়ার শেষ তারিখ {deadline}-এর পূর্বে)',
    noFilesUploadedHint: 'এখনও কোনো পিডিএফ ফাইল আপলোড করা হয়নি। ম্যাচ করার পূর্বে আপলোড ধাপে ফাইল যুক্ত করুন।',
    autoMatchBtn: 'নাম অনুযায়ী স্বয়ংক্রিয় ম্যাচ',
    autoMatchNotice: 'ফাইলের নাম বিশ্লেষণ করে {count}টি নথি স্বয়ংক্রিয়ভাবে ম্যাচ করা হয়েছে।',

    // Status Engine Labels & Badges
    statusMissing: 'Missing (অনুপস্থিত)',
    statusExpiryNeeded: 'Expiry date needed (মেয়াদের তারিখ প্রয়োজন)',
    statusExpired: 'Expired (মেয়াদোত্তীর্ণ)',
    statusNotProvided: 'Not provided (প্রদান করা হয়নি)',
    statusOk: 'OK (সঠিক)',

    // Status Descriptions
    descMissing: 'বাধ্যতামূলক শর্তে কোনো নথি সংযুক্ত করা হয়নি।',
    descExpiryNeeded: 'নথি সংযুক্ত আছে, কিন্তু মেয়াদের তারিখ প্রদান করা প্রয়োজন।',
    descExpired: 'দরপত্র জমা দেওয়ার শেষ তারিখের পূর্বেই নথির মেয়াদ শেষ হয়ে গেছে।',
    descNotProvided: 'ঐচ্ছিক শর্তে কোনো নথি সংযুক্ত করা হয়নি (চূড়ান্ত প্যাকেজ থেকে বাদ থাকবে)।',
    descOk: 'নথি সংযুক্ত এবং সকল শর্তে সঠিক ও বৈধ।',

    // Validation & Blocking
    validationTitle: 'কমপ্লায়েন্স যাচাইকরণ ও স্ট্যাটাস ইঞ্জিন',
    validationSubtitle: 'দরপত্রের শর্তাবলী এবং জমা দেওয়ার সময়সীমা অনুসারে রিয়েল-টাইম যাচাই।',
    readyToGenerate: 'সকল শর্ত পূরণ হয়েছে! দরপত্র সাবমিশন প্যাকেজ সংকলনের জন্য প্রস্তুত।',
    generationBlocked: 'প্যাকেজ তৈরি স্থগিত রয়েছে',
    blockedExplanation: 'চূড়ান্ত প্যাকেজ তৈরি করার পূর্বে নিম্নোক্ত সমস্যাগুলি সমাধান করা আবশ্যক:',
    summaryStats: 'স্ট্যাটাস সারসংক্ষেপ: {ok}টি OK | {missing}টি Missing | {expiryNeeded}টি Expiry Needed | {expired}টি Expired | {notProvided}টি Not Provided',
    zeroMatchesError: 'প্যাকেজ তৈরির জন্য কমপক্ষে একটি নথি ম্যাচ করা আবশ্যক।',

    // Generate Package Section
    generateTitle: 'দরপত্র সাবমিশন প্যাকেজ প্রস্তুতকরণ',
    generateSubtitle: 'যাচাইকৃত সকল নথিকে একটি সুশৃঙ্খল, পেজ নম্বরযুক্ত দরপত্র ফাইলে যুক্ত করুন যার শুরুতে ইংরেজি কভার পৃষ্ঠা থাকবে।',
    generateBtn: 'দরপত্র প্যাকেজ পিডিএফ তৈরি করুন',
    generatingBtn: 'প্যাকেজ সংকলন করা হচ্ছে...',
    downloadReadyBtn: 'পুনরায় প্যাকেজ ডাউনলোড করুন ({filename})',
    packageRulesTitle: 'স্বয়ংক্রিয় প্যাকেজ তৈরির নিয়মাবলী:',
    ruleCover: 'পৃষ্ঠা ১ একটি প্রাতিষ্ঠানিক ইংরেজি কভার যেখানে টেন্ডার আইডি, শিরোনাম, ক্রয়কারী প্রতিষ্ঠান, বিডার, জমা দেওয়ার শেষ সময়, তৈরির তারিখ এবং নথির তালিকা থাকবে।',
    ruleOrder: 'সংযুক্ত নথিগুলি সাংখ্যিক ক্রম (#1, #2 ইত্যাদি) অনুসারে সাজানো হবে।',
    rulePagination: 'প্রতিটি পৃষ্ঠায় (কভার সহ) একটি নিরবচ্ছিন্ন ফুটার থাকবে: "<tender_id> | Page X of Y"।',
    ruleFooterMargin: 'ফুটারটি নিচের সুরক্ষিত মার্জিনে থাকবে যাতে মূল নথির কোনো লেখা বা তথ্য ঢাকা না পড়ে।',
    ruleOptional: 'যেসব ঐচ্ছিক শর্তে ফাইল নেই সেগুলি স্বয়ংক্রিয়ভাবে বাদ দেওয়া হবে।',
    ruleFilename: 'প্যাকেজটি স্বয়ংক্রিয়ভাবে "<tender_id>_Package.pdf" নামে ডাউনলোড হবে।',
    successGenerated: 'প্যাকেজ সফলভাবে তৈরি হয়েছে! ({pages} পৃষ্ঠা, {size} কিলোবাইট)',

    // General
    actions: 'পদক্ষেপ',
    status: 'স্ট্যাটাস',
    details: 'বিবরণ',
    back: 'পূর্ববর্তী',
    next: 'পরবর্তী',
    close: 'বন্ধ করুন',
  },
};
