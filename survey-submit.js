'use strict';

// The survey is hosted on GitHub Pages, which cannot process form POSTs itself.
// Use FormSubmit's documented cross-origin AJAX endpoint, retaining the native
// form action as a fallback when JavaScript is disabled.
(() => {
  const form = document.getElementById('survey-form');
  const button = document.getElementById('submit');
  const status = document.getElementById('survey-status');
  if (!form || !button || !status) return;

  function setStatus(message, kind = 'info') {
    status.textContent = message;
    status.className = 'survey-status is-' + kind;
    status.hidden = !message;
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (button.disabled) return;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    button.disabled = true;
    button.textContent = 'SUBMITTING…';
    setStatus('Forwarding your feedback to the appropriate department…');

    try {
      const fields = Object.fromEntries(new FormData(form).entries());
      // _next is used only for normal HTML submission; redirect after AJAX success.
      delete fields._next;
      const response = await fetch('https://formsubmit.co/ajax/devkorddurham@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(fields),
        signal: controller.signal
      });
      if (!response.ok) throw new Error('The submission service returned HTTP ' + response.status + '.');
      const result = await response.json();
      if (!(result.success === true || result.success === 'true')) {
        throw new Error(typeof result.message === 'string' ? result.message : 'The submission service did not accept the survey.');
      }
      window.location.assign('https://kordldurham.github.io/surveyportfolio/thanks.html');
    } catch (error) {
      const message = error.name === 'AbortError'
        ? 'The submission service did not respond within 15 seconds. Your survey might have been received; please check before retrying.'
        : 'Submission could not be confirmed. ' + (error.message || 'Please try again later.');
      setStatus(message, 'error');
    } finally {
      clearTimeout(timeout);
      button.disabled = false;
      button.textContent = 'SUBMIT';
    }
  });
})();
