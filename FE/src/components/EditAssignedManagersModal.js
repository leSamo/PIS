import React, { useState } from 'react';
import { Form, Button, Modal, ModalVariant, DualListSelector } from '@patternfly/react-core';

const EditAssignedManagersModal = ({ isOpen, setOpen, callback, selectedUser }) => {
    const [availableOptions, setAvailableOptions] = useState([
        '<Director username>',
        '<Manager 1 username>',
        '<Manager 2 username>',
        '<Manager 3 username>'
    ]);
    const [chosenOptions, setChosenOptions] = useState([]);

    const onListChange = (newAvailableOptions, newChosenOptions) => {
        setAvailableOptions(newAvailableOptions.sort());
        setChosenOptions(newChosenOptions.sort());
    };

    const closeModal = () => {
        setOpen(false)
    }

    console.log(availableOptions)

    return (
        <Modal
            variant={ModalVariant.small}
            title={`Editing managers assigned to ${selectedUser.username}`}
            isOpen={isOpen}
            onClose={closeModal}
            actions={[
                <Button
                    key="confirm"
                    variant="primary"
                    onClick={callback}
                    /* TODO */
                    isDisabled={false}
                >
                    Save
                </Button>,
                <Button key="cancel" variant="link" onClick={closeModal}>Cancel</Button>
            ]}>
            <Form>
                <DualListSelector
                    availableOptions={availableOptions}
                    availableOptionsTitle="Managers not assigned"
                    chosenOptions={chosenOptions}
                    chosenOptionsTitle="Managers assigned"
                    onListChange={onListChange}
                    addAllTooltip="Add all options"
                    addAllTooltipProps={{ position: 'top' }}
                    addSelectedTooltip="Add selected options"
                    addSelectedTooltipProps={{ position: 'right' }}
                    removeSelectedTooltip="Remove selected options"
                    removeSelectedTooltipProps={{ position: 'left' }}
                    removeAllTooltip="Remove all options"
                    removeAllTooltipProps={{ position: 'bottom' }}
                    id="dual-list-selector-basic-tooltips"
                />
            </Form>
        </Modal>
    )
};

export default EditAssignedManagersModal;
