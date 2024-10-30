class RealTimeFilter {
    static FILTER_TYPE = {
        LOWPASS: 'lowpass',
        HIGHPASS: 'highpass'
    };

    constructor(scene) {
        this.filterType = RealTimeFilter.FILTER_TYPE.LOWPASS;
        this.speaker = new MySpeaker(scene);
        this.audioContext = this.speaker.getAudioContext();
        this.filters = [];
        for (let i = 0; i < 3; i++) {
            let filter = this._createFilter();
            this.filters.push(filter);
        }

        scene.subscribeToSceneClosing(this);
    }

    onSceneClosed(){
        this.stopProcessing();
    }

    invertFilter(){
        if(this.filterType === RealTimeFilter.FILTER_TYPE.LOWPASS){
            this.filterType = RealTimeFilter.FILTER_TYPE.HIGHPASS;
        }
        else if(this.filterType === RealTimeFilter.FILTER_TYPE.HIGHPASS){
            this.filterType = RealTimeFilter.FILTER_TYPE.LOWPASS;
        }

        for(let filter of this.filters){
            filter.type = this.filterType;
        }
    }

    getAudioContext(){
        return this.audioContext;
    }

    getSoundSource(){
        return this._getLastFilter();
    }

    _getLastFilter(){
        return this.filters[this.filters.length - 1];
    }

    getFilterType(){
        return this.filterType;
    }

    isLowPassFilter(){
        return this.filterType === RealTimeFilter.FILTER_TYPE.LOWPASS;
    }

    isHighPassFilter(){
        return this.filterType === RealTimeFilter.FILTER_TYPE.HIGHPASS;
    }

    setHearingFrequency(frequency) {
        this.hearingFrequency = frequency;
        if (frequency === -138) {
            // специальное сигнальное значение
            // отключения фильтра
            let filterDisablingFrequency;
            if(this.filterType === RealTimeFilter.FILTER_TYPE.LOWPASS){
                filterDisablingFrequency = 999_999_999;
            }
            else if(this.filterType === RealTimeFilter.FILTER_TYPE.HIGHPASS) {
                filterDisablingFrequency = 0;
            }
            else {
                throw new Error("Algorithm error");
            }

            for (let filter of this.filters) {
                filter.frequency.value = filterDisablingFrequency;
            }
        }
        else {
            this.hearingFrequency = frequency;
            for (let filter of this.filters) {
                filter.frequency.value = frequency;
            }
        }
    }

    async loadFile(file) {
        this.file = file;
        // Чтение аудиофайла
        let arrayBuffer = await file.arrayBuffer();
        let audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this._audioBuffer = audioBuffer;
    }

    startProcessingFromMicrophone(stream) {
        if (!stream) {
            throw new Error("Invalid argument: no stream");
        }

        if (this.hearingFrequency == null) { // Проверяет на null и undefined, ноль допустим
            throw new Error("No hearing frequency parameter");
        }

        this.speaker.setFilters(this.filters);
        this.speaker.playStream(stream);
    }

    startProcessingFromFile(position) {
        if (!this._audioBuffer) {
            throw new Error("No one source is loaded");
        }

        if (this.hearingFrequency == null) { // Проверяет на null и undefined, ноль допустим
            throw new Error("No hearing frequency parameter");
        }

        this.speaker.setFilters(this.filters);
        this.speaker.playBuffer(this._audioBuffer, position);
    }

    stopProcessing() {
        this.speaker.stop();

        for (let filter of this.filters) {
            filter.disconnect();
        }
    }

    _createFilter() {
        let filter = this.audioContext.createBiquadFilter();
        filter.type = this.filterType;
        return filter;
    }
}