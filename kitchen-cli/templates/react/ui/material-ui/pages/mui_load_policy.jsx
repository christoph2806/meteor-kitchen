import React, { useState } from 'react'
import { withTracker, createContainer } from "meteor/react-meteor-data";

import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Box,
  TableFooter,
  TablePagination,
  makeStyles, createStyles, useTheme, IconButton
} from '@material-ui/core'
import FirstPageIcon from '@material-ui/icons/FirstPage'
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft'
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight'
import LastPageIcon from '@material-ui/icons/LastPage'
import styled from 'styled-components'

/*IMPORTS*/


const table_headers = [
  "Name",
  "Policyholder Name",
  "Postal Address",
  "Policy Number",
  "Status",
];

const renderTableHeaders = (tableHeaders = []) => {
  return tableHeaders.map((tableHeader, index) => (
    <StyledTableCell
      key={tableHeader}
      align={index + 1 === tableHeaders.length ? "center" : "left"}
    >
      {tableHeader}
    </StyledTableCell>
  ));
};

function getProperty(propertyName, object) {
  var parts = propertyName.split("."),
    length = parts.length,
    i,
    property = object || this;

  for (i = 0; i < length; i++) {
    property = property[parts[i]];
    if (!property) {
      console.error(`Check property name: ${propertyName} as it is not defined in object: ${JSON.stringify(object)}`);
      return null;
    }
  }

  return property;
}

const renderTableData = (data, fieldNames = []) => {
  if (fieldNames.length <= 3) {
    console.warn("Please provide at least 3 field names");
    return null;
  }
  const [firstFieldName, ...restFieldNames] = fieldNames;

  if (fieldNames.some((fieldName) => !getProperty(fieldName, data))) {
    return null;
  }

  return (
    <TableRow
      key={data[firstFieldName]}
      hover
      onClick={() => {
        console.log("REDIRECT TO SPECIFIC POLICY");
      }}
    >
      <TableCell component="th" scope="row">
        {data[firstFieldName]}
      </TableCell>
      {restFieldNames.map((fieldName, index) => (
        <TableCell
          key={fieldName}
          align={index + 1 === restFieldNames.length ? "center" : "left"}
        >
          {getProperty(fieldName, data)}
        </TableCell>
      ))}
    </TableRow>
  );
};

const fields = [
  "name",
  "data.step1.policyholderName",
  "data.step1.postalAddress",
  "data.step1.policyNumber",
  "status",
];


const policies = [
  {
    id: 1,
    name: 'Acre Africa Policy',
    status: 'Draft',
    data: {
      step1: {
        policyholderName: 'James Bond',
        postalAddress: '221B Baker Street',
        policyNumber: 'DASDOK342',
        dateOfBirth: '1992-05-25',
      },
      step2: {
        properties: [
          { location: 'TEST 1', propertyId: 'ASDPLKJ234' },
          { location: 'TEST3', propertyId: 'zxc' },
        ],
        additionalInformation: 'TODO',
      },
    },
  },
  {
    id: 2,
    name: 'Acme America Policy',
    status: 'Draft',
    data: {
      step1: {
        policyholderName: 'James Holmes',
        postalAddress: '221B Wall Street',
        policyNumber: 'POKNW341',
        dateOfBirth: '1992-08-30',
      },
      step2: {
        properties: [],
        additionalInformation: 'TODO',
      },
    },
  },
  {
    id: 3,
    name: 'Winterfell Policy',
    status: 'Draft',
    data: {
      step1: {
        policyholderName: 'Mekhi Prosacco',
        postalAddress: 'Cambridgeshire Port Bruce 70313',
        policyNumber: 'DASDOK342',
        dateOfBirth: '1992-05-25',
      },
      step2: {
        properties: [
          { location: 'TEST 1', propertyId: 'ASDPLKJ234' },
          { location: 'TEST3', propertyId: 'zxc' },
        ],
        additionalInformation: 'TODO',
      },
    },
  },
]


const useStyles1 = makeStyles(theme =>
  createStyles({
    root: {
      flexShrink: 0,
      marginLeft: theme.spacing(2.5),
    },
  }),
)

export function TablePaginationActions(props) {
  const theme = useTheme()
  const classes = useStyles1()
  const { count, page, rowsPerPage, onChangePage } = props

  const handleFirstPageButtonClick = (event) => {
    onChangePage(event, 0)
  }

  const handleBackButtonClick = (event) => {
    onChangePage(event, page - 1)
  }

  const handleNextButtonClick = (event) => {
    onChangePage(event, page + 1)
  }

  const handleLastPageButtonClick = (event) => {
    onChangePage(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1))
  }

  return (
    <div className={classes.root}>
      <IconButton onClick={handleFirstPageButtonClick} disabled={page === 0} aria-label="first page">
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </div>
  )
}



export function TEMPLATE_NAME(props) {
  React.useEffect(() => {
    Meteor.defer(function () {
      globalOnRendered();
    });
  }, []);
  return (
    <React.Fragment>
        <LoadPolicy />
        {props.content}
    </React.Fragment>
  );
}


export const TEMPLATE_NAMEContainer = withTracker(function (props) {
  /*SUBSCRIPTIONS*/
})(TEMPLATE_NAME);


export const LoadPolicy = () => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }
  return (
    <React.Fragment>
      <Typography component="h1" variant="h4">
        <Box component="span" fontWeight="fontWeightRegular">
          Load policy
        </Box>
      </Typography>

      <Box my={2}>
        <Typography component="p" variant="body1">
          <Box component="span" fontWeight="fontWeightRegular">
            Here is a list of all policies in the system. You can also upload lists.
          </Box>
        </Typography>
      </Box>

      <Box my={2}>
        <FileUpload />
      </Box>

      <TableContainer component={Paper}>
        <Table aria-label="policy table">
        <TableHead>
            <TableRow>{renderTableHeaders(table_headers)}</TableRow>
          </TableHead>
          <TableBody>
            {policies.map((policy) => renderTableData(policy, fields))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                colSpan={3}
                count={policies.length}
                rowsPerPage={rowsPerPage}
                page={page}
                SelectProps={{
                  inputProps: { 'aria-label': 'rows per page' },
                  native: true,
                }}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </React.Fragment>
  )
}


const StyledTableCell = styled(props => <TableCell {...props} />)`
&& {
  background-color: ${theme.palette.primary.main};
  color: ${theme.palette.primary.contrastText};
  &:hover {
    cursor: pointer;
  }
  }
`
