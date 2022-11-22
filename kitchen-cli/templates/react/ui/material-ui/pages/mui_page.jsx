import React from "react";
import { withTracker, createContainer } from "meteor/react-meteor-data";
import {Card} from "/imports/ui/mui-plugins/card/card.jsx";
//WIP: Fix this import manually, set it to
// "/imports/ui/stylesheets/framework/mui-plugins/card/card"

/*IMPORTS*/

export function TEMPLATE_NAME(props) {
  React.useEffect(() => {
    Meteor.defer(function () {
      globalOnRendered();
    });
  }, []);

  return (
    <React.Fragment>
      <p>Hard coded content all below are components</p>
      <Card />
    </React.Fragment>
  );
}

export const TEMPLATE_NAMEContainer = withTracker(function (props) {
  /*SUBSCRIPTIONS*/
})(TEMPLATE_NAME);
