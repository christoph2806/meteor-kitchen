import React from "react";
import { withTracker } from "meteor/react-meteor-data";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  Button
} from "@material-ui/core";
import styled from "styled-components";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";

/*IMPORTS*/


const renderHelpers = {
  text: function renderTextField({ label, value }) {
    return (
      <TextField
        key={label}
        margin="normal"
        label={label}
        defaultValue={value}
        disabled
        fullWidth
      />
    )
  },
  date: function renderDatePickerField({ label, value }) {
    return (
      <MuiPickersUtilsProvider utils={DateFnsUtils} key={label}>
        <KeyboardDatePicker
          margin="normal"
          label={label}
          format="dd/MM/yyyy"
          variant="inline"
          KeyboardButtonProps={{
            "aria-label": "change date",
          }}
          onChange={() => {}}
          value={value}
          helperText=""
          invalidDateMessage=""
          disabled
          readOnly
          fullWidth
        />
      </MuiPickersUtilsProvider>
    );
  }

}

const LIST_OF_FIELDS = [
  {
    name: "policyholderName",
    label: "Policyholder Name",
    value: "John Doe",
    type: "text",
  },
  {
    name: "postalAddress",
    label: "Postal address",
    value: "221B Baker Street",
    type: "text",
  },
  {
    name: "policyNumber",
    label: "Policy number",
    value: "AB2314CD",
    type: "text",
  },
  {
    name: "dateOfBirth",
    label: "Date of birth",
    value: "21/03/2020",
    type: "date"
  },
  {
    name: "propertyId",
    label: "Property Id",
    value: "DNDNUFFN 2314",
    type: "text",
    nested: [
      { value: "DNDNUFFN 2316" },
      { value: "DNDNUFFN 2317" },
      { value: "DNDNUFFN 2318" },
    ],
  },
  {
    name: "propertyLocation",
    label: "Property location",
    value: "ST Ville 132/31",
    type: "text",
    nested: [
      { value: "ST Ville 132/31" },
      { value: "ST Ville 132/33" },
      { value: "ST Ville 132/34" },
    ],
  },
];
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
          Create New Policy - Summary
        </Box>
      </Typography>

      <Paper elevation={3} style={{ padding: "16px" }}>
        <Summary />
      </Paper>
    </React.Fragment>
  );
}

export const Summary = ({ state = {}, onSubmit }) => {
  const renderField = (field) => {
    if (!renderHelpers[field.type]) {
      console.error(`Type ${field.type} is not supported type and it was ignored during render. Supported types are: [${Object.keys(renderHelpers).join(', ')}]`)
      return null
    }
    return renderHelpers[field.type](field)
  }
  return (
    <div>
      <Box mb={4}>
        <Typography component="h3" variant="h4" gutterBottom>
          Summary
        </Typography>
      </Box>
      <FieldContainer>
        {LIST_OF_FIELDS.map(renderField)}
      </FieldContainer>
      {/* {state.step2.properties.map((property, index) => (
  		<InputsContainer key={property.propertyId}>
  			<TextField name={`properties[${index}].propertyId`} margin="normal" label="Property Id" disabled defaultValue={property.propertyId} />
  			<TextField name={`properties[${index}].location`} margin="normal" label="Property location" disabled defaultValue={property.location} />
  		</InputsContainer>
  		))} */}
      <Box width="100%">
        <TextField
          margin="normal"
          fullWidth
          label="Additional information"
          name="additionalInformation"
          disabled
          defaultValue="Additional information example value"
        />
      </Box>
      <Box my={2} display="flex" justifyContent="space-between">
        <IconButton aria-label="back" onClick={() => {}}>
          <ArrowBackIcon />
        </IconButton>
        <StyledButton
          variant="contained"
          color="primary"
          size="large"
          onClick={onSubmit}
        >
          Submit
        </StyledButton>
      </Box>
    </div>
  );
};

export const InputsContainer = styled.div`
  display: grid;
  grid-auto-rows: 1fr;
  grid-template-columns: repeat(2, 1fr);
  grid-column-gap: 35px;
`;


const StyledButton = styled(Button)`
  max-width: 230px;
  box-shadow: ${theme.shadows[5]};
`;

const FieldContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 16px;
`;


export const TEMPLATE_NAMEContainer = withTracker(function (props) {
  /*SUBSCRIPTIONS*/
})(TEMPLATE_NAME);
