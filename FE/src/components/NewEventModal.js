import React, { useState } from 'react';
import { Form, FormGroup, TextInput, TextArea, Modal, ModalVariant, Button, TimePicker, DatePicker, Split, SplitItem } from '@patternfly/react-core';

const NewEventModal = ({ isOpen, setOpen, createCallback }) => {
    const [eventTitle, setEventTitle] = useState('');
    const [eventDescription, setEventDescription] = useState('');

    const onTimeChange = (_event, time, hour, minute, seconds, isValid) => {
        console.log('time', time);
        console.log('hour', hour);
        console.log('minute', minute);
        console.log('seconds', seconds);
        console.log('isValid', isValid);
    };

    return (
        <Modal
            variant={ModalVariant.small}
            title="Create a new event"
            isOpen={isOpen}
            onClose={() => setOpen(false)}
            actions={[
                <Button key="confirm" variant="primary" onClick={() => { createCallback({ eventTitle, eventDescription }); setOpen(false); }}>Create</Button>,
                <Button key="cancel" variant="link" onClick={() => setOpen(false)}>Cancel</Button>
            ]}>
            <Form>
                <FormGroup label="Event title" isRequired>
                    <TextInput
                        isRequired
                        id="event-name"
                        name="event-name"
                        value={eventTitle}
                        onChange={value => setEventTitle(value)}
                    />
                </FormGroup>
                <FormGroup label="Event description" isRequired>
                    <TextArea
                        isRequired
                        id="event-description"
                        name="event-description"
                        resizeOrientation='vertical'
                        value={eventDescription}
                        onChange={value => setEventDescription(value)}
                    />
                </FormGroup>
                <FormGroup label="From" isRequired>
                    <Split hasGutter>
                        <SplitItem>
                            <DatePicker
                                onBlur={(_event, str, date) => console.log('onBlur', str, date)}
                                onChange={(_event, str, date) => console.log('onChange', str, date)}
                                appendTo={document.querySelector("body")}
                            />
                        </SplitItem>
                        <SplitItem>
                            <TimePicker time="3:35 AM" onChange={onTimeChange} />
                        </SplitItem>
                    </Split>
                </FormGroup>
                <FormGroup label="To" isRequired>
                    <Split hasGutter>
                        <SplitItem>
                            <DatePicker
                                onBlur={(_event, str, date) => console.log('onBlur', str, date)}
                                onChange={(_event, str, date) => console.log('onChange', str, date)}
                                appendTo={document.querySelector("body")}
                            />
                        </SplitItem>
                        <SplitItem>
                            <TimePicker time="3:35 AM" onChange={onTimeChange} />
                        </SplitItem>
                    </Split>
                </FormGroup>
            </Form>
        </Modal>
    );
};

export default NewEventModal;
