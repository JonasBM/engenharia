import { Box, Typography } from "@mui/material";

import React from "react";

const ContentLine = ({ value }: { value: string }) => {
  return (
    <Box>
      <Typography component="div" variant="body2">
        {value}
      </Typography>
    </Box>
  );
};

const ConnectionsPopover = ({
  connectionNames,
}: {
  connectionNames: string[];
}) => {
  return (
    <Box flexDirection="row" padding={2}>
      <Box>
        <Typography component="div" variant="body1" fontWeight={"bold"}>
          Conexões calculadas
        </Typography>
      </Box>
      {connectionNames &&
        connectionNames.map((_fitting_name, _index) => (
          <ContentLine key={_index} value={_fitting_name} />
        ))}
    </Box>
  );
};

export default ConnectionsPopover;
