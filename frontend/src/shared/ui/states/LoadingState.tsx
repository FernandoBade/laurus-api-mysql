"use client";

import React from "react";

type LoadingStateProps = {
  message: string;
  className?: string;
};

const LoadingState = ({ message, className = "" }: LoadingStateProps) => (
  <p className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}>
    {message}
  </p>
);

export default LoadingState;
