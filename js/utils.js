class Utils {

    static async downloadFileFromDesktop() {
        return new Promise((resolve, reject) => {
            // Создаем скрытый input элемент
            let hiddenInput = document.createElement("input");
            hiddenInput.type = "file";
            hiddenInput.style.display = "none"; // Скрываем элемент

            // Ограничиваем выбор файлов только аудио и видео
            hiddenInput.accept = "audio/*,video/*,.mkv"; // Выбираем все аудио и видео файлы

            // Обработчик события выбора файла
            hiddenInput.addEventListener('change', () => {
                let file = hiddenInput.files[0]; // Получаем первый выбранный файл
                if (file) {
                    resolve(file); // Разрешаем промис с выбранным файлом
                } else {
                    reject(new Error("No file selected")); // Отклоняем промис, если файл не выбран
                }
            });

            hiddenInput.click();
        });
    }
}