import React from "react";
import { AnatomicalBody, AnatomicalBodyProps } from "./AnatomicalBody";

export const AnatomicalSvgFront: React.FC<AnatomicalBodyProps> = (props) => (
  <AnatomicalBody {...props} view="front" />
);
