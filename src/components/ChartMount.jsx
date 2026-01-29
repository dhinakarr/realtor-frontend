import React, { useEffect, useState } from "react";

export default function ChartMount({ children }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 0);
  }, []);

  return show ? children : null;
}
