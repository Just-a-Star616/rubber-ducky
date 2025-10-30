
import React from 'react';
import { PermissionNode, PermissionLevel } from '../../types';

interface PermissionTreeProps {
  nodes: PermissionNode[];
  permissions: Record<string, PermissionLevel>;
  onPermissionChange: (nodeId: string, level: PermissionLevel) => void;
  level?: number;
}

const PermissionChoice: React.FC<{
  nodeId: string;
  currentLevel: PermissionLevel;
  onPermissionChange: (nodeId: string, level: PermissionLevel) => void;
}> = ({ nodeId, currentLevel, onPermissionChange }) => {
  const levels: { value: PermissionLevel; label: string }[] = [
    { value: 'hidden', label: 'Hidden' },
    { value: 'view', label: 'View' },
    { value: 'edit', label: 'Edit' },
  ];

  return (
    <div className="flex items-center gap-1 rounded-lg bg-gray-200 dark:bg-gray-900 p-1">
      {levels.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => onPermissionChange(nodeId, value)}
          className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
            currentLevel === value
              ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-300 shadow'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

const PermissionTree: React.FC<PermissionTreeProps> = ({
  nodes,
  permissions,
  onPermissionChange,
  level = 0,
}) => {
  return (
    <div className="space-y-2">
      {nodes.map(node => (
        <div key={node.id}>
          <div
            className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50"
            style={{ paddingLeft: `${0.5 + level * 1.5}rem` }}
          >
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{node.name}</span>
            <PermissionChoice
              nodeId={node.id}
              currentLevel={permissions[node.id] || 'hidden'}
              onPermissionChange={onPermissionChange}
            />
          </div>
          {node.children && node.children.length > 0 && (
            <PermissionTree
              nodes={node.children}
              permissions={permissions}
              onPermissionChange={onPermissionChange}
              level={level + 1}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default PermissionTree;