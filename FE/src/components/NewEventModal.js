import React, { useEffect, useState } from 'react';
import { Form, FormGroup, TextInput, TextArea, Modal, ModalVariant, Button, TimePicker, DatePicker, Split, SplitItem, Select, SelectVariant, SelectOption, Tile } from '@patternfly/react-core';
import axios from 'axios';
import { COLORS } from './../helpers/Constants';
import { capitalize, isSubstring } from './../helpers/Utils';

// TODO: Automatically select event organizer in typeahead
// TODO: Disable "Create" button until all fields are valid
const NewEventModal = ({ isOpen, setOpen, createCallback }) => {
    const [eventTitle, setEventTitle] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [allUsers, setAllUsers] = React.useState([]);
    const [isTypeaheadOpen, setTypeaheadOpen] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedColor, setSelectedColor] = useState("blue");

    const [dateFrom, setDateFrom] = useState('');
    const [timeFrom, setTimeFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [timeTo, setTimeTo] = useState('');

    useEffect(() => {
        axios.get("/allUsers").then(response => {
            setAllUsers(response.data);
        })
    }, []);

    const onTypeaheadSelect = (event, selection) => {
        const index = selectedUsers.indexOf(selection);

        if (index === -1) {
            const user = allUsers.find(user => user.email === selection);
            setSelectedUsers([...selectedUsers, user.email]);
        }
        else {
            setSelectedUsers([...selectedUsers.slice(0, index), ...selectedUsers.slice(index + 1)])
        }
    };

    const clearTypeaheadSelection = () => {
        setSelectedUsers([]);
        setTypeaheadOpen(false);
    };

    const typeaheadFilter = (_, value) => {
        const filteredUsers = allUsers.filter(user => isSubstring(value, user.email) || isSubstring(value, user.username) || isSubstring(value, user.fullname));

        return filteredUsers.map((option, index) => (
            <SelectOption
                key={index}
                value={option.email}
                description={option.fullname}
            />
        ));
    }

    return (
        <Modal
            variant={ModalVariant.small}
            title="Create a new event"
            isOpen={isOpen}
            onClose={() => setOpen(false)}
            actions={[
                <Button
                    key="confirm"
                    variant="primary"
                    onClick={() => {
                        createCallback({ eventTitle, eventDescription, selectedUsers, dateFrom, timeFrom, dateTo, timeTo });
                        setOpen(false);
                    }}
                >
                    Create
                </Button>,
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
                                onChange={(_event, str) => setDateFrom(str)}
                                appendTo={document.querySelector("body")}
                            />
                        </SplitItem>
                        <SplitItem>
                            <TimePicker onChange={(e, time) => setTimeFrom(time)} />
                        </SplitItem>
                    </Split>
                </FormGroup>
                <FormGroup label="To" isRequired>
                    <Split hasGutter>
                        <SplitItem>
                            <DatePicker
                                onChange={(_event, str) => setDateTo(str)}
                                appendTo={document.querySelector("body")}
                            />
                        </SplitItem>
                        <SplitItem>
                            <TimePicker onChange={(e, time) => setTimeTo(time)} />
                        </SplitItem>
                    </Split>
                </FormGroup>
                <FormGroup label="Attendees">
                    <Select
                        chipGroupProps={{ numChips: 1, expandedText: 'Hide', collapsedText: 'Show ${remaining}' }}
                        variant={SelectVariant.typeaheadMulti}
                        onToggle={newState => setTypeaheadOpen(newState)}
                        onSelect={onTypeaheadSelect}
                        onClear={clearTypeaheadSelection}
                        selections={selectedUsers}
                        isOpen={isTypeaheadOpen}
                        onFilter={typeaheadFilter}
                        placeholderText="Attendees"
                        menuAppendTo="parent"
                    >
                        {allUsers.map((option, index) => (
                            <SelectOption
                                key={index}
                                value={option.email}
                                description={option.fullname}
                            />
                        ))}
                    </Select>
                </FormGroup>
                <FormGroup label="Display color">
                    {
                        Object.entries(COLORS).map(([colorName, colorValue]) => 
                            <Tile key={colorName} title={capitalize(colorName)} style={{ backgroundColor: colorValue }} isSelected={selectedColor === colorName} onClick={() => setSelectedColor(colorName)}/>
                        )
                    }
                </FormGroup>
            </Form>
        </Modal >
    );
};

export default NewEventModal;
