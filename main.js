// ⚠️ GOOGLE APPS SCRIPT & CRM CONFIGURATION (Supports Vercel Environment Variables)
const GOOGLE_SHEET_WEBHOOK_URL = import.meta.env.VITE_GOOGLE_SHEET_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbwVv4tYI69nc8UKZwmaQSA-ulxhsy5aZU_IyRGjIo1LnXjAIQ0QDQDbApXcnruls8jc/exec'; 
const CRM_TOKEN = import.meta.env.VITE_CRM_TOKEN || 'M6JNcKxcNszQwNYZW';
const CRM_CHANNEL_ID = import.meta.env.VITE_CRM_CHANNEL_ID || 'AMT-DBT-SKYSKM';
const CRM_PRODUCT_ID = import.meta.env.VITE_CRM_PRODUCT_ID || '52'; 

document.addEventListener('DOMContentLoaded', () => {

  // 1. WhatsApp Float Button & Order Modal Popup
  const openModalBtn = document.getElementById('whatsappFloat');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const orderModal = document.getElementById('orderModal');

  if (openModalBtn && closeModalBtn && orderModal) {
    openModalBtn.addEventListener('click', () => {
      orderModal.classList.add('active');
    });

    closeModalBtn.addEventListener('click', () => {
      orderModal.classList.remove('active');
    });

    // Close on clicking overlay outside the modal card
    orderModal.addEventListener('click', (e) => {
      if (e.target === orderModal) {
        orderModal.classList.remove('active');
      }
    });
  }

  // 2. Order Form Submissions & Google Sheet Sync
  const orderForms = document.querySelectorAll('.order-form-element');
  orderForms.forEach((form, index) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const nameInput = form.querySelector('input[type="text"]');
      const phoneInput = form.querySelector('input[type="tel"]');
      const submitBtn = form.querySelector('button[type="submit"]');

      if (!nameInput || !phoneInput) return;

      const name = nameInput.value.trim();
      const phone = phoneInput.value.trim();

      if (!name || !phone) {
        alert('कृपया अपना नाम और फ़ोन नंबर दर्ज करें!');
        return;
      }

      // Basic 10-digit phone validation
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        alert('कृपया एक सही 10-अंकों का फ़ोन नंबर दर्ज करें!');
        return;
      }

      const formSource = form.closest('.modal-card') ? 'Modal Form' : (index === 0 ? 'Top Form' : 'Bottom Form');

      // 1. Prepare Direct Macherbs CRM URL & Google Sheet Webhook URL
      const originalBtnText = submitBtn ? submitBtn.innerText : 'ORDER NOW';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'प्रक्रिया जारी है...';
      }

      try {
        // Direct Call to Macherbs CRM API
        const crmParams = new URLSearchParams({
          token: CRM_TOKEN,
          channel_id: CRM_CHANNEL_ID,
          product_id: CRM_PRODUCT_ID,
          name: name,
          number: cleanPhone
        });
        const directCrmUrl = `https://macherbs.com/apileads/leads.php?${crmParams.toString()}`;

        // Send to CRM and Google Sheet in Parallel
        const crmPromise = fetch(directCrmUrl).then(res => res.json()).catch(() => null);
        
        let sheetPromise = Promise.resolve(null);
        if (GOOGLE_SHEET_WEBHOOK_URL && GOOGLE_SHEET_WEBHOOK_URL.trim() !== '' && !GOOGLE_SHEET_WEBHOOK_URL.includes('YOUR_GOOGLE_APPS_SCRIPT_WEBHOOK_URL_HERE')) {
          const sheetParams = new URLSearchParams({
            name: name,
            phone: phone,
            cleanPhone: cleanPhone,
            formSource: formSource,
            crmToken: CRM_TOKEN,
            crmChannelId: CRM_CHANNEL_ID,
            crmProductId: CRM_PRODUCT_ID,
            _t: Date.now()
          });
          const targetSheetUrl = `${GOOGLE_SHEET_WEBHOOK_URL}${GOOGLE_SHEET_WEBHOOK_URL.includes('?') ? '&' : '?'}${sheetParams.toString()}`;
          sheetPromise = fetch(targetSheetUrl, { cache: 'no-cache' }).then(res => res.json()).catch(() => null);
        }

        const [crmRes, sheetRes] = await Promise.all([crmPromise, sheetPromise]);

        // Check if either CRM or Google Sheet flagged duplicate
        const isCrmDuplicate = crmRes && (crmRes.message === 'user already exist' || crmRes.error === 'user already exist');
        const isSheetDuplicate = sheetRes && sheetRes.status === 'duplicate';

        if (isCrmDuplicate || isSheetDuplicate) {
          alert('You have already submitted your detail, please wait for 24 hours. Our representative will call you in a while.');
        } else {
          alert('धन्यवाद! आपका ऑर्डर सफलतापूर्वक दर्ज कर लिया गया है। हम जल्द ही आपसे संपर्क करेंगे।');
          nameInput.value = '';
          phoneInput.value = '';
          if (orderModal) {
            orderModal.classList.remove('active');
          }
        }
      } catch (error) {
        console.error('Submission error:', error);
        alert('धन्यवाद! आपका ऑर्डर सफलतापूर्वक दर्ज कर लिया गया है। हम जल्द ही आपसे संपर्क करेंगे।');
        nameInput.value = '';
        phoneInput.value = '';
        if (orderModal) {
          orderModal.classList.remove('active');
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = originalBtnText;
        }
      }
    });
  });

  // 3. Privacy Policy Toggle
  const togglePrivacyBtn = document.getElementById('togglePrivacyBtn');
  const privacyBox = document.getElementById('privacyBox');

  if (togglePrivacyBtn && privacyBox) {
    togglePrivacyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      privacyBox.classList.toggle('active');
    });
  }

});

