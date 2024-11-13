class BadHearingExampleService {
    constructor(page) {
        this.page = page;

        this.page.subscribeOnLanguageChangingEvent(this);
    }

    install(scene) {
        let serviceBox = scene.createBox();
        serviceBox.addClassName("badHearingExampleServiceBox");
        serviceBox.setAttribute("specialstate", "transparent");

        let horizontalContainer = document.createElement("div");
        horizontalContainer.classList.add("horizontalContainer");

        let captionDiv = document.createElement("div");
        captionDiv.classList.add("box");
        captionDiv.classList.add("tipBox");

        let caption = document.createElement("p");
        caption.innerHTML = htmlTSTR("InVideoExampleBadHearing");
        captionDiv.appendChild(caption);

        let leftArrowWrapper = document.createElement("div");
        leftArrowWrapper.classList.add("arrowWrapper");
        leftArrowWrapper.classList.add("box");

        let leftArrow = document.createElement("button");
        leftArrow.classList.add("myBtn");
        leftArrow.classList.add("arrowBtn");
        leftArrow.setAttribute("arrow", "left");

        leftArrowWrapper.appendChild(leftArrow);

        let rightArrowWrapper = document.createElement("div");
        rightArrowWrapper.classList.add("arrowWrapper");
        rightArrowWrapper.classList.add("box");

        let rightArrow = document.createElement("button");
        rightArrow.classList.add("myBtn");
        rightArrow.classList.add("arrowBtn");
        rightArrow.setAttribute("arrow", "right");

        rightArrowWrapper.appendChild(rightArrow);

        leftArrow.addEventListener("click", () => {
            this._onPreviousBtnClicked();
        });

        rightArrow.addEventListener("click", () => {
            this._onNextBtnClicked();
        })

        let videoDiv = document.createElement("div");

        horizontalContainer.appendChild(leftArrowWrapper);
        horizontalContainer.appendChild(videoDiv);
        horizontalContainer.appendChild(rightArrowWrapper);

        serviceBox.addElement(captionDiv);
        serviceBox.addElement(horizontalContainer);

        let realtimeFilter = new RealTimeFilter(scene);
        realtimeFilter.setHearingFrequency(250);

        this.player = new MyPlayer(scene, null);
        this.player.installInDiv(videoDiv);
        this.player.setFullVolume();
        this.player.connectFilter(realtimeFilter);

        this.currentCollection = this._getLocalizedCollection();
        this._showFirstExample();
    }

    _onPreviousBtnClicked() {
        this.player.setAutoplay(true);
        this._showPreviousExample();
    }

    _onNextBtnClicked() {
        this.player.setAutoplay(true);
        this._showNextExample();
    }

    _showFirstExample() {
        let firstExample = this.currentCollection.getFirst();
        this._showExample(firstExample);
    }

    _showPreviousExample(){
        let previousExample = this.currentCollection.getPrevious();
        this._showExample(previousExample);
    }

    _showNextExample(){
        let nextExample = this.currentCollection.getNext();
        this._showExample(nextExample);
    }

    _showExample(example) {
        this.player.setFileLink(example.getLink());
        this.player.replaceVideo();
        this._onExampleShown(example);
    }

    _reloadService() {
        this.currentCollection = this._getLocalizedCollection();
        this._showFirstExample();
    }

    _getLocalizedCollection() {
        let currentLanguage = this.page.getCurrentLanguage();
        let languageCode = currentLanguage.getCode();

        let localizedConfig = window.bad_hearing_examples[languageCode];
        let currentCollection = new BadHearingExample(localizedConfig, 0);
        return currentCollection;
    }

    _onExampleShown(examle){
        this.currentCollection = examle;
    }

    onLanguageChanged() {
        this._reloadService();
    }
}