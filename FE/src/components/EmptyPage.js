import React from 'react';
import {
    Title,
    Button,
    EmptyState,
    EmptyStateIcon
} from '@patternfly/react-core';
import CubesIcon from '@patternfly/react-icons/dist/esm/icons/cubes-icon';

const EmptyPage = ({ text = 'Táto stránka neexistuje' }) => (
    <EmptyState>
        <EmptyStateIcon icon={CubesIcon} />
        <Title headingLevel="h4" size="lg">
            {text}
        </Title>
        <Button variant="primary" onClick={() => window.location = '/'}>Späť na hlavnú stránku</Button>
    </EmptyState>
)

export default EmptyPage;
