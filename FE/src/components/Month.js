import { Text, TextContent, Popover, Button } from '@patternfly/react-core';
import React, { Fragment, useEffect, useState } from 'react';
import { getFirstDayOfMonth, getMostRecentMonday, getWeekCountInMonth, goBackMonth, goForwardMonth, goForwardYear, isoLongToShort, WEEKDAYS_SHORT } from '../helpers/CalendarHelper';
import { getMonthCalendarTitle, goBackYear } from './../helpers/CalendarHelper';
import { COLORS } from './../helpers/Constants';
import { playFadeInAnimation } from './../helpers/Utils';

const Month = ({ userInfo, doubleLeftButtonClickCount, leftButtonClickCount, rightButtonClickCount, doubleRightButtonClickCount }) => {
    const [firstDayOfMonth, setFirstDayOfMonth] = useState(getFirstDayOfMonth(new Date()));

    const refreshDays = () => {

    }

    useEffect(() => {
        if (doubleLeftButtonClickCount > 0) {
            setFirstDayOfMonth(goBackYear(firstDayOfMonth));
        }
    }, [doubleLeftButtonClickCount])

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
        if (doubleRightButtonClickCount > 0) {
            setFirstDayOfMonth(goForwardYear(firstDayOfMonth));
        }
    }, [doubleRightButtonClickCount])

    useEffect(() => {
        refreshDays();

        playFadeInAnimation("#month-container");
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
                <table style={{ width: "100%", height: "100%", tableLayout: "fixed" }} border="1">
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
                            <tr key={week} style={{ height: `calc(725px / ${getWeekCountInMonth(firstDayOfMonth)})` }}>
                                {[...Array(7).keys()].map(day => {
                                    const currentDate = new Date(getMostRecentMonday(firstDayOfMonth));
                                    currentDate.setDate(currentDate.getDate() + (week * 7) + day);
                                    const dateAsString = isoLongToShort(currentDate);
                                    const dayNumber = dateAsString.split("-")[2];

                                    return (
                                        <td key={day} style={{ textAlign: "center", verticalAlign: "top" }}>
                                            <b>{dayNumber}</b>
                                            {week * 7 + day === 25 &&
                                                <Popover
                                                    headerContent={<div>Event name</div>}
                                                    bodyContent={
                                                        <Fragment>
                                                            <div>🕒 06:00 – 08:00</div>
                                                            <div>📝 Event description</div>
                                                            <div>✏️ Author: Samuel Olekšák (soleksak@ahoj.cau)</div>
                                                            <div>🙋‍♀️ Attendees:</div>
                                                            <div style={{ marginLeft: 32 }}>- Michal Findra (mfindra@cau.ahoj)</div>
                                                            <div style={{ marginLeft: 32 }}>- Findra Michal (mfindra@ahoj.ahoj)</div>
                                                        </Fragment>
                                                    }
                                                    footerContent={
                                                        <Button variant="primary" style={{ width: "100%" }}>
                                                            Edit
                                                        </Button>
                                                    }
                                                    minWidth="400px"
                                                >
                                                    <div style={{
                                                        width: "calc(100% - 16px)",
                                                        backgroundColor: COLORS.red,
                                                        marginLeft: 8,
                                                        marginRight: 8,
                                                        cursor: "pointer",
                                                        border: "1px solid black",
                                                        borderRadius: 4,
                                                        textAlign: "left",
                                                        paddingLeft: 8,
                                                        paddingRight: 8
                                                    }}>
                                                        <b>Event name</b>
                                                    </div>
                                                </Popover>
                                            }
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
};

export default Month;
