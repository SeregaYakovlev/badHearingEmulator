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

        let mainDiv0 = document.createElement("div");
        mainDiv0.classList.add("videoInfoContainer");

        let videoInfoObject0 = document.createElement("div");
        videoInfoObject0.classList.add("videoInfoObject");
        videoInfoObject0.classList.add("videoDescription");

        let caption = document.createElement("span");
        videoInfoObject0.appendChild(caption);

        mainDiv0.appendChild(videoInfoObject0);

        let mainDiv1 = document.createElement("div");
        mainDiv1.classList.add("videoInfoContainer");

        let videoInfoObject1 = document.createElement("div");
        videoInfoObject1.classList.add("videoInfoObject");
        videoInfoObject1.classList.add("videoName");

        let videoInfoObject11 = document.createElement("div");
        videoInfoObject11.classList.add("videoInfoObject");
        videoInfoObject11.classList.add("youtubeLink");

        let videoInfoLink = document.createElement("a");
        videoInfoLink.setAttribute("target", "_blank");
        videoInfoLink.innerHTML = htmlTSTR("OpenYouTube");

        videoInfoObject11.appendChild(videoInfoLink);

        // Добавляем все элементы в контейнер
        mainDiv1.appendChild(videoInfoObject1);
        mainDiv1.appendChild(videoInfoObject11);

        this.videoInfo = {};

        videoInfoLink.addEventListener("click", () => {
            this._onExternalLinkClicked();
        });

        this.videoInfo.setVideoInfo = (videoName, videoUrl) => {
            let text = document.createElement("span");
            text.textContent = videoName;
            videoInfoObject1.innerHTML = "";
            videoInfoObject1.appendChild(text);
            videoInfoLink.setAttribute("href", videoUrl);
        };

        this.videoInfo.setDescription = (description) => {
            caption.innerHTML = description;
        }

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

        serviceBox.addElement(mainDiv0);
        serviceBox.addElement(horizontalContainer);
        serviceBox.addElement(mainDiv1);

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
        this.videoInfo.setDescription(example.getDescription());
        this.videoInfo.setVideoInfo(example.getName(), example.getSourceLink());

        let filterData = example.getFilterDataOrDefault();

        this.realtimeFilter.setType(filterData.type);
        this.realtimeFilter.setSharpness(filterData.sharpness);
        this.realtimeFilter.setHearingFrequency(filterData.frequency);
        this.realtimeFilter.setGain(filterData.gain);

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