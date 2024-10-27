class IntroductionService {
    constructor(page) {
        this.page = page;
    }

    async show() {
        let scene = new Scene(this.page);
        scene.addClassName("introductionScene");

        let box = scene.createBox();
        box.addClassName("introductionBox");

        let projectDescription = document.createElement("div");
        projectDescription.classList.add("introduction");

        this.projectDescription = projectDescription;

        box.addElement(projectDescription);

        let currentLanguage = this.page.getCurrentLanguage();

        await this._loadIntroduction(currentLanguage.getCode(), projectDescription);

        this._addCloseBtn(box);

        this.page.subscribeOnLanguageChangingEvent(this);

        scene.show();
    }

    onLanguageChanged(language){
        this._loadIntroduction(language.getCode(), this.projectDescription);
    }

    _addCloseBtn(box){
        let btn = document.createElement("button");
        btn.innerHTML = setTSTR("Close");
        btn.addEventListener("click", () => {
            this.page.showRoot();
        });

        box.addElement(btn);
    }

    async _loadIntroduction(languageCode, projectDescription) {
        let response = await fetch(`projectIntroduction/${languageCode}/introduction.md`);

        let text = await response.text();

        let html = marked.parse(text);

        projectDescription.innerHTML = html;
    }
}