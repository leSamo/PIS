import { Text, TextContent, Popover, Button, Stack, StackItem, AlertVariant } from '@patternfly/react-core';
import React, { Fragment, useEffect, useState } from 'react';
import {
    daysApart,
    getFirstDayOfMonth,
    getMostRecentMonday,
    getWeekCountInMonth,
    goBackMonth,
    goForwardMonth,
    goForwardYear,
    isoLongToShort,
    WEEKDAYS_SHORT,
    getMonthCalendarTitle,
    goBackYear,
    prettyTime,
    getFirstFollowingSunday
} from '../helpers/CalendarHelper';
import { COLORS } from './../helpers/Constants';
import { playFadeInAnimation } from './../helpers/Utils';
import { useAction, useFetch } from './../helpers/Hooks';

const Month = ({ userInfo, addToastAlert, doubleLeftButtonClickCount, leftButtonClickCount, rightButtonClickCount, doubleRightButtonClickCount, refreshCounter, navigateTodayCounter, editEvent }) => {
    const [firstDayOfMonth, setFirstDayOfMonth] = useState(getFirstDayOfMonth(new Date()));
    const [fetchedEvents, areEventsLoading, refreshEvents] = useFetch('/events', userInfo, { users: userInfo.upn, start_date: (new Date(getMostRecentMonday(firstDayOfMonth))).toISOString().replace(/\.[0-9]{3}/, ''), end_date: (new Date(getFirstFollowingSunday(goForwardMonth(firstDayOfMonth)))).toISOString().replace(/\.[0-9]{3}/, '') });

    console.log(fetchedEvents);

    const deleteEvent = useAction('DELETE', '/events', userInfo);

    const deleteEventAction = eventId => {
        if (confirm(`Are you sure you want to remove this event?`)) {
            const callback = () => {
                addToastAlert(AlertVariant.success, `Event was successfully deleted`);
                refreshEvents();
            }

            deleteEvent(eventId, {}, callback);
        }
    }

    const refreshDays = () => {
        refreshEvents();
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
        if (navigateTodayCounter > 0) {
            setFirstDayOfMonth(getFirstDayOfMonth(new Date()));
        }
    }, [navigateTodayCounter])

    useEffect(() => {
        refreshDays();

        playFadeInAnimation("#month-container");
    }, [firstDayOfMonth, refreshCounter])

    const eventsToElements = events => {
        events = events.map(event => ({ ...event, start: event.start.split("[")[0], end: event.end.split("[")[0] }))
        // handle single day events
        const elements = [...Array(getWeekCountInMonth(firstDayOfMonth) * 7).keys()].map(() => []);

        const singleDayEvents = events.filter(event => isoLongToShort(event.start) === isoLongToShort(event.end));

        singleDayEvents.forEach(event => {
            const index = daysApart(getMostRecentMonday(firstDayOfMonth), isoLongToShort(event.start));

            if (index >= 0 && index < getWeekCountInMonth(firstDayOfMonth) * 7)
                elements[index].push(event);
        });

        console.log("aaa", elements);

        // return array of 7 elements
        return elements;
    }

    return (
        <div id="month-container">
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
                                            {
                                                eventsToElements(fetchedEvents)[week * 7 + day].map(event => (
                                                    <Popover
                                                        zIndex={100}
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
                                                        footerContent={event.creator.username === userInfo.upn &&
                                                            <Stack hasGutter>
                                                                <StackItem>
                                                                    <Button className="edit-event" variant="primary" style={{ width: "100%" }} onClick={() => editEvent(event)}>
                                                                        Edit
                                                                    </Button>
                                                                </StackItem>
                                                                <StackItem>
                                                                    <Button className="delete-event" variant="danger" style={{ width: "100%" }} onClick={() => deleteEventAction(event.id)}>
                                                                        Delete
                                                                    </Button>
                                                                </StackItem>
                                                            </Stack>
                                                        }
                                                        minWidth="400px"
                                                    >
                                                        <div
                                                            className="event"
                                                            style={{
                                                                width: "calc(100% - 16px)",
                                                                backgroundColor: COLORS[event.color.toLowerCase()],
                                                                marginLeft: 8,
                                                                marginRight: 8,
                                                                cursor: "pointer",
                                                                border: "1px solid black",
                                                                borderRadius: 4,
                                                                textAlign: "left",
                                                                paddingLeft: 8,
                                                                paddingRight: 8
                                                            }}
                                                        >
                                                            <b>{event.name}</b>
                                                        </div>
                                                    </Popover>
                                                ))
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
