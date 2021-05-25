import React from "react";
import { withTracker, createContainer } from "meteor/react-meteor-data";
import { Box, Typography, TextField, IconButton, Paper, Button } from "@material-ui/core";
import * as Yup from "yup";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import AddCircleOutlineOutlinedIcon from "@material-ui/icons/AddCircleOutlineOutlined";
import RemoveCircleOutlineIcon from "@material-ui/icons/RemoveCircleOutline";
import { yupResolver } from "@hookform/resolvers/yup";
import styled from "styled-components";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";

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
          Create New Policy - Step 2
        </Box>
      </Typography>

      <Paper elevation={3} style={{ padding: "16px" }}>
        <Step2 />
      </Paper>
    </React.Fragment>
  );
}


const LIST_OF_FIELDS = [
  {
    name: "propertyId",
    label: "Property Id",
    type: "text",
    validationType: "string",
    validations: [
      {
        type: "max",
        params: [255, "Property id cannot be longer than 255 characters"],
      },
      {
        type: "required",
        params: ["Property id is required"],
      },
      {
        type: "default",
        params: [""],
      },
    ],
  },
  {
    name: "propertyLocation",
    label: "Property location",
    validationType: "string",
    type: "text",
    validations: [
      {
        type: "max",
        params: [255, "Property location cannot be longer than 255 characters"],
      },
      {
        type: "required",
        params: ["Property location is required"],
      },
      {
        type: "default",
        params: [""],
      },
    ],
  },
  {
    name: "additionalInformation",
    label: "Additional information",
    type: "text",
    validationType: "string",
    validations: [
      {
        type: "max",
        params: [255, "Additional information cannot be longer than 255 characters"],
      },
      {
        type: "default",
        params: [""],
      },
    ],
  }
];

const step2Schema = Yup.object().shape({
  properties: Yup.array()
    .of(
      Yup.object().shape({
        propertyId: Yup.string().max(255).required("Property id is required"),
        location: Yup.string()
          .max(255)
          .required("Property location is required"),
      })
    )
    .default([{ propertyId: "", location: "" }])
    .required(),
  additionalInformation: Yup.string().max(255).default(""),
});

const renderHelpers = {
  date: function renderDatePickerField({ label, errors, field, ...rest }) {
    return (
      <MuiPickersUtilsProvider utils={DateFnsUtils} key={label}>
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
        inputRef={field.ref}
        error={Boolean(errors[field.name])}
        helperText={errors[field.name] && errors[field.name]?.message}
        margin="normal"
        label={label}
        fullWidth
        {...field}
      />
    );
  },
};

export const Step2 = ({ state = {}, onSubmit: onStepSubmit }) => {
  const { control, handleSubmit, formState } = useForm({
    resolver: yupResolver(step2Schema),
    mode: "onBlur",
    defaultValues: { ...step2Schema.cast(), ...state },
  });

  const fieldArrayName = "properties";

  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldArrayName, // unique name for your Field Array
  });

  const { errors } = formState;

  const handleClick = () => {
    append({propertyId: '', location: ''});
  };

  const onSubmit = (data) => {
    onStepSubmit(data);
    console.log("TODO HANDLER");
  };

  const renderArrayField = (props, { field }) => {
    return (
    <TextField margin="normal" {...props} {...field} />
    )
  };

  const renderTextField = ({ label }, { field }) => {
    return (
      <TextField
        error={Boolean(errors[field.name])}
        helperText={errors[field.name] && errors[field.name]?.message}
        margin="normal"
        label={label}
        fullWidth
        {...field}
      />
    );
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
          properties.
        </Typography>
      </Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        <GridContainer>
          <Box gridArea="1/1/2/2" alignSelf="center">
            <Typography component="p" variant="body1" gutterBottom>
              <Box component="span" fontWeight="fontWeightBold">
                Property Id
              </Box>
            </Typography>
          </Box>
          <Box gridArea="1/2/2/3" alignSelf="center">
            <Typography component="p" variant="body1" gutterBottom>
              <Box component="span" fontWeight="fontWeightBold">
                Property location
              </Box>
            </Typography>
          </Box>
          <Box gridArea="2/1/3/3">
            {fields.map((field, index) => {
              const { id, ...restFields } = field;
              const fieldNames = Object.keys(restFields);

              return (
                <InputsContainer key={field.id}>
                  {fieldNames.map((fieldName) => (
                      <Controller
                        key={`${field.id}-${fieldName}`}
                        name={`${fieldArrayName}[${index}][${fieldName}]`}
                        control={control}
                        render={(controlProps) =>
                          renderArrayField(
                            {
                              error: Boolean(
                                errors[fieldArrayName] &&
                                  errors[fieldArrayName][index][fieldName]
                              ),
                              helperText:
                                errors[fieldArrayName] &&
                                errors[fieldArrayName][index][fieldName]
                                  ?.message,
                              label: "Property id",
                              index: index,
                            },
                            controlProps
                          )
                        }
                      />
                  ))}
                  {fields.length === 1 ? null : (
                    <Box alignSelf="self-end">
                      <IconButton
                        aria-label="remove"
                        onClick={() => remove(index)}
                        size="small"
                      >
                        <RemoveCircleOutlineIcon />
                      </IconButton>
                    </Box>
                  )}
                </InputsContainer>
              );
            })}
          </Box>
        </GridContainer>
        <Box display="flex" justifyContent="flex-end" mr="55px">
          <IconButton
            aria-label="remove"
            onClick={handleClick}
            style={{ height: "50px", alignSelf: "center" }}
          >
            <AddCircleOutlineOutlinedIcon />
          </IconButton>
        </Box>
        <Box width="100%" pr="65px">
          <Controller
            name={"additionalInformation"}
            control={control}
            render={(controlProps) =>
              renderTextField({ label: "Additional information" }, controlProps)
            }
          />
        </Box>
        <Box m="16px 65px 16px 0" display="flex" justifyContent="space-between">
          <IconButton aria-label="back" onClick={() => {}}>
            <ArrowBackIcon />
          </IconButton>
          <StyledButton
            type="submit"
            variant="contained"
            color="primary"
            size="large"
          >
            Next
          </StyledButton>
        </Box>
      </form>
    </React.Fragment>
  );
};

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: 50px 1fr;
`;

export const InputsContainer = styled.div`
  display: grid;
  grid-auto-rows: 1fr;
  grid-template-columns: repeat(2, 1fr) 30px;
  grid-column-gap: 35px;
`;

const StyledButton = styled(Button)`
  max-width: 230px;
  box-shadow: ${theme.shadows[5]};
`;

export const TEMPLATE_NAMEContainer = withTracker(function (props) {
  /*SUBSCRIPTIONS*/
})(TEMPLATE_NAME);
