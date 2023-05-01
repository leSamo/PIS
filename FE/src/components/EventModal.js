import React, { useEffect, useState } from 'react';
import { Form, FormGroup, TextInput, TextArea, Modal, ModalVariant, Button, TimePicker, DatePicker, Split, SplitItem, Select, SelectVariant, SelectOption, Tile, Alert } from '@patternfly/react-core';
import { COLORS } from '../helpers/Constants';
import { capitalize, isSubstring } from '../helpers/Utils';
import { useFetch } from '../helpers/Hooks';
import { validateDate } from '../helpers/Validators';
import { validateTime } from '../helpers/Validators';

// modal used for creating new events and editing existing events
const EventModal = ({ userInfo, isOpen, setOpen, createCallback, initialEventData }) => {
    const [eventTitle, setEventTitle] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [isTypeaheadOpen, setTypeaheadOpen] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedColor, setSelectedColor] = useState("blue");

    const [dateFrom, setDateFrom] = useState('');
    const [timeFrom, setTimeFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [timeTo, setTimeTo] = useState('');

    const [allUsers] = useFetch('/users', userInfo);

    useEffect(() => {
        if (isOpen) {
            // if initialEventData is provided, this means that modal is editing existing event
            if (initialEventData) {
                setEventTitle(initialEventData.name);
                setEventDescription(initialEventData.description);
                setSelectedUsers(initialEventData.attendees.map(attendee => attendee.username));
                setSelectedColor(initialEventData.color.toLowerCase());
    
                const [startDate, startTime] = initialEventData.start.split(/[TZ]/);
                const [endDate, endTime] = initialEventData.end.split(/[TZ]/);
    
                setDateFrom(startDate);
                setTimeFrom(startTime.substring(0, 5));
                setDateTo(endDate);
                setTimeTo(endTime.substring(0, 5));
            }
            // modal is creating a new event
            // logged in user is select as an attendee by default
            else {
                setSelectedUsers([userInfo.upn]);
            }
        }
    }, [isOpen]);

    // typeahead is used to select the attendees
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

        setDateFrom('');
        setDateTo('');
        setTimeFrom('');
        setTimeTo('');
    }

    // time alert is used to notify the user that selected relation of from/to date/time is invalid
    const getTimeAlertTitle = () => {
        const from = new Date(dateFrom + "T" + timeFrom)
        const to = new Date(dateTo + "T" + timeTo);

        if (from > to) {
            return "Event cannot start after it has ended"
        }

        let diffInMilliseconds = to.getTime() - from.getTime();
        let diffInMinutes = diffInMilliseconds / 60000;

        if (diffInMinutes < 10) {
            return "Events have to take at least 10 minutes" 
        }

        return null;
    }

    return (
        <Modal
            className="event-modal"
            variant={ModalVariant.small}
            title={initialEventData ? "Edit event" : "Create a new event"}
            isOpen={isOpen}
            onClose={closeModal}
            actions={[
                <Button
                    className="event-modal-confirm"
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
                        }, initialEventData?.id);
                        closeModal();
                    }}
                    isDisabled={!eventTitle || !validateDate(dateFrom) || !validateDate(dateTo) || !validateTime(timeFrom) || !validateTime(timeTo) || getTimeAlertTitle()}
                >
                    {initialEventData ? "Edit" : "Create"}
                </Button>,
                <Button className="event-modal-cancel" key="cancel" variant="link" onClick={closeModal}>Cancel</Button>
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
                <FormGroup label="Event description">
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
                                value={dateFrom}
                            />
                        </SplitItem>
                        <SplitItem>
                            <TimePicker
                                onChange={(e, time) => setTimeFrom(time)}
                                is24Hour
                                time={timeFrom}
                            />
                        </SplitItem>
                    </Split>
                </FormGroup>
                <FormGroup label="To" isRequired>
                    <Split hasGutter>
                        <SplitItem>
                            <DatePicker
                                onChange={(_event, str) => setDateTo(str)}
                                appendTo={document.querySelector("body")}
                                value={dateTo}
                            />
                        </SplitItem>
                        <SplitItem>
                            <TimePicker
                                onChange={(e, time) => setTimeTo(time)}
                                is24Hour
                                time={timeTo}
                            />
                        </SplitItem>
                    </Split>
                </FormGroup>
                {getTimeAlertTitle() && <Alert variant="danger" title={getTimeAlertTitle()} isInline/>}
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

export default EventModal;
