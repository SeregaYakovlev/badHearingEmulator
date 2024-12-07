class RealTimeFilter {
    static FILTER_TYPE = {
        LOWPASS: 'lowpass',
        HIGHPASS: 'highpass'
    };

    constructor(scene) {
        this.filterType = RealTimeFilter.FILTER_TYPE.LOWPASS;
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        this.sharpness = 3; // по умолчанию фильтр шестого порядка (три - так как один фильтр является биквадратным)
        this.gain = 1; // по умолчанию нет усиления или ослабления

        this.filters = [];
        for (let i = 0; i < 3; i++) {
            let filter = this._createFilter();
            this.filters.push(filter);
        }

        // Создаем узел усиления
        this.gainNode = this.audioContext.createGain();
        this.setGain(this.gain); // Усиление по умолчанию (1 = без изменений)

        scene.subscribeToSceneClosing(this);
    }

    setSharpness(sharpness) {
        if (sharpness < 1 || sharpness > 3) {
            throw new Error("Impossible to set filter sharpness more than 3 or less than 1");
        }

        this.sharpness = sharpness;
    }

    setType(type) {
        if (type === RealTimeFilter.FILTER_TYPE.LOWPASS || type === RealTimeFilter.FILTER_TYPE.HIGHPASS) {
            this.filterType = type;

            for (let filter of this.filters) {
                filter.type = this.filterType;
            }
        }
        else {
            throw new Error("Invalid filter type");
        }
    }

    setGain(value) {
        if (value < 0 || value > 1) {
            throw new Error("Gain value must be between 0 and 1");
        }
        this.gainNode.gain.value = value;

        this.gain = value;
    }

    onSceneClosed() {
        for (let filter of this.filters) {
            filter.disconnect();
        }

        this.gainNode.disconnect();
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

        // вызываем эту функцию, так как различается filterDisablingFrequency
        // у разных типов фильтра. Если какие-то фильтры не активны, то нужно изменить
        // всё-пропускающую частоту
        this.setHearingFrequency(this.hearingFrequency);
    }

    getAudioContext() {
        return this.audioContext;
    }

    getSoundSource() {
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

    _getFilterDisablingFrequency() {
        if (this.filterType === RealTimeFilter.FILTER_TYPE.LOWPASS) {
            return 999_999_999; // Очень высокая частота для lowpass (фильтр не ограничивает частоты)
        }
        else if (this.filterType === RealTimeFilter.FILTER_TYPE.HIGHPASS) {
            return 0; // Очень низкая частота для highpass (фильтр пропускает все частоты)
        }
        else {
            throw new Error("Algorithm error");
        }
    }

    setHearingFrequency(frequency) {
        if (frequency === -138) {
            // специальное сигнальное значение отключения фильтра
            frequency = this._getFilterDisablingFrequency();
        }

        // Устанавливаем частоту для активных фильтров
        for (let i = 0; i < this.sharpness; i++) {
            this.filters[i].frequency.value = frequency;
        }

        // Устанавливаем частоту для неактивных фильтров
        if (this.sharpness < this.filters.length) {
            for (let i = this.sharpness; i < this.filters.length; i++) {
                this.filters[i].frequency.value = this._getFilterDisablingFrequency(); // Отключаем фильтр
            }
        }

        this.hearingFrequency = frequency; // Обновляем текущую частоту
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
        // Подключаем вход к узлу усиления
        source.connect(this.gainNode);

        // Подключаем источник к фильтрам
        this.gainNode.connect(this.filters[0]);

        // Подключаем фильтры друг к другу
        for (let i = 0; i < this.filters.length - 1; i++) {
            this.filters[i].connect(this.filters[i + 1]);
        }

        // Подключаем последний фильтр к узлу выхода
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