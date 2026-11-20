import type { ValidationError } from "../types";

export interface StepErrorsProps {
  errors: ValidationError[];
}

export function StepErrors({ errors }: StepErrorsProps) {
  if (errors.length === 0) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      data-testid="step-errors"
      className="cp-step-errors"
    >
      <div className="cp-step-errors__header">
        <span className="cp-step-errors__icon" aria-hidden="true">
          !
        </span>
        <strong className="cp-step-errors__title">
          Resolve before advancing
        </strong>
      </div>
      <ul className="cp-step-errors__list">
        {errors.map((err, index) => (
          <li
            key={`${err.step}-${err.field}-${index}`}
            className="cp-step-errors__item"
          >
            {err.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
