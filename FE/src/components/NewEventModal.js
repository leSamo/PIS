import React, { useState } from 'react';
import { Form, FormGroup, TextInput, TextArea, Modal, ModalVariant, Button, TimePicker, DatePicker, Split, SplitItem, Select, SelectVariant, SelectOption, Tile } from '@patternfly/react-core';
import { COLORS } from './../helpers/Constants';
import { capitalize, isSubstring } from './../helpers/Utils';
import { useFetch } from './../helpers/Hooks';
import { validateDate } from '../helpers/Validators';
import { validateTime } from './../helpers/Validators';

// TODO: Automatically select event organizer in typeahead
// TODO: Disable "Create" button until all fields are valid
// TODO: Start day must be before end day
// TODO: Event has to last at least 10 minutes
const NewEventModal = ({ userInfo, isOpen, setOpen, createCallback }) => {
    const [eventTitle, setEventTitle] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [isTypeaheadOpen, setTypeaheadOpen] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedColor, setSelectedColor] = useState("blue");

    const [dateFrom, setDateFrom] = useState('');
    const [timeFrom, setTimeFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [timeTo, setTimeTo] = useState('');

    const [allUsers, areUsersLoading, refreshUsers] = useFetch('/users', userInfo);

    console.log(allUsers, selectedUsers);

    const onTypeaheadSelect = (event, selection) => {
        const index = selectedUsers.indexOf(selection);

        if (index === -1) {
            console.log("searching", selection, "in", allUsers)
            const user = allUsers.find(user => user.username === selection);
            setSelectedUsers([...selectedUsers, user.username]);
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
        const filteredUsers = allUsers.filter(user => isSubstring(value, user.email) || isSubstring(value, user.username) || isSubstring(value, user.name));

        return filteredUsers.map((option, index) => (
            <SelectOption
                key={index}
                value={option.username}
                description={option.fullname}
            >
                {`${option.name} (${option.email})`}
            </SelectOption>
        ));
    }

    const closeModal = () => {
        setOpen(false);
        setEventTitle('');
        setEventDescription('');
        clearTypeaheadSelection();
        setSelectedColor("blue");
    }

    console.log(dateFrom, timeFrom);

    return (
        <Modal
            variant={ModalVariant.small}
            title="Create a new event"
            isOpen={isOpen}
            onClose={closeModal}
            actions={[
                <Button
                    key="confirm"
                    variant="primary"
                    onClick={() => {
                        createCallback({
                            name: eventTitle,
                            description: eventDescription,
                            color: selectedColor.toUpperCase(),
                            attendees: selectedUsers,
                            start: (new Date(dateFrom + "T" + timeFrom)).toISOString(),
                            end: (new Date(dateTo + "T" + timeTo)).toISOString()
                        });
                        closeModal();
                    }}
                    isDisabled={!eventTitle || !eventDescription || !validateDate(dateFrom) || !validateDate(dateTo) || !validateTime(timeFrom) || !validateTime(timeTo)}
                >
                    Create
                </Button>,
                <Button key="cancel" variant="link" onClick={closeModal}>Cancel</Button>
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
                            <TimePicker onChange={(e, time) => setTimeFrom(time)} is24Hour />
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
                            <TimePicker onChange={(e, time) => setTimeTo(time)} is24Hour />
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
                                value={option.username}
                                description={option.fullname}
                            >
                                {`${option.name} (${option.email})`}
                            </SelectOption>
                        ))}
                    </Select>
                </FormGroup>
                <FormGroup label="Display color">
                    {
                        Object.entries(COLORS).map(([colorName, colorValue]) =>
                            <Tile
                                key={colorName}
                                title={capitalize(colorName)}
                                style={{ backgroundColor: colorValue, width: 100 }}
                                isSelected={selectedColor === colorName}
                                onClick={() => setSelectedColor(colorName)}
                            />
                        )
                    }
                </FormGroup>
            </Form>
        </Modal >
    );
};

export default NewEventModal;
