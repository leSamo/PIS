import { Popover, Stack, StackItem, Button } from '@patternfly/react-core';
import React, { Fragment } from 'react';
import { prettyTime } from './../helpers/CalendarHelper';

const EventPopover = ({ children, userInfo, event, editEvent, deleteEventAction }) => {
    return (
        <Popover
            zIndex={100}
            headerContent={<div>{event.name}</div>}
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
    )
}

export default EventPopover;
