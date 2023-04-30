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
