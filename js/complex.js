class Complex {
    constructor(real, imaginary) {
        if(real === null || real === undefined || imaginary === null || imaginary === undefined){
            throw new Error("Can not create complex");
        }

        this.real = real;
        this.imaginary = imaginary;
    }

    getReal(){
        return this.real;
    }

    getImaginary(){
        return this.imaginary;
    }

    // Возвращает модуль комплексного числа
    // Возвращает модуль комплексного числа с учетом возможных случаев
    abs() {
        if (isNaN(this.real) || isNaN(this.imaginary)) {
            return NaN;
        }
        if (!isFinite(this.real) || !isFinite(this.imaginary)) {
            return Infinity;
        }

        // Проверка на случай, когда мнимая часть больше или равна реальной части
        if (Math.abs(this.real) < Math.abs(this.imaginary)) {
            if (this.real === 0.0) {
                return Math.abs(this.imaginary);
            }
            let q = this.real / this.imaginary;
            return Math.abs(this.imaginary) * Math.sqrt(1 + q * q);
        } else {
            if (this.imaginary === 0.0) {
                return Math.abs(this.real);
            }
            let q = this.imaginary / this.real;
            return Math.abs(this.real) * Math.sqrt(1 + q * q);
        }
    }

    // Возвращает аргумент (или фазу) комплексного числа
    getArgument() {
        return Math.atan2(this.imaginary, this.real);
    }

    // Преобразование полярных координат в комплексное число
    static polar2Complex(r, theta) {
        if (r < 0) {
            throw new Error(`Negative modulus for complex number: ${r}`);
        }
        return new Complex(r * Math.cos(theta), r * Math.sin(theta));
    }

    // Возвращает строковое представление комплексного числа
    toString() {
        return `${this.real} + ${this.imaginary}i`;
    }
}
