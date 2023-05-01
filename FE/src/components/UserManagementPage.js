import React, { useState } from 'react';
import {
    Card, CardBody, TextContent, Text, TextVariants, AlertVariant, ButtonVariant, Button, SplitItem, Split
} from '@patternfly/react-core';
import { useAction } from '../helpers/Hooks';
import Table from './Table';
import { Link } from 'react-router-dom/cjs/react-router-dom';
import NewUserModal from './NewUserModal';
import EditUserModal from './EditUserModal';
import { AngleLeftIcon } from '@patternfly/react-icons';
import EditAssignedManagersModal from './EditAssignedManagersModal';
import { useFetch } from './../helpers/Hooks';
import { capitalize } from './../helpers/Utils';

// component responsible for rendering the page after user has clicked the "User management" button in the navigation
const UserManagementPage = ({ addToastAlert, userInfo }) => {
    const TABLE_COLUMNS = [
        { label: 'User name' },
        { label: 'Full name' },
        { label: 'Email address' },
        { label: 'Role' },
        { label: 'Can manage users', type: 'boolean' },
        { label: 'Registered', type: 'date' }
    ];

    const [isNewUserModalOpen, setNewUserModalOpen] = useState(false);
    const [isEditUserModalOpen, setEditUserModalOpen] = useState(false);
    const [userSelectedForEdit, setUserSelectedForEdit] = useState({});
    const [isEditAssignedManagersModalOpen, setEditAssignedManagersModalOpen] = useState(false);

    const [fetchedUsers, areUsersLoading, refreshUsers] = useFetch('/users', userInfo);
    const deleteUser = useAction('DELETE', '/users', userInfo);

    const deleteUserAction = name => {
        if (confirm(`Are you sure you want to remove ${name}?`)) {
            const callback = () => {
                addToastAlert(AlertVariant.success, `User "${name}" was successfully deleted`);
                refreshUsers();
            }

            deleteUser(name, {}, callback);
        }
    }

    const openEditUserModal = user => {
        setUserSelectedForEdit(user);
        setEditUserModalOpen(true);
    }

    const openEditAssignedManagersModal = user => {
        setUserSelectedForEdit(user);
        setEditAssignedManagersModalOpen(true);
    }

    return (
        <Card>
            <NewUserModal
                isOpen={isNewUserModalOpen}
                setOpen={setNewUserModalOpen}
                userInfo={userInfo}
                successCallback={() => {
                    refreshUsers();
                    addToastAlert(AlertVariant.success, `User was successfully created`);
                }}
                failureCallback={reason => {
                    addToastAlert(AlertVariant.danger, `Failed to create user`, reason);
                }}
            />
            <EditUserModal
                userInfo={userInfo}
                isOpen={isEditUserModalOpen}
                setOpen={setEditUserModalOpen}
                callback={() => {
                    addToastAlert(AlertVariant.success, `User was successfully edited`)
                    setEditUserModalOpen(false);
                    refreshUsers();
                }}
                selectedUser={userSelectedForEdit}
            />
            <EditAssignedManagersModal
                userInfo={userInfo}
                addToastAlert={addToastAlert}
                isOpen={isEditAssignedManagersModalOpen}
                setOpen={setEditAssignedManagersModalOpen}
                callback={() => { }}
                selectedUser={userSelectedForEdit}
            />
            <CardBody>
                <Split>
                    <SplitItem>
                        <Link to="/">
                            <Button variant={ButtonVariant.secondary} className="navigate-to-index-page">
                                <AngleLeftIcon style={{ marginRight: 8, verticalAlign: -2 }} />
                                Go back
                            </Button>
                        </Link>
                    </SplitItem>
                    <SplitItem isFilled />
                    <SplitItem>
                        <Button variant={ButtonVariant.primary} onClick={() => setNewUserModalOpen(true)} className="create-user">Add new user</Button>
                    </SplitItem>
                </Split>
                <br />
                <br />
                <Table
                    title={
                        <TextContent>
                            <Text component={TextVariants.h1}>
                                Registered users
                            </Text>
                        </TextContent>
                    }
                    rows={fetchedUsers.map(user => [user.username, user.name, user.email, capitalize(user.userRole.toLowerCase()), user.admin, user.userCreated.split("[")[0]])}
                    columns={TABLE_COLUMNS}
                    isLoading={areUsersLoading}
                    actions={[
                        {
                            label: 'Edit',
                            onClick: ([username, fullname, email, role, isAdmin]) => openEditUserModal({ username, fullname, email, role, isAdmin }),
                            buttonProps: {
                                variant: ButtonVariant.primary,
                                className: 'table-edit-user'
                            }
                        }, {
                            label: 'Edit assigned managers',
                            onClick: ([username, fullname, email, role, isAdmin]) => openEditAssignedManagersModal({ username, fullname, email, role, isAdmin }),
                            buttonProps: {
                                variant: ButtonVariant.secondary,
                                className: 'table-edit-managers-user'
                            },
                            resolver: row => row[3] === 'Assistant'
                        }, {
                            label: 'Remove',
                            onClick: ([username]) => deleteUserAction(username),
                            buttonProps: {
                                variant: ButtonVariant.danger,
                                className: 'table-delete-user'
                            },
                            resolver: ([username]) => username !== userInfo.upn
                        }]}
                    itemCount={fetchedUsers?.length}
                />
            </CardBody>
        </Card>
    )
};

export default UserManagementPage;
