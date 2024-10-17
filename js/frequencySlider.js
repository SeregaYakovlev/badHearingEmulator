class FrequencySlider {
    constructor(scene, initialFrequency, minFrequency, maxFrequency) {
        this.scene = scene;
        this.minFrequency = minFrequency;
        this.maxFrequency = maxFrequency;
        this.initialFrequency = initialFrequency;
        this.normalHearingValue = -138;

        this.createSlider();
    }

    // Преобразование частоты в значение для ползунка
    frequencyToSliderValue(frequency) {
        if (frequency >= this.maxFrequency) {
            return 1; // Значение для "Нормального слуха"
        }
        return (Math.log(frequency / this.minFrequency) / Math.log(this.maxFrequency / this.minFrequency));
    }

    // Преобразование значения ползунка обратно в частоту
    sliderValueToFrequency(value) {
        if (value >= 1) {
            return this.normalHearingValue; // Значение для "Нормального слуха"
        }
        let freq = this.minFrequency * Math.pow(this.maxFrequency / this.minFrequency, value);
        return freq.toFixed(0);
    }

    createSlider() {
        // Создаем контейнер для ползунка
        this.frequencySliderBox = this.scene.createBox();
        this.frequencySliderBox.addClassName("frequencySliderBox");

        this.frequencySlider = document.createElement("input");
        this.frequencySlider.type = "range";

        // Устанавливаем диапазон ползунка от 0 до 1
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
            if (value !== parseInt(this.frequencySlider.max)) {
                this.updateFrequencyLabel(value);
            }
            else {
                this.updateLabel(setTSTR("normalHearing"));
            }

            this.onFrequencyChange(value);
        });

        this.frequencySliderBox.addElement(this.frequencySlider);
        this.frequencySliderBox.addElement(this.frequencyLabel);

        this._paintSlider();
        this.frequencySlider.addEventListener('input', () => {
            this._paintSlider();
        });
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

    updateLabel(text) {
        this.frequencyLabel.innerHTML = text;
        // Not implemented
    }

    onFrequencyChange(frequency) {
        frequency = parseInt(frequency);
        if (typeof this.frequencyCallback === "function") {
            if (frequency === parseInt(this.frequencySlider.max)) {
                this.frequencyCallback(this.normalHearingValue);
            }
            else {
                this.frequencyCallback(frequency);
            }

        }
    }

    setFrequencyCallback(callback) {
        this.frequencyCallback = callback;
    }
}
