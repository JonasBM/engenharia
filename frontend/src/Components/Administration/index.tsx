import { Box, Container, Tab, Tabs } from "@mui/material";
import React, { useEffect } from "react";

import IGC from "Components/IGC";
import SHPAdmin from "./SHPAdmin";
import SPDA from "Components/SPDA";
import { documentTitles } from "myConstants";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Administration = () => {
  const [value, setValue] = React.useState(0);

  useEffect(() => {
    document.title = documentTitles.ADMIN;
    return () => {
      document.title = documentTitles.PORTAL;
    };
  }, []);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Container>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={value} onChange={handleChange} centered>
          <Tab label="SHP" />
          <Tab label="IGC" />
          <Tab label="SPDA" />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <SHPAdmin />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <IGC />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <SPDA />
      </TabPanel>
    </Container>
  );
};

export default Administration;
