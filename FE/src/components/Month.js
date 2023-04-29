import { Split, SplitItem, Stack, StackItem } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { getFirstDayOfMonth, getFirstFollowingSunday, getLastDayOfMonth, getMostRecentMonday, getWeekCountInMonth, goBackMonth, goForwardMonth, isoLongToShort } from '../helpers/CalendarHelper';

const Month = ({ leftButtonClickCount, rightButtonClickCount }) => {
    const [firstDayOfMonth, setFirstDayOfMonth] = useState(getFirstDayOfMonth(new Date()));

    const refreshDays = () => {
        console.log(getWeekCountInMonth(firstDayOfMonth), firstDayOfMonth, getLastDayOfMonth(firstDayOfMonth), getMostRecentMonday(firstDayOfMonth), getFirstFollowingSunday(getLastDayOfMonth(firstDayOfMonth)))
    }

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

        /*
        document.querySelector("#week-split").classList.remove('fade-in');
        document.querySelector("#week-split").offsetWidth;
        document.querySelector("#week-split").classList.add('fade-in');
        */
    }, [firstDayOfMonth])

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
};

export default Month;
