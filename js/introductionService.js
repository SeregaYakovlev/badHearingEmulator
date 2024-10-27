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

        box.addElement(projectDescription);

        await this._loadIntroduction("rus", projectDescription);

        this._addCloseBtn(box);

        scene.show();
    }

    _addCloseBtn(box){
        let btn = document.createElement("button");
        btn.innerHTML = setTSTR("Close");
        btn.addEventListener("click", () => {
            this.page.showRoot();
        });

        box.addElement(btn);
    }

    async _loadIntroduction(languageCode, projectDescriptionElem) {
        let response = await fetch(`../projectIntroduction/${languageCode}/introduction.md`);

        let text = await response.text();

        let html = marked.parse(text);

        projectDescriptionElem.innerHTML = html;
    }
}