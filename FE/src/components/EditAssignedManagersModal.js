import React, { useEffect, useState } from 'react';
import { Form, Button, Modal, ModalVariant, DualListSelector } from '@patternfly/react-core';
import { useAction, useFetch } from './../helpers/Hooks';

const EditAssignedManagersModal = ({ userInfo, isOpen, setOpen, callback, selectedUser }) => {
    const [availableOptions, setAvailableOptions] = useState([]);
    const [chosenOptions, setChosenOptions] = useState([]);

    const [allUsers, areAllUsersLoading, refreshUsers] = useFetch('/users', userInfo);
    const [managedUsers, areManagedUsersLoading, refreshManagedUsers] = useFetch(`/users/${selectedUser.username ?? userInfo.upn}/managed_users`, userInfo);

    const selectManagedUsers = useAction('POST', `/users/${selectedUser.username}/managed_users`, userInfo);

    console.log("ccc", managedUsers);

    useEffect(() => {
        if (isOpen) {
            refreshUsers();
            refreshManagedUsers();
        }
    }, [isOpen]);

    useEffect(() => {
        setAvailableOptions(allUsers
            .filter(user => user.userRole === "MANAGER" || user.userRole === "DIRECTOR")
            .filter(user => !managedUsers.map(user => user.username).includes(user.username))
            .map(user => user.username));
    }, [allUsers, managedUsers]);

    useEffect(() => {
        setChosenOptions(managedUsers.map(user => user.username));
    }, [managedUsers]);    

    const onListChange = (newAvailableOptions, newChosenOptions) => {
        setAvailableOptions(newAvailableOptions.sort());
        setChosenOptions(newChosenOptions.sort());
    };

    const closeModal = () => {
        setOpen(false)
    }

    const onSubmit = () => {
        selectManagedUsers(null, { usernames: chosenOptions }, () => console.log("succ"));
        closeModal();
    }

    return (
        <Modal
            className="edit-assigned-managers-modal"
            variant={ModalVariant.small}
            title={`Editing managers assigned to ${selectedUser.username}`}
            isOpen={isOpen}
            onClose={closeModal}
            actions={[
                <Button
                    className="edit-assigned-managers-modal-confirm"
                    key="confirm"
                    variant="primary"
                    onClick={onSubmit}
                >
                    Save
                </Button>,
                <Button
                    className="edit-assigned-managers-modal-cancel"
                    key="cancel"
                    variant="link"
                    onClick={closeModal}
                >
                    Cancel
                </Button>
            ]}>
            <Form>
                <DualListSelector
                    className="edit-assigned-managers-modal-selector"
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
