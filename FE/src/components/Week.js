import React, { Fragment, useEffect, useState } from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import { Popover, Split, SplitItem } from '@patternfly/react-core';
import { getMostRecentMonday, getWeekCalendarTitle, getWeekNumber, goBackWeek, goForwardWeek, WEEKDAYS } from '../helpers/CalendarHelper';

const Week = ({ leftButtonClickCount, rightButtonClickCount }) => {
    const [splitWidth, setSplitWidth] = useState(0);
    const [currentMonday, setCurrentMonday] = useState(getMostRecentMonday(new Date()));
    const [weekDays, setWeekDays] = useState([]);

    const refreshDays = () => {
        const weekDays = [];

        for (let i = 0; i < 7; i++) {
            const day = new Date(currentMonday);
            day.setDate(day.getDate() + i);
            weekDays.push(day);
        }

        setWeekDays(weekDays)
    }

    useEffect(() => {
        setSplitWidth(document.querySelector("#week-split").clientWidth);

        function handleResize() {
            setSplitWidth(document.querySelector("#week-split").clientWidth);
        }

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (leftButtonClickCount > 0) {
            setCurrentMonday(goBackWeek(currentMonday));
        }
    }, [leftButtonClickCount])

    useEffect(() => {
        if (rightButtonClickCount > 0) {
            setCurrentMonday(goForwardWeek(currentMonday));
        }
    }, [rightButtonClickCount])

    useEffect(() => {
        refreshDays();

        document.querySelector("#week-split").classList.remove('fade-in');
        document.querySelector("#week-split").offsetWidth;
        document.querySelector("#week-split").classList.add('fade-in');
    }, [currentMonday])

    return (
        <Split id="week-split" hasGutter style={{ width: "100%", display: "flex", marginTop: "32px" }}>
            <SplitItem style={{ flex: 1, height: 1200 }}>
                <b>
                    <div style={{ textAlign: "center", height: 24 }}>Week {getWeekNumber(currentMonday)}</div>
                    <div style={{ textAlign: "center", height: 24 }}>{getWeekCalendarTitle(currentMonday)}</div>
                </b>
                {
                    [...Array(24).keys()].map(hour =>
                        <Fragment key={hour}>
                            <div style={{ position: "relative", height: 0 }}>
                                <div style={{ width: splitWidth, position: "absolute", height: 0, border: "2px solid rgba(150, 150, 150, 0.3)" }} />
                            </div>
                            <div style={{ height: 48, color: "gray" }}>
                                {String(hour).padStart(2, '0')}:00
                            </div>
                            {/*<div style={{ height: 48, position: "absolute", width: "100%", padding: 0, margin: 0, border: "2px solid gray" }} />*/}
                        </Fragment>
                    )
                }

            </SplitItem>
            {WEEKDAYS.map((weekday, index) => (
                <SplitItem key={weekday} style={{ flex: 1, height: 1200, border: "1px solid black" }}>
                    <b>
                        <div style={{ textAlign: "center", height: 24 }}>{weekday}</div>
                        <div style={{ textAlign: "center", height: 24 }}>{weekDays?.[index]?.getDate()}</div>
                    </b>
                    {index === 3 &&
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
                            minWidth="400px"
                        >
                            <div style={{ backgroundColor: "red", height: 48 * 2, width: "100%", padding: 2, marginTop: 48 * 6, cursor: "pointer", border: "1px solid black", borderRadius: 4 }}>
                                <b>Event name</b>
                            </div>
                        </Popover>
                    }
                </SplitItem>
            ))}
        </Split>
    );
};

export default Week;
