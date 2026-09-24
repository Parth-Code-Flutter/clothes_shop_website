"use client";

import React, {
  useEffect,
  useRef,
  type ReactNode,
  type HTMLAttributes,
} from "react";

interface MagnetProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: number;
  disabled?: boolean;
  magnetStrength?: number;
  activeTransition?: string;
  inactiveTransition?: string;
  wrapperClassName?: string;
  innerClassName?: string;
}

/** React Bits Magnet — pointer pull, disabled when reduced-motion. */
const Magnet: React.FC<MagnetProps> = ({
  children,
  padding = 100,
  disabled = false,
  magnetStrength = 2,
  activeTransition = "transform 0.3s ease-out",
  inactiveTransition = "transform 0.5s ease-in-out",
  wrapperClassName = "",
  innerClassName = "",
  ...props
}) => {
  const magnetRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(false);

  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;

    if (disabled) {
      inner.style.transform = "translate3d(0px, 0px, 0)";
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!magnetRef.current || !innerRef.current) return;

      const { left, top, width, height } =
        magnetRef.current.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;

      const distX = Math.abs(centerX - e.clientX);
      const distY = Math.abs(centerY - e.clientY);

      if (distX < width / 2 + padding && distY < height / 2 + padding) {
        activeRef.current = true;
        innerRef.current.style.transition = activeTransition;
        const offsetX = (e.clientX - centerX) / magnetStrength;
        const offsetY = (e.clientY - centerY) / magnetStrength;
        innerRef.current.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
      } else if (activeRef.current) {
        activeRef.current = false;
        innerRef.current.style.transition = inactiveTransition;
        innerRef.current.style.transform = "translate3d(0px, 0px, 0)";
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [
    padding,
    disabled,
    magnetStrength,
    activeTransition,
    inactiveTransition,
  ]);

  return (
    <div
      ref={magnetRef}
      className={wrapperClassName}
      style={{ position: "relative", display: "inline-block" }}
      {...props}
    >
      <div
        ref={innerRef}
        className={innerClassName}
        style={{ willChange: "transform" }}
      >
        {children}
      </div>
    </div>
  );
};

export default Magnet;
