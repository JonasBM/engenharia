import React, { useEffect, useState } from "react";

const IGC = () => {
  let mounted = false;

  useEffect(() => {
    if (!mounted) {
      mounted = true;
      console.log("IGC");
    }
  }, []);

  return <div>IGC</div>;
};

export default IGC;
