class RealtimeFileService {
    constructor(page) {
        this.page = page;
    }

    async run() {
        this._download_process_and_display_file_from_desktop();
    }

    async _download_process_and_display_file_from_desktop(){
        let myFile = new MyFile(this.page);
        myFile.setFileSizeLimitInMegabytes(100);
        let file = await myFile.downloadFileFromDesktop();
        this._showMediaPlayer(file);
    }

    async _showMediaPlayer(originalFile) {
        let preloader = new Preloader(this.page);
        let preloaderCaption = preloader.createCaptionArea();
        preloaderCaption.setMessage(setTSTR("OneMinute..."));
        preloader.show();

        let hearingFrequency = 500;

        let scene = new Scene(this.page);
        scene.addClassName("mediaPlayerScene");

        let realtimeFilter = new RealTimeFilter(scene);
        realtimeFilter.setHearingFrequency(hearingFrequency);
        await realtimeFilter.loadFile(originalFile);

        let player = new MyPlayer(scene, realtimeFilter);
        player.setFile(originalFile);
        player.install(scene);

        let frequencySlider = new FrequencySlider(scene, hearingFrequency, 0, 8_000, realtimeFilter);
        frequencySlider.setFrequencyCallback((frequency) => {
            realtimeFilter.setHearingFrequency(frequency);
        });

        let actionsBox = scene.createBox();
        actionsBox.addClassName("actionsBox");

        let btnContainer = document.createElement("div");
        btnContainer.classList.add("mediaPlayerBtnContainer");
        actionsBox.addElement(btnContainer);

        let anotherFileBtn = document.createElement("button");
        anotherFileBtn.classList.add("myBtn");
        anotherFileBtn.innerHTML = setTSTR("anotherFile");
        anotherFileBtn.addEventListener("click", async () => {
            this._download_process_and_display_file_from_desktop();
        });

        let soundVisualizationBtn = new MyBinaryButton();
        let soundVisualization = new SoundVisualization(scene, realtimeFilter.getSpeaker());

        soundVisualizationBtn.setState1("FrequencySpectrum", async () => {
            player.hide();
            soundVisualization.show();
        });

        soundVisualizationBtn.setState2("ShowVideo", () => {
            player.show();
            soundVisualization.hide();
        });

        soundVisualizationBtn.applyFirstState();

        btnContainer.appendChild(anotherFileBtn);
        btnContainer.appendChild(soundVisualizationBtn.asHTMLElement());

        preloader.close();

        scene.show();
    }
}