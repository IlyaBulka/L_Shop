export const createAuthForm = () => {
    const form = document.createElement('form');
    form.setAttribute('data-registration', ''); // Обязательный атрибут по ТЗ 
    
    form.innerHTML = `
        <div class="auth-group">
            <input type="text" name="identifier" placeholder="Email или Телефон" required>
            <input type="password" name="password" placeholder="Пароль" required>
            <button type="submit">Войти</button>
        </div>
    `;

    form.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const body = Object.fromEntries(formData);

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                const user = await response.json();
                localStorage.setItem('userName', user.name); // Сохраняем имя для хедера
                alert(`Привет, ${user.name}!`);
                window.location.reload(); 
            } else {
                alert('Ошибка входа: проверьте данные');
            }
        } catch (error) {
            console.error('Ошибка сети:', error);
        }
    };

    return form;
};