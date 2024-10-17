function setTSTR(stringName){
    return `<translated-string string-name=${stringName}>${getTSTR(stringName)}</translated-string>`;
}

function getTSTR(stringName){
    let page = window.page;

    let currentLanguage = page.getCurrentLanguage();

    return currentLanguage.getTranslation(stringName);
}