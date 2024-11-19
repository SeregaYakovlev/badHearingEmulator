class BadHearingExampleService {
    constructor(page) {
        this.page = page;

        this.page.subscribeOnLanguageChangingEvent(this);
    }

    async install(scene) {
        let serviceBox = scene.createBox();
        serviceBox.addClassName("badHearingExampleServiceBox");

        let horizontalContainer = document.createElement("div");
        horizontalContainer.classList.add("horizontalContainer");

        let captionDiv = document.createElement("div");
        captionDiv.classList.add("captionDiv");

        let caption = document.createElement("p");
        caption.innerHTML = htmlTSTR("InVideoExampleBadHearing");
        captionDiv.appendChild(caption);

        let videoInfoDiv = document.createElement("div");
        videoInfoDiv.classList.add("videoInfoDiv");

        let videoInfoText = document.createElement("div");
        videoInfoText.classList.add("videoInfoText");

        let videoInfoLink = document.createElement("a");
        videoInfoLink.setAttribute("target", "_blank");
        videoInfoLink.classList.add("videoInfoLink");
        videoInfoLink.innerHTML = htmlTSTR("OpenYouTube");

        // Добавляем все элементы в контейнер
        videoInfoDiv.appendChild(videoInfoText);
        videoInfoDiv.appendChild(videoInfoLink);

        this.videoInfo = {};

        videoInfoLink.addEventListener("click", () => {
            this._onExternalLinkClicked();
        });

        this.videoInfo.setVideoInfo = (videoName, videoUrl) => {
            let text = document.createElement("span");
            text.textContent = videoName;
            videoInfoText.innerHTML = "";
            videoInfoText.appendChild(text);
            videoInfoLink.setAttribute("href", videoUrl);
        };

        let leftArrowWrapper = document.createElement("div");
        leftArrowWrapper.classList.add("arrowWrapper");

        let leftArrow = document.createElement("button");
        leftArrow.classList.add("myBtn");
        leftArrow.classList.add("arrowBtn");
        leftArrow.setAttribute("arrow", "left");

        leftArrowWrapper.appendChild(leftArrow);

        let rightArrowWrapper = document.createElement("div");
        rightArrowWrapper.classList.add("arrowWrapper");

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
        serviceBox.addElement(videoInfoDiv);

        this.realtimeFilter = new RealTimeFilter(scene);

        this._addFrequencySpectrum(scene, this.realtimeFilter);

        this.player = new MyPlayer(scene, this);
        this.player.installInDiv(videoDiv);

        this.currentCollection = this._getLocalizedCollection();
        this._showFirstExample();
    }

    _addFrequencySpectrum(scene, realtimeFilter) {
        this.soundVisualization = new SoundVisualization(scene, realtimeFilter.getAudioContext(), realtimeFilter.getSoundSource());
        this.soundVisualization.setFrequencyRange(16, 8_000, 9);
        this.soundVisualization.show();
    }

    onPlay() {
        // this.audioContext.createMediaElementSource(this.audioElement) не любит пустые файлы
        // и работает с перебоями в таком случае
        let isFilterConnected = this.player.isFilterConnected();
        if (!isFilterConnected) {
            this.player.connectFilter(this.realtimeFilter);
        }
    }

    _onExternalLinkClicked() {
        if (this.player) {
            this.player.pause();
        }
    }

    _onPreviousBtnClicked() {
        this._showPreviousExample();
    }

    _onNextBtnClicked() {
        this._showNextExample();
    }

    _showFirstExample() {
        let firstExample = this.currentCollection.getFirst();
        this._showExample(firstExample);
    }

    _showPreviousExample() {
        let previousExample = this.currentCollection.getPrevious();
        this._showExample(previousExample);
    }

    _showNextExample() {
        let nextExample = this.currentCollection.getNext();
        this._showExample(nextExample);
    }

    _showExample(example) {
        this.videoInfo.setVideoInfo(example.getName(), example.getSourceLink());

        this.realtimeFilter.setHearingFrequency(example.getFilterValue());
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

        currentCollection.shuffle();

        return currentCollection;
    }

    _onExampleShown(examle) {
        this.currentCollection = examle;
    }

    onLanguageChanged() {
        this._reloadService();
    }
}