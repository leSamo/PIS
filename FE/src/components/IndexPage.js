import React, { useEffect, useState } from 'react';
import { Card, CardBody, Dropdown, DropdownToggle, DropdownItem, Flex, FlexItem, Button, ButtonVariant, Select, SelectVariant, SelectOption, Toolbar, Switch } from '@patternfly/react-core';
import EventModal from './EventModal';
import Week from './Week';
import { AngleDoubleLeftIcon, AngleDoubleRightIcon, AngleLeftIcon, AngleRightIcon } from '@patternfly/react-icons';
import { MONTH_VIEW, WEEK_VIEW } from '../helpers/Constants';
import Month from './Month';
import { isSubstring } from '../helpers/Utils';
import { useAction } from '../helpers/Hooks';

const IndexPage = ({ userInfo, addToastAlert }) => {
    const [isEventModalOpen, setEventModalOpen] = useState(false);
    const [allUsers, setAllUsers] = React.useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const [isTypeaheadOpen, setTypeaheadOpen] = useState(false);
    const [doubleLeftButtonClickCount, setDoubleLeftButtonClickCount] = useState(0);
    const [leftButtonClickCount, setLeftButtonClickCount] = useState(0);
    const [rightButtonClickCount, setRightButtonClickCount] = useState(0);
    const [doubleRightButtonClickCount, setDoubleRightButtonClickCount] = useState(0);
    const [refreshCounter, setRefreshCounter] = useState(0);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedView, setSelectedView] = useState(WEEK_VIEW);
    const [showMyOwnCalendar, setShowMyOwnCalendar] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const createEvent = useAction('POST', '/events', userInfo);
    const editEvent = useAction('PATCH', '/events', userInfo);

    useEffect(() => {
        // TODO: Remove own self
        /*
        axios.get("/allUsers").then(response => {
            setAllUsers(response.data);
        })
        */
    }, []);

    const onDropdownToggle = isOpen => {
        setIsDropdownOpen(isOpen);
    };

    const onDropdownSelect = () => {
        setIsDropdownOpen(false);
        document.getElementById('view-dropdown-toggle').focus();
    };

    const dropdownItems = [
        <DropdownItem key="week" onClick={() => setSelectedView(WEEK_VIEW)}>
            Week
        </DropdownItem>,
        <DropdownItem key="month" onClick={() => setSelectedView(MONTH_VIEW)}>
            Month
        </DropdownItem>
    ];

    const onTypeaheadSelect = (_, selection) => {
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

    const createCallback = (event, id) => {
        if (selectedEvent) {
            editEvent(id, event, () => setRefreshCounter(refreshCounter + 1));
        }
        else {
            createEvent(null, event, () => setRefreshCounter(refreshCounter + 1));
        }
    };

    const openEditEventModal = event => {
        setEventModalOpen(true);
        setSelectedEvent(event);
    }
    
    const openCreateEventModal = () => {
        setSelectedEvent(null);
        setEventModalOpen(true);
    }

    return (
        <Card>
            <EventModal
                userInfo={userInfo}
                isOpen={isEventModalOpen}
                setOpen={setEventModalOpen}
                createCallback={createCallback}
                initialEventData={selectedEvent}
            />
            <CardBody style={{ paddingTop: 0 }}>
                <Toolbar isSticky style={{ paddingLeft: 16, paddingRight: 16 }}>
                    <Flex>
                        <FlexItem>
                            <Select
                                chipGroupProps={{ numChips: 1, expandedText: 'Hide', collapsedText: 'Show ${remaining}' }}
                                variant={SelectVariant.typeaheadMulti}
                                onToggle={newState => setTypeaheadOpen(newState)}
                                onSelect={onTypeaheadSelect}
                                onClear={clearTypeaheadSelection}
                                selections={selectedUsers}
                                isOpen={isTypeaheadOpen}
                                onFilter={typeaheadFilter}
                                placeholderText="Show calendar of"
                            >
                                {allUsers.map((option, index) => (
                                    <SelectOption
                                        key={index}
                                        value={option.email}
                                        description={option.fullname}
                                    />
                                ))}
                            </Select>
                        </FlexItem>
                        <FlexItem>
                            <Dropdown
                                onSelect={onDropdownSelect}
                                toggle={
                                    <DropdownToggle id="view-dropdown-toggle" onToggle={onDropdownToggle}>
                                        Toggle view
                                    </DropdownToggle>
                                }
                                isOpen={isDropdownOpen}
                                dropdownItems={dropdownItems}
                            />
                        </FlexItem>
                        <FlexItem>
                            <Button className="toolbar-create-event" variant={ButtonVariant.primary} onClick={openCreateEventModal}>Create event</Button>
                        </FlexItem>
                        <FlexItem>
                            <Button className="toolbar-navigate-double-left" variant="secondary" onClick={() => setDoubleLeftButtonClickCount(doubleLeftButtonClickCount + 1)}>
                                <AngleDoubleLeftIcon />
                            </Button>
                        </FlexItem>
                        <FlexItem>
                            <Button className="toolbar-navigate-left" variant="secondary" onClick={() => setLeftButtonClickCount(leftButtonClickCount + 1)}>
                                <AngleLeftIcon />
                            </Button>
                        </FlexItem>
                        <FlexItem>
                            <Button className="toolbar-navigate-right" variant="secondary" onClick={() => setRightButtonClickCount(rightButtonClickCount + 1)}>
                                <AngleRightIcon />
                            </Button>
                        </FlexItem>
                        <FlexItem>
                            <Button className="toolbar-navigate-double-right" variant="secondary" onClick={() => setDoubleRightButtonClickCount(doubleRightButtonClickCount + 1)}>
                                <AngleDoubleRightIcon />
                            </Button>
                        </FlexItem>
                        <FlexItem style={{ marginLeft: "auto" }}>
                            <Switch
                                id="my-calendar-switch"
                                label="Show my own calendar"
                                labelOff="Don't show my own calendar"
                                isChecked={showMyOwnCalendar}
                                onChange={newValue => setShowMyOwnCalendar(newValue)}
                                isReversed
                            />
                        </FlexItem>
                    </Flex>
                </Toolbar>
                {selectedView === WEEK_VIEW
                    ? <Week
                        userInfo={userInfo}
                        addToastAlert={addToastAlert}
                        doubleLeftButtonClickCount={doubleLeftButtonClickCount}
                        leftButtonClickCount={leftButtonClickCount}
                        rightButtonClickCount={rightButtonClickCount}
                        doubleRightButtonClickCount={doubleRightButtonClickCount}
                        refreshCounter={refreshCounter}
                        editEvent={openEditEventModal}
                    />
                    : <Month
                        userInfo={userInfo}
                        addToastAlert={addToastAlert}
                        doubleLeftButtonClickCount={doubleLeftButtonClickCount}
                        leftButtonClickCount={leftButtonClickCount}
                        rightButtonClickCount={rightButtonClickCount}
                        doubleRightButtonClickCount={doubleRightButtonClickCount}
                        refreshCounter={refreshCounter}
                        editEvent={openEditEventModal}
                    />
                }
            </CardBody>
        </Card>
    );
};

export default IndexPage;