class AudiogramScene {
    constructor(page, service, audiogramType){
        this.page = page;
        this.service = service;
        this.scene = new Scene(page);
        this.scene.addClassName("audiogramScene");
        this.audiogramType = audiogramType;
        this.audiogram = new Audiogram(audiogramType);
        this._createAudiogramControlsBox(this.scene, this.audiogram);
        this.audiogramBox = this._createAudiogramBox(this.scene);
        this._createAudiogramCaption(this.audiogram, this.audiogramBox);
        this.nextActionBox = this._createNextActionBox(this.scene);
        this.audiogram.show(this.audiogramBox.asHTMLElement());
    }

    getAudiogram(){
        return this.audiogram;
    }

    show(){
        this.scene.show();
    }

    isLeftEar(){
        return this.audiogramType === Audiogram.Types.LEFT_EAR;
    }

    isRightEar(){
        return this.audiogramType === Audiogram.Types.RIGHT_EAR;
    }

    isBinaural(){
        return this.audiogramType === Audiogram.Types.BINAURAL;
    }

    _createAudiogramCaption(audiogram, audiogramBox){
        let captionDiv = document.createElement("div");
        captionDiv.classList.add("audiogramCaptionDiv");
        let captionSpan = document.createElement("span");
        captionSpan.innerHTML = audiogram.getCaption();

        captionDiv.appendChild(captionSpan);
        audiogramBox.addElement(captionDiv);
        return captionDiv;
    }

    _createAudiogramControlsBox(scene, audiogram){
        let audiogramControlsBox = scene.createBox();
        audiogramControlsBox.addClassName("audiogramControlsBox");

        let btnContainer = document.createElement("div");
        btnContainer.classList.add("audioGramBtnContainer");

        audiogramControlsBox.addElement(btnContainer);

        this._addClearAllBtn(audiogram, btnContainer);
        this._addClearLastDrawnPointBtn(audiogram, btnContainer);
        return audiogramControlsBox;
    }

    _createAudiogramBox(scene){
        let audiogramBox = scene.createBox();
        audiogramBox.addClassName("audiogramBox");
        return audiogramBox;
    }

    setNextActionBtnText(btnText){
        this.nextActionBox.nextActionBtn.textContent = btnText;
    }

    _createNextActionBox(scene){
        let nextActionBox = scene.createBox();
        nextActionBox.addClassName("nextActionBox");

        let nextActionBtn = document.createElement("button");
        nextActionBtn.innerHTML = setTSTR("Next");

        nextActionBtn.addEventListener("click", () => {
            this.service.onAudiogramSceneInputed(this);
        })

        nextActionBox.addElement(nextActionBtn);

        nextActionBox.nextActionBtn = nextActionBtn;
        return nextActionBox;
    }

    _getMyNeighbour(){
        return this.myNeighbour;
    }

    knowYourNeighbour(audiogramScene){
        this.myNeighbour = audiogramScene;
    }

    getServerTask(){
        if(this.isBinaural()){
            let serverTask = new ServerTask();
            serverTask.setBinauralAudiogram(this.getAudiogram());
            return serverTask;
        }
        else if(this.isRightEar()){
            let myNeighbour = this._getMyNeighbour();
            let leftEarAudiogram = myNeighbour.getAudiogram();

            let serverTask = new ServerTask();
            serverTask.setLeftEarAudiogram(leftEarAudiogram);
            serverTask.setRightEarAudiogram(this.getAudiogram())
            return serverTask;
        }
        else if(this.isLeftEar()){
            throw new Error("Algorithm error");
        }
    }



    _addClearAllBtn(audiogram, btnContainer){
        let clearAllBtn = document.createElement("button");
        clearAllBtn.innerHTML = setTSTR("DeleteAll");
        clearAllBtn.addEventListener("click", () => {
            audiogram.clearAllPoints();
        });

        btnContainer.appendChild(clearAllBtn);
    }

    _addClearLastDrawnPointBtn(audiogram, btnContainer){
        let clearLastDrawnPointBtn = document.createElement("button");
        clearLastDrawnPointBtn.innerHTML = setTSTR("DeleteOneByOne");
        clearLastDrawnPointBtn.addEventListener("click", () => {
            audiogram.clearLastDrawnPoint();
        });

        btnContainer.appendChild(clearLastDrawnPointBtn);
    }
}