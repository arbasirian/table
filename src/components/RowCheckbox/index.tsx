import React from 'react';

interface Props {
  name: string;
  isChecked: boolean;
  shouldPrevent?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
export const RowCheckbox: React.FC<Props> = ({
  name,
  isChecked,
  shouldPrevent,
  onChange,
}) => {
  return (
    <input
      className="peransa-table-checkbox has-hover"
      type="checkbox"
      id={`checkbox-id-${name}`}
      name={`checkbox-name-${name}`}
      checked={isChecked}
      onClick={(e) => {
        if (shouldPrevent) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      onChange={onChange}
    />
  );
};
