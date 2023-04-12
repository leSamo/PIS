import React, { useEffect, useState } from 'react';
import { Card, CardBody, AlertVariant, ChipGroup, Chip, Dropdown, DropdownToggle, DropdownItem, Flex, FlexItem, Button, ButtonVariant, Select, SelectVariant, SelectOption } from '@patternfly/react-core';
import NewEventModal from './NewEventModal';
import { useAction } from '../helpers/Hooks';
import axios from 'axios';

const IndexPage = ({ addToastAlert, userInfo }) => {
    const [isNewEventModalOpen, setNewEventModalOpen] = useState(false);
    const [nameSearchInput, setNameSeachInput] = React.useState('');
    const [allUsers, setAllUsers] = React.useState([]);

    useEffect(() => {
        // TODO: Remove own self
        axios.get("/allUsers").then(response => {
            setAllUsers(response.data);
        })
    }, []);

    const createNewCourse = useAction('/createNewCourse', userInfo);

    const createNewCourseAction = courseInfo => {
        const callback = () => {
            addToastAlert(AlertVariant.success, 'Kurz bol úspešne založený', 'Po schválení moderátorom bude zverejnený');
        }

        createNewCourse(courseInfo, callback);
    }

    const [isOpen, setIsOpen] = React.useState(false);

    const onToggle = (isOpen) => {
        setIsOpen(isOpen);
    };

    const onFocus = () => {
        const element = document.getElementById('toggle-basic');
        element.focus();
    };

    const onSelect = () => {
        setIsOpen(false);
        onFocus();
    };

    const dropdownItems = [
        <DropdownItem key="week">
            Week
        </DropdownItem>,
        <DropdownItem key="month">
            Month
        </DropdownItem>
    ];

    const [isTypeaheadOpen, setTypeaheadOpen] = useState(false)
    const [selectedUsers, setSelectedUsers] = useState([])


    const onTypeaheadToggle = isOpen => {
        setTypeaheadOpen(isOpen);
    };

    console.log(allUsers, selectedUsers);

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

    const clearSelection = () => {
        setSelectedUsers([]);
        setTypeaheadOpen(false);
    };

return (
    <Card>
        <NewEventModal isOpen={isNewEventModalOpen} setOpen={setNewEventModalOpen} createCallback={courseInfo => createNewCourseAction(courseInfo)} />
        <CardBody>
            <Flex>
                <FlexItem>
                    <Select
                        chipGroupProps={{ numChips: 1, expandedText: 'Hide', collapsedText: 'Show ${remaining}' }}
                        variant={SelectVariant.typeaheadMulti}
                        onToggle={onTypeaheadToggle}
                        onSelect={onTypeaheadSelect}
                        onClear={clearSelection}
                        selections={selectedUsers}
                        isOpen={isTypeaheadOpen}
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
                        onSelect={onSelect}
                        toggle={
                            <DropdownToggle id="toggle-basic" onToggle={onToggle}>
                                Toggle view
                            </DropdownToggle>
                        }
                        isOpen={isOpen}
                        dropdownItems={dropdownItems}
                    />
                </FlexItem>
                <FlexItem>
                    <Button variant={ButtonVariant.primary} onClick={() => setNewEventModalOpen(true)}>Add event</Button>
                </FlexItem>
            </Flex>
        </CardBody>
    </Card>
);
};

export default IndexPage;