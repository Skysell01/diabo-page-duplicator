// main.js - Interactive behaviors & Google Sheet Integration for Diabeet Landing Page

// ⚠️ GOOGLE APPS SCRIPT WEB APP URL FOR LEAD SYNC & DUPLICATE CHECK
const GOOGLE_SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyPe4FxZyaHeHx3YLGD2fNpdgtulSraEB0mQ2U1pUKqvzyCkurPfqy6ymasPJHfjCuRgw/exec'; 

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

      // If Webhook URL is set, send data to Google Apps Script & CRM
      if (GOOGLE_SHEET_WEBHOOK_URL && GOOGLE_SHEET_WEBHOOK_URL.trim() !== '' && !GOOGLE_SHEET_WEBHOOK_URL.includes('YOUR_GOOGLE_APPS_SCRIPT_WEBHOOK_URL_HERE')) {
        const originalBtnText = submitBtn ? submitBtn.innerText : 'ORDER NOW';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerText = 'प्रक्रिया जारी है...';
        }

        // Parallel trigger to CRM API directly from client side
        const crmUrl = `https://macherbs.com/apileads/leads.php?token=M6JNcKxcNszQwNYZW&channel_id=AMT-DBT-SKYSKM&product_id=52&name=${encodeURIComponent(name)}&number=${encodeURIComponent(cleanPhone)}`;
        fetch(crmUrl, { mode: 'no-cors' }).catch(err => console.log('Client CRM trigger sent'));

        try {
          const payload = {
            name: name,
            phone: phone,
            cleanPhone: cleanPhone,
            formSource: formSource,
            crmToken: "M6JNcKxcNszQwNYZW",
            crmChannelId: "AMT-DBT-SKYSKM",
            crmProductId: "52",
            timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
          };

          const response = await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
              'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(payload)
          });

          const result = await response.json();

          if (result.status === 'duplicate') {
            alert(result.message || 'You have already submitted your detail, please wait for 24 hours. Our representative will call you in a while.');
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
      } else {
        // Fallback when Webhook URL is not yet configured
        alert('धन्यवाद! आपका ऑर्डर सफलतापूर्वक दर्ज कर लिया गया है। हम जल्द ही आपसे संपर्क करेंगे।');
        nameInput.value = '';
        phoneInput.value = '';
        if (orderModal) {
          orderModal.classList.remove('active');
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

