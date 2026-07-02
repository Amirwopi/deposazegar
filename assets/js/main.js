document.addEventListener('DOMContentLoaded', () => {
  const mobileButton = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const sheetBackdrop = document.querySelector('[data-sheet-backdrop]');
  const sheetOpeners = document.querySelectorAll('[data-sheet-open]');
  const sheets = document.querySelectorAll('.bottom-sheet');
  let activeSheet = null;
  let lastSheetTrigger = null;
  let closeTimer = null;

  const closeMenu = () => {
    if (!mobileButton || !mobileMenu) return;
    mobileMenu.hidden = true;
    mobileButton.setAttribute('aria-expanded', 'false');
    mobileButton.setAttribute('aria-label', 'باز کردن منوی اصلی');
  };

  if (mobileButton && mobileMenu) {
    mobileButton.addEventListener('click', () => {
      const willOpen = mobileMenu.hidden;
      mobileMenu.hidden = !willOpen;
      mobileButton.setAttribute('aria-expanded', String(willOpen));
      mobileButton.setAttribute('aria-label', willOpen ? 'بستن منوی اصلی' : 'باز کردن منوی اصلی');
    });

    mobileMenu.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMenu();
    });
  }

  const closeSheet = (restoreFocus = true) => {
    if (!activeSheet || !sheetBackdrop) return;
    const sheetToClose = activeSheet;
    activeSheet = null;
    sheetToClose.classList.remove('is-open');
    sheetBackdrop.classList.remove('is-open');
    document.body.classList.remove('sheet-open');
    sheetOpeners.forEach((button) => button.setAttribute('aria-expanded', 'false'));

    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(() => {
      sheetToClose.hidden = true;
      sheetBackdrop.hidden = true;
    }, 240);

    if (restoreFocus && lastSheetTrigger) lastSheetTrigger.focus();
  };

  const openSheet = (trigger) => {
    const target = document.getElementById(trigger.dataset.sheetOpen);
    if (!target || !sheetBackdrop) return;
    if (activeSheet) {
      const previousSheet = activeSheet;
      closeSheet(false);
      previousSheet.hidden = true;
    }

    window.clearTimeout(closeTimer);
    activeSheet = target;
    lastSheetTrigger = trigger;
    target.hidden = false;
    sheetBackdrop.hidden = false;
    document.body.classList.add('sheet-open');
    trigger.setAttribute('aria-expanded', 'true');

    window.requestAnimationFrame(() => {
      target.classList.add('is-open');
      sheetBackdrop.classList.add('is-open');
      target.querySelector('[data-sheet-close]')?.focus();
    });
  };

  sheetOpeners.forEach((button) => {
    button.addEventListener('click', () => openSheet(button));
  });

  sheets.forEach((sheet) => {
    sheet.querySelector('[data-sheet-close]')?.addEventListener('click', () => closeSheet());
    sheet.addEventListener('keydown', (event) => {
      if (event.key !== 'Tab') return;
      const focusable = [...sheet.querySelectorAll('a[href], button:not([disabled])')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  });

  sheetBackdrop?.addEventListener('click', () => closeSheet());

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (activeSheet) {
      closeSheet();
    } else if (mobileMenu && !mobileMenu.hidden) {
      closeMenu();
      mobileButton?.focus();
    }
  });
});
