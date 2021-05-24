import {
  ThemeProvider,
  Container,
  Paper,
  Divider,
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListSubheader,
} from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import styled from "styled-components";
import { theme } from "/imports/modules/both/object_utils";

export function TEMPLATE_NAME(props) {
  React.useEffect(() => {
    /*TEMPLATE_CREATED_CODE*/
    /*TEMPLATE_RENDERED_CODE*/
    Meteor.defer(function () {
      globalOnRendered();
    });

    return () => {
      /*TEMPLATE_DESTROYED_CODE*/
    };
  }, []);

  /*EVENTS_CODE*/

  /*HELPERS_CODE*/

  if (props.data.dataLoading) {
    return (<Loading />);
  }
  return (
    <ThemeProvider theme={theme}>
      <StyledContainer maxWidth={false} component="main">
        <Header />
        <StyledAside>
          <Box
            display="flex"
            flexBasis="150px"
            justifyContent="center"
            alignItems="center"
          >
            <img src={"images/acre-africa-logo.svg"} atl="acre africa logo" />
          </Box>
          <Divider />
          <List id="menu">
            LEFT SIDE NAVIGATION {/* change this.props into props */}
          </List>
        </StyledAside>
        <StyledSection>
          <StyledPaper elevation={2}>{props.content}</StyledPaper>
        </StyledSection>
        <StyledFooter>
          <img src={"images/etherisc-logo.png"} />
        </StyledFooter>
      </StyledContainer>
    </ThemeProvider>
  );
}

const Header = (props) => {
  const ITEM_HEIGHT = 48;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <StyledHeader>
      <div />
      {props.children}
      <Box display="flex" justifySelf="end" mr={1}>
        <img src="images/user-icon.svg" alt="user icon" />
        <Box ml={1} component="span">
          {"John Doe"}
        </Box>
      </Box>
      <IconButton
        aria-label="more"
        aria-controls="long-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVertIcon style={{ color: "white" }} />
      </IconButton>
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: ITEM_HEIGHT * 4.5,
            width: "20ch"
          }
        }}
      >
        <StyledListSubheader>
          <Box display="flex" alignItems="center">
            <img src="images/link-icon.svg" alt="link icon" />
            <Box ml={1}>John Doe</Box>
          </Box>
        </StyledListSubheader>
        <Divider />
        <MenuItem onClick={handleClose}>
          <p> LOGOUT </p>
        </MenuItem>
      </Menu>
    </StyledHeader>
  );
};

const StyledHeader = styled.header`
  grid-area: header;
  background-color: ${theme.palette.primary.main};
  color: ${theme.palette.primary.contrastText};
  display: grid;
  grid-auto-flow: column;
  grid-template-columns: 1fr;
  grid-gap: 16px;
  padding: 0 16px;
  align-items: center;
  justify-items: end;
`;

const StyledListSubheader = styled((props) => <ListSubheader {...props} />)`
  && {
    background-color: ${theme.palette.grey[300]};
    margin-top: -8px;
  }
`;

const StyledContainer = styled((props) => <Container {...props} />)`
  && {
    display: grid;
    grid-template-columns: 300px 1fr;
    grid-template-rows: 50px 1fr 80px;
    grid-template-areas:
      "aside header"
      "aside content"
      "footer footer";
    grid-column-gap: 0px;
    grid-row-gap: 0px;
    min-height: 100vh;
    padding: 0 8px;
  }
`;

const StyledSection = styled.section`
  grid-area: content;
`;

const StyledPaper = styled((props) => <Paper {...props} />)`
  && {
    min-height: 100%;
    padding: 32px;
  }
`;

const StyledAside = styled.aside`
  display: flex;
  flex-direction: column;
  grid-area: aside;
`;

const StyledFooter = styled.footer`
  grid-area: footer;
  padding: 16px;
  background-color: #607d8b;
  display: flex;
  align-items: center;
`;

export const TEMPLATE_NAMEContainer = withTracker(function (props) {
  /*SUBSCRIPTIONS*/
})(TEMPLATE_NAME);
