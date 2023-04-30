export const validateEmail = email => {
    if (!email) return true;

    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email) && email.length <= 320;
}

export const validateUsername = username => {
    if (!username) return true;

    const re = /^[a-zA-Z0-9_]{4,20}$/i;
    return re.test(username);
}

export const validatePassword = password => {
    if (!password) return true;

    const re = /^[a-zA-Z0-9!@#$%^&*()_+,\-.\/:;<=>?@[\\\]^_`{|}~]{8,128}$/i;
    return re.test(password);
}

export const validateDate = dateString => {
    const dateRegex = /^(\d{4})-(0[1-9]|1[0-2])-([0-2][1-9]|3[01])$/;
    const match = dateString.match(dateRegex);

    if (!match) {
        return false;
    }
    
    const year = parseInt(match[1]);
    const month = parseInt(match[2]);
    const day = parseInt(match[3]);
    const date = new Date(year, month - 1, day);

    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
}

export const validateTime = timeString => {
    const timeRegex = /^([0-9]?\d|1\d|2[0-3]):([0-5]\d)$/
    return timeRegex.test(timeString);
}