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

const UserManagementPage = ({ addToastAlert, userInfo }) => {
    const COLUMNS = [
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
                    addToastAlert(AlertVariant.danger, `Failed to create user: ${reason}`);
                }}
            />
            <EditUserModal
                isOpen={isEditUserModalOpen}
                setOpen={setEditUserModalOpen}
                callback={() => {}}
                selectedUser={userSelectedForEdit}
            />
            <EditAssignedManagersModal
                userInfo={userInfo}
                isOpen={isEditAssignedManagersModalOpen}
                setOpen={setEditAssignedManagersModalOpen}
                callback={() => {}}
                selectedUser={userSelectedForEdit}
            />
            <CardBody>
                <Split>
                    <SplitItem>
                        <Link to="/">
                            <Button variant={ButtonVariant.secondary}><AngleLeftIcon style={{ marginRight: 8, verticalAlign: -2 }}/>Go back</Button>
                        </Link>
                    </SplitItem>
                    <SplitItem isFilled />
                    <SplitItem>
                        <Button variant={ButtonVariant.primary} onClick={() => setNewUserModalOpen(true)}>Add new user</Button>
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
                    columns={COLUMNS}
                    isLoading={areUsersLoading}
                    actions={[
                        {
                            label: 'Edit',
                            onClick: ([username, fullname, email, role, isAdmin]) => openEditUserModal({ username, fullname, email, role, isAdmin }),
                            buttonProps: {
                                variant: ButtonVariant.primary
                            }
                        },  {
                            label: 'Edit assigned managers',
                            onClick: ([username, fullname, email, role, isAdmin]) => openEditAssignedManagersModal({ username, fullname, email, role, isAdmin }),
                            buttonProps: {
                                variant: ButtonVariant.secondary
                            },
                            resolver: row => row[3] === 'Assistant'
                        },  {
                            label: 'Remove',
                            onClick: ([username]) => deleteUserAction(username),
                            buttonProps: {
                                variant: ButtonVariant.danger
                            },
                            resolver: ([username]) => username !== userInfo.upn
                        }]}
                    sortBy={null}
                    onSort={() => { }}
                    page={1}
                    perPage={10000}
                    itemCount={fetchedUsers?.length}
                    onSetPage={() => { }}
                    onPerPageSelect={() => { }}
                />
            </CardBody>
        </Card>
    )
};

export default UserManagementPage;
