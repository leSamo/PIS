import { Text, TextContent, AlertVariant } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
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
    getFirstFollowingSunday
} from '../helpers/CalendarHelper';
import { COLORS } from './../helpers/Constants';
import { playFadeInAnimation } from './../helpers/Utils';
import { useAction, useFetch } from './../helpers/Hooks';
import EventPopover from './EventPopover';
import { addDays } from './../helpers/CalendarHelper';

// component which renders the calendar when month view is selected
const Month = ({ userInfo, addToastAlert, doubleLeftButtonClickCount, leftButtonClickCount, rightButtonClickCount, doubleRightButtonClickCount, refreshCounter, navigateTodayCounter, editEvent, selectedUsers }) => {
    const [firstDayOfMonth, setFirstDayOfMonth] = useState(getFirstDayOfMonth(new Date()));
    const [fetchedEvents, , refreshEvents] = useFetch('/events', userInfo, {
        users: selectedUsers,
        start_date: (new Date(getMostRecentMonday(firstDayOfMonth))).toISOString().replace(/\.[0-9]{3}/, ''),
        end_date: (new Date(getFirstFollowingSunday(goForwardMonth(firstDayOfMonth)))).toISOString().replace(/\.[0-9]{3}/, '')
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
        refreshEvents();
    }

    // handle button click in the navigation above the calendar
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
    }, [firstDayOfMonth, refreshCounter, selectedUsers])

    // convert each event into divs, which will be displayed in the calendar
    const eventsToElements = events => {
        events = events.map(event => ({ ...event, start: event.start.split("[")[0], end: event.end.split("[")[0] }))
        
        // array where one element represents one day
        let elements = [...Array(getWeekCountInMonth(firstDayOfMonth) * 7).keys()].map(() => []);
        
        events.forEach(event => {
            // get the index of start and end dates of an event
            // if the event is single-day it only occupies one slot
            const startIndex = daysApart(getMostRecentMonday(firstDayOfMonth), isoLongToShort(event.start));
            const endIndex = daysApart(getMostRecentMonday(firstDayOfMonth), isoLongToShort(event.end));
            
            // this has to be array to account for multi-day events
            const indices = [];
            
            for (let i = startIndex; i <= endIndex; i++) {
                indices.push(i);
            }
            
            indices.forEach(index => {
                if (index >= 0 && index < getWeekCountInMonth(firstDayOfMonth) * 7) {
                    elements[index].push(event);
                }
            });
        });

        // sort events on each day by start time
        elements = elements.map(element =>
            element.sort((a, b) => new Date(a.start) - new Date(b.start))
        );

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
                                        <td key={day} style={{
                                            textAlign: "center",
                                            verticalAlign: "top",
                                            // color today's date column light blue
                                            backgroundColor: addDays(firstDayOfMonth, week * 7 + day) === getMostRecentMonday(new Date()) ? "#b0fff7" : "white"
                                        }}>
                                            <b>{dayNumber}</b>
                                            {
                                                eventsToElements(fetchedEvents)[week * 7 + day].map(event => (
                                                    <EventPopover key={event.id} userInfo={userInfo} event={event} editEvent={editEvent} deleteEventAction={deleteEventAction}>
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
                                                                paddingRight: 8,
                                                                overflow: "hidden"
                                                            }}
                                                        >
                                                            <b>{event.name}</b>
                                                        </div>
                                                    </EventPopover>
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
