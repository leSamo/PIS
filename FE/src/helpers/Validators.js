export const validateEmail = email => {
    if (!email) return true;

    const re = /^[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+$/;
    return re.test(email) && email.length <= 320;
}

export const validateUsername = username => {
    if (!username) return true;

    const re = /^[a-z0-9_-]{3,32}$/i;
    return re.test(username);
}

export const validatePassword = password => {
    if (!password) return true;

    const re = /^([a-z0-9!@#&()–{}:;',?/*~$=<> ]){8,128}$/i;
    return re.test(password);
}
