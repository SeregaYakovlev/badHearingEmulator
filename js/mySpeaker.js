class MySpeaker {
    constructor(scene) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.currentInputSource = null;
        this.speakerEventListeners = [];

        scene.subscribeToSceneClosing(this);
    }

    subscribeToSpeakerEvents(speakerListener) {
        this.speakerEventListeners.push(speakerListener);
    }

    getAudioContext() {
        return this.audioContext;
    }

    getSoundSource() {
        return this.getActiveSoundSource();
    }

    setFilters(filters) {
        this.filters = filters;
    }

    playStream(stream) {
        if(this.isPlaying()){
            throw new Error("The speaker is already playing");
        }
    
        if (!stream) {
            throw new Error("Invalid argument: no stream");
        }
    
        let streamSource = this._createSoundStreamSource(stream);
    
        if (this.filters) {
            this._connectFiltersToOutput(streamSource, this.filters);
        } else {
            streamSource.connect(this.audioContext.destination);
        }
    
        this.currentInputSource = streamSource;

        this._onPlayingStarted(this.getActiveSoundSource());
    }
    
    playBuffer(audioBuffer, position) {
        if(this.isPlaying()){
            throw new Error("The speaker is already playing");
        }
    
        if (!audioBuffer) {
            throw new Error("AudioBuffer is not set.");
        }
    
        let bufferSource = this._createSoundBufferSource();
        bufferSource.buffer = audioBuffer;
    
        if (this.filters) {
            this._connectFiltersToOutput(bufferSource, this.filters);
        } else {
            bufferSource.connect(this.audioContext.destination);
        }
    
        bufferSource.start(0, position);
        this.currentInputSource = bufferSource;
    
        this._onPlayingStarted(this.getActiveSoundSource());
    }
    

    stop() {
        if (this.currentInputSource) {
            this.currentInputSource.disconnect();

            if (this.currentInputSource instanceof AudioBufferSourceNode) {
                this.currentInputSource.stop();
            }

            this.currentInputSource = null;
        }

        this._disconnectFiltersFromOutput();

        this._onPlayingStopped();
    }

    _onPlayingStarted(source) {
        for (let speakerListener of this.speakerEventListeners) {
            speakerListener.onSpeakerPlayingStarted(source);
        }
    }

    _onPlayingStopped() {
        for (let speakerListener of this.speakerEventListeners) {
            speakerListener.onSpeakerPlayingStopped();
        }
    }

    isPlaying() {
        return this.currentInputSource != null;
    }

    getActiveSoundSource() {
        if(this.filters){
            return this.filters[this.filters.length - 1];
        }
        else {
            return this.currentInputSource;
        }
    }

    _connectFiltersToOutput(soundSource, filters) {
        this._connectFiltersToInputAndOutput(filters, soundSource, this.audioContext.destination);
    }

    _connectFiltersToInputAndOutput(filters, input, output) {
        // Соединяем фильтры последовательно
        input.connect(filters[0]); // Подключаем источник к первому фильтру
        for (let i = 1; i < filters.length; i++) {
            filters[i - 1].connect(filters[i]); // Подключаем фильтры друг к другу
        }
        filters[filters.length - 1].connect(output); // Последний фильтр к выходу
    }

    _disconnectFiltersFromOutput(){
        if(this.filters){
            for (let filter of this.filters) {
                filter.disconnect();
            }
        }
    }

    _createSoundBufferSource() {
        let soundSource = this.audioContext.createBufferSource();
        return soundSource; // Не забываем вернуть созданный источник
    }

    _createSoundStreamSource(stream) {
        let soundSource = this.audioContext.createMediaStreamSource(stream);
        return soundSource; // Не забываем вернуть созданный источник
    }

    onSceneClosed() {
        this.stop();
    }
}
