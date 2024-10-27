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

        let sliderValue = this.frequencySlider.value;
        let isLowPassFilter = this.realtimeFilter.isLowPassFilter();
        let invertedBool = !isLowPassFilter;
        let invertedFrequency = this._convertSliderValueToFrequency(sliderValue, invertedBool);
        this.onFrequencyChange(invertedFrequency);
        this.realtimeFilter.invertFilter();

        let event = new Event('input', {
            bubbles: true, // Опционально, если хотите, чтобы событие всплывало
            cancelable: true // Опционально, если хотите, чтобы событие можно было отменить
        });
        
        // Триггерим событие
        this.frequencySlider.dispatchEvent(event);
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
        this.frequencySlider.value = this.initialFrequency;
        this.frequencySlider.classList.add("frequencySlider");

        // Добавляем метку
        this.frequencyLabel = document.createElement("span");
        this.frequencyLabel.classList.add("frequencyLabel");
        this.updateFrequencyLabel(this.initialFrequency);

        this.frequencySlider.addEventListener("input", (event) => {
            let value = parseInt(event.target.value);
            let frequency = this._convertSliderValueToFrequency(value, this.realtimeFilter.isLowPassFilter());
            if (!this._isNormalHearing(frequency)) {
                this.updateFrequencyLabel(frequency);
            }
            else {
                this.updateLabel(setTSTR("normalHearing"));
            }

            this.onFrequencyChange(frequency);
        });

        let invertionButton = document.createElement("button");
        invertionButton.classList.add("invertionButton");
        invertionButton.innerHTML = setTSTR("InvertFilter");
        invertionButton.addEventListener("click", () => {
            this._invertSlider();
        })

        this.frequencySliderBox.addElement(this.frequencySlider);
        this.frequencySliderBox.addElement(this.frequencyLabel);
        this.frequencySliderBox.addElement(invertionButton);

        this._paintSlider();
        this.frequencySlider.addEventListener('input', () => {
            this._paintSlider();
        });
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
        this.updateLabel(`${setTSTR("filterParameter")}: ${formattedFrequency}`);
    }

    _isNormalHearing(frequency){
        if(this.realtimeFilter.isLowPassFilter()){
            return frequency === parseInt(this.frequencySlider.max);
        }
        else if(this.realtimeFilter.isHighPassFilter()){
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
