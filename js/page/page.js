class Page {
    constructor() {
        this.languageChangingListeners = [];
        this.translatedStrings = [];
    }

    showRoot() {
        this._runRootService();
    }

    subscribeOnLanguageChangingEvent(listener) {
        this.languageChangingListeners.push(listener);
    }

    _triggerLanguageChangingEvent(language) {
        for (let listener of this.languageChangingListeners) {
            listener.onLanguageChanged(language);
        }
    }

    async _downloadTranslations() {
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
    }

    async _downloadSupportedLanguages() {
        let response = await fetch('languages/supported_languages.json');
        if (!response.ok) {
            throw new Error('Response was not ok');
        }
        let data = await response.json();
        window.languages = data.languages;
    }

    getSupportedLanguages(){
        let langs = [];
        for(let lang of window.languages){
            langs.push(new Language(lang.code));
        }

        return langs;
    }

    async _downloadBadHearingConfig() {
        let response = await fetch('bad_hearing_examples/bad_hearing_examples.json');
        if (!response.ok) {
            throw new Error('Response was not ok');
        }
        let data = await response.json();
        window.bad_hearing_examples = data.bad_hearing_examples;
    }

    async init() {

        await this._downloadSupportedLanguages();
        await this._downloadTranslations();
        await this._downloadBadHearingConfig();

        this._setTheme();
        this._add_what_is_it_btn();
        this._addLanguageSwitcher();
        this._addHomepageBtn();
        this._addThemeSwitcher();
        this._addGithub();
        this._addContactLink();

        let currentLanguage = this.getCurrentLanguage();
        this._setLanguage(currentLanguage);

        this._runRootService();
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
            return new Language("en");
        }

        return new Language(languageCode);
    }

    _add_what_is_it_btn() {
        let what_is_it_btn = document.createElement('div');
        what_is_it_btn.className = 'what-is-it-btn';

        let what_is_it_icon = document.createElement('div');
        what_is_it_icon.className = 'what-is-it-icon';

        what_is_it_btn.appendChild(what_is_it_icon);

        document.body.appendChild(what_is_it_btn);

        what_is_it_btn.addEventListener('click', () => {
            this.runIntroductionService();
        });
    }

    _addHomepageBtn() {
        let homepageBtn = document.createElement('div');
        homepageBtn.className = 'homepage-btn';

        let homePageIcon = document.createElement('div');
        homePageIcon.className = 'homepage-icon';

        homepageBtn.appendChild(homePageIcon);

        document.body.appendChild(homepageBtn);

        homepageBtn.addEventListener('click', () => {
            this.showRoot();
        });
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
        languageCode.textContent = currentLanguage.getSelfCode(); // Устанавливаем текущий язык

        this.languageCodeElem = languageCode;

        languageCircle.appendChild(languageCode);
        switchWrapper.appendChild(languageCircle);

        // Создаем выпадающий список языков
        let languageListDiv = document.createElement('div');
        languageListDiv.className = 'language-list';

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
            const isVisible = languageListDiv.getAttribute('data-visible') === 'true';

            // Меняем значение атрибута data-visible
            languageListDiv.setAttribute('data-visible', !isVisible); // Инвертируем значение
        });


        // Закрытие списка при клике вне переключателя
        document.addEventListener('click', (event) => {
            if (!switchWrapper.contains(event.target)) {
                // Меняем значение атрибута data-visible
                languageListDiv.setAttribute('data-visible', false); // Инвертируем значение
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

        document.title = textTSTR("siteTitle");

        // Установка языка на тег <html>
        document.documentElement.lang = language.getCode();

        for (let translatedString of this.translatedStrings) {
            translatedString.changeLanguageTo(language);
        }

        this._onLanguageChanged(language);
    }

    clearToBlankState() {
        document.body.innerHTML = "";
    }

    _onLanguageChanged(language) {
        let currentLanguage = language;
        let languageSelfCode = currentLanguage.getSelfCode();
        this.languageCodeElem.textContent = languageSelfCode; // Устанавливаем текущий язык

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

    runListenYourselfService() {
        let listenYourselfService = new ListenYourselfService(this);
        listenYourselfService.show();
    }

    runRealtimeFileService() {
        let realtimeFileService = new RealtimeFileService(this);
        realtimeFileService.run();
    }

    runIntroductionService() {
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