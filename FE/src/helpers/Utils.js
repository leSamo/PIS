export const capitalize = string => {
    return string[0].toUpperCase() + string.slice(1);
}

export const isSubstring = (substring, string) => {
    const strippedSubstring = substring.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const strippedString = string.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    return strippedString.toLowerCase().indexOf(strippedSubstring.toLowerCase()) !== -1;
}

export const playFadeInAnimation = element => {
    document.querySelector(element).classList.remove('fade-in');
    document.querySelector(element).offsetWidth;
    document.querySelector(element).classList.add('fade-in');
}