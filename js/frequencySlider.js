class FrequencySlider {


    constructor(scene, initialFrequency, minFrequency, maxFrequency, realtimeFilter) {
        this.scene = scene;
        this.minFrequency = minFrequency;
        this.maxFrequency = maxFrequency;
        this.initialFrequency = initialFrequency;
        this.normalHearingValue = -138;
        this.realtimeFilter = realtimeFilter;
        this.hearingFrequency = this.initialFrequency;

        this.createSlider();
    }

    _invertSlider() {
        this.realtimeFilter.invertFilter();

        let sliderValue = this.frequencySlider.value;
        let invertedSliderValue = parseInt(this.frequencySlider.max) - sliderValue;
        this.frequencySlider.value = invertedSliderValue;
        this._onFrequencySliderInput(invertedSliderValue);
    }

    createSlider() {
        // Создаем контейнер для ползунка
        this.frequencySliderBox = this.scene.createBox();
        this.frequencySliderBox.addClassName("frequencySliderBox");

        this.frequencySlider = document.createElement("input");
        this.frequencySlider.type = "range";

        this.frequencySlider.min = this.minFrequency;
        this.frequencySlider.max = this.maxFrequency + 1;
        this.frequencySlider.step = 1; // Шаг для ползунка

        // Устанавливаем начальное значение
        this.frequencySlider.value = this._convertSliderValueToFrequency(this.initialFrequency, this.realtimeFilter.isLowPassFilter());
        this.frequencySlider.classList.add("frequencySlider");

        // Добавляем метку
        this.frequencyLabel = document.createElement("span");
        this.frequencyLabel.classList.add("frequencyLabel");
        this.updateFrequencyLabel(this.initialFrequency);

        this.frequencySlider.addEventListener("input", (event) => {
            this._onFrequencySliderInput(event.target.value);
        });

        this.frequencySliderBox.addElement(this.frequencySlider);
        this.frequencySliderBox.addElement(this.frequencyLabel);

        this._addFilterInvertionBtn(this.frequencySliderBox);

        this._paintSlider();
    }

    _onFrequencySliderInput(sliderValue) {
        let value = parseInt(sliderValue);
        let frequency = this._convertSliderValueToFrequency(value, this.realtimeFilter.isLowPassFilter());
        if (!this._isNormalHearing(frequency)) {
            this.updateFrequencyLabel(frequency);
        }
        else {
            this.updateLabel(htmlTSTR("normalHearing"));
        }

        this._paintSlider();

        this.onFrequencyChange(frequency);
    }

    _addFilterInvertionBtn(box) {
        let btn = new MyBinaryButton();
        btn.addClassName("invertionButton");

        btn.setState1("EnableHighPassFilter", () => {
            this._invertSlider();
        });

        btn.setState2("EnableLowPassFilter", () => {
            this._invertSlider();
        })

        if (this.realtimeFilter.isLowPassFilter()) {
            btn.applyFirstState();
        }
        else if (this.realtimeFilter.isHighPassFilter()) {
            btn.applySecondState();
        }

        box.addElement(btn.asHTMLElement());
    }

    _convertSliderValueToFrequency(sliderValue, isLowPassFilter) {
        if (!isLowPassFilter) {
            // Для высокочастотного фильтра
            let maxValue = parseFloat(this.frequencySlider.max);
            let invertedValue = maxValue - sliderValue;

            // Преобразуем инвертированное значение ползунка в частоту
            return invertedValue;
        } else {
            // Для низкочастотного фильтра
            return sliderValue;
        }
    }

    _paintSlider() {
        let value = (this.frequencySlider.value - this.frequencySlider.min) / (this.frequencySlider.max - this.frequencySlider.min) * 100;
        this.frequencySlider.style.setProperty('--value', value + '%');
    }

    updateFrequencyLabel(frequency) {
        // Функция для форматирования числа с разделением тысяч
        let formatFrequency = (freq) => {
            if (freq > 999) {
                let integerPart = Math.floor(freq / 1_000); // Целая часть
                let fractionalPart = freq % 1_000; // Дробная часть
                return `${integerPart} ${fractionalPart.toString().padStart(3, '0')}`; // Форматируем и добавляем ведущие нули
            } else {
                return freq.toString();
            }
        };

        let formattedFrequency = formatFrequency(frequency);

        let tstr;
        if(this.realtimeFilter.isLowPassFilter()){
            tstr = "lowPassFilterParameter";
        }
        else if(this.realtimeFilter.isHighPassFilter()){
            tstr = "highPassFilterParameter";
        }
        else {
            throw new Error("Algorithm error");
        }

        this.updateLabel(`${htmlTSTR(tstr)}: ${formattedFrequency}`);
    }

    _isNormalHearing(frequency) {
        if (this.realtimeFilter.isLowPassFilter()) {
            return frequency === parseInt(this.frequencySlider.max);
        }
        else if (this.realtimeFilter.isHighPassFilter()) {
            return frequency === 0;
        }
        else {
            throw new Error("Algorithm error");
        }
    }

    updateLabel(text) {
        this.frequencyLabel.innerHTML = text;
    }

    onFrequencyChange(frequency) {
        if (typeof this.frequencyCallback === "function") {
            if (this._isNormalHearing(frequency)) {
                this.hearingFrequency = this.normalHearingValue;
            }
            else {
                this.hearingFrequency = frequency;
            }

            this.frequencyCallback(this.hearingFrequency);
        }
    }

    setFrequencyCallback(callback) {
        this.frequencyCallback = callback;
    }
}
