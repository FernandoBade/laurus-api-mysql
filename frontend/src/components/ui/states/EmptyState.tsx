"use client";

import React from "react";

type EmptyStateProps = {
  message: string;
  className?: string;
};

const EmptyState = ({ message, className = "" }: EmptyStateProps) => (
  <p className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}>
    {message}
  </p>
);

export default EmptyState;
