import React from "react";

interface SectionContainerProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const SectionContainer: React.FC<SectionContainerProps> = ({
  title,
  children,
  className = "",
}) => (
  <section
    className={`bg-white dark:bg-muted rounded-2xl shadow-md p-8 mb-10 border border-border ${className}`}
  >
    {title && (
      <>
        <h2 className="text-2xl font-bold mb-2 tracking-tight text-primary">
          {title}
        </h2>
        <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full mb-6" />
      </>
    )}
    {children}
  </section>
); 