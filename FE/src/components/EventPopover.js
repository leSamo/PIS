import { Popover, Stack, StackItem, Button } from '@patternfly/react-core';
import React, { Fragment } from 'react';
import { formatDateTimeRange } from './../helpers/CalendarHelper';

// shown after clicking an event in month or week view
// containing information about the event
// if user has permission to edit the event, edit and delete event buttons are shown
// upon clicking the edit button, edit event modal is shown
const EventPopover = ({ children, userInfo, event, editEvent, deleteEventAction }) => (
    <Popover
        zIndex={100}
        headerContent={<div>{event.name}</div>}
        bodyContent={
            <Fragment>
                <div>🕒 {formatDateTimeRange(event.start, event.end, true)}</div>
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
                    <Button variant="primary" style={{ width: "100%" }} onClick={() => editEvent(event)} className="edit-event">
                        Edit
                    </Button>
                </StackItem>
                <StackItem>
                    <Button variant="danger" style={{ width: "100%" }} onClick={() => deleteEventAction(event.id)} className="delete-event">
                        Delete
                    </Button>
                </StackItem>
            </Stack>
        }
        minWidth="400px"
    >
        {children}
    </Popover>
);

export default EventPopover;
