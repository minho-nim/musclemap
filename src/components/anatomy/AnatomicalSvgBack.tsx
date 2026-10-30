import React from "react";
import { AnatomicalBody, AnatomicalBodyProps } from "./AnatomicalBody";

export const AnatomicalSvgBack: React.FC<AnatomicalBodyProps> = (props) => (
  <AnatomicalBody {...props} view="back" />
);
