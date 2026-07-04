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

  const commentForm = document.querySelector('[data-comment-form]');
  const commentList = document.querySelector('[data-comment-list]');
  const commentEmpty = document.querySelector('[data-comment-empty]');
  const commentStatus = document.querySelector('[data-comment-status]');
  const commentMessage = commentForm?.querySelector('[name="message"]');
  const commentCounter = document.querySelector('[data-comment-counter]');

  const setCommentStatus = (message, state = '') => {
    if (!commentStatus) return;
    commentStatus.textContent = message;
    commentStatus.dataset.state = state;
  };

  const createCommentCard = (comment) => {
    const article = document.createElement('article');
    article.className = 'visitor-comment';

    const header = document.createElement('header');
    const avatar = document.createElement('span');
    avatar.className = 'visitor-comment-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = (comment.name || 'م').trim().slice(0, 1);

    const identity = document.createElement('div');
    const name = document.createElement('strong');
    name.textContent = comment.name;
    const meta = document.createElement('span');
    meta.textContent = comment.city || 'بازدیدکننده سایت';
    identity.append(name, meta);
    header.append(avatar, identity);

    const message = document.createElement('p');
    message.textContent = comment.message;
    article.append(header, message);
    return article;
  };

  const loadComments = async () => {
    if (!commentList || !commentForm) return;
    try {
      const response = await fetch(commentForm.action, {
        headers: { Accept: 'application/json' },
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('comments-unavailable');
      const payload = await response.json();
      const comments = Array.isArray(payload.comments) ? payload.comments : [];
      commentList.replaceChildren(...comments.map(createCommentCard));
      if (commentEmpty) commentEmpty.hidden = comments.length > 0;
    } catch {
      if (commentEmpty) {
        commentEmpty.hidden = false;
        commentEmpty.textContent = 'نظرهای تأییدشده پس از فعال شدن سرویس روی هاست نمایش داده می‌شوند.';
      }
    }
  };

  if (commentForm) {
    const startedAt = commentForm.querySelector('[name="startedAt"]');
    if (startedAt) startedAt.value = String(Date.now());

    const updateCounter = () => {
      if (commentCounter && commentMessage) commentCounter.textContent = `${commentMessage.value.length} / ۶۰۰`;
    };
    commentMessage?.addEventListener('input', updateCounter);
    updateCounter();

    commentForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!commentForm.reportValidity()) return;

      const submitButton = commentForm.querySelector('button[type="submit"]');
      const formData = new FormData(commentForm);
      const payload = Object.fromEntries(formData.entries());
      payload.consent = formData.has('consent');

      submitButton?.setAttribute('disabled', '');
      commentForm.setAttribute('aria-busy', 'true');
      setCommentStatus('در حال ثبت نظر شما…');

      try {
        const response = await fetch(commentForm.action, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.message || 'ثبت نظر انجام نشد.');

        commentForm.reset();
        if (startedAt) startedAt.value = String(Date.now());
        updateCounter();
        setCommentStatus(result.message || 'نظر شما دریافت شد و پس از بررسی منتشر می‌شود.', 'success');
      } catch (error) {
        setCommentStatus(error.message || 'ارتباط برقرار نشد؛ لطفاً دوباره تلاش کنید.', 'error');
      } finally {
        submitButton?.removeAttribute('disabled');
        commentForm.removeAttribute('aria-busy');
      }
    });

    loadComments();
  }
});
