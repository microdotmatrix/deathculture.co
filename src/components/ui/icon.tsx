"use client";

import { Icon as Iconify } from "@iconify/react";

export const Icon = ({
  icon,
  className,
  ...props
}: {
  icon: string;
  className?: string;
}) => {
  return <Iconify icon={icon} className={className} {...props} />;
};
