import React, { Fragment, useEffect, useState } from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import { Split, SplitItem } from '@patternfly/react-core';

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const Week = () => {
    const [splitWidth, setSplitWidth] = useState(0);

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

    useEffect(() => {
        setSplitWidth(document.querySelector("#week-split").clientWidth);

        function handleResize() {
            setSplitWidth(document.querySelector("#week-split").clientWidth);
        }
    
        window.addEventListener("resize", handleResize);
    
        return () => window.removeEventListener("resize", handleResize);
      }, []);

    return (
        <Split id="week-split" hasGutter style={{ width: "100%", display: "flex", marginTop: "64px" }}>
            <SplitItem style={{ flex: 1, height: 1200 }}>
                <div style={{ textAlign: "center", height: 48 }}>Week 19</div>
                {
                    [...Array(24).keys()].map(hour =>
                        <Fragment key={hour}>
                            <div style={{ position: "relative", height: 0 }}>
                                <div style={{ width: splitWidth, position: "absolute", height: 0, border: "2px solid gray" }} />
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
                    <div style={{ textAlign: "center", height: 24 }}>{weekday}</div>
                    <div style={{ textAlign: "center", height: 24 }}>{weekDays[index].getDate()}</div>
                    <div style={{ backgroundColor: "red", height: 48 * 2, width: "100%", padding: 2 }}>
                        Event name
                    </div>
                </SplitItem>
            ))}
        </Split>
    );
};

export default Week;
