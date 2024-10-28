class ExactlyHearingService {
    constructor(page) {
        this.page = page;
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
        separateEarsBtn.innerHTML = setTSTR("onEachEar");
        separateEarsBtn.addEventListener("click", () => {
            this._showAudiogramScene(Audiogram.Types.LEFT_EAR);
        })

        let binauralBtn = document.createElement("button");
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

        let box2 = scene.createBox();
        box2.addClassName("exactlyServiceBtnContainer");

        let homePageBtn = document.createElement("button");
        homePageBtn.innerHTML = setTSTR("homePage");
        homePageBtn.addEventListener("click", () => {
            this.page.showRoot();
        });

        box2.addElement(homePageBtn);
        scene.show();
    }

    async onAudiogramSceneInputed(audiogramScene) {
        if (audiogramScene.isLeftEar()) {
            let rightEarAudiogram = this._getAudiogramScene(Audiogram.Types.RIGHT_EAR);
            rightEarAudiogram.knowYourNeighbour(audiogramScene);
            rightEarAudiogram.show();
        }
        else if (audiogramScene.isRightEar() || audiogramScene.isBinaural()) {
            let file = await this._downloadFileFromDesktop();
            let serverTask = audiogramScene.getServerTask();
            serverTask.setFile(file);
            this._showFileHandlingScene(serverTask);
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


    async _showFileHandlingScene(serverTask) {
        let preloader = new Preloader(this.page);
        preloader.show();

        let worker = new Worker("worker.js");

        let handledAudioBuffer;
        let originalFile = serverTask.getFile();

        let myAudio = new MyAudio(originalFile);
        myAudio.setLogStream(preloader);

        let audiograms = serverTask.getAudiograms();
        // Конвертируем каждый аудиограм в JSON и собираем их в массив
        let audiogramArray = audiograms.map(audiogram => audiogram.toJsonSerializableObj());
        let json = JSON.stringify(audiogramArray);

        let auditoryGraphArray = AuditoryGraph.getAuditoryGraphArrayFromJson(json);

        handledAudioBuffer = await myAudio.processWithAuditoryGraphs(auditoryGraphArray);

        preloader.close();

        this._showMediaPlayer(serverTask, handledAudioBuffer, originalFile);
    }

    _showMediaPlayer(serverTask, handledAudioBuffer, originalFile) {
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
        anotherFileBtn.innerHTML = setTSTR("anotherFile");
        anotherFileBtn.addEventListener("click", async () => {
            let anotherFile = await this._downloadFileFromDesktop();
            let newServerTask = serverTask.recreate();
            newServerTask.setFile(anotherFile);
            this._showFileHandlingScene(newServerTask);
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

        let mainSceneBtn = document.createElement("button");
        mainSceneBtn.innerHTML = setTSTR("homePage");
        mainSceneBtn.addEventListener("click", () => {
            this.page.showRoot();
        });
        btnContainer.appendChild(mainSceneBtn);

        scene.show();
    }
}