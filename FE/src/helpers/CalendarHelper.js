export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
export const WEEKDAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/* FORMAT DATE TO A STRING */

// ISO long format: 2023-04-24T013:00:00.000Z or 2023-04-24T013:00:00.000+02:00
// ISO short format: 2023-04-24
export const isoLongToShort = dateString => {
    dateString = new Date(dateString)
    return dateString.getFullYear() + "-" + (dateString.getMonth() + 1).toString().padStart(2, "0") + "-" + dateString.getDate().toString().padStart(2, "0");
}

// display time in HH:MM format
export const prettyTime = date => {
    date = new Date(date);

    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = date.getMinutes().toString().padStart(2, "0")

    return `${hours}:${minutes}`;
}

// used to display date in notifications and event popovers
// if from date and to date are the same, only a single date and time range is displayed
// if the dates are not at the same day, both dates and times are shown
export const formatDateTimeRange = (dateFrom, dateTo, isShort = false) => {
    const date1 = new Date(dateFrom.split("[")[0]);
    const date2 = new Date(dateTo.split("[")[0]);

    const dateString1 = date1.toISOString().substring(0, 10);
    const dateString2 = date2.toISOString().substring(0, 10);

    const timeString1 = date1.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const timeString2 = date2.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    if (dateString1 === dateString2) {
        return isShort
            ? `${timeString1} – ${timeString2}`
            : `${dateString1} ${timeString1} – ${timeString2}`;
    } else {
        return `${dateString1} ${timeString1} – ${dateString2} ${timeString2}`;
    }
}

/* MOVE INSIDE A SINGLE WEEK */

// returns the date of the most recent previous monday in relation to supplied date
// if supplied date is monday, the supplied date itself is returned
export const getMostRecentMonday = dateString => {
    const date = new Date(dateString);
    const daysSinceMonday = date.getDay() === 0 ? 6 : date.getDay() - 1;
    date.setDate(date.getDate() - daysSinceMonday);

    return isoLongToShort(date);
}

// returns the date of the first following sunday in relation to supplied date
// if supplied date is sunday, the supplied date itself is returned
export const getFirstFollowingSunday = dateString => {
    const date = new Date(dateString);
    const daysUntilSunday = date.getDay() === 0 ? 0 : 7 - date.getDay();
    date.setDate(date.getDate() + daysUntilSunday);

    return isoLongToShort(date);
}

/* MOVE INSIDE A SINGLE MONTH */

// 2023-03-15 -> 2023-03-01
export const getFirstDayOfMonth = dateString => {
    const firstDayOfMonth = new Date(dateString);
    firstDayOfMonth.setDate(1);

    return isoLongToShort(firstDayOfMonth);
}

// 2023-03-15 -> 2023-03-31
export const getLastDayOfMonth = dateString => {
    const date = new Date(dateString);
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    return isoLongToShort(lastDayOfMonth);
}

/* NAVIGATING BY A SINGLE WEEK */

// 2023-03-15 -> 2023-03-08
export const goBackWeek = dateString => {
    const date = new Date(dateString);

    date.setDate(new Date(date).getDate() - 7);
    return isoLongToShort(date);
}

// 2023-03-15 -> 2023-03-22
export const goForwardWeek = dateString => {
    const date = new Date(dateString);

    date.setDate(new Date(date).getDate() + 7);
    return isoLongToShort(date);
}

/* NAVIGATING BY A SINGLE MONTH */

// 2023-03-15 -> 2023-02-15
export const goBackMonth = dateString => {
    const date = new Date(dateString);

    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = prevMonth === 11 ? year - 1 : year;

    const prevMonthFirstDay = new Date(prevYear, prevMonth, day);

    return isoLongToShort(prevMonthFirstDay);
}

// 2023-03-15 -> 2023-04-15
export const goForwardMonth = dateString => {
    const date = new Date(dateString);

    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = nextMonth === 0 ? year + 1 : year;

    const nextMonthFirstDay = new Date(nextYear, nextMonth, day);

    return isoLongToShort(nextMonthFirstDay);
}

/* NAVIGATING BY A SINGLE YEAR */

// 2023-05-05 -> 2022-05-05
export const goBackYear = dateString => {
    const [year, month, day] = dateString.split("-")

    return isoLongToShort(new Date(parseInt(year, 10) - 1, parseInt(month, 10) - 1, parseInt(day, 10)));
};

// 2023-05-05 -> 2024-05-05
export const goForwardYear = dateString => {
    const [year, month, day] = dateString.split("-")

    return isoLongToShort(new Date(parseInt(year, 10) + 1, parseInt(month, 10) - 1, parseInt(day, 10)));
};

/* CREATE TITLES FOR EACH VIEW */

// title with information about the current week
// is displayed above the calendar in week view
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

// title with information about the current month
// is displayed above the calendar in month view
export const getMonthCalendarTitle = firstDayOfMonth => {
    const [year, month] = firstDayOfMonth.split("-");

    return `${MONTHS[month - 1]} ${year}`;
}

/* VARIOUS OTHER FUNCTIONS */

// get how many weeks are in month
// partial weeks at the start and end of the month count as a whole
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

// get the number of week in a year of a date
// indexing starts at 1
export const getWeekNumber = dateString => {
    const date = new Date(dateString);
    const yearStart = new Date(date.getFullYear(), 0, 1);
    const timeDiff = date.getTime() - yearStart.getTime();
    const weekNumber = Math.ceil(timeDiff / (1000 * 3600 * 24 * 7));

    return weekNumber;
}

// move date forward a supplied number of days
export const addDays = (dateString, days) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);

    return isoLongToShort(date);
}

// get difference between two dates in days
export const daysApart = (date1, date2) => {
    const timeDiff = Math.abs((new Date(date2)).getTime() - (new Date(date1)).getTime());
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return daysDiff;
}

// returns true if two date ranges overlap
export const doDateRangesOverlap = (start1, end1, start2, end2) => {
    let startDate1 = new Date(start1);
    let endDate1 = new Date(end1);
    let startDate2 = new Date(start2);
    let endDate2 = new Date(end2);

    if (startDate1 <= endDate2 && endDate1 >= startDate2) {
        return true;
    } else {
        return false;
    }
}
