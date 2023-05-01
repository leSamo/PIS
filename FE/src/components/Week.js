import React, { Fragment, useEffect, useState } from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import { Split, SplitItem, AlertVariant } from '@patternfly/react-core';
import { getMostRecentMonday, getWeekCalendarTitle, getWeekNumber, goBackMonth, goBackWeek, goForwardMonth, goForwardWeek, WEEKDAYS, isoLongToShort, daysApart } from '../helpers/CalendarHelper';
import { COLORS } from './../helpers/Constants';
import { playFadeInAnimation } from './../helpers/Utils';
import { useAction, useFetch } from './../helpers/Hooks';
import { doDateRangesOverlap, addDays } from './../helpers/CalendarHelper';
import EventPopover from './EventPopover';

// component which implements calendar when week view is selected
const Week = ({ userInfo, addToastAlert, doubleLeftButtonClickCount, leftButtonClickCount, rightButtonClickCount, doubleRightButtonClickCount, refreshCounter, navigateTodayCounter, editEvent, selectedUsers }) => {
    const [splitWidth, setSplitWidth] = useState(0);
    const [currentMonday, setCurrentMonday] = useState(getMostRecentMonday(new Date()));
    const [weekDays, setWeekDays] = useState([]);
    const [fetchedEvents, , refreshEvents] = useFetch('/events', userInfo, {
        users: selectedUsers,
        start_date: (new Date(currentMonday)).toISOString().replace(/\.[0-9]{3}/, ''),
        end_date: (new Date(goForwardWeek(currentMonday))).toISOString().replace(/\.[0-9]{3}/, '')
    });

    console.log(fetchedEvents);

    const deleteEvent = useAction('DELETE', '/events', userInfo);

    const deleteEventAction = eventId => {
        if (confirm(`Are you sure you want to remove this event?`)) {
            const successCallback = () => {
                addToastAlert(AlertVariant.success, `Event was successfully deleted`);
                refreshEvents();
            }

            const errorCallback = reason => {
                addToastAlert(AlertVariant.danger, `Event deletion failed`, reason);
            }

            deleteEvent(eventId, {}, successCallback, errorCallback);
        }
    }

    const refreshDays = () => {
        // calculate a day number for each day in a week
        const weekDays = [];

        for (let i = 0; i < 7; i++) {
            const day = new Date(currentMonday);
            day.setDate(day.getDate() + i);
            weekDays.push(day);
        }

        setWeekDays(weekDays);
        refreshEvents();
    }

    // make the week view responsive
    useEffect(() => {
        setSplitWidth(document.querySelector("#week-split").clientWidth);

        function handleResize() {
            setSplitWidth(document.querySelector("#week-split").clientWidth);
        }

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // handle button click in the navigation above the calendar
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
        if (navigateTodayCounter > 0) {
            setCurrentMonday(getMostRecentMonday(new Date()));
        }
    }, [navigateTodayCounter])

    useEffect(() => {
        refreshDays();

        playFadeInAnimation("#week-split");
    }, [currentMonday, refreshCounter, selectedUsers])

    // convert each event into divs, which will be displayed in the calendar
    const eventsToElements = events => {
        events = events.map(event => ({ ...event, start: event.start.split("[")[0], end: event.end.split("[")[0] }))

        // handle single day events
        let elements = [[], [], [], [], [], [], []];

        // calculate layout parameters for the events
        events.forEach(event => {
            const startIndex = daysApart(getMostRecentMonday(currentMonday), isoLongToShort(event.start));
            const endIndex = daysApart(getMostRecentMonday(currentMonday), isoLongToShort(event.end));

            // this has to be array to account for multi-day events
            const indices = [];

            for (let i = startIndex; i <= endIndex; i++) {
                indices.push(i);
            }
            
            // handle multi-day events
            indices.forEach(index => {
                let eventCopy = { ...event };

                if (index >= 0 && index < 7) {
                    // single-day event
                    if (startIndex === endIndex) {
                        eventCopy.marginTop = ((new Date(event.start)).getHours() + (new Date(event.start)).getMinutes() / 60.0) * 48
                        eventCopy.height = ((new Date(event.end)).getHours() + (new Date(event.end)).getMinutes() / 60.0) * 48 - eventCopy.marginTop
                    }
                    // first day of multi-day event
                    else if (index === startIndex) {
                        eventCopy.marginTop = ((new Date(event.start)).getHours() + (new Date(event.start)).getMinutes() / 60.0) * 48
                        eventCopy.height = 24 * 48 - eventCopy.marginTop
                    }
                    // last day of multi-day event
                    else if (index === endIndex) {
                        eventCopy.marginTop = 0
                        eventCopy.height = ((new Date(event.end)).getHours() + (new Date(event.end)).getMinutes() / 60.0) * 48
                    }
                    // day during multi-day event
                    else {
                        eventCopy.marginTop = 0;
                        eventCopy.height = 48 * 24;
                    }

                    if (eventCopy.height < 16) {
                        eventCopy.height = 16;
                    }

                    elements[index].push(eventCopy);
                }
            });
        });

        // sort events, so the shorter will be rendered on top of longer
        elements = elements.map(element => 
            element.sort((a, b) => b.height - a.height)    
        );

        // calculate offsets so overlapping events can be displayed side-by-side
        let elementsOffset = elements.map(notOffset => {
            const alreadyOffset = [];

            notOffset.forEach(element => {
                let maxOffset = 0;

                alreadyOffset.forEach(otherElement => {
                    if (doDateRangesOverlap(element.start, element.end, otherElement.start, otherElement.end)) {
                        if (otherElement.offset >= maxOffset) {
                            maxOffset = otherElement.offset + splitWidth / 60;
                        }
                    }
                })

                alreadyOffset.push({...element, offset: maxOffset})
            })

            return alreadyOffset;
        });


        // return array of 7 elements
        return elementsOffset;
    }

    return (
        <Split id="week-split" style={{ width: "100%", display: "flex", marginTop: "32px" }}>
            <SplitItem style={{ flex: 1, height: 1200}}>
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
                <SplitItem key={weekday} className="weekday-split" style={{
                    flex: 1,
                    height: 1200,
                    border: "1px solid black",
                    borderLeft: index === 0 ? "1px solid black" : 0,
                    // color today's date column light blue
                    backgroundColor: addDays(currentMonday, index) === getMostRecentMonday(new Date()) ? "#b0fff7" : "white"
                }}>
                    <b>
                        <div style={{ textAlign: "center", height: 24 }}>{weekday}</div>
                        <div style={{ textAlign: "center", height: 24 }}>{weekDays?.[index]?.getDate()}</div>
                    </b>
                    {eventsToElements(fetchedEvents)[index].map(event => (
                        <div key={event.id} style={{ position: "relative" }}>
                            <EventPopover userInfo={userInfo} event={event} editEvent={editEvent} deleteEventAction={deleteEventAction}>
                                <div
                                    className="event"
                                    style={{
                                        backgroundColor: COLORS[event.color.toLowerCase()],
                                        height: event.height,
                                        width: document.querySelectorAll(".weekday-split")[index].offsetWidth - 2 - event.offset,
                                        padding: 2,
                                        marginTop: event.marginTop,
                                        cursor: "pointer",
                                        border: "1px solid black",
                                        borderRadius: 4,
                                        position: "absolute",
                                        marginLeft: event.offset,
                                        overflow: "hidden",
                                        ...event.height < 24 ? {
                                            fontSize: 10,
                                            padding: 0,
                                            paddingLeft: 2
                                        } : {}
                                    }}
                                >
                                    <b>{event.name}</b>
                                </div>
                            </EventPopover>
                        </div>
                    ))
                    }
                </SplitItem>
            ))}
        </Split>
    );
};

export default Week;
