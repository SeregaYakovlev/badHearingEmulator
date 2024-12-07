class BadHearingExample {
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

    getName() {
        return this.object.name;
    }

    getSourceLink() {
        return this.object.sourceLink;
    }

    getFilterDataOrDefault() {
        let defaultProperties = {
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
        };
    }

    shuffle() {
        for (let i = this.localizedConfig.length - 1; i > 0; i--) {
            // Генерируем случайный индекс от 0 до i
            let j = Math.floor(Math.random() * (i + 1));

            // Меняем местами элементы массива
            [this.localizedConfig[i], this.localizedConfig[j]] =
                [this.localizedConfig[j], this.localizedConfig[i]];
        }

        // Обновляем текущий объект на первый элемент перемешанного массива
        this.object = this.localizedConfig[0];
    }

    getDescription(){
        let description = this.object.description;
        if(!description){
            description = textTSTR("WithoutDescription");
        }

        return description;
    }
}