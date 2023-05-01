import React from 'react';
import { EmptyState, EmptyStateIcon, Title } from '@patternfly/react-core';
import CubesIcon from '@patternfly/react-icons/dist/esm/icons/cubes-icon';

// component which renders a table if it has zero items, but this should not happen
// in our app as you cannot your own account
const TableEmptyState = ({ children = "No items", icon = CubesIcon }) => (
    <EmptyState>
        <EmptyStateIcon icon={icon} />
        <Title headingLevel="h5" size="lg">
            {children}
        </Title>
    </EmptyState>
)

export default TableEmptyState;
