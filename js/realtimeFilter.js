class RealTimeFilter {
    static FILTER_TYPE = {
        LOWPASS: 'lowpass',
        HIGHPASS: 'highpass'
    };

    constructor(scene) {
        this.filterType = RealTimeFilter.FILTER_TYPE.LOWPASS;
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.filters = [];
        for (let i = 0; i < 3; i++) {
            let filter = this._createFilter();
            this.filters.push(filter);
        }

        scene.subscribeToSceneClosing(this);
    }

    onSceneClosed() {
        for (let filter of this.filters) {
            filter.disconnect();
        }
    }

    invertFilter() {
        if (this.filterType === RealTimeFilter.FILTER_TYPE.LOWPASS) {
            this.filterType = RealTimeFilter.FILTER_TYPE.HIGHPASS;
        }
        else if (this.filterType === RealTimeFilter.FILTER_TYPE.HIGHPASS) {
            this.filterType = RealTimeFilter.FILTER_TYPE.LOWPASS;
        }

        for (let filter of this.filters) {
            filter.type = this.filterType;
        }
    }

    getAudioContext() {
        return this.audioContext;
    }

    getSoundSource() {
        return this._getLastFilter();
    }

    _getLastFilter() {
        return this.filters[this.filters.length - 1];
    }

    getFilterType() {
        return this.filterType;
    }

    isLowPassFilter() {
        return this.filterType === RealTimeFilter.FILTER_TYPE.LOWPASS;
    }

    isHighPassFilter() {
        return this.filterType === RealTimeFilter.FILTER_TYPE.HIGHPASS;
    }

    setHearingFrequency(frequency) {
        this.hearingFrequency = frequency;
        if (frequency === -138) {
            // специальное сигнальное значение
            // отключения фильтра
            let filterDisablingFrequency;
            if (this.filterType === RealTimeFilter.FILTER_TYPE.LOWPASS) {
                filterDisablingFrequency = 999_999_999;
            }
            else if (this.filterType === RealTimeFilter.FILTER_TYPE.HIGHPASS) {
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

    async connectMicrophone(microphoneStream) {
        let source = this.audioContext.createMediaStreamSource(microphoneStream);
        await this._connectStream(source);
    }

    async connectPlayer(htmlElement) {
        if (!(htmlElement instanceof HTMLAudioElement || htmlElement instanceof HTMLVideoElement)) {
            throw new Error("Expected an HTMLAudioElement or HTMLVideoElement");
        }

        // Создаем источник аудио из элемента <audio> или <video>
        let source = this.audioContext.createMediaElementSource(htmlElement);

        await this._connectStream(source);
    }

    async _connectStream(source) {
        // Подключаем источник к фильтрам
        source.connect(this.filters[0]);

        // Подключаем фильтры друг к другу
        for (let i = 0; i < this.filters.length - 1; i++) {
            this.filters[i].connect(this.filters[i + 1]);
        }

        // Подключаем последний фильтр к выходу
        this.filters[this.filters.length - 1].connect(this.audioContext.destination);

        // НА МОБИЛЬНОМ CHROME аудиоконтекст останавливается, если был создан
        // до того, как пользователь повзаимодействовал со страницей

        // может быть такое, что резуминг контекста зависнет.
        // в таком случае бросаем исключение, чтобы юзер ребутнул страницу,
        // а не думал, почему видео зависло
        if (this.getAudioContext().state === 'suspended') {
            let timeout = 1000; // Таймаут в миллисекундах

            await Promise.race([
                this.getAudioContext().resume(),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('AudioContext resume timed out')), timeout)
                ),
            ]);
        }
    }

    _createFilter() {
        let filter = this.audioContext.createBiquadFilter();
        filter.type = this.filterType;
        return filter;
    }
}