import React from 'react';
import { EmptyState, EmptyStateIcon, Title } from '@patternfly/react-core';
import CubesIcon from '@patternfly/react-icons/dist/esm/icons/cubes-icon';

const TableEmptyState = ({ children = "No items", icon = CubesIcon }) => (
    <EmptyState>
        <EmptyStateIcon icon={icon} />
        <Title headingLevel="h5" size="lg">
            {children}
        </Title>
    </EmptyState>
)

export default TableEmptyState;
