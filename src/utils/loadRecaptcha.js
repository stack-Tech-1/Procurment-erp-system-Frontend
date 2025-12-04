// frontend/src/utils/loadRecaptcha.js
export default function loadRecaptcha(siteKey) {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined") return resolve(false);
  
      // already loaded & ready
      if (window.grecaptcha) {
        try {
          window.grecaptcha.ready(() => resolve(true));
        } catch (e) {
          return resolve(true);
        }
        return;
      }
  
      const id = "recaptcha-script";
      if (document.getElementById(id)) {
        // script exists but grecaptcha might not be ready yet
        const wait = () => {
          if (window.grecaptcha) return window.grecaptcha.ready(() => resolve(true));
          setTimeout(wait, 200);
        };
        return wait();
      }
  
      const script = document.createElement("script");
      script.id = id;
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.grecaptcha) {
          try {
            window.grecaptcha.ready(() => resolve(true));
          } catch (e) {
            resolve(true);
          }
        } else {
          resolve(false);
        }
      };
      script.onerror = (err) => {
        console.error("reCAPTCHA script failed to load", err);
        resolve(false);
      };
      document.head.appendChild(script);
    });
  }
  