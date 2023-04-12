import React, { useEffect, useState } from 'react';
import { Card, CardBody, Dropdown, DropdownToggle, DropdownItem, Flex, FlexItem, Button, ButtonVariant, Select, SelectVariant, SelectOption } from '@patternfly/react-core';
import NewEventModal from './NewEventModal';
import axios from 'axios';
import Week from './Week';

const IndexPage = () => {
    const [isNewEventModalOpen, setNewEventModalOpen] = useState(false);
    const [allUsers, setAllUsers] = React.useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const [isTypeaheadOpen, setTypeaheadOpen] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);

    useEffect(() => {
        // TODO: Remove own self
        axios.get("/allUsers").then(response => {
            setAllUsers(response.data);
        })
    }, []);

    const onDropdownToggle = (isOpen) => {
        setIsDropdownOpen(isOpen);
    };

    const onDropdownSelect = () => {
        setIsDropdownOpen(false);
        document.getElementById('view-dropdown-toggle').focus();
    };

    const dropdownItems = [
        <DropdownItem key="week">
            Week
        </DropdownItem>,
        <DropdownItem key="month">
            Month
        </DropdownItem>
    ];

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

    const isSubstring = (substring, string) => {
        const strippedSubstring = substring.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const strippedString = string.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        return strippedString.toLowerCase().indexOf(strippedSubstring.toLowerCase()) !== -1;
    }

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

    const createCallback = event => {
        console.log("Create event", event)
    };

    return (
        <Card style={{ height: "100%", overflow: "hidden" }}>
            <NewEventModal
                isOpen={isNewEventModalOpen}
                setOpen={setNewEventModalOpen}
                createCallback={createCallback}
            />
            <CardBody>
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
                        <Button variant={ButtonVariant.primary} onClick={() => setNewEventModalOpen(true)}>Add event</Button>
                    </FlexItem>
                </Flex>
                <Week />
            </CardBody>
        </Card>
    );
};

export default IndexPage;