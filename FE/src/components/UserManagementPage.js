import React from 'react';
import {
    Card, CardBody, TextContent, Text, TextVariants, AlertVariant, ButtonVariant
} from '@patternfly/react-core';
import { useAction, useFetch } from '../helpers/Hooks';
import Table from './Table';
import Username from './Username';

const UserManagementPage = ({ addToastAlert, userInfo }) => {
    const COLUMNS = [
        { label: 'Používateľské meno', link: user => `/users/${user}` },
        { label: 'Email' },
        { label: 'Počet otázok' },
        { label: 'Počet odpovedí' },
        { label: 'Body' },
        { label: 'Registrácia', type: 'date' },
        { label: 'Rola' },
        { label: 'Posledná aktivita', type: 'date' }
    ];

    const [{ data, meta }, isLoading, refresh, { sortBy, onSort }, { page, perPage, onSetPage, onPerPageSelect }] = useFetch('/allUsers', userInfo, sortIndex => sortIndex + 1);

    const deleteUser = useAction('/removeUser', userInfo);

    const deleteUserAction = name => {
        if (confirm(`Naozaj chcete odstrániť používateľa ${name}? Otázky, odpovede a kurzy vytvorené používateľom vymazané nebudú.`)) {
            const callback = () => {
                addToastAlert(AlertVariant.success, `Používateľ "${name}" bol odstránený`);
                refresh();
            }

            deleteUser({ user: name }, callback);
        }
    }

    return (
        <Card>
            <CardBody>
                <Table
                    title={
                        <TextContent>
                            <Text component={TextVariants.h1}>
                                Registrovaní používatelia
                            </Text>
                        </TextContent>
                    }
                    rows={data?.map(([preferredBadge, username, ...rest]) => [<Username achievementId={preferredBadge} key={username}>{username}</Username>, ...rest])}
                    columns={COLUMNS}
                    isLoading={isLoading}
                    actions={[{
                        label: 'Odstrániť',
                        onClick: user => deleteUserAction(user.key),
                        buttonProps: {
                            variant: ButtonVariant.danger
                        }
                    }]}
                    sortBy={sortBy}
                    onSort={onSort}
                    page={page}
                    perPage={perPage}
                    itemCount={meta?.itemCount}
                    onSetPage={onSetPage}
                    onPerPageSelect={onPerPageSelect}
                />
            </CardBody>
        </Card>
    )
};

export default UserManagementPage;
