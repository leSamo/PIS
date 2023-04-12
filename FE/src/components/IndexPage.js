import React, { useState } from 'react';
import { Card, CardBody, AlertVariant, TextInput, Split, SplitItem, ChipGroup, Chip, Dropdown, DropdownToggle, DropdownItem, Flex, FlexItem, Button, ButtonVariant } from '@patternfly/react-core';
import NewEventModal from './NewEventModal';
import { useAction } from '../helpers/Hooks';

const IndexPage = ({ addToastAlert, userInfo }) => {
    const [isNewEventModalOpen, setNewEventModalOpen] = useState(false);
    const [nameSearchInput, setNameSeachInput] = React.useState('');

    const createNewCourse = useAction('/createNewCourse', userInfo);

    const createNewCourseAction = courseInfo => {
        const callback = () => {
            addToastAlert(AlertVariant.success, 'Kurz bol úspešne založený', 'Po schválení moderátorom bude zverejnený');
        }

        createNewCourse(courseInfo, callback);
    }

    const [chips, setChips] = React.useState([
        'Samuel Olekšák',
        'Michal Findra',
        'abc',
        'def',
        'ghi'
    ]);

    const deleteItem = (id) => {
        const copyOfChips = [...chips];
        const filteredCopy = copyOfChips.filter(chip => chip !== id);
        setChips(filteredCopy);
    };

    const deleteCategory = () => {
        setChips([]);
    };

    const chipsComponent = (
        <ChipGroup categoryName="Meeting with" isClosable onClick={deleteCategory}>
            {chips.map(currentChip => (
                <Chip key={currentChip} onClick={() => deleteItem(currentChip)}>
                    {currentChip}
                </Chip>
            ))}
        </ChipGroup>
    )

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

    return (
        <Card>
            <NewEventModal isOpen={isNewEventModalOpen} setOpen={setNewEventModalOpen} createCallback={courseInfo => createNewCourseAction(courseInfo)} />
            <CardBody>
                  <Flex>
                    <FlexItem>
                        Show calendar of:
                    </FlexItem>
                    {/* TODO: Use typeahead (https://www.patternfly.org/v4/components/select#typeahead) */}
                    <FlexItem>
                        <TextInput value={nameSearchInput} type="text" onChange={value => setNameSeachInput(value)} aria-label="show-calendar-input" />
                    </FlexItem>
                    <FlexItem>
                        {chipsComponent}
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