class LiveConversation {
    constructor(page) {
        this.page = page;
        this.microphone = new MyMicrophone();
        this.realtimeFilter = new RealTimeFilter();
        this.hearingFrequency = 500;
    }

    show() {
        let scene = new Scene(this.page);
        scene.addClassName("liveConversationScene");

        let mainBox = scene.createBox();
        mainBox.addClassName("mainBox");

        let p0 = document.createElement("p");
        p0.innerHTML = setTSTR("liveConversationP0");

        let p1 = document.createElement("p");
        p1.innerHTML = `1) ${setTSTR("takeSmartphone")}`;

        let p2 = document.createElement("p");
        p2.innerHTML = `2) ${setTSTR("putOnHeadphones")}`;

        let p3 = document.createElement("p");
        p3.innerHTML = `3) ${setTSTR("enableMicrophone")}`;

        let p4 = document.createElement("p");
        p4.innerHTML = `4) ${setTSTR("talkToSurroundings")}`;

        mainBox.addElement(p0);
        mainBox.addElement(p1);
        mainBox.addElement(p2);
        mainBox.addElement(p3);
        mainBox.addElement(p4);

        this._addMicrophoneBtn(mainBox);
        this._addFrequencySlider(scene);
        this._addFrequencySpectrum(scene);

        scene.show();
    }

    async _enableMicrophone(){
        await this.microphone.enable();
        this._onMicrophoneEnabled();
    }

    _disableMicrophone(){
        this.microphone.disable();
        this._onMicrophoneDisabled();
    }

    _addMicrophoneBtn(box) {
        let btn = document.createElement("button");
        btn.classList.add("microphoneBtn");

        btn.innerHTML = setTSTR("enableMicrophone");

        btn.onclick = () => {
            if(this.microphone.isEnabled()){
                this._disableMicrophone();
            }
            else {
                this._enableMicrophone();
            }
        };
        box.addElement(btn);

        this.microphoneBtn = btn;
        this.microphoneBtn.onMicrophoneEnabled = () => {
            this.microphoneBtn.setAttribute('microphone-enabled', 'true');
            this.microphoneBtn.innerHTML = setTSTR("disableMicrophone");
        }
        this.microphoneBtn.onMicrophoneDisabled = () => {
            this.microphoneBtn.setAttribute('microphone-enabled', 'false');
            this.microphoneBtn.innerHTML = setTSTR("enableMicrophone");
        }
    }

    _onMicrophoneEnabled() {
        this.microphoneBtn.onMicrophoneEnabled();
        let stream = this.microphone.getStream();
        this.realtimeFilter.setHearingFrequency(this.hearingFrequency);
        this.realtimeFilter.startProcessingFromMicrophone(stream);
        this.soundVisualization.startProcessing();
    }

    _onMicrophoneDisabled() {
        this.microphoneBtn.onMicrophoneDisabled();
        this.realtimeFilter.stopProcessing();
        this.soundVisualization.stopProcessing();
    }

    _addFrequencySlider(scene) {
        let frequencySlider = new FrequencySlider(scene, this.hearingFrequency, 0, 8_000, this.realtimeFilter);
        frequencySlider.setFrequencyCallback((frequency) => {
            this._setHearingFrequency(frequency);
        });
    }

    _addFrequencySpectrum(scene){
        this.soundVisualization = new SoundVisualization(scene, this);
        scene.update(); // важный вызов, чтобы bounding_client_rect увидел элемент
        this.soundVisualization.show();
    }

    getAudioContext(){
        return this.realtimeFilter.getAudioContext();
    }

    getSoundSource(){
        return this.realtimeFilter.getSoundSource();
    }

    _setHearingFrequency(frequency) {
        this.hearingFrequency = frequency;
        this.realtimeFilter.setHearingFrequency(frequency);
    }
}
