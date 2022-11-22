import React from 'react'
import {Box, Typography, Card as MUICard, Avatar, Button} from '@material-ui/core'
import styled from 'styled-components'
import {theme} from "/imports/modules/both/object_utils";


export const Card = () => {
  return (
    <Box mr={2}>
      <StyledCard>
        <CardHeader>
          <Box mr={1}>
            <StyledAvatar>
              ADD ICON
            </StyledAvatar>
          </Box>
          <Typography variant="h5" component="p">
            Create Policy
          </Typography>
        </CardHeader>
        <Box py={3}>
          <Typography variant="body2" component="p">
            Create a new insurance policy and track the lifecycle of the
            connected business process.
          </Typography>
        </Box>
        <Button
          component={"a"}
          to={'/TEST'}
          variant="contained"
          color="primary"
          size="large"
        >
          Create new policy
        </Button>
      </StyledCard>
    </Box>
  );
};

const StyledCard = styled(MUICard)`
  box-shadow: ${theme.shadows[5]};
  max-width: 450px;
  padding: ${theme.spacing(2, 2)};
`

const CardHeader = styled.div`
  display: flex;
  align-items: center;
`

const StyledAvatar = styled(Avatar)`
  background-color: ${theme.palette.primary.main};
  color: ${theme.palette.primary.contrastText};
`