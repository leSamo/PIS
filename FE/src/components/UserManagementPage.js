import React, { useEffect, useState } from 'react';
import {
    Card, CardBody, TextContent, Text, TextVariants, AlertVariant, ButtonVariant, Button, SplitItem, Split
} from '@patternfly/react-core';
import { useAction } from '../helpers/Hooks';
import Table from './Table';
import axios from 'axios';
import { Link } from 'react-router-dom/cjs/react-router-dom';
import NewUserModal from './NewUserModal';

const UserManagementPage = ({ addToastAlert }) => {
    const COLUMNS = [
        { label: 'User name' },
        { label: 'Full name' },
        { label: 'Email address' },
        { label: 'Role' },
        { label: 'Can manage users', type: 'boolean' },
        { label: 'Registered', type: 'date' }
    ];

    const [isLoading, setLoading] = useState(true);
    const [isNewUserModalOpen, setNewUserModalOpen] = useState(false);
    const [data, setData] = useState([]);
    const [refreshCounter, setRefreshCounter] = useState(0);

    useEffect(() => {
        console.log("refresh");
        axios.get("/allUsers").then(response => {
            setData(response.data.map(row => [row.username, row.fullname, row.email, row.role, row.isUserAdmin, row.registered]));
            setLoading(false);
        })
    }, [refreshCounter]);

    const deleteUser = useAction('/removeUser', {});

    const deleteUserAction = name => {
        if (confirm(`Are you sure you want to remove ${name}?`)) {
            const callback = () => {
                addToastAlert(AlertVariant.success, `User "${name}" was successfully deleted`);
                setRefreshCounter(refreshCounter + 1);
            }

            deleteUser({ user: name }, callback);
        }
    }

    return (
        <Card>
            <NewUserModal isOpen={isNewUserModalOpen} setOpen={setNewUserModalOpen} />
            <CardBody>
                <Split>
                    <SplitItem>
                        <Link to="/">
                            <Button variant={ButtonVariant.secondary}>Go back</Button>
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
                    rows={data}
                    columns={COLUMNS}
                    isLoading={isLoading}
                    actions={[{
                        label: 'Remove',
                        onClick: user => deleteUserAction(user),
                        buttonProps: {
                            variant: ButtonVariant.danger
                        }
                    }]}
                    sortBy={null}
                    onSort={() => { }}
                    page={1}
                    perPage={20}
                    itemCount={data?.length}
                    onSetPage={() => { }}
                    onPerPageSelect={() => { }}
                />
            </CardBody>
        </Card>
    )
};

export default UserManagementPage;
