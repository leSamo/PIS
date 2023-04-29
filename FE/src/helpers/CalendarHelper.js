export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
export const WEEKDAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// ISO long format: 2023-04-24T013:00:00.000Z or 2023-04-24T013:00:00.000+02:00
// ISO short format: 2023-04-24 (don't forget timezone correction)
export const isoLongToShort = dateString => {
    dateString = new Date(dateString)
    return dateString.getFullYear() + "-" + (dateString.getMonth() + 1).toString().padStart(2, "0") + "-" + dateString.getDate().toString().padStart(2, "0");
}

export const getMostRecentMonday = dateString => {
    const date = new Date(dateString);
    const daysSinceMonday = date.getDay() === 0 ? 6 : date.getDay() - 1;
    date.setDate(date.getDate() - daysSinceMonday);

    return isoLongToShort(date);
}

export const getFirstFollowingSunday = dateString => {
    const date = new Date(dateString);
    const daysUntilSunday = date.getDay() === 0 ? 0 : 7 - date.getDay();
    date.setDate(date.getDate() + daysUntilSunday);

    return isoLongToShort(date);
}

export const goBackWeek = dateString => {
    const date = new Date(dateString);

    date.setDate(new Date(date).getDate() - 7);
    return isoLongToShort(date);
}

export const goForwardWeek = dateString => {
    const date = new Date(dateString);

    date.setDate(new Date(date).getDate() + 7);
    return isoLongToShort(date);
}

export const getWeekNumber = dateString => {
    const date = new Date(dateString);
    const yearStart = new Date(date.getFullYear(), 0, 1);
    const timeDiff = date.getTime() - yearStart.getTime();
    const weekNumber = Math.ceil(timeDiff / (1000 * 3600 * 24 * 7));

    return weekNumber;
}

export const getWeekCalendarTitle = currentMonday => {
    currentMonday = new Date(currentMonday);
    let currentSunday = new Date(currentMonday);
    currentSunday.setDate(new Date(currentSunday).getDate() + 6);

    const mondayMonth = MONTHS[currentMonday.getMonth()]
    const sundayMonth = MONTHS[currentSunday.getMonth()]
    const mondayYear = currentMonday.getFullYear()
    const sundayYear = currentSunday.getFullYear()

    if (mondayMonth === sundayMonth) {
        return mondayMonth + " " + mondayYear;
    }

    if (mondayYear === sundayYear) {
        return mondayMonth + " – " + sundayMonth + " " + mondayYear;
    }

    return mondayYear + " – " + sundayYear
}

export const getMonthCalendarTitle = firstDayOfMonth => {
    const [year, month] = firstDayOfMonth.split("-");

    return `${MONTHS[month - 1]} ${year}`;
}

export const getFirstDayOfMonth = dateString => {
    const firstDayOfMonth = new Date(dateString);
    firstDayOfMonth.setDate(1);

    return isoLongToShort(firstDayOfMonth);
}

export const getLastDayOfMonth = dateString => {
    const date = new Date(dateString);
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    return isoLongToShort(lastDayOfMonth);
}

export const getWeekCountInMonth = dateString => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastOfMonth.getDate();
    const daysFromMonday = (firstOfMonth.getDay() + 6) % 7;
    const daysLeft = daysInMonth - (7 - daysFromMonday);
    const weeksInMonth = 1 + Math.ceil(daysLeft / 7);

    return weeksInMonth;
};

export const goBackMonth = dateString => {
    const date = new Date(dateString);
    const month = date.getMonth();
    const year = date.getFullYear();

    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = prevMonth === 11 ? year - 1 : year;

    const prevMonthFirstDay = new Date(prevYear, prevMonth, 1);

    return isoLongToShort(prevMonthFirstDay);
}

export const goForwardMonth = dateString => {
    const date = new Date(dateString);
    const month = date.getMonth();
    const year = date.getFullYear();

    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = nextMonth === 0 ? year + 1 : year;

    const nextMonthFirstDay = new Date(nextYear, nextMonth, 1);

    return isoLongToShort(nextMonthFirstDay);
}

export const addDays = (dateString, days) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);

    return isoLongToShort(date);
}
