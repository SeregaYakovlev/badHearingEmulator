class ExactlyHearingService {
    constructor(page) {
        this.page = page;
        this.audiograms = [];
    }

    show() {
        this._showMainScene();
    }

    _showMainScene() {
        let scene = new Scene(this.page);
        scene.addClassName("mainScene");
        let b = scene.createBox();

        let welcomElem = document.createElement("div");

        let p0 = document.createElement("p");
        p0.innerHTML = `${setTSTR("audiogramScene_mainBox_P0")}`;
        welcomElem.appendChild(p0);

        let p1 = document.createElement("p");
        p1.innerHTML = `1) ${setTSTR("audiogramScene_mainBox_P1")}`;
        welcomElem.appendChild(p1);

        let p2 = document.createElement("p");
        p2.innerHTML = `2) ${setTSTR("audiogramScene_mainBox_P2")}`;
        welcomElem.appendChild(p2);

        let separateEarsBtn = document.createElement("button");
        separateEarsBtn.classList.add("myBtn");
        separateEarsBtn.innerHTML = setTSTR("onEachEar");
        separateEarsBtn.addEventListener("click", () => {
            this._showAudiogramScene(Audiogram.Types.LEFT_EAR);
        })

        let binauralBtn = document.createElement("button");
        binauralBtn.classList.add("myBtn");
        binauralBtn.innerHTML = setTSTR("OnBothEarsOnce");
        binauralBtn.addEventListener("click", () => {
            this._showAudiogramScene(Audiogram.Types.BINAURAL);
        })

        b.addElement(welcomElem);

        let div = document.createElement("div");
        div.classList.add("exactlyServiceBtnContainer");

        div.appendChild(separateEarsBtn);
        div.appendChild(binauralBtn);

        b.addElement(div);

        scene.show();
    }

    async _processAndDisplayFileFromDesktop(file) {
        let fileSizeInBytes = file.size;
        let fileSizeInMegaBytes = Utils.bytesToMegabytes(fileSizeInBytes);

        while (fileSizeInMegaBytes > 100) {
            let warningResult = await this._displayFileSizeWarning(fileSizeInMegaBytes);
            if (!warningResult.userIsAgree) {
                file = warningResult.anotherFile;
                fileSizeInBytes = file.size;
                fileSizeInMegaBytes = Utils.bytesToMegabytes(fileSizeInBytes);
            }
        }

        let preloader = new Preloader(this.page);
        preloader.show();
        let handledAudioBuffer = await this._handleFile(preloader, file, this.audiograms);
        preloader.close();
        this._showMediaPlayer(handledAudioBuffer, file);
    }

    async _displayFileSizeWarning(fileSizeInMegaBytes) {
        fileSizeInMegaBytes = Math.round(fileSizeInMegaBytes);
        let recommendedFileSizeInMegaBytes = 20;
        return new Promise((resolve) => {
            let scene = new Scene(this.page);
            scene.addClassName("fileSizeWarningScene");
            let box = scene.createBox();

            let p = document.createElement("p");
            p.innerHTML = setTSTR("FileSizeWarning", [fileSizeInMegaBytes, recommendedFileSizeInMegaBytes]);

            let anotherFileBtn = document.createElement("button");
            anotherFileBtn.classList.add("myBtn");
            anotherFileBtn.innerHTML = setTSTR("anotherFile");

            anotherFileBtn.addEventListener("click", async () => {
                let anotherFile = await this._downloadFileFromDesktop();
                scene.close();
                resolve({ anotherFile: anotherFile, userIsAgree: false }); // Возвращает новый файл
            });

            let agreeBtn = document.createElement("button");
            agreeBtn.classList.add("myBtn");
            agreeBtn.innerHTML = setTSTR("ContinueAnyway");

            agreeBtn.addEventListener("click", () => {
                scene.close();
                resolve({ anotherFile: null, userIsAgree: true }); // Возвращает согласие на обработку
            });

            let btnContainer = document.createElement("div");
            btnContainer.classList.add("exactlyServiceBtnContainer");

            btnContainer.appendChild(anotherFileBtn);
            btnContainer.appendChild(agreeBtn);

            box.addElement(p);
            box.addElement(btnContainer);
            scene.show();
        });
    }


    async onAudiogramSceneInputed(audiogramScene) {
        this.audiograms.push(audiogramScene.getAudiogram());
        if (audiogramScene.isLeftEar()) {
            let rightEarAudiogram = this._getAudiogramScene(Audiogram.Types.RIGHT_EAR);
            rightEarAudiogram.show();
        }
        else if (audiogramScene.isRightEar() || audiogramScene.isBinaural()) {
            let file = await this._downloadFileFromDesktop();
            this._processAndDisplayFileFromDesktop(file);
        }
    }

    _showAudiogramScene(audiogramType) {
        let audiogramScene = this._getAudiogramScene(audiogramType);
        audiogramScene.show();
    }

    _getAudiogramScene(audiogramType) {
        let scene = new AudiogramScene(this.page, this, audiogramType);
        return scene;
    }

    async _downloadFileFromDesktop() {
        return await Utils.downloadFileFromDesktop();
    }

    async _handleFile(preloader, originalFile, audiograms) {
        let handledAudioBuffer;

        let myFFT = new MyFFT(originalFile);
        myFFT.setPreloader(preloader);

        // Конвертируем каждый аудиограм в JSON и собираем их в массив
        let audiogramArray = audiograms.map(audiogram => audiogram.toJsonSerializableObj());
        let json = JSON.stringify(audiogramArray);

        let auditoryGraphArray = AuditoryGraph.getAuditoryGraphArrayFromJson(json);

        handledAudioBuffer = await myFFT.processWithAuditoryGraphs(auditoryGraphArray);

        return handledAudioBuffer;
    }

    _showMediaPlayer(handledAudioBuffer, originalFile) {
        let scene = new Scene(this.page);
        scene.addClassName("mediaPlayerScene");

        let player = new MyPlayer(scene, null);
        player.setFile(originalFile);
        player.setCustomAudioBuffer(handledAudioBuffer);
        player.install(scene);

        let actionsBox = scene.createBox();
        actionsBox.addClassName("actionsBox");

        let btnContainer = document.createElement("div");
        btnContainer.classList.add("mediaPlayerBtnContainer");
        actionsBox.addElement(btnContainer);

        let anotherFileBtn = document.createElement("button");
        anotherFileBtn.classList.add("myBtn");
        anotherFileBtn.innerHTML = setTSTR("anotherFile");
        anotherFileBtn.addEventListener("click", async () => {
            let anotherFile = await this._downloadFileFromDesktop();
            this._processAndDisplayFileFromDesktop(anotherFile);
        });

        btnContainer.appendChild(anotherFileBtn);

        let soundVisualizationBtn = new MyBinaryButton();

        let soundVisualization = new SoundVisualization(scene, player);

        soundVisualizationBtn.setState1("FrequencySpectrum", async () => {
            player.hide();
            await soundVisualization.show();
            soundVisualization.startProcessing();
        });

        soundVisualizationBtn.setState2("ShowVideo", () => {
            player.show();
            soundVisualization.hide();
            soundVisualization.stopProcessing();
        });

        soundVisualizationBtn.applyFirstState();

        btnContainer.appendChild(soundVisualizationBtn.asHTMLElement());

        scene.show();
    }
}