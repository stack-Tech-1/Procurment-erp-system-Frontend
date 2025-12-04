// C:\Users\SMC\Documents\GitHub\procurement-erp-system\frontend\src\lib\i18n.js
// Simple i18n implementation for now
const translations = {
    en: {
      welcome: "Welcome",
      signup: "Sign Up",
      login: "Login",
      email: "Email Address",
      password: "Password",
      fullName: "Full Name",
      companyName: "Company Name",
      phone: "Phone Number",
      country: "Country",
      accessCode: "Access Code",
      department: "Department",
      terms: "I agree to the Terms & Conditions",
      privacy: "Privacy Policy",
      support: "Support",
      help: "Help",
      language: "Language",
      submit: "Submit",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      confirmPassword: "Confirm Password",
      weak: "Weak",
      fair: "Fair",
      good: "Good",
      strong: "Strong",
      veryWeak: "Very Weak",
      passwordStrength: "Password Strength",
      next: "Next",
      back: "Back",
      completeRegistration: "Complete Registration",
      alreadyHaveAccount: "Already have an account?",
      signInHere: "Sign in here",
      supplierRegistration: "Supplier Registration",
      staffRegistration: "Staff Registration",
      basicInfo: "Basic Information",
      companyDetails: "Company Details",
      staffDetails: "Staff Details",
      complete: "Complete",
      createYourAccount: "Create Your ProcureTrack Account"
    },
    ar: {
      welcome: "مرحباً",
      signup: "التسجيل",
      login: "تسجيل الدخول",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      fullName: "الاسم الكامل",
      companyName: "اسم الشركة",
      phone: "رقم الهاتف",
      country: "البلد",
      accessCode: "رمز الدخول",
      department: "القسم",
      terms: "أوافق على الشروط والأحكام",
      privacy: "سياسة الخصوصية",
      support: "الدعم",
      help: "مساعدة",
      language: "اللغة",
      submit: "إرسال",
      loading: "جاري التحميل...",
      error: "خطأ",
      success: "نجاح",
      confirmPassword: "تأكيد كلمة المرور",
      weak: "ضعيفة",
      fair: "متوسطة",
      good: "جيدة",
      strong: "قوية",
      veryWeak: "ضعيفة جداً",
      passwordStrength: "قوة كلمة المرور",
      next: "التالي",
      back: "السابق",
      completeRegistration: "إتمام التسجيل",
      alreadyHaveAccount: "هل لديك حساب بالفعل؟",
      signInHere: "سجل الدخول هنا",
      supplierRegistration: "تسجيل الموردين",
      staffRegistration: "تسجيل الموظفين",
      basicInfo: "المعلومات الأساسية",
      companyDetails: "تفاصيل الشركة",
      staffDetails: "تفاصيل الموظف",
      complete: "إكمال",
      createYourAccount: "أنشئ حسابك في ProcureTrack"
    }
  };
  
  export function useTranslation(locale = 'en') {
    return {
      t: (key) => translations[locale][key] || key,
      i18n: {
        changeLanguage: (newLocale) => {
          if (typeof window !== 'undefined') {
            localStorage.setItem('preferred-language', newLocale);
            window.location.reload();
          }
        }
      }
    };
  }
  
  export function getTranslation(locale = 'en', key) {
    return translations[locale][key] || key;
  }