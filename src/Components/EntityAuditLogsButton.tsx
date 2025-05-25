import React, { useState } from 'react';
import { Button, IconButton, Tooltip } from '@mui/material';
import { History as HistoryIcon } from '@mui/icons-material';
import { useLocalStorage } from "../hooks/useLocalStorage";
import EntityAuditLogsModal from './EntityAuditLogsModal';

interface EntityAuditLogsButtonProps {
  entityType: string;
  buttonVariant?: 'icon' | 'text' | 'outlined' | 'contained';
  iconColor?: string;
  buttonSize?: 'small' | 'medium' | 'large';
  tooltipPlacement?: 'top' | 'right' | 'bottom' | 'left';
}

const EntityAuditLogsButton: React.FC<EntityAuditLogsButtonProps> = ({
  entityType,
  buttonVariant = 'icon',
  iconColor = 'primary',
  buttonSize = 'small',
  tooltipPlacement = 'top'
}) => {
  const [auditLogOpen, setAuditLogOpen] = useState(false);
  const { storedValue: authToken } = useLocalStorage<string>("token", "");

  if (buttonVariant === 'icon') {
    return (
      <>
        <Tooltip title={`View ${entityType} Audit Logs`} placement={tooltipPlacement}>
          <IconButton
            size={buttonSize}
            onClick={() => setAuditLogOpen(true)}
            color={iconColor as any}
          >
            <HistoryIcon />
          </IconButton>
        </Tooltip>

        {auditLogOpen && (
          <EntityAuditLogsModal
            entityType={entityType}
            open={auditLogOpen}
            onClose={() => setAuditLogOpen(false)}
            authToken={authToken}
          />
        )}
      </>
    );
  }

  return (
    <>
      <Button
        variant={buttonVariant as any}
        size={buttonSize}
        onClick={() => setAuditLogOpen(true)}
        color={iconColor as any}
        startIcon={<HistoryIcon />}
      >
        View Audit Logs
      </Button>

      {auditLogOpen && (
        <EntityAuditLogsModal
          entityType={entityType}
          open={auditLogOpen}
          onClose={() => setAuditLogOpen(false)}
          authToken={authToken}
        />
      )}
    </>
  );
};

export default EntityAuditLogsButton;