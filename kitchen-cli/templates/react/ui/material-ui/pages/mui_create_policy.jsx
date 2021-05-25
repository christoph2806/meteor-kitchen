import React from "react";
import { withTracker, createContainer } from "meteor/react-meteor-data";
import * as Yup from "yup";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box } from "@material-ui/core";
import { Typography } from "@material-ui/core";
import { TextField } from "@material-ui/core";
import { Paper } from "@material-ui/core";
import { Button } from "@material-ui/core";
import DateFnsUtils from "@date-io/date-fns";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import styled from "styled-components";

/*IMPORTS*/

function createYupSchema(schema, config) {
  const { name, validationType, validations = [] } = config;
  if (!Yup[validationType]) {
    return schema;
  }

  let validator = Yup[validationType]();
  validations.forEach((validation) => {
    const { params, type } = validation;
    if (!validator[type]) {
      return;
    }
    validator = validator[type](...params);
  });
  schema[name] = validator;
  return schema;
}


const LIST_OF_FIELDS = [
  {
    name: "policyholderName",
    label: "Policyholder Name",
    type: "text",
    validationType: "string",
    validations: [
      {
        type: "max",
        params: [255, "Policyholder name cannot be longer than 255 characters"],
      },
      {
        type: "required",
        params: ["Policyholder name is required"],
      },
      {
        type: "trim",
        params: [],
      },
      {
        type: "default",
        params: [""],
      },
    ],
  },
  {
    name: "postalAddress",
    label: "Postal address",
    validationType: "string",
    type: "text",
    validations: [
      {
        type: "max",
        params: [255, "Postal address cannot be longer than 255 characters"],
      },
      {
        type: "required",
        params: ["Postal address is required"],
      },
      {
        type: "trim",
        params: [],
      },
      {
        type: "default",
        params: [""],
      },
    ],
  },
  {
    name: "policyNumber",
    label: "Policy number",
    type: "text",
    validationType: "string",
    validations: [
      {
        type: "max",
        params: [255, "Policy number cannot be longer than 255 characters"],
      },
      {
        type: "required",
        params: ["Policy number is required"],
      },
      {
        type: "trim",
        params: [],
      },
      {
        type: "default",
        params: [""],
      },
    ],
  },
  {
    name: "dateOfBirth",
    label: "Date of birth",
    defaultValue: "",
    type: "date",
    validationType: "date",
    validations: [
      {
        type: "nullable",
        params: [],
      },
      {
        type: "transform",
        params: [(curr, original) => (original === "" ? null : curr)],
      },
      {
        type: "typeError",
        params: ["Invalid date format. Valid format is dd/MM/yyyy"],
      },
      {
        type: "max",
        params: [new Date(), "Cannot set current or future date"],
      },
      {
        type: "required",
        params: ["Date of birth is required"],
      },
      {
        type: "default",
        params: [() => new Date()],
      },
    ],
  },
];

const renderHelpers = {
  date: function renderDatePickerField({ label, errors, field, ...rest }) {
    return (
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          margin="normal"
          label={label}
          format="dd/MM/yyyy"
          error={Boolean(errors[field.name])}
          helperText={errors[field.name] && errors[field.name]?.message}
          disableFuture
          KeyboardButtonProps={{
            "aria-label": "change date",
          }}
          fullWidth
          {...field}
        />
      </MuiPickersUtilsProvider>
    );
  },
  text: function renderTextField({ label, errors, field, ...rest }) {
    return (
      <TextField
        error={Boolean(errors[field.name])}
        helperText={errors[field.name] && errors[field.name]?.message}
        margin="normal"
        label={label}
        fullWidth
        inputRef={field.ref}
        {...field}
      />
    );
  },
};

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
          Create New Policy  - HARD CODED
        </Box>
      </Typography>

      <Paper elevation={3} style={{ padding: "16px" }}>
        <Step1 />
      </Paper>
    </React.Fragment>
  );
}

const Step1 = ({ state = {}, onSubmit = () => {} }) => {
  const yupSchema = React.useMemo(() => {
    return LIST_OF_FIELDS.reduce(createYupSchema, {});
  }, []);
  const schema = React.useMemo(() => {
    return Yup.object().shape(yupSchema);
  }, []);

  const { handleSubmit, formState, control } = useForm({
    resolver: yupResolver(schema),
    mode: "onBlur",
    defaultValues: { ...schema.cast(), ...state },
  });
  const {errors} = formState

  const onFormSubmit = (data) => {
    console.log(data);
  };

  const renderField = (field) => {
    if (!renderHelpers[field.type]) {
      console.error(
        `Type ${
          field.type
        } is not supported type and it was ignored during render. Supported types are: [${Object.keys(
          renderHelpers
        ).join(", ")}]`
      );
      return null;
    }
    return renderHelpers[field.type]({ ...field, errors });
  };

  return (
    <React.Fragment>
      <Box my={4}>
        <Typography component="p" variant="body1" gutterBottom>
          You are about to create a new policy. Please enter the details of the
          policyholder  - HARD CODED
        </Typography>
      </Box>
      <StyledForm onSubmit={handleSubmit(onFormSubmit)}>
      <FieldContainer>
          {LIST_OF_FIELDS.map((field) => (
            <Controller
              key={field.name}
              name={field.name}
              control={control}
              test={null}
              render={(controlProps) => renderField({ ...field, ...controlProps })}
            />
          ))}
        </FieldContainer>

        <Box my={2} display="flex" justifyContent="flex-end">
          <StyledButton
            type="submit"
            variant="contained"
            color="primary"
            size="large"
          >
            Next
          </StyledButton>
        </Box>
      </StyledForm>
    </React.Fragment>
  );
};

const StyledButton = styled(Button)`
  max-width: 230px;
  box-shadow: ${theme.shadows[5]};
`;

const StyledForm = styled.form`
  display: grid;
`;

const FieldContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 16px;
`;


export const TEMPLATE_NAMEContainer = withTracker(function (props) {
  /*SUBSCRIPTIONS*/
})(TEMPLATE_NAME);
