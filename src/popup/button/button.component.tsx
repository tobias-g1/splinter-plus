import React from 'react';
import './button.component.scss';

export enum ButtonType {
  STROKED = 'stroked',
  RAISED = 'raised',
  IMPORTANT = 'important',
  DEFAULT = 'default',
}

export interface ButtonProps {
  onClick: () => void;
  label: string;
  skipLabelTranslation?: boolean;
  labelParams?: string[];
  type?: ButtonType;
  fixToBottom?: boolean;
}

const ButtonComponent = (props: ButtonProps) => {
  return (
    <button
      className={`submit-button ${
        props.type ? props.type : ButtonType.DEFAULT
      } ${props.fixToBottom ? 'fix-to-bottom' : ''}`}
      onClick={props.onClick}>
      <div className="button-label">
        {props.skipLabelTranslation
          ? props.label
          : chrome.i18n.getMessage(props.label, props.labelParams)}{' '}
      </div>
    </button>
  );
};

export default ButtonComponent;
