// C:\Users\SMC\Documents\GitHub\procurement-erp-system\frontend\src\utils\loadRecaptcha.js
export default function loadRecaptcha(siteKey) {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    console.log("🔍 Loading reCAPTCHA v2...");

    // Already loaded
    if (window.grecaptcha) {
      console.log("✅ reCAPTCHA already loaded");
      resolve(true);
      return;
    }

    const id = "recaptcha-script";
    
    // Check if script already exists
    if (document.getElementById(id)) {
      console.log("📝 Script already exists");
      const wait = () => {
        if (window.grecaptcha) {
          console.log("✅ grecaptcha found after wait");
          resolve(true);
        } else {
          setTimeout(wait, 200);
        }
      };
      wait();
      return;
    }

    // Create script for reCAPTCHA v2
    const script = document.createElement("script");
    script.id = id;
    
    // reCAPTCHA v2 doesn't need render parameter
    script.src = "https://www.google.com/recaptcha/api.js";
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log("✅ reCAPTCHA v2 script loaded");
      if (window.grecaptcha) {
        console.log("✅ grecaptcha object created");
        resolve(true);
      } else {
        console.error("❌ grecaptcha not defined after load");
        resolve(false);
      }
    };
    
    script.onerror = (err) => {
      console.error("❌ reCAPTCHA script failed to load:", err);
      resolve(false);
    };
    
    document.head.appendChild(script);
  });
}