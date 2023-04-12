import React from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import { Split, SplitItem } from '@patternfly/react-core';

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const Week = () => {
    const today = new Date();

    // Get the first day of the week (Sunday)
    const firstDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());

    // Create an array to store the dates
    const weekDays = [];

    // Loop through the week's days and add them to the array
    for (let i = 0; i < 7; i++) {
        const day = new Date(firstDay);
        day.setDate(firstDay.getDate() + i);
        weekDays.push(day);
    }


    return (
        <Split hasGutter style={{ width: "100%", display: "flex", height: "100%", marginTop: "16px" }}>
            <SplitItem style={{ flex: 1, height: "100%", overflow: "auto" }}>
                Left panel
            </SplitItem>
            {WEEKDAYS.map((weekday, index) => (
                <SplitItem key={weekday} style={{ flex: 1, height: "100%", overflow: "auto", border: "1px solid black" }}>
                    <div style={{ textAlign: "center" }}>{weekday}</div>
                    <div style={{ textAlign: "center" }}>{weekDays[index].getDate()}</div>
                </SplitItem>
            ))

            }
        </Split>
    );
};

export default Week;
