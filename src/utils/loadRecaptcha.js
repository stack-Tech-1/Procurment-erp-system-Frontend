// frontend/src/utils/loadRecaptcha.js
export default function loadRecaptcha(siteKey) {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return resolve(false);

    // If grecaptcha is already loaded
    if (window.grecaptcha) return resolve(true);

    const id = "recaptcha-script";
    if (document.getElementById(id)) {
      const wait = () => {
        if (window.grecaptcha) return resolve(true);
        setTimeout(wait, 200);
      };
      return wait();
    }

    const script = document.createElement("script");
    script.id = id;
    script.src = "https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoadCallback&render=explicit";
    script.async = true;
    script.defer = true;

    window.onRecaptchaLoadCallback = () => {
      resolve(true);
    };

    script.onerror = (err) => {
      console.error("reCAPTCHA script failed to load", err);
      resolve(false);
    };

    document.head.appendChild(script);
  });
}
