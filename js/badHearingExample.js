class BadHearingExample {

    static HEARING_GROUPS = {
        lowpass: {
            type: 'lowpass',
            sharpness: 3,
            frequency: 500,
            gain: 1
        },
        highpass: {
            type: 'highpass',
            sharpness: 3,
            frequency: 500,
            gain: 1
        },
        weakHearingAllFrequencies: {
            type: 'highpass',
            sharpness: 3,
            frequency: 0,
            gain: 0.05
        }
    }


    static NO_SUCH_EXAMPLE = 345;

    constructor(localizedConfig, exampleIndex) {
        this.localizedConfig = localizedConfig;
        this.object = localizedConfig[exampleIndex];
        if (!this.object) {
            let error = new Error("Invalid object");
            error.customId = BadHearingExample.NO_SUCH_EXAMPLE;
            throw error;
        }

        this.object.index = exampleIndex;
    }

    getFirst() {
        return new BadHearingExample(this.localizedConfig, 0);
    }

    getLast() {
        return new BadHearingExample(this.localizedConfig, this.localizedConfig.length - 1);
    }

    getPrevious() {
        try {
            return new BadHearingExample(this.localizedConfig, this.object.index - 1);
        } catch (e) {
            if (e.customId && e.customId === BadHearingExample.NO_SUCH_EXAMPLE) {
                return this.getLast();
            }
            else {
                throw e;
            }
        }
    }

    getNext() {
        try {
            return new BadHearingExample(this.localizedConfig, this.object.index + 1);
        } catch (e) {
            if (e.customId && e.customId === BadHearingExample.NO_SUCH_EXAMPLE) {
                return this.getFirst();
            }
            else {
                throw e;
            }
        }
    }

    getIndex() {
        return this.object.index;
    }

    getLink() {
        return this.object.url;
    }

    isPinned() {
        return this.object.isPinned;
    }

    getSourceLink() {
        return this.object.sourceLink;
    }

    getFilterData(group) {
        if (group === 'lowpass') {
            return BadHearingExample.HEARING_GROUPS.lowpass; // Значения по умолчанию для lowFrequencyDeafness группы

        } else if (group === 'highpass') {
            return BadHearingExample.HEARING_GROUPS.highpass; // Значения по умолчанию для highFrequencyDeafness группы
        }
        else if (group === 'weakHearingAllFrequencies') {
            return BadHearingExample.HEARING_GROUPS.weakHearingAllFrequencies; // Значения по умолчанию для weakHearingAllFrequencies группы
        }
        else {
            throw new Error("No such group");
        }
        /*let defaultProperties = {
            type: 'lowpass', // Значение по умолчанию для свойства type
            sharpness: 3, // Значение по умолчанию для свойства sharpness
            frequency: 500, // Значение по умолчанию для свойства frequency
            gain: 1 // Значение по умолчанию для свойства gain
        };

        // Берём текущий объект filter или создаём пустой
        let filter = this.object.filter || {};

        // Создаём новый объект с заданными свойствами, дополняя их значениями по умолчанию
        return {
            ...defaultProperties,
            ...filter
        };*/
    }

    shuffle() {
        // Создаем массив непиннед элементов
        let nonPinnedElements = this.localizedConfig.filter(item => !item.pinned);

        // Если все элементы pinned, нет смысла делать перемешивание
        if (nonPinnedElements.length === 0) {
            return;
        }

        // Перемешиваем только непиннед элементы
        for (let i = 0; i < this.localizedConfig.length; i++) {
            if (this.localizedConfig[i].pinned) {
                continue;  // Пропускаем элементы, которые pinned
            }

            // Выбираем случайный элемент из массива непиннед элементов
            let randomIndex = Math.floor(Math.random() * nonPinnedElements.length);
            let randomElement = nonPinnedElements[randomIndex];

            // Меняем местами элементы массива
            [this.localizedConfig[i], randomElement] =
                [randomElement, this.localizedConfig[i]];

            // Удаляем использованный элемент из массива
            nonPinnedElements.splice(randomIndex, 1);
        }

        // Обновляем текущий объект на первый элемент массива
        this.object = this.localizedConfig[0];
    }

    getDescription() {
        let description = this.object.description;
        if (!description) {
            description = textTSTR("WithoutDescription");
        }

        return description;
    }

    getName() {
        let name = this.object.name;
        if (!name) {
            name = textTSTR("WithoutTitle");
        }

        return name;
    }
}