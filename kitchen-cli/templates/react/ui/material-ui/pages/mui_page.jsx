import React from "react";
import { withTracker, createContainer } from "meteor/react-meteor-data";
import { Typography } from "@material-ui/core";
import { Box } from "@material-ui/core";

/*IMPORTS*/


export function TEMPLATE_NAME(props) {
  React.useEffect(() => {
    Meteor.defer(function () {
      globalOnRendered();
    });
  }, []);

  return (
    <React.Fragment>
      <Typography component="h1" variant="h4">
        <Box component="span" fontWeight="fontWeightRegular">
          Welcome to Acre Africa Policy Management - HARD CODED
        </Box>
      </Typography>

      <Box mt={2} mb={4}>
        <Typography component="p" gutterBottom>
          We manage policy lifecycle workflows on blockchain  - HARD CODED
        </Typography>
      </Box>

      <div style={{ display: "grid", gridGap: "8px", gridTemplateColumns: "1fr 1fr 1fr" }}>
        <Card />
        <Card />
        <Card />
      </div>
    </React.Fragment>
  );
}

export const TEMPLATE_NAMEContainer = withTracker(function (props) {
  /*SUBSCRIPTIONS*/
})(TEMPLATE_NAME);
