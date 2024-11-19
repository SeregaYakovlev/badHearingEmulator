class Utils {
    static truncate(string, maxLength) {
        if (maxLength < 3) {
            throw new Error("Can not truncate by ... length less than 3");
        }
    
        // Если строка длиннее maxLength - 3, то обрезаем и добавляем троеточие
        if (string.length > maxLength) {
            return string.substring(0, maxLength - 3) + "...";
        }
    
        // Если длина строки меньше или равна maxLength, то возвращаем строку как есть
        return string;
    }
    
}