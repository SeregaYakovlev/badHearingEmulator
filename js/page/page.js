class Page {
    constructor() {
        this.languageChangingListeners = [];
    }

    showRoot() {
        this._runRootService();
    }

    subscribeOnLanguageChangingEvent(listener){
        this.languageChangingListeners.push(listener);
    }

    _triggerLanguageChangingEvent(language){
        for(let listener of this.languageChangingListeners){
            listener.onLanguageChanged(language);
        }
    }

    async init() {
        // Загружаем JSON-файл с переводами
        let response = await fetch('languages/translations.json');

        // Проверяем, что ответ был успешным
        if (!response.ok) {
            throw new Error('Response was not ok');
        }

        // Преобразуем ответ в формат JSON
        let data = await response.json();

        // Сохраняем переводы в глобальной области window
        window.translations = data.translations;

        let response2 = await fetch('languages/supported_languages.json');
        if (!response2.ok) {
            throw new Error('Response was not ok');
        }
        let data2 = await response2.json();
        window.languages = data2.languages;

        document.title = getTSTR("siteTitle");

        this._setTheme();
        this._addLanguageSwitcher();
        this._addThemeSwitcher();
        this._addGithub();
        this._addContactLink();

        this._runRootService(this);
    }

    isDay() {
        return document.body.getAttribute("theme") === "day";
    }

    _setFavicon() {
        let icon = document.getElementById("favicon");
        if (this.isDay()) {
            icon.href = "images/favicon-day.svg";
        }
        else {
            icon.href = "images/favicon-night.svg";
        }
    }

    _addGithub() {
        // Создаем новый div элемент для кнопки GitHub
        let githubDiv = document.createElement("div");

        // Добавляем классы стилей
        githubDiv.classList.add("github-toggle");

        // Создаем элемент ссылки <a>
        let githubLink = document.createElement("a");

        // Устанавливаем ссылку на репозиторий GitHub
        githubLink.href = "https://github.com/SeregaYakovlev/badHearingEmulator"; // Замените ссылку на свою

        // Открывать в новой вкладке
        githubLink.target = "_blank";

        // Добавляем иконку GitHub
        let githubIcon = document.createElement("div");
        githubIcon.classList.add("github-icon");

        // Вкладываем иконку в ссылку, а ссылку в див
        githubLink.appendChild(githubIcon);
        githubDiv.appendChild(githubLink);

        // Добавляем на страницу (например, в body)
        document.body.appendChild(githubDiv);
    }

    _addContactLink() {
        // Создаем новый div элемент для кнопки GitHub
        let contactDiv = document.createElement("div");

        // Добавляем классы стилей
        contactDiv.classList.add("contact-toggle");

        // Создаем элемент ссылки <a>
        let contactLink = document.createElement("a");

        // Устанавливаем ссылку на репозиторий GitHub
        contactLink.href = "https://t.me/badhearingemulator"; // Замените ссылку на свою

        // Открывать в новой вкладке
        contactLink.target = "_blank";

        // Добавляем иконку GitHub
        let githubIcon = document.createElement("div");
        githubIcon.classList.add("contact-icon");

        // Вкладываем иконку в ссылку, а ссылку в див
        contactLink.appendChild(githubIcon);
        contactDiv.appendChild(contactLink);

        // Добавляем на страницу (например, в body)
        document.body.appendChild(contactDiv);
    }


    getCurrentLanguage() {
        let languageCode = localStorage.getItem("language");

        if (!languageCode) {
            return new Language("eng");
        }

        return new Language(languageCode);
    }

    async _addLanguageSwitcher() {
        // Создаем переключатель языков
        let switchWrapper = document.createElement('div');
        switchWrapper.className = 'language-toggle';

        // Создаем круг с кодом языка
        let languageCircle = document.createElement('div');
        languageCircle.className = 'language-circle';

        // Создаем элемент для отображения кода языка
        let languageCode = document.createElement('span');
        languageCode.className = 'language-code';

        let currentLanguage = this.getCurrentLanguage();
        languageCode.textContent = currentLanguage.getCode(); // Устанавливаем текущий язык

        this.languageCodeElem = languageCode;

        languageCircle.appendChild(languageCode);
        switchWrapper.appendChild(languageCircle);

        // Создаем выпадающий список языков
        let languageListDiv = document.createElement('div');
        languageListDiv.className = 'language-list';
        languageListDiv.style.display = 'none'; // Скрываем список по умолчанию

        let languageList = window.languages;

        // Добавляем языки в список
        languageList.forEach(lang => {
            let listItem = document.createElement('div');
            listItem.className = 'language-item';
            listItem.textContent = lang.name;
            listItem.onclick = () => {
                let l = new Language(lang.code);
                this._setLanguage(l);
            }
            languageListDiv.appendChild(listItem);
        });

        switchWrapper.appendChild(languageListDiv);
        document.body.appendChild(switchWrapper);

        // Обработчик события для отображения/скрытия списка языков
        switchWrapper.addEventListener('click', () => {
            if (languageListDiv.style.display === 'none') {
                languageListDiv.style.display = 'block'; // Показываем список
            } else {
                languageListDiv.style.display = 'none'; // Скрываем список
            }
        });

        // Закрытие списка при клике вне переключателя
        document.addEventListener('click', (event) => {
            if (!switchWrapper.contains(event.target)) {
                languageListDiv.style.display = 'none'; // Скрываем список, если клик вне переключателя
            }
        });
    }

    _addThemeSwitcher() {
        // Создаем переключатель тем
        let switchWrapper = document.createElement('div');
        switchWrapper.className = 'theme-toggle';

        let sunIcon = document.createElement('div');
        sunIcon.className = 'theme-icon sun';

        let moonIcon = document.createElement('div');
        moonIcon.className = 'theme-icon moon';

        switchWrapper.appendChild(sunIcon);
        switchWrapper.appendChild(moonIcon);
        document.body.appendChild(switchWrapper);

        // Обработчик события для переключения тем
        switchWrapper.addEventListener('click', () => {
            let currentTheme = localStorage.getItem('theme');
            if (currentTheme === "day") {
                this._setTheme('night');
            } else {
                this._setTheme('day');
            }
        });
    }

    _setTheme(theme) {
        if (!theme) {
            // Проверяем, сохранённую тему в localStorage
            theme = localStorage.getItem('theme');
            if (!theme) {
                // Проверяем, предпочитает ли пользователь тёмную тему
                if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    theme = 'night';
                } else {
                    theme = 'day';
                }
            }
        }

        document.body.setAttribute('theme', theme);
        localStorage.setItem("theme", theme);
        this._setFavicon();
    }


    _setLanguage(language) {
        localStorage.setItem("language", language.getCode());

        let translatedElements = document.querySelectorAll("translated-string");

        for (let translatedElement of translatedElements) {
            let stringName = translatedElement.getAttribute("string-name");
            translatedElement.textContent = language.getTranslation(stringName);
        }

        document.title = getTSTR("siteTitle");

        this._onLanguageChanged(language);
    }

    clearToBlankState(){
        document.body.innerHTML = "";
    }

    _onLanguageChanged(language) {
        let currentLanguage = language;
        this.languageCodeElem.textContent = currentLanguage.getCode(); // Устанавливаем текущий язык

        this._triggerLanguageChangingEvent(language);
    }

    runExactlyHearingService() {
        let exactlyHearingService = new ExactlyHearingService(this);
        exactlyHearingService.show();
    }

    runLiveConversationService() {
        let liveConversationService = new LiveConversation(this);
        liveConversationService.show();
    }

    runListenYourselfService(){
        let listenYourselfService = new ListenYourselfService(this);
        listenYourselfService.show();
    }

    runRealtimeFileService() {
        let realtimeFileService = new RealtimeFileService(this);
        realtimeFileService.run();
    }

    runIntroductionService(){
        let introductionService = new IntroductionService(this);
        introductionService.show();
    }

    _runRootService() {
        let rootService = new RootService(this);
        rootService.show();
    }

    showScene(scene) {
        this._closeSceneIfExists();
        this.currentScene = scene;
        scene.displayAt(document.body);
    }

    _closeSceneIfExists() {
        if (this.currentScene) {
            this.currentScene.close();
            this.currentScene = null;
        }
    }

}