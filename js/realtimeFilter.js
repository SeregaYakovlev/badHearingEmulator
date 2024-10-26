class RealTimeFilter {
    constructor() {
        this.speaker = new MySpeaker();
        this.audioContext = this.speaker.getAudioContext();
        this.filters = [];
        for (let i = 0; i < 3; i++) {
            let filter = this._createFilter();
            this.filters.push(filter);
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

    setHearingFrequency(frequency) {
        this.hearingFrequency = frequency;
        if (frequency === -138) {
            // специальное сигнальное значение
            // отключения фильтра
            for (let filter of this.filters) {
                filter.frequency.value = 999_999_999;
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
        filter.type = "lowpass";
        return filter;
    }
}