import { Stack, StackItem, Text, TextContent } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { getFirstDayOfMonth, getFirstFollowingSunday, getLastDayOfMonth, getMostRecentMonday, getWeekCountInMonth, goBackMonth, goForwardMonth, isoLongToShort, WEEKDAYS_SHORT } from '../helpers/CalendarHelper';
import { getMonthCalendarTitle } from './../helpers/CalendarHelper';

const Month = ({ leftButtonClickCount, rightButtonClickCount }) => {
    const [firstDayOfMonth, setFirstDayOfMonth] = useState(getFirstDayOfMonth(new Date()));

    const refreshDays = () => {
        console.log(getWeekCountInMonth(firstDayOfMonth), firstDayOfMonth, getLastDayOfMonth(firstDayOfMonth), getMostRecentMonday(firstDayOfMonth), getFirstFollowingSunday(getLastDayOfMonth(firstDayOfMonth)))
    }

    console.log("aaa", firstDayOfMonth);

    useEffect(() => {
        if (leftButtonClickCount > 0) {
            setFirstDayOfMonth(goBackMonth(firstDayOfMonth));
        }
    }, [leftButtonClickCount])

    useEffect(() => {
        if (rightButtonClickCount > 0) {
            setFirstDayOfMonth(goForwardMonth(firstDayOfMonth));
        }
    }, [rightButtonClickCount])

    useEffect(() => {
        refreshDays();

        document.querySelector("#month-container").classList.remove('fade-in');
        document.querySelector("#month-container").offsetWidth;
        document.querySelector("#month-container").classList.add('fade-in');
    }, [firstDayOfMonth])

    return (
        <div id="month-container" style={{ height: "calc(100vh - 170px)" }}>
            <div style={{ padding: 16 }}>
                <TextContent>
                    <Text component="h2" style={{ textAlign: "center" }}>
                        {getMonthCalendarTitle(firstDayOfMonth)}
                    </Text>
                </TextContent>
            </div>
            <div style={{ height: "calc(100% - 100px)" }}>
                <table style={{ width: "100%", height: "100%", tableLayout: "fixed" }}>
                    <thead>
                        <tr style={{ height: 48 }}>
                            {WEEKDAYS_SHORT.map(weekday =>
                                <td key={weekday} style={{ textAlign: "center" }}>
                                    <b>{weekday}</b>
                                </td>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(getWeekCountInMonth(firstDayOfMonth)).keys()].map(week =>
                            <tr key={week}>
                                {[...Array(7).keys()].map(day => {
                                    const currentDate = new Date(getMostRecentMonday(firstDayOfMonth));
                                    currentDate.setDate(currentDate.getDate() + (week * 7) + day);
                                    const dateAsString = isoLongToShort(currentDate);
                                    const [yearNumber, monthNumber, dayNumber] = dateAsString.split("-");

                                    return (
                                        <td key={day} style={{ textAlign: "center", verticalAlign: "top" }}>
                                            <b>{dayNumber}</b>
                                        </td>
                                    )
                                })}
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
    /*
    return (
        <Stack style={{ height: "100%" }}>
            {[...Array(getWeekCountInMonth(firstDayOfMonth)).keys()].map(week =>
                <StackItem key={week}>
                    <Split>
                        {[...Array(7).keys()].map(day => {
                            const currentDate = new Date(getMostRecentMonday(firstDayOfMonth));
                            currentDate.setDate(currentDate.getDate() + (week * 7) + day);
                            const dateAsString = isoLongToShort(currentDate);

                            return (
                                <SplitItem key={day} style={{ width: "100%" }}>
                                    {dateAsString}
                                </SplitItem>
                            )
                        })}
                    </Split>
                </StackItem>
            )}
        </Stack>
    )
    */
};

export default Month;
