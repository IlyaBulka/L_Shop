export const createAuthForm = () => {
    const form = document.createElement('form');
    form.setAttribute('data-registration', ''); // Обязательный атрибут по ТЗ 
    form.className = 'form registration-form slide-in-up';
    
    form.innerHTML = `
        <h2 class="section-title registration-form__title" data-auth-title>Вход</h2>

        <div class="form__group" data-auth-name style="display:none;">
            <label class="form__label" for="auth-name">Имя</label>
            <input class="form__input" id="auth-name" type="text" name="name" placeholder="Ваше имя">
            <span class="form__error" id="auth-name-error" aria-live="polite"></span>
        </div>

        <div class="form__group" data-auth-identifier>
            <label class="form__label" for="auth-identifier">Email или Телефон</label>
            <input class="form__input" id="auth-identifier" type="text" name="identifier" placeholder="example@mail.ru или 8029..." required>
            <span class="form__error" id="auth-identifier-error" aria-live="polite"></span>
        </div>

        <div class="form__group" data-auth-email style="display:none;">
            <label class="form__label" for="auth-email">Email</label>
            <input class="form__input" id="auth-email" type="email" name="email" placeholder="example@mail.ru">
            <span class="form__error" id="auth-email-error" aria-live="polite"></span>
        </div>

        <div class="form__group" data-auth-phone style="display:none;">
            <label class="form__label" for="auth-phone">Телефон</label>
            <input class="form__input" id="auth-phone" type="tel" name="phone" placeholder="8029...">
            <span class="form__error" id="auth-phone-error" aria-live="polite"></span>
        </div>

        <div class="form__group">
            <label class="form__label" for="auth-password">Пароль</label>
            <input class="form__input" id="auth-password" type="password" name="password" placeholder="Пароль" required>
            <span class="form__error" id="auth-password-error" aria-live="polite"></span>
        </div>

        <div class="auth-actions">
            <button class="btn btn--secondary btn--large" type="submit" data-auth-submit>Войти</button>
            <button class="link-button" type="button" data-mode="register">Нет аккаунта? Регистрация</button>
        </div>
    `;

    let mode: 'login' | 'register' = 'login';
    const nameGroup = form.querySelector('[data-auth-name]') as HTMLElement | null;
    const nameInput = form.querySelector('#auth-name') as HTMLInputElement | null;
    const identifierGroup = form.querySelector('[data-auth-identifier]') as HTMLElement | null;
    const identifierInput = form.querySelector('#auth-identifier') as HTMLInputElement | null;
    const emailGroup = form.querySelector('[data-auth-email]') as HTMLElement | null;
    const emailInput = form.querySelector('#auth-email') as HTMLInputElement | null;
    const phoneGroup = form.querySelector('[data-auth-phone]') as HTMLElement | null;
    const phoneInput = form.querySelector('#auth-phone') as HTMLInputElement | null;
    const passwordInput = form.querySelector('#auth-password') as HTMLInputElement | null;
    const submitBtn = form.querySelector('[data-auth-submit]') as HTMLButtonElement | null;
    const modeBtn = form.querySelector('button[data-mode="register"]') as HTMLButtonElement | null;
    const titleEl = form.querySelector('[data-auth-title]') as HTMLElement | null;

    const setError = (id: string, msg: string) => {
        const input = form.querySelector(`#${id}`) as HTMLInputElement | null;
        const err = form.querySelector(`#${id}-error`) as HTMLElement | null;
        if (input) input.classList.toggle('error', Boolean(msg));
        if (err) err.textContent = msg;
    };

    const syncMode = () => {
        if (!identifierInput || !submitBtn || !modeBtn) return;
        const isRegister = mode === 'register';
        if (nameGroup) nameGroup.style.display = isRegister ? '' : 'none';
        if (nameInput) nameInput.required = isRegister;
        if (identifierGroup) identifierGroup.style.display = isRegister ? 'none' : '';
        if (emailGroup) emailGroup.style.display = isRegister ? '' : 'none';
        if (phoneGroup) phoneGroup.style.display = isRegister ? '' : 'none';

        if (emailInput) emailInput.required = isRegister;
        if (phoneInput) phoneInput.required = isRegister;

        identifierInput.required = !isRegister;
        identifierInput.placeholder = 'example@mail.ru или 8029...';
        submitBtn.textContent = isRegister ? 'Зарегистрироваться' : 'Войти';
        modeBtn.textContent = isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Регистрация';
        if (titleEl) titleEl.textContent = isRegister ? 'Регистрация' : 'Вход';
    };

    modeBtn?.addEventListener('click', () => {
        mode = mode === 'login' ? 'register' : 'login';
        syncMode();
    });
    syncMode();

    form.onsubmit = async (e) => {
        e.preventDefault();
        setError('auth-name', '');
        setError('auth-identifier', '');
        setError('auth-password', '');
        setError('auth-email', '');
        setError('auth-phone', '');

        const identifier = identifierInput?.value.trim() ?? '';
        const email = emailInput?.value.trim() ?? '';
        const phone = phoneInput?.value.trim() ?? '';
        const password = passwordInput?.value.trim() ?? '';
        const name = nameInput?.value.trim() ?? '';

        if (mode === 'register' && !name) {
            setError('auth-name', 'Укажите имя');
            return;
        }
        if (mode === 'login' && !identifier) {
            setError('auth-identifier', 'Укажите email или телефон');
            return;
        }
        if (mode === 'register' && !email) {
            setError('auth-email', 'Укажите email');
            return;
        }
        if (mode === 'register' && !phone) {
            setError('auth-phone', 'Укажите телефон');
            return;
        }
        if (!password) {
            setError('auth-password', 'Укажите пароль');
            return;
        }

        try {
            const endpoint = mode === 'register' ? '/api/register' : '/api/login';
            const payload =
                mode === 'register'
                    ? {
                        name,
                        password,
                        email,
                        phone
                    }
                    : { identifier, password };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            });

            if (response.ok) {
                const user = await response.json();
                localStorage.setItem('userName', user.name); // Сохраняем имя для хедера
                const w = window as unknown as { __refreshAuth?: () => Promise<void> | void };
                if (typeof w.__refreshAuth === 'function') await w.__refreshAuth();
                window.location.hash = '#';
            } else {
                const err = await response.json().catch(() => null) as { message?: string } | null;
                setError('auth-identifier', err?.message ?? (mode === 'register' ? 'Ошибка регистрации' : 'Ошибка входа'));
            }
        } catch (error) {
            console.error('Ошибка сети:', error);
        }
    };

    return form;
};