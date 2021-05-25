import React from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { Typography, Box, ButtonBase, FormHelperText } from "@material-ui/core";
import { yupResolver } from "@hookform/resolvers/yup";
import styled from "styled-components";
import PropTypes from "prop-types";

// Temporary hard-coded path...
import { theme } from "/imports/ui/stylesheets/framework/mui-theme/theme.js";

FileUpload.propTypes = {
  onSubmit: PropTypes.func,
};

FileUpload.defaultProps = {
  onSubmit: (data) => {
    const file = data.policy[0];
    window.alert(`File: ${file.name} uploaded successfully`);
  },
};

const supportedFormats = [
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/plain",
];
const FILE_SIZE_LIMIT = 1000 * 1024;

const schema = Yup.object().shape({
  policy: Yup.mixed()
    .test("required", "File is required", (value) => {
      return value.length > 0;
    })
    .test("size", "File size is too large", (value) => {
      if (value.length === 0) {
        return false;
      }
      return value[0].size <= FILE_SIZE_LIMIT;
    })
    .test(
      "type",
      "Unsupported file format. Supported formats: .csv, .xls, .xlsx, .txt",
      (value) => {
        if (value.length === 0) {
          return false;
        }
        return supportedFormats.includes(value[0].type);
      }
    ),
});

export function FileUpload({ onSubmit }) {
  const { handleSubmit, formState, trigger, register, setValue } = useForm({
    resolver: yupResolver(schema),
  });

  const { errors } = formState;

  const handleChange = async (event) => {
    const file = event.target.files;
    setValue("policy", file);
    const isValid = await trigger("policy");

    if (isValid) {
      handleSubmit(onSubmit)();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box display="flex" alignItems="center">
        <ButtonBase>
          <Label htmlFor="file-upload">
            <Box mr={1}>
              <img src="images/file-upload.svg" />
            </Box>
            <Box>
              <Typography component="span" variant="body1">
                <Box fontWeight="fontWeightRegular">Upload file</Box>
              </Typography>
            </Box>
          </Label>
          <FileUploadInput
            id="file-upload"
            type="file"
            {...register("policy", { required: true })}
            onChange={handleChange}
          />
        </ButtonBase>
      </Box>
      <Box my={1}>
        <FormHelperText error> {errors?.policy?.message} </FormHelperText>
      </Box>
    </form>
  );
}

const Label = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${theme.shadows[5]};
  padding: ${theme.spacing(1, 2)};
  text-transform: uppercase;
  border-radius: ${theme.shape.borderRadius}px;
  width: 200px;
  &:hover {
    cursor: pointer;
    background-color: ${theme.palette.grey[200]};
  }
`;

const FileUploadInput = styled.input`
  display: none;
`;
