import { useId, useRef, useState, type FocusEvent, type KeyboardEvent } from "react";

export interface TooltipProps {
  text: string;
  label?: string;
}

export function Tooltip({ text, label }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const openedByHoverRef = useRef(false);
  const pointerSnapshotRef = useRef({
    wasOpen: false,
    wasFocused: false,
    wasOpenedByHover: false,
  });
  const tooltipId = useId();

  const accessibleLabel = label ?? "More information";

  const handleMouseEnter = () => {
    if (!isOpen) {
      openedByHoverRef.current = true;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (!isFocused) {
      openedByHoverRef.current = false;
      setIsOpen(false);
    }
  };

  const handleFocus = () => {
    openedByHoverRef.current = false;
    setIsFocused(true);
    setIsOpen(true);
  };

  const handleBlur = (event: FocusEvent<HTMLSpanElement>) => {
    if (
      event.relatedTarget instanceof Node &&
      wrapperRef.current?.contains(event.relatedTarget)
    ) {
      return;
    }
    openedByHoverRef.current = false;
    setIsFocused(false);
    setIsOpen(false);
  };

  const handlePointerDown = () => {
    pointerSnapshotRef.current = {
      wasOpen: isOpen,
      wasFocused: isFocused,
      wasOpenedByHover: openedByHoverRef.current,
    };
  };

  const handleClick = () => {
    const { wasOpen, wasOpenedByHover } = pointerSnapshotRef.current;
    openedByHoverRef.current = false;

    if (wasOpen && !wasOpenedByHover) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Escape") {
      if (isOpen) {
        event.preventDefault();
        event.stopPropagation();
        openedByHoverRef.current = false;
        setIsOpen(false);
      }
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openedByHoverRef.current = false;
      setIsOpen(true);
    }
  };

  return (
    <span
      ref={wrapperRef}
      className="cp-tooltip"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onBlur={handleBlur}
    >
      <button
        type="button"
        className="cp-tooltip__trigger"
        aria-label={accessibleLabel}
        aria-expanded={isOpen}
        aria-describedby={isOpen ? tooltipId : undefined}
        onFocus={handleFocus}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        ?
      </button>
      {isOpen ? (
        <span id={tooltipId} role="tooltip" className="cp-tooltip__popup">
          {text}
        </span>
      ) : null}
    </span>
  );
}
