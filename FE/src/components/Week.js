import React, { Fragment, useEffect, useState } from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import { Popover, Split, SplitItem, Button } from '@patternfly/react-core';
import { getMostRecentMonday, getWeekCalendarTitle, getWeekNumber, goBackMonth, goBackWeek, goForwardMonth, goForwardWeek, WEEKDAYS, isoLongToShort, daysApart } from '../helpers/CalendarHelper';
import { COLORS } from './../helpers/Constants';
import { playFadeInAnimation } from './../helpers/Utils';
import { useFetch } from './../helpers/Hooks';
import { prettyTime } from './../helpers/CalendarHelper';

const Week = ({ userInfo, doubleLeftButtonClickCount, leftButtonClickCount, rightButtonClickCount, doubleRightButtonClickCount }) => {
    const [splitWidth, setSplitWidth] = useState(0);
    const [currentMonday, setCurrentMonday] = useState(getMostRecentMonday(new Date()));
    const [weekDays, setWeekDays] = useState([]);
    const [fetchedEvents, areEventsLoading, refreshEvents] = useFetch('/events', userInfo, { users: "samoo", start_date: (new Date(currentMonday)).toISOString().replace(/\.[0-9]{3}/, ''), end_date: (new Date(goForwardWeek(currentMonday))).toISOString().replace(/\.[0-9]{3}/, '') });

    console.log(fetchedEvents);

    const refreshDays = () => {
        const weekDays = [];

        for (let i = 0; i < 7; i++) {
            const day = new Date(currentMonday);
            day.setDate(day.getDate() + i);
            weekDays.push(day);
        }

        setWeekDays(weekDays);
        refreshEvents();
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
        if (doubleLeftButtonClickCount > 0) {
            setCurrentMonday(getMostRecentMonday(goBackMonth(currentMonday)));
        }
    }, [doubleLeftButtonClickCount])

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
        if (doubleRightButtonClickCount > 0) {
            setCurrentMonday(getMostRecentMonday(goForwardMonth(currentMonday)));
        }
    }, [doubleRightButtonClickCount])

    useEffect(() => {
        refreshDays();

        playFadeInAnimation("#week-split");
    }, [currentMonday])

    const eventsToElements = events => {
        events = events.map(event => ({ ...event, start: event.start.split("[")[0], end: event.end.split("[")[0] }))
        // handle single day events
        const elements = [[], [], [], [], [], [], []];

        const singleDayEvents = events.filter(event => isoLongToShort(event.start) === isoLongToShort(event.end));

        singleDayEvents.forEach(event => {
            const index = daysApart(currentMonday, isoLongToShort(event.start));
            event.marginTop = ((new Date(event.start)).getHours() + (new Date(event.start)).getMinutes() / 60.0) * 48
            event.height = ((new Date(event.end)).getHours() + (new Date(event.end)).getMinutes() / 60.0) * 48 - event.marginTop

            if (index >= 0 && index <= 6) {
                elements[index].push(event);
            }
        });

        // return array of 7 elements
        return elements;
    }

    return (
        <Split id="week-split" style={{ width: "100%", display: "flex", marginTop: "32px" }}>
            <SplitItem style={{ flex: 1, height: 1200 }}>
                <b>
                    <div style={{ textAlign: "center", height: 24 }}>Week {getWeekNumber(currentMonday)}</div>
                    <div style={{ textAlign: "center", height: 24 }}>{getWeekCalendarTitle(currentMonday)}</div>
                </b>
                {
                    [...Array(24).keys()].map((hour, index) =>
                        <Fragment key={hour}>
                            <div style={{ position: "relative", height: 0 }}>
                                <div style={{
                                    width: splitWidth,
                                    position: "absolute",
                                    height: 0,
                                    borderBottom: index === 0 ? "1px solid black" : "1px solid rgba(150, 150, 150, 0.3)",
                                    pointerEvents: "none"
                                }} />
                            </div>
                            <div style={{ height: 48, color: "gray" }}>
                                {String(hour).padStart(2, '0')}:00
                            </div>
                        </Fragment>
                    )
                }

            </SplitItem>
            {WEEKDAYS.map((weekday, index) => (
                <SplitItem key={weekday} style={{
                    flex: 1,
                    height: 1200,
                    border: "1px solid black",
                    borderLeft: index === 0 ? "1px solid black" : 0
                }}>
                    <b>
                        <div style={{ textAlign: "center", height: 24 }}>{weekday}</div>
                        <div style={{ textAlign: "center", height: 24 }}>{weekDays?.[index]?.getDate()}</div>
                    </b>
                    {/* get day (index), convert start time to margin top, convert end time to height */
                        eventsToElements(fetchedEvents)[index].map(event => (
                            <Popover
                                key={event.id}
                                headerContent={<div>{event.description}</div>}
                                bodyContent={
                                    <Fragment>
                                        <div>🕒 {prettyTime(event.start)} – {prettyTime(event.end)}</div>
                                        <div>📝 {event.description}</div>
                                        <div>✏️ Author: {event.creator.name} ({event.creator.email})</div>
                                        <div>🙋‍♀️ Attendees:</div>
                                        {
                                            event.attendees.map(attendee => (
                                                <div key={attendee.username} style={{ marginLeft: 32 }}>- {attendee.name} ({attendee.email})</div>
                                            ))
                                        }
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
                                    backgroundColor: COLORS[event.color.toLowerCase()],
                                    height: event.height,
                                    width: "100%",
                                    padding: 2,
                                    marginTop: event.marginTop,
                                    cursor: "pointer",
                                    border: "1px solid black",
                                    borderRadius: 4
                                }}>
                                    <b>Event name</b>
                                </div>
                            </Popover>
                        ))
                    }
                </SplitItem>
            ))}
        </Split>
    );
};

export default Week;
