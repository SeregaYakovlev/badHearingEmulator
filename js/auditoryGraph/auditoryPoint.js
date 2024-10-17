class AuditoryPoint {
    constructor(frequency, level) {
        this.frequency = frequency;
        this.level = level;
    }

    getFrequency() {
        return this.frequency;
    }

    getLevel() {
        return this.level;
    }

    getAttenuation() {
        // Преобразуем уровень затухания из децибел в линейное значение
        return Math.pow(10, -this.level / 20.0);
    }

    clone(){
        return new AuditoryPoint(this.frequency, this.level);
    }

    static fromJson(pointData) {
        let { frequency, level } = pointData;
        return new AuditoryPoint(frequency, level);
    }
}