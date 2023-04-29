export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// ISO long format: 2023-04-24T013:00:00.000Z or 2023-04-24T013:00:00.000+02:00
// ISO short format: 2023-04-24 (don't forget timezone correction)
export const isoLongToShort = date => {
    date = new Date(date)
    return date.getFullYear() + "-" + (date.getMonth() + 1).toString().padStart(2, "0") + "-" + date.getDate().toString().padStart(2, "0");
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

export const goBackWeek = input => {
    const date = (new Date(input));

    date.setDate(new Date(date).getDate() - 7);
    return isoLongToShort(date);
}

export const goForwardWeek = input => {
    const date = (new Date(input));

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

export const getWeekCalendarTitle = (currentMonday) => {
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

export const getFirstDayOfMonth = date => {
    const firstDayOfMonth = new Date(date);
    firstDayOfMonth.setDate(1);

    return isoLongToShort(firstDayOfMonth);
}

export const getLastDayOfMonth = dateString => {
    const date = new Date(dateString);
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    return isoLongToShort(lastDayOfMonth);
}

export const getWeekCountInMonth = dateString => {
    const [year, month] = dateString.split("-");
    // subtract 1 to shift to Monday-based week
    const firstDay = new Date(year, month, 1).getDay() - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInFirstWeek = 7 - firstDay;
    const daysInRemainingWeeks = daysInMonth - daysInFirstWeek;
    const remainingWeeks = Math.ceil(daysInRemainingWeeks / 7);
    const totalWeeks = 1 + remainingWeeks;

    return totalWeeks;
};

export const goBackMonth = dateString => {
    const currentDate = new Date(dateString);
    const previousMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());
    const previousMonthDateString = previousMonthDate.toISOString().slice(0, 10);

    return previousMonthDateString;
}

export const goForwardMonth = dateString => {
    const currentDate = new Date(dateString);
    const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
    const nextMonthDateString = nextMonthDate.toISOString().slice(0,10);

    return nextMonthDateString;
  }
