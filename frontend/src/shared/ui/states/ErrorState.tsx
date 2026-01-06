"use client";

import React from "react";
import Alert from "@/components/ui/alert/Alert";

type ErrorStateProps = {
  title: string;
  message: string;
};

const ErrorState = ({ title, message }: ErrorStateProps) => (
  <Alert variant="error" title={title} message={message} />
);

export default ErrorState;
